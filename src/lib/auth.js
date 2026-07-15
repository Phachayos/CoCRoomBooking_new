import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only_please_change_in_production';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // 1 day
    .sign(key);
}

export async function decrypt(input) {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSessionToken(adminUser) {
  const session = await encrypt({ 
    id: adminUser.id, 
    studentId: adminUser.studentId,
    name: adminUser.name 
  });
  return session;
}

export async function getSession(request) {
  if (!request) return null;
  const session = request.cookies.get('session')?.value;
  if (!session) return null;
  return await decrypt(session);
}
