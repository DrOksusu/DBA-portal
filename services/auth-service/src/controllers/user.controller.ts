import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().optional(),
  teamName: z.string().optional(),
});

const approveUserSchema = z.object({
  clinicId: z.string().min(1, 'Clinic ID is required'),
  role: z.enum(['USER', 'ADMIN', 'TEAM_LEADER', 'MANAGER']).optional(),
  permissions: z.array(z.string()).optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'TEAM_LEADER', 'MANAGER']),
  permissions: z.array(z.string()).optional(),
});

export async function getMe(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get user info',
    });
  }
}

export async function updateMe(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const validation = updateUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: validation.data,
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
        updatedAt: true,
      },
    });

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update user info',
    });
  }
}

export async function getPendingUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get pending users',
    });
  }
}

export async function approveUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validation = approveUserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const { clinicId, role, permissions } = validation.data;

    const user = await prisma.user.update({
      where: { id },
      data: {
        status: 'APPROVED',
        clinicId,
        role: role || 'USER',
        permissions: permissions || [],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        clinicId: true,
        permissions: true,
      },
    });

    return res.json({
      success: true,
      message: 'User approved successfully',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to approve user',
    });
  }
}

export async function rejectUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { status: 'REJECTED' },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    });

    return res.json({
      success: true,
      message: 'User rejected',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to reject user',
    });
  }
}

export async function updateUserRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validation = updateRoleSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const { role, permissions } = validation.data;

    const user = await prisma.user.update({
      where: { id },
      data: {
        role,
        permissions: permissions || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
      },
    });

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update user role',
    });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const { clinicId, status, role, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    if (status) where.status = status;
    if (role) where.role = role;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          clinicId: true,
          teamName: true,
          isTeamLeader: true,
          createdAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: users,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get users',
    });
  }
}
