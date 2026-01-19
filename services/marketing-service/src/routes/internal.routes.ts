import { Router } from 'express';
import { verifyInternalToken } from '../middlewares/auth.middleware';
import { prisma } from '../server';

const router = Router();

router.use(verifyInternalToken);

// 마케팅 비용 합계 조회 (다른 서비스에서 사용)
router.get('/expense/monthly-total', async (req, res) => {
  try {
    const { clinicId, year, month } = req.query;

    if (!clinicId || !year || !month) {
      return res.status(400).json({
        success: false,
        error: 'clinicId, year, and month are required',
      });
    }

    const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);

    const expenses = await prisma.marketingExpense.aggregate({
      where: {
        clinicId: clinicId as string,
        expenseDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    return res.json({
      success: true,
      data: {
        total: expenses._sum.amount || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get marketing expense total',
    });
  }
});

// 신규 환자 수 조회
router.get('/patients/new-count', async (req, res) => {
  try {
    const { clinicId, year, month } = req.query;

    if (!clinicId || !year || !month) {
      return res.status(400).json({
        success: false,
        error: 'clinicId, year, and month are required',
      });
    }

    const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);

    const count = await prisma.patientSource.count({
      where: {
        clinicId: clinicId as string,
        visitDate: { gte: startDate, lte: endDate },
      },
    });

    return res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get new patient count',
    });
  }
});

// 채널별 환자 유입 조회
router.get('/patients/by-channel', async (req, res) => {
  try {
    const { clinicId, year, month } = req.query;

    if (!clinicId || !year || !month) {
      return res.status(400).json({
        success: false,
        error: 'clinicId, year, and month are required',
      });
    }

    const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);

    const sources = await prisma.patientSource.groupBy({
      by: ['channel'],
      where: {
        clinicId: clinicId as string,
        visitDate: { gte: startDate, lte: endDate },
      },
      _count: true,
      _sum: { totalRevenue: true },
    });

    const byChannel = sources.reduce((acc, source) => {
      acc[source.channel] = {
        count: source._count,
        revenue: source._sum.totalRevenue || 0,
      };
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return res.json({
      success: true,
      data: byChannel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get patient sources by channel',
    });
  }
});

// 활성 캠페인 목록 조회
router.get('/campaigns/active', async (req, res) => {
  try {
    const { clinicId } = req.query;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'clinicId is required',
      });
    }

    const campaigns = await prisma.campaign.findMany({
      where: {
        clinicId: clinicId as string,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        channel: true,
        budgetAmount: true,
        spentAmount: true,
      },
    });

    return res.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get active campaigns',
    });
  }
});

export default router;
