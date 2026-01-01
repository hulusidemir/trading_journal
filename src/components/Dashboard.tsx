'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Position, Order } from '@prisma/client'
import { RefreshCw, DollarSign, TurkishLira } from 'lucide-react'
import PositionsTable from '@/components/PositionsTable'
import ClosedPositionsTable from '@/components/ClosedPositionsTable'
import OrdersTable from '@/components/OrdersTable'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'

import { refreshData } from '@/app/actions'

interface DashboardProps {
  openPositions: Position[]
  closedPositions: Position[]
  openOrders: Order[]
}

export default function Dashboard({ openPositions, closedPositions, openOrders }: DashboardProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currency, setCurrency] = useState<'USD' | 'TRY'>('USD')
  const [exchangeRate, setExchangeRate] = useState(35)

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data.rates && data.rates.TRY) {
          setExchangeRate(data.rates.TRY)
        }
      })
      .catch(err => console.error('Failed to fetch exchange rate', err))
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
      // Force a hard reload to ensure data is fresh
      window.location.reload()
    } catch (error) {
      console.error('Refresh failed:', error)
      setIsRefreshing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">{t.title}</h1>
          <LanguageSwitcher />
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all text-gray-300 hover:text-white flex items-center gap-2 border border-gray-700 hover:border-gray-600"
            title="Sync with Bybit"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-1">
            <button
              onClick={() => setCurrency('USD')}
              className={`p-1.5 rounded ${currency === 'USD' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="USD"
            >
              <DollarSign size={16} />
            </button>
            <button
              onClick={() => setCurrency('TRY')}
              className={`p-1.5 rounded ${currency === 'TRY' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="TRY"
            >
              <TurkishLira size={16} />
            </button>
          </div>
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
          <PositionsTable initialPositions={openPositions} currency={currency} rate={exchangeRate} />
        </section>
        
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white border-b-2 border-blue-500 pb-1 inline-block">{t.openOrders}</h2>
          </div>
          <OrdersTable initialOrders={openOrders} currency={currency} rate={exchangeRate} />
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white border-b-2 border-gray-500 pb-1 inline-block">{t.closedPositions}</h2>
          </div>
          <ClosedPositionsTable initialPositions={closedPositions} currency={currency} rate={exchangeRate} />
        </section>
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>{t.footer.replace('{year}', new Date().getFullYear().toString())}</p>
      </footer>
    </main>
  )
}
