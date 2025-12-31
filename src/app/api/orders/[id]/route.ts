import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: body
    })
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Error updating order' }, { status: 500 })
  }
}
