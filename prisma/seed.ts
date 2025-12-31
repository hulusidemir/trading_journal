import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({
  url: dbPath
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clear existing data
  await prisma.position.deleteMany()
  await prisma.order.deleteMany()

  // Create Positions
  await prisma.position.createMany({
    data: [
      {
        symbol: 'LIGHTUSDT',
        side: 'SHORT',
        qty: 1600,
        value: 2011.59,
        entryPrice: 1.2572,
        markPrice: 1.3915,
        liqPrice: 5.9137,
        breakEvenPrice: 1.2553,
        im: 225.3140,
        mm: 47.0100,
        unrealizedPnl: -171.2900,
        unrealizedRoi: -76.02,
        realizedPnl: -0.8046,
        leverage: 10.00,
        isCross: true,
        notes: 'Initial short position'
      },
      {
        symbol: 'ADAUSDT',
        side: 'LONG',
        qty: 14983,
        value: 4999.82,
        entryPrice: 0.3337,
        markPrice: 0.3324,
        liqPrice: null,
        breakEvenPrice: 0.3339,
        im: 500.3600,
        mm: 39.8162,
        unrealizedPnl: -20.9762,
        unrealizedRoi: -4.19,
        realizedPnl: -0.9999,
        leverage: 10.00,
        isCross: true,
        notes: 'Long term hold'
      },
      {
        symbol: 'BEATUSDT',
        side: 'LONG',
        qty: 1147,
        value: 1713.60,
        entryPrice: 1.4939,
        markPrice: 1.3632,
        liqPrice: null,
        breakEvenPrice: 1.4935,
        im: 158.0555,
        mm: 40.7862,
        unrealizedPnl: -148.2958,
        unrealizedRoi: -93.82,
        realizedPnl: 2.3775,
        tp: 1.6727,
        leverage: 10.00,
        isCross: true,
        notes: 'Swing trade'
      },
      {
        symbol: 'BROCCOLIUSDT',
        side: 'SHORT',
        qty: 27392,
        value: 896.08,
        entryPrice: 0.032713,
        markPrice: 0.042021,
        liqPrice: 0.306060,
        breakEvenPrice: 0.032661,
        im: 116.1224,
        mm: 29.8438,
        unrealizedPnl: -239.1455,
        unrealizedRoi: -205.94,
        realizedPnl: -0.4284,
        tp: 0.014752,
        leverage: 10.00,
        isCross: true,
        notes: 'High risk short'
      }
    ]
  })

  // Create Orders (Mock data)
  await prisma.order.createMany({
    data: [
      {
        symbol: 'LIGHTUSDT',
        type: 'Limit',
        side: 'Buy',
        price: 1.2000,
        qty: 1000,
        status: 'Open',
        notes: 'Take profit target 1'
      },
      {
        symbol: 'ADAUSDT',
        type: 'Trigger',
        side: 'Sell',
        price: 0.3000,
        triggerPrice: 0.3100,
        qty: 5000,
        isReduceOnly: true,
        status: 'Open',
        notes: 'Stop loss'
      }
    ]
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
