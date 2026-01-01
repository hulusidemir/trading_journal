'use client'

import { useState } from 'react'
import { Position } from '@prisma/client'
import { useLanguage } from '@/contexts/LanguageContext'
import Pagination from './Pagination'
import Tooltip from './Tooltip'

export default function PositionsTable({ 
  initialPositions, 
  currency = 'USD', 
  rate = 1 
}: { 
  initialPositions: Position[], 
  currency?: 'USD' | 'TRY', 
  rate?: number 
}) {
  const { t } = useLanguage()
  const [positions] = useState(initialPositions)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(positions.length / itemsPerPage)
  const currentPositions = positions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatCurrency = (value: number) => {
    const converted = currency === 'TRY' ? value * rate : value
    return new Intl.NumberFormat(currency === 'TRY' ? 'tr-TR' : 'en-US', { 
      style: 'currency', 
      currency: currency 
    }).format(converted)
  }

  const totalLong = positions.filter(p => p.side === 'LONG').reduce((sum, p) => sum + p.value, 0)
  const totalShort = positions.filter(p => p.side === 'SHORT').reduce((sum, p) => sum + p.value, 0)
  const grandTotal = totalLong + totalShort

  const formatNumber = (value: number, decimals = 4) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
          <tr>
            <th className="px-4 py-3">{t.table.date}</th>
            <th className="px-4 py-3">{t.table.contracts}</th>
            <th className="px-4 py-3">{t.table.qty}</th>
            <th className="px-4 py-3">{t.table.value}</th>
            <th className="px-4 py-3">{t.table.entryPrice}</th>
            <th className="px-4 py-3">{t.table.markPrice}</th>
            <th className="px-4 py-3">{t.table.liqPrice}</th>
            <th className="px-4 py-3">{t.table.imMm}</th>
            <th className="px-4 py-3">{t.table.unrealizedPnl}</th>
            <th className="px-4 py-3">{t.table.tpSl}</th>
            <th className="px-4 py-3">{t.table.notes}</th>
          </tr>
        </thead>
        <tbody>
          {currentPositions.map((position) => (
            <tr key={position.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-150">
              <td className="px-4 py-3 text-gray-400">{formatDate(position.createdAt)}</td>
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
              <td className={`px-4 py-3 ${position.side === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                {position.qty.toLocaleString()} {position.symbol.replace('USDT', '')}
              </td>
              <td className="px-4 py-3">{formatCurrency(position.value)}</td>
              <td className="px-4 py-3">{formatNumber(position.entryPrice)}</td>
              <td className="px-4 py-3">{formatNumber(position.markPrice)}</td>
              <td className="px-4 py-3 text-orange-400">{position.liqPrice ? formatNumber(position.liqPrice) : '--'}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span>{formatCurrency(position.im || 0)}</span>
                  <span className="text-xs text-gray-500">{formatCurrency(position.mm || 0)}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className={position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {formatCurrency(position.unrealizedPnl)}
                  </span>
                  <span className={`text-xs ${position.unrealizedRoi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({position.unrealizedRoi.toFixed(2)}%)
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col text-xs">
                  <span className="text-green-400">TP: {position.tp ? formatNumber(position.tp) : '--'}</span>
                  <span className="text-red-400">SL: {position.sl ? formatNumber(position.sl) : '--'}</span>
                </div>
              </td>
              <td className="px-4 py-3 max-w-[200px]">
                <Tooltip text={position.notes || ''}>
                  <span className="text-gray-400 italic truncate block cursor-help">{position.notes || t.table.noNotes}</span>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-900/50 border-t border-gray-700">
          <tr>
            <td colSpan={11} className="px-4 py-3">
              <div className="flex justify-end items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{t.table.totalLong}:</span>
                  <span className="text-green-400 font-mono font-medium">{formatCurrency(totalLong)}</span>
                </div>
                <span className="text-gray-700">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{t.table.totalShort}:</span>
                  <span className="text-red-400 font-mono font-medium">{formatCurrency(totalShort)}</span>
                </div>
                <span className="text-gray-700">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-semibold">{t.table.grandTotal}:</span>
                  <span className={`font-mono font-bold ${grandTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
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
