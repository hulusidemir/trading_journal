import { prisma } from '@/lib/prisma'
import PositionsTable from '@/components/PositionsTable'
import ClosedPositionsTable from '@/components/ClosedPositionsTable'
import OrdersTable from '@/components/OrdersTable'
import { syncPositions, syncOrders } from '@/lib/services'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Sync data from Bybit before rendering
  await Promise.all([syncPositions(), syncOrders()])

  const openPositions = await prisma.position.findMany({
    where: { status: 'OPEN' },
    orderBy: { createdAt: 'desc' }
  })
  
  const closedPositions = await prisma.position.findMany({
    where: { status: 'CLOSED' },
    orderBy: { closedAt: 'desc' }
  })

  const openOrders = await prisma.order.findMany({
    where: { status: { in: ['New', 'PartiallyFilled', 'Untriggered'] } }, // Adjust based on Bybit status
    orderBy: { createdAt: 'desc' }
  })

  const historyOrders = await prisma.order.findMany({
    where: { status: { notIn: ['New', 'PartiallyFilled', 'Untriggered'] } },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Trading Journal</h1>
        <div className="text-sm text-gray-400">
          Open Positions: {openPositions.length} | Open Orders: {openOrders.length}
        </div>
      </header>
      
      <div className="space-y-12">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white border-b-2 border-yellow-500 pb-1 inline-block">Open Positions</h2>
          </div>
          <PositionsTable initialPositions={openPositions} />
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white border-b-2 border-gray-500 pb-1 inline-block">Closed Positions History</h2>
          </div>
          <ClosedPositionsTable initialPositions={closedPositions} />
        </section>
        
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white border-b-2 border-blue-500 pb-1 inline-block">Open Orders</h2>
          </div>
          <OrdersTable initialOrders={openOrders} />
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white border-b-2 border-gray-500 pb-1 inline-block">Order History</h2>
          </div>
          <OrdersTable initialOrders={historyOrders} />
        </section>
      </div>
    </main>
  )
}
