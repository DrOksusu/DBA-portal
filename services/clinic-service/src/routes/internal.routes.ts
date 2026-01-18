import { Router } from 'express';
import { prisma } from '../server';
import { verifyInternalToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyInternalToken);

// Get clinic by ID (for other services)
router.get('/clinics/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await prisma.clinic.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
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
});

// Get teams for a clinic (for other services)
router.get('/teams', async (req, res) => {
  try {
    const { clinicId } = req.query;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    const teams = await prisma.team.findMany({
      where: {
        clinicId: clinicId as string,
        isActive: true,
      },
      include: {
        members: {
          select: {
            employeeId: true,
          },
        },
      },
      orderBy: { teamName: 'asc' },
    });

    return res.json({
      success: true,
      data: teams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get teams',
    });
  }
});

export default router;
