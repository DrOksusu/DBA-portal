import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';

const setPreferenceSchema = z.object({
  value: z.any(),
});

export async function getAllPreferences(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const preferences = await prisma.userPreference.findMany({
      where: { userId },
      select: {
        key: true,
        value: true,
        updatedAt: true,
      },
    });

    // Convert to key-value object
    const preferencesMap = preferences.reduce((acc, pref) => {
      acc[pref.key] = pref.value;
      return acc;
    }, {} as Record<string, any>);

    return res.json({
      success: true,
      data: preferencesMap,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get preferences',
    });
  }
}

export async function getPreference(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { key } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const preference = await prisma.userPreference.findUnique({
      where: {
        userId_key: { userId, key },
      },
    });

    if (!preference) {
      return res.status(404).json({
        success: false,
        error: 'Preference not found',
      });
    }

    return res.json({
      success: true,
      data: preference.value,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get preference',
    });
  }
}

export async function setPreference(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const clinicId = req.user?.clinicId;
    const { key } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const validation = setPreferenceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const preference = await prisma.userPreference.upsert({
      where: {
        userId_key: { userId, key },
      },
      update: {
        value: validation.data.value,
        clinicId: clinicId || undefined,
      },
      create: {
        userId,
        key,
        value: validation.data.value,
        clinicId: clinicId || undefined,
      },
    });

    return res.json({
      success: true,
      data: preference,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to save preference',
    });
  }
}

export async function deletePreference(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { key } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    await prisma.userPreference.delete({
      where: {
        userId_key: { userId, key },
      },
    });

    return res.json({
      success: true,
      message: 'Preference deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete preference',
    });
  }
}
