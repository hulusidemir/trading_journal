import { prisma } from '@/lib/prisma'
import PositionsTable from '@/components/PositionsTable'
import OrdersTable from '@/components/OrdersTable'
import { syncPositions, syncOrders } from '@/lib/services'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Sync data from Bybit before rendering
  await Promise.all([syncPositions(), syncOrders()])

  const positions = await prisma.position.findMany({
    orderBy: { createdAt: 'desc' }
  })
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Trading Journal</h1>
        <div className="text-sm text-gray-400">
          Total Positions: {positions.length} | Open Orders: {orders.length}
        </div>
      </header>
      
      <div className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white border-b-2 border-yellow-500 pb-1 inline-block">Positions</h2>
          </div>
          <PositionsTable initialPositions={positions} />
        </section>
        
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white border-b-2 border-blue-500 pb-1 inline-block">Open Orders</h2>
          </div>
          <OrdersTable initialOrders={orders} />
        </section>
      </div>
    </main>
  )
}
