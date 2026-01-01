import { NextResponse } from 'next/server'
import { syncPositions, syncOrders } from '@/lib/services'

export async function POST() {
  try {
    await Promise.all([syncPositions(), syncOrders()])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Sync failed' 
    }, { status: 500 })
  }
}
