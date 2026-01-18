import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';

const createTeamSchema = z.object({
  teamName: z.string().min(1, 'Team name is required'),
});

const updateTeamSchema = z.object({
  teamName: z.string().optional(),
  isActive: z.boolean().optional(),
});

const addMemberSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
});

export async function getTeams(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    const teams = await prisma.team.findMany({
      where: { clinicId },
      include: {
        members: {
          select: {
            id: true,
            employeeId: true,
            joinedAt: true,
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
}

export async function createTeam(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    const validation = createTeamSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const team = await prisma.team.create({
      data: {
        clinicId,
        teamName: validation.data.teamName,
      },
    });

    return res.status(201).json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Team with this name already exists',
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to create team',
    });
  }
}

export async function updateTeam(req: Request, res: Response) {
  try {
    const { teamName } = req.params;
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    const validation = updateTeamSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const team = await prisma.team.update({
      where: {
        clinicId_teamName: { clinicId, teamName },
      },
      data: validation.data,
    });

    return res.json({
      success: true,
      data: team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update team',
    });
  }
}

export async function deleteTeam(req: Request, res: Response) {
  try {
    const { teamName } = req.params;
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    await prisma.team.delete({
      where: {
        clinicId_teamName: { clinicId, teamName },
      },
    });

    return res.json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete team',
    });
  }
}

export async function addTeamMember(req: Request, res: Response) {
  try {
    const { teamName } = req.params;
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    const validation = addMemberSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const team = await prisma.team.findUnique({
      where: {
        clinicId_teamName: { clinicId, teamName },
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        employeeId: validation.data.employeeId,
      },
    });

    return res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Employee is already a member of this team',
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to add team member',
    });
  }
}

export async function removeTeamMember(req: Request, res: Response) {
  try {
    const { teamName, employeeId } = req.params;
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    const team = await prisma.team.findUnique({
      where: {
        clinicId_teamName: { clinicId, teamName },
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    await prisma.teamMember.delete({
      where: {
        teamId_employeeId: { teamId: team.id, employeeId },
      },
    });

    return res.json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to remove team member',
    });
  }
}
