'use client'

import { useState } from 'react'
import { Position } from '@prisma/client'
import { Pencil } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Pagination from './Pagination'
import Tooltip from './Tooltip'

interface ClosedPositionsTableProps {
  initialPositions: Position[]
  currency?: 'USD' | 'TRY'
  rate?: number
}

export default function ClosedPositionsTable({ initialPositions, currency = 'USD', rate = 1 }: ClosedPositionsTableProps) {
  const { t } = useLanguage()
  const [positions, setPositions] = useState(initialPositions)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [noteText, setNoteText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(positions.length / itemsPerPage)
  const currentPositions = positions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatCurrency = (value: number) => {
    const convertedValue = currency === 'TRY' ? value * rate : value
    return new Intl.NumberFormat(currency === 'TRY' ? 'tr-TR' : 'en-US', { 
      style: 'currency', 
      currency: currency 
    }).format(convertedValue)
  }

  const formatNumber = (value: number, decimals = 4) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '--'
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
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

  const totalPnL = positions.reduce((sum, p) => sum + (p.realizedPnl || 0), 0)

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
          <tr>
            <th className="px-4 py-3">{t.table.symbol}</th>
            <th className="px-4 py-3">{t.table.entryPrice}</th>
            <th className="px-4 py-3">{t.table.exitPrice}</th>
            <th className="px-4 py-3">{t.table.realizedPnl}</th>
            <th className="px-4 py-3">{t.table.date}</th>
            <th className="px-4 py-3">{t.table.notes}</th>
            <th className="px-4 py-3">{t.table.action}</th>
          </tr>
        </thead>
        <tbody>
          {currentPositions.map((position) => (
            <tr key={position.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-150">
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
              <td className="px-4 py-3 max-w-[200px]">
                {editingId === position.id ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={noteText} 
                      onChange={(e) => setNoteText(e.target.value)}
                      className="bg-gray-700 text-white px-2 py-1 rounded text-xs w-full"
                    />
                    <button onClick={() => handleSaveNote(position.id)} className="text-green-400 text-xs">{t.table.save}</button>
                  </div>
                ) : (
                  <Tooltip text={position.notes || ''}>
                    <span className="text-gray-400 italic truncate block cursor-help">{position.notes || t.table.noNotes}</span>
                  </Tooltip>
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
                {t.table.noClosedPositions}
              </td>
            </tr>
          )}
        </tbody>
        <tfoot className="bg-gray-800/50 border-t border-gray-700">
          <tr>
            <td colSpan={7} className="px-4 py-3">
              <div className="flex justify-end items-center gap-2 text-sm">
                <span className="text-gray-300 font-semibold">{t.table.grandTotal}:</span>
                <span className={`font-mono font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(totalPnL)}
                </span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
    </div>
  )
}
