'use server'

import { revalidatePath } from 'next/cache'
import { syncPositions, syncOrders } from '@/lib/services'

export async function refreshData() {
  try {
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
