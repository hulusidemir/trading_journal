'use client'

import { useState } from 'react'
import { Position } from '@prisma/client'
import { Pencil } from 'lucide-react'

export default function ClosedPositionsTable({ initialPositions }: { initialPositions: Position[] }) {
  const [positions, setPositions] = useState(initialPositions)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [noteText, setNoteText] = useState('')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }

  const formatNumber = (value: number, decimals = 4) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '--'
    return new Date(date).toLocaleString()
  }

  const handleSaveNote = async (id: number) => {
    try {
      const response = await fetch(`/api/positions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteText })
      })
      
      if (response.ok) {
        setPositions(positions.map(p => p.id === id ? { ...p, notes: noteText } : p))
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
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Entry Price</th>
            <th className="px-4 py-3">Exit Price</th>
            <th className="px-4 py-3">Realized P&L</th>
            <th className="px-4 py-3">Closed At</th>
            <th className="px-4 py-3">Notes</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => (
            <tr key={position.id} className="border-b border-gray-700 hover:bg-gray-750">
              <td className="px-4 py-3 font-medium text-white">
                <div className="flex flex-col">
                  <span className={position.side === 'LONG' ? 'text-green-400' : 'text-red-400'}>
                    {position.symbol}
                  </span>
                  <span className="text-xs text-gray-500">
                    {position.isCross ? 'Cross' : 'Iso'} {position.leverage.toFixed(2)}x
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">{formatNumber(position.entryPrice)}</td>
              <td className="px-4 py-3">{position.exitPrice ? formatNumber(position.exitPrice) : '--'}</td>
              <td className="px-4 py-3">
                <span className={position.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {formatCurrency(position.realizedPnl)}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-400">
                {formatDate(position.closedAt)}
              </td>
              <td className="px-4 py-3 max-w-xs truncate">
                {editingId === position.id ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={noteText} 
                      onChange={(e) => setNoteText(e.target.value)}
                      className="bg-gray-700 text-white px-2 py-1 rounded text-xs w-full"
                    />
                    <button onClick={() => handleSaveNote(position.id)} className="text-green-400 text-xs">Save</button>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">{position.notes || 'No notes'}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <button 
                  onClick={() => {
                    setEditingId(position.id)
                    setNoteText(position.notes || '')
                  }}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <Pencil size={16} className="text-gray-400" />
                </button>
              </td>
            </tr>
          ))}
          {positions.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No closed positions found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
