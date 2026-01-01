'use client'

import { useState } from 'react'
import { Position } from '@prisma/client'
import { useLanguage } from '@/contexts/LanguageContext'
import Pagination from './Pagination'

export default function PositionsTable({ initialPositions }: { initialPositions: Position[] }) {
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
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }

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
            <tr key={position.id} className="border-b border-gray-700 hover:bg-gray-750">
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
                  <span>{formatNumber(position.im || 0, 2)}</span>
                  <span className="text-xs text-gray-500">{formatNumber(position.mm || 0, 2)}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className={position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {formatNumber(position.unrealizedPnl, 2)} USDT
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
              <td className="px-4 py-3 max-w-xs truncate">
                <span className="text-gray-400 italic">{position.notes || t.table.noNotes}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
    </div>
  )
}
