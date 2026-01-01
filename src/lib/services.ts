import { prisma } from '@/lib/db'
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
        const side = pos.side === 'Buy' ? 'LONG' : 'SHORT';
        const symbolSide = `${pos.symbol}_${side}`;
        activeSymbolSides.add(symbolSide);

        // Find existing OPEN position
        const existingPos = await prisma.position.findFirst({
          where: {
            symbol: pos.symbol,
            side: side,
            status: 'OPEN'
          }
        });

        const data = {
          symbol: pos.symbol,
          side: side,
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
          leverage: parseFloat(pos.leverage || '0'),
          isCross: pos.tradeMode === 0,
          status: 'OPEN',
          updatedAt: new Date(),
          notes: undefined as string | undefined | null
        };

        if (existingPos) {
          await prisma.position.update({
            where: { id: existingPos.id },
            data: data
          });
        } else {
          // Try to find a matching order with notes to inherit
          const matchingOrder = await prisma.order.findFirst({
            where: {
              symbol: pos.symbol,
              side: pos.side, // 'Buy' or 'Sell' matches Order side
              notes: { not: null }
            },
            orderBy: { createdAt: 'desc' }
          });

          if (matchingOrder?.notes) {
            data.notes = matchingOrder.notes;
          }

          await prisma.position.create({
            data: data
          });
        }
      }
    }

    // 2. Sync Recent Closed PnL (Handles both Full and Partial Closes)
    const pnlResponse = await bybit.getClosedPnL({
      category: 'linear',
      limit: 50 // Fetch last 50 closed trades to catch everything
    });

    // Define the start date for recording history (January 1, 2026 12:00 PM UTC)
    // Any closed positions before this date will be ignored.
    const HISTORY_START_DATE = new Date('2026-01-01T12:00:00Z');

    if (pnlResponse.retCode === 0) {
      for (const item of pnlResponse.result.list) {
        const closedAt = new Date(parseInt(item.updatedTime));
        
        // Skip positions closed before the start date
        if (closedAt < HISTORY_START_DATE) {
          continue;
        }

        const side = item.side === 'Buy' ? 'LONG' : 'SHORT';
        
        // Check if this specific closed trade exists
        const exists = await prisma.position.findFirst({
          where: {
            symbol: item.symbol,
            side: side,
            status: 'CLOSED',
            closedAt: closedAt
          }
        });

        if (!exists) {
          // Check if there is an active OPEN position for this symbol
          // If YES, this is a Partial Close
          // If NO, this is likely a Full Close (or the final part of it)
          const openPos = await prisma.position.findFirst({
            where: {
              symbol: item.symbol,
              side: side,
              status: 'OPEN'
            }
          });

          let notes = openPos?.notes || null;
          
          // If it's a partial close (Open position still exists), append tag
          if (openPos) {
             if (notes) {
               notes += ' (Kısmen Kapatıldı)';
             } else {
               notes = 'Kısmen Kapatıldı';
             }
          }

          // Create the Closed Position record
          await prisma.position.create({
            data: {
              symbol: item.symbol,
              side: side,
              qty: parseFloat(item.qty),
              value: parseFloat(item.cumEntryValue),
              entryPrice: parseFloat(item.avgEntryPrice),
              markPrice: parseFloat(item.avgExitPrice),
              exitPrice: parseFloat(item.avgExitPrice),
              realizedPnl: parseFloat(item.closedPnl),
              closedAt: closedAt,
              status: 'CLOSED',
              leverage: parseFloat(item.leverage),
              isCross: true,
              unrealizedPnl: 0,
              unrealizedRoi: 0,
              updatedAt: new Date(),
              notes: notes
            }
          });
        }
      }
    }

    // 3. Cleanup Stale Open Positions
    // If a position is OPEN in DB but not in activeSymbolSides, and we haven't just closed it via PnL logic above...
    // Actually, the PnL logic above creates NEW records. It doesn't close the existing OPEN record.
    // So we still need to mark the "stale" OPEN record as CLOSED or DELETE it.
    // Since we are creating new records for every PnL event, the "stale" OPEN record is now redundant/duplicate if we keep it as "CLOSED".
    // Ideally, we should DELETE the stale open record because its history is now fully represented by the PnL records we just synced.
    
    const dbOpenPositions = await prisma.position.findMany({
      where: { status: 'OPEN' }
    });

    for (const dbPos of dbOpenPositions) {
      const symbolSide = `${dbPos.symbol}_${dbPos.side}`;
      if (!activeSymbolSides.has(symbolSide)) {
        // Position is no longer open on Bybit.
        // We have likely already imported its closure details via PnL sync above.
        // So we can safely remove this "tracking" record to avoid duplicates in history.
        // OR, if we want to be safe, we check if we have a recent CLOSED record for this symbol.
        
        await prisma.position.delete({
          where: { id: dbPos.id }
        });
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
