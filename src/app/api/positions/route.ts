import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncPositions } from '@/lib/services'

export async function GET() {
  try {
    await syncPositions()

    const positions = await prisma.position.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(positions)
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json({ error: 'Error fetching positions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const position = await prisma.position.create({
      data: body
    })
    return NextResponse.json(position)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating position' }, { status: 500 })
  }
}
