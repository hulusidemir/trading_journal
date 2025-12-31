'use client'

import { useState } from 'react'
import { Order } from '@prisma/client'
import { Pencil } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const { t } = useLanguage()
  const [orders, setOrders] = useState(initialOrders)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [noteText, setNoteText] = useState('')

  const formatNumber = (value: number, decimals = 4) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
  }

  const handleSaveNote = async (id: number) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteText })
      })
      
      if (response.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, notes: noteText } : o))
        setEditingId(null)
      }
    } catch (error) {
      console.error('Failed to save note', error)
    }
  }

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
          <tr>
            <th className="px-4 py-3">{t.table.date}</th>
            <th className="px-4 py-3">{t.table.symbol}</th>
            <th className="px-4 py-3">{t.table.type}</th>
            <th className="px-4 py-3">{t.table.side}</th>
            <th className="px-4 py-3">{t.table.price}</th>
            <th className="px-4 py-3">{t.table.qty}</th>
            <th className="px-4 py-3">{t.table.filled}</th>
            <th className="px-4 py-3">{t.table.trigger}</th>
            <th className="px-4 py-3">{t.table.reduceOnly}</th>
            <th className="px-4 py-3">{t.table.status}</th>
            <th className="px-4 py-3">{t.table.notes}</th>
            <th className="px-4 py-3">{t.table.action}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-750">
              <td className="px-4 py-3 text-gray-400">{formatDate(order.createdAt)}</td>
              <td className="px-4 py-3 font-medium text-white">{order.symbol}</td>
              <td className="px-4 py-3">{order.type}</td>
              <td className={`px-4 py-3 ${order.side === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                {order.side}
              </td>
              <td className="px-4 py-3">{formatNumber(order.price)}</td>
              <td className="px-4 py-3">{order.qty.toLocaleString()}</td>
              <td className="px-4 py-3">{order.filledQty.toLocaleString()}</td>
              <td className="px-4 py-3 text-orange-400">
                {order.triggerPrice ? formatNumber(order.triggerPrice) : '--'}
              </td>
              <td className="px-4 py-3">
                {order.isReduceOnly ? <span className="text-yellow-400">Yes</span> : 'No'}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs ${
                  order.status === 'Open' ? 'bg-green-900 text-green-300' : 
                  order.status === 'Filled' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700'
                }`}>
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 max-w-xs truncate">
                {editingId === order.id ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={noteText} 
                      onChange={(e) => setNoteText(e.target.value)}
                      className="bg-gray-700 text-white px-2 py-1 rounded text-xs w-full"
                    />
                    <button onClick={() => handleSaveNote(order.id)} className="text-green-400 text-xs">{t.table.save}</button>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">{order.notes || t.table.noNotes}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <button 
                  onClick={() => {
                    setEditingId(order.id)
                    setNoteText(order.notes || '')
                  }}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <Pencil size={16} className="text-gray-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
