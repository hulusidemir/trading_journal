import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncOrders } from '@/lib/services'

export async function GET() {
  try {
    await syncOrders()

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const order = await prisma.order.create({
      data: body
    })
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
  }
}
