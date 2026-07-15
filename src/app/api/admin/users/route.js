import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Middleware-like check
async function requireAuth(request) {
  const session = await getSession(request);
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

// GET all admin users
export async function GET(request) {
  try {
    await requireAuth(request);
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        studentId: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREATE new admin user
export async function POST(request) {
  try {
    await requireAuth(request);
    const { studentId, name, password } = await request.json();

    if (!studentId || !name || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({ where: { studentId } });
    if (existing) {
      return NextResponse.json({ error: "Student ID already exists" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.adminUser.create({
      data: { studentId, name, password: hashedPassword }
    });

    return NextResponse.json({ success: true, id: newUser.id });
  } catch (error) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE admin user
export async function DELETE(request) {
  try {
    const session = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    // Prevent deleting oneself
    if (id === session.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await prisma.adminUser.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
