import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSessionToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { studentId, password } = await request.json();

    if (!studentId || !password) {
      return NextResponse.json({ error: "Missing studentId or password" }, { status: 400 });
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { studentId }
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, adminUser.password);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionToken = await createSessionToken(adminUser);
    
    const response = NextResponse.json({ 
      success: true, 
      user: { id: adminUser.id, studentId: adminUser.studentId, name: adminUser.name } 
    });

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    response.cookies.set('session', sessionToken, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
