import { prisma } from '@/lib/prisma'
import { bybit } from '@/lib/bybit'

export async function syncPositions() {
  try {
    const response = await bybit.getPositionInfo({
      category: 'linear',
      settleCoin: 'USDT',
    });

    if (response.retCode !== 0) {
      console.error('Bybit API Error (Positions):', response.retMsg);
      return;
    }

    const bybitPositions = response.result.list;
    const activeSymbolSides = new Set<string>();

    // 1. Sync Open Positions
    for (const pos of bybitPositions) {
      if (parseFloat(pos.size) > 0) {
        const symbolSide = `${pos.symbol}_${pos.side === 'Buy' ? 'LONG' : 'SHORT'}`;
        activeSymbolSides.add(symbolSide);

        await prisma.position.upsert({
          where: {
            symbol_side_status: {
              symbol: pos.symbol,
              side: pos.side === 'Buy' ? 'LONG' : 'SHORT',
              status: 'OPEN'
            }
          },
          update: {
            qty: parseFloat(pos.size),
            value: parseFloat(pos.positionValue),
            entryPrice: parseFloat(pos.avgPrice),
            markPrice: parseFloat(pos.markPrice),
            liqPrice: pos.liqPrice ? parseFloat(pos.liqPrice) : null,
            breakEvenPrice: parseFloat(pos.avgPrice),
            im: parseFloat(pos.positionIM || '0'),
            mm: parseFloat(pos.positionMM || '0'),
            unrealizedPnl: parseFloat(pos.unrealisedPnl),
            unrealizedRoi: parseFloat(pos.unrealisedPnl) / parseFloat(pos.positionIM || '1') * 100,
            realizedPnl: parseFloat(pos.cumRealisedPnl),
            tp: pos.takeProfit ? parseFloat(pos.takeProfit) : null,
            sl: pos.stopLoss ? parseFloat(pos.stopLoss) : null,
            leverage: parseFloat(pos.leverage),
            isCross: pos.tradeMode === 0,
            updatedAt: new Date()
          },
          create: {
            symbol: pos.symbol,
            side: pos.side === 'Buy' ? 'LONG' : 'SHORT',
            qty: parseFloat(pos.size),
            value: parseFloat(pos.positionValue),
            entryPrice: parseFloat(pos.avgPrice),
            markPrice: parseFloat(pos.markPrice),
            liqPrice: pos.liqPrice ? parseFloat(pos.liqPrice) : null,
            breakEvenPrice: parseFloat(pos.avgPrice),
            im: parseFloat(pos.positionIM || '0'),
            mm: parseFloat(pos.positionMM || '0'),
            unrealizedPnl: parseFloat(pos.unrealisedPnl),
            unrealizedRoi: parseFloat(pos.unrealisedPnl) / parseFloat(pos.positionIM || '1') * 100,
            realizedPnl: parseFloat(pos.cumRealisedPnl),
            tp: pos.takeProfit ? parseFloat(pos.takeProfit) : null,
            sl: pos.stopLoss ? parseFloat(pos.stopLoss) : null,
            leverage: parseFloat(pos.leverage),
            isCross: pos.tradeMode === 0,
            status: 'OPEN'
          }
        });
      }
    }

    // 2. Handle Closed Positions
    // Find positions in DB that are OPEN but not in the current Bybit list
    const dbOpenPositions = await prisma.position.findMany({
      where: { status: 'OPEN' }
    });

    for (const dbPos of dbOpenPositions) {
      const symbolSide = `${dbPos.symbol}_${dbPos.side}`;
      if (!activeSymbolSides.has(symbolSide)) {
        // Position is no longer open, mark as CLOSED
        // Fetch closure details from Bybit Closed PnL
        const pnlResponse = await bybit.getClosedPnL({
          category: 'linear',
          symbol: dbPos.symbol,
          limit: 1 // Get latest
        });

        let exitPrice = dbPos.markPrice; // Fallback
        let closedAt = new Date();

        if (pnlResponse.retCode === 0 && pnlResponse.result.list.length > 0) {
          const lastPnl = pnlResponse.result.list[0];
          // Verify it matches roughly
          exitPrice = parseFloat(lastPnl.avgExitPrice);
          closedAt = new Date(parseInt(lastPnl.updatedTime));
          
          await prisma.position.update({
            where: { id: dbPos.id },
            data: {
              status: 'CLOSED',
              exitPrice: exitPrice,
              closedAt: closedAt,
              qty: 0, // Closed
              value: 0,
              realizedPnl: parseFloat(lastPnl.closedPnl),
              updatedAt: new Date()
            }
          });
        } else {
           // Fallback if PnL not found immediately
           await prisma.position.update({
            where: { id: dbPos.id },
            data: {
              status: 'CLOSED',
              exitPrice: exitPrice,
              closedAt: closedAt,
              qty: 0,
              value: 0,
              updatedAt: new Date()
            }
          });
        }
      }
    }

  } catch (error) {
    console.error('Error syncing positions:', error);
  }
}

export async function syncOrders() {
  try {
    // 1. Sync Active Orders
    const response = await bybit.getActiveOrders({
      category: 'linear',
      settleCoin: 'USDT',
    });

    if (response.retCode !== 0) {
      console.error('Bybit API Error (Orders):', response.retMsg);
      return;
    }

    const bybitOrders = response.result.list;
    const activeOrderIds = new Set(bybitOrders.map(o => o.orderId));

    for (const order of bybitOrders) {
      await prisma.order.upsert({
        where: { orderId: order.orderId },
        update: {
          symbol: order.symbol,
          type: order.orderType,
          side: order.side,
          price: parseFloat(order.price),
          qty: parseFloat(order.qty),
          filledQty: parseFloat(order.cumExecQty),
          triggerPrice: order.triggerPrice ? parseFloat(order.triggerPrice) : null,
          isReduceOnly: order.reduceOnly,
          status: order.orderStatus,
          updatedAt: new Date()
        },
        create: {
          orderId: order.orderId,
          symbol: order.symbol,
          type: order.orderType,
          side: order.side,
          price: parseFloat(order.price),
          qty: parseFloat(order.qty),
          filledQty: parseFloat(order.cumExecQty),
          triggerPrice: order.triggerPrice ? parseFloat(order.triggerPrice) : null,
          isReduceOnly: order.reduceOnly,
          status: order.orderStatus,
        }
      });
    }

    // 2. Handle Missing Orders (Filled or Cancelled)
    const dbOpenOrders = await prisma.order.findMany({
      where: { 
        status: { in: ['New', 'PartiallyFilled', 'Untriggered'] }
      }
    });

    for (const dbOrder of dbOpenOrders) {
      if (!activeOrderIds.has(dbOrder.orderId)) {
        // Order is no longer active, check history
        // Note: getOrderHistory might have rate limits, be careful in loop
        // Better to fetch history for this symbol
        const historyResponse = await bybit.getHistoricOrders({
          category: 'linear',
          orderId: dbOrder.orderId,
          limit: 1
        });

        if (historyResponse.retCode === 0 && historyResponse.result.list.length > 0) {
          const histOrder = historyResponse.result.list[0];
          await prisma.order.update({
            where: { id: dbOrder.id },
            data: {
              status: histOrder.orderStatus,
              filledQty: parseFloat(histOrder.cumExecQty),
              updatedAt: new Date()
            }
          });
        } else {
            // If not found in history (rare), maybe just mark as Unknown or leave it?
            // Or maybe it was just cancelled.
        }
      }
    }

  } catch (error) {
    console.error('Error syncing orders:', error);
  }
}
