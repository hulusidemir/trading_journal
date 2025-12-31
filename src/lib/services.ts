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

    // Sync with Database
    for (const pos of bybitPositions) {
      if (parseFloat(pos.size) > 0) {
        await prisma.position.upsert({
          where: {
            symbol_side: {
              symbol: pos.symbol,
              side: pos.side === 'Buy' ? 'LONG' : 'SHORT'
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
          }
        });
      } else {
        // Remove closed positions
        await prisma.position.deleteMany({
            where: {
                symbol: pos.symbol,
                side: pos.side === 'Buy' ? 'LONG' : 'SHORT'
            }
        }).catch(() => {});
      }
    }
  } catch (error) {
    console.error('Error syncing positions:', error);
  }
}

export async function syncOrders() {
  try {
    const response = await bybit.getActiveOrders({
      category: 'linear',
      settleCoin: 'USDT',
    });

    if (response.retCode !== 0) {
      console.error('Bybit API Error (Orders):', response.retMsg);
      return;
    }

    const bybitOrders = response.result.list;
    
    // Get all current order IDs from DB
    const existingOrders = await prisma.order.findMany({ select: { orderId: true } });
    const existingOrderIds = new Set(existingOrders.map(o => o.orderId));
    const newOrderIds = new Set(bybitOrders.map(o => o.orderId));

    // Delete orders that are no longer open
    const ordersToDelete = [...existingOrderIds].filter(id => !newOrderIds.has(id));
    if (ordersToDelete.length > 0) {
      await prisma.order.deleteMany({
        where: {
          orderId: { in: ordersToDelete }
        }
      });
    }

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
  } catch (error) {
    console.error('Error syncing orders:', error);
  }
}
