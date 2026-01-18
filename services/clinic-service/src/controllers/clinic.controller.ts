import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';

const createClinicSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

const updateClinicSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  logoUrl: z.string().optional(),
});

export async function getClinic(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const clinic = await prisma.clinic.findUnique({
      where: { id },
      include: {
        teams: {
          where: { isActive: true },
          select: {
            id: true,
            teamName: true,
            isActive: true,
          },
        },
      },
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        error: 'Clinic not found',
      });
    }

    return res.json({
      success: true,
      data: clinic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get clinic',
    });
  }
}

export async function updateClinic(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validation = updateClinicSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const clinic = await prisma.clinic.update({
      where: { id },
      data: validation.data,
    });

    return res.json({
      success: true,
      data: clinic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update clinic',
    });
  }
}

export async function createClinic(req: Request, res: Response) {
  try {
    const validation = createClinicSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const clinic = await prisma.clinic.create({
      data: validation.data,
    });

    return res.status(201).json({
      success: true,
      data: clinic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create clinic',
    });
  }
}

export async function uploadLogo(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // For now, return a placeholder - actual file upload would use multer
    // and a storage service like S3
    return res.json({
      success: true,
      message: 'Logo upload endpoint - implement with file storage service',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to upload logo',
    });
  }
}

export async function getAllClinics(req: Request, res: Response) {
  try {
    const clinics = await prisma.clinic.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.json({
      success: true,
      data: clinics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get clinics',
    });
  }
}
