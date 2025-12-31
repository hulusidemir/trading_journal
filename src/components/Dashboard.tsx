'use client'

import { Position, Order } from '@prisma/client'
import PositionsTable from '@/components/PositionsTable'
import ClosedPositionsTable from '@/components/ClosedPositionsTable'
import OrdersTable from '@/components/OrdersTable'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'

interface DashboardProps {
  openPositions: Position[]
  closedPositions: Position[]
  openOrders: Order[]
  historyOrders: Order[]
}

export default function Dashboard({ openPositions, closedPositions, openOrders, historyOrders }: DashboardProps) {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">{t.title}</h1>
          <LanguageSwitcher />
        </div>
        <div className="text-sm text-gray-400">
          {t.stats.replace('{posCount}', openPositions.length.toString()).replace('{orderCount}', openOrders.length.toString())}
        </div>
      </header>
      
      <div className="space-y-12">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white border-b-2 border-yellow-500 pb-1 inline-block">{t.openPositions}</h2>
          </div>
          <PositionsTable initialPositions={openPositions} />
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white border-b-2 border-gray-500 pb-1 inline-block">{t.closedPositions}</h2>
          </div>
          <ClosedPositionsTable initialPositions={closedPositions} />
        </section>
        
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white border-b-2 border-blue-500 pb-1 inline-block">{t.openOrders}</h2>
          </div>
          <OrdersTable initialOrders={openOrders} />
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white border-b-2 border-gray-500 pb-1 inline-block">{t.orderHistory}</h2>
          </div>
          <OrdersTable initialOrders={historyOrders} />
        </section>
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>{t.footer.replace('{year}', new Date().getFullYear().toString())}</p>
      </footer>
    </main>
  )
}
