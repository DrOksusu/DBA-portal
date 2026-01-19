import { Router } from 'express';
import { verifyInternalToken } from '../middlewares/auth.middleware';
import { prisma } from '../server';

const router = Router();

router.use(verifyInternalToken);

// 직원 목록 조회 (다른 서비스에서 사용)
router.get('/employees', async (req, res) => {
  try {
    const { clinicId, status } = req.query;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'clinicId is required',
      });
    }

    const employees = await prisma.employee.findMany({
      where: {
        clinicId: clinicId as string,
        ...(status ? { status: status as any } : {}),
      },
      select: {
        id: true,
        userId: true,
        name: true,
        position: true,
        employmentType: true,
        status: true,
        baseSalary: true,
      },
    });

    return res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get employees',
    });
  }
});

// 직원 상세 조회 (by userId)
router.get('/employees/by-user/:userId', async (req, res) => {
  try {
    const { clinicId } = req.query;
    const { userId } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'clinicId is required',
      });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        clinicId: clinicId as string,
        userId,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    return res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get employee',
    });
  }
});

// 월별 인건비 총액 조회 (매출 분석용)
router.get('/salary/monthly-total', async (req, res) => {
  try {
    const { clinicId, year, month } = req.query;

    if (!clinicId || !year || !month) {
      return res.status(400).json({
        success: false,
        error: 'clinicId, year, and month are required',
      });
    }

    const salaries = await prisma.salary.findMany({
      where: {
        clinicId: clinicId as string,
        year: parseInt(year as string),
        month: parseInt(month as string),
      },
    });

    const totals = salaries.reduce(
      (acc, salary) => {
        const gross = salary.baseSalary + salary.overtimePay + salary.nightPay +
          salary.holidayPay + salary.incentive + salary.bonus + salary.allowances;

        return {
          totalGross: acc.totalGross + gross,
          totalNet: acc.totalNet + salary.netSalary,
          count: acc.count + 1,
        };
      },
      { totalGross: 0, totalNet: 0, count: 0 }
    );

    return res.json({
      success: true,
      data: totals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get monthly salary total',
    });
  }
});

// 목표 매출 조회
router.get('/targets/monthly', async (req, res) => {
  try {
    const { clinicId, year, month } = req.query;

    if (!clinicId || !year || !month) {
      return res.status(400).json({
        success: false,
        error: 'clinicId, year, and month are required',
      });
    }

    const target = await prisma.targetRevenue.findFirst({
      where: {
        clinicId: clinicId as string,
        year: parseInt(year as string),
        month: parseInt(month as string),
      },
    });

    return res.json({
      success: true,
      data: target,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get target revenue',
    });
  }
});

export default router;
