'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function ClientSync() {
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/sync', { 
        method: 'POST',
        cache: 'no-store'
      })
      const data = await response.json()
      
      if (data.success) {
        window.location.reload()
      } else {
        alert('Sync failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Sync failed: ' + error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
    >
      <RefreshCw className={syncing ? 'animate-spin' : ''} size={16} />
      {syncing ? 'Syncing...' : 'Refresh Data'}
    </button>
  )
}
