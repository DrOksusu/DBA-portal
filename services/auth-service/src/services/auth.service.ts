import bcrypt from 'bcryptjs';
import { prisma } from '../server';
import { TokenPayload } from '../types';
import { generateTokens, getRefreshTokenExpiry } from './token.service';

export async function createUser(email: string, password: string, name: string, clinicId?: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      clinicId,
      status: 'PENDING',
      role: 'USER',
    },
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  if (user.status !== 'APPROVED') {
    throw new Error(`Account is ${user.status.toLowerCase()}. Please wait for admin approval.`);
  }

  const permissions = (user.permissions as string[]) || [];
  const tokenPayload: TokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name || '',
    role: user.role,
    clinicId: user.clinicId || '',
    permissions,
  };

  const { accessToken, refreshToken } = generateTokens(tokenPayload);

  // Save refresh token to database
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { user, accessToken, refreshToken };
}

export async function refreshUserToken(oldRefreshToken: string) {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new Error('Invalid refresh token');
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new Error('Refresh token expired');
  }

  const user = storedToken.user;
  if (user.status !== 'APPROVED') {
    throw new Error('Account is not approved');
  }

  // Delete old refresh token
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const permissions = (user.permissions as string[]) || [];
  const tokenPayload: TokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name || '',
    role: user.role,
    clinicId: user.clinicId || '',
    permissions,
  };

  const { accessToken, refreshToken } = generateTokens(tokenPayload);

  // Save new refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { user, accessToken, refreshToken };
}

export async function logoutUser(userId: string, refreshToken?: string) {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  } else {
    // Delete all refresh tokens for user
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      clinicId: true,
      teamName: true,
      isTeamLeader: true,
      permissions: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function verifyToken(token: string) {
  const { verifyAccessToken } = await import('./token.service');

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== 'APPROVED') {
      return { valid: false };
    }

    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clinicId: user.clinicId,
        permissions: user.permissions,
      },
    };
  } catch (error) {
    return { valid: false };
  }
}
