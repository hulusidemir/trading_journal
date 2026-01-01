import { prisma } from '@/lib/prisma'
import { syncPositions, syncOrders } from '@/lib/services'
import Dashboard from '@/components/Dashboard'
import { LanguageProvider } from '@/contexts/LanguageContext'

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
    where: { status: { in: ['New', 'PartiallyFilled', 'Untriggered'] } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <LanguageProvider>
      <Dashboard 
        openPositions={openPositions} 
        closedPositions={closedPositions} 
        openOrders={openOrders} 
      />
    </LanguageProvider>
  )
}
