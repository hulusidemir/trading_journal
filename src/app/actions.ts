'use server'

import { revalidatePath } from 'next/cache'
import { syncPositions, syncOrders } from '@/lib/services'

export async function refreshData() {
  try {
    // Skip sync in production (Vercel) due to Bybit geo-restrictions
    if (process.env.VERCEL) {
      console.log('Sync skipped in production environment')
      revalidatePath('/')
      return { success: true, message: 'Data refreshed (sync disabled in production)' }
    }
    
    console.log('Starting sync...')
    await Promise.all([syncPositions(), syncOrders()])
    console.log('Sync completed. Revalidating...')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Sync failed:', error)
    return { success: false, error: 'Sync failed' }
  }
}
