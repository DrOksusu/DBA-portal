import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as employeeService from '../services/employee.service';

const createEmployeeSchema = z.object({
  userId: z.string().uuid().optional(),
  name: z.string().min(1, '이름은 필수입니다'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  position: z.enum(['DIRECTOR', 'ASSOCIATE', 'DENTIST', 'HYGIENIST', 'ASSISTANT', 'COORDINATOR', 'DESK', 'MANAGER', 'OTHER']),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).optional(),
  hireDate: z.string().transform((str) => new Date(str)),
  baseSalary: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const updateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  position: z.enum(['DIRECTOR', 'ASSOCIATE', 'DENTIST', 'HYGIENIST', 'ASSISTANT', 'COORDINATOR', 'DESK', 'MANAGER', 'OTHER']).optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).optional(),
  baseSalary: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const resignSchema = z.object({
  resignDate: z.string().transform((str) => new Date(str)),
  resignReason: z.string().optional(),
});

// 직원 목록 조회
export const getEmployees = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { status, position, employmentType, search, page, limit } = req.query;

    const result = await employeeService.getEmployees(
      {
        clinicId,
        status: status as any,
        position: position as any,
        employmentType: employmentType as any,
        search: search as string,
      },
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '직원 목록을 불러오는데 실패했습니다',
    });
  }
};

// 직원 상세 조회
export const getEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const employee = await employeeService.getEmployee(clinicId, id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: '직원을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '직원 정보를 불러오는데 실패했습니다',
    });
  }
};

// 직원 등록
export const createEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const validation = createEmployeeSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const employee = await employeeService.createEmployee({
      clinicId,
      ...validation.data,
    });

    return res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '직원 등록에 실패했습니다',
    });
  }
};

// 직원 정보 수정
export const updateEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;
    const validation = updateEmployeeSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const employee = await employeeService.updateEmployee(
      clinicId,
      id,
      validation.data,
      req.user!.id
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: '직원을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '직원 정보 수정에 실패했습니다',
    });
  }
};

// 퇴사 처리
export const resignEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;
    const validation = resignSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const employee = await employeeService.resignEmployee(
      clinicId,
      id,
      validation.data.resignDate,
      validation.data.resignReason
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: '직원을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '퇴사 처리에 실패했습니다',
    });
  }
};

// 재직 복귀
export const reinstateEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const employee = await employeeService.reinstateEmployee(clinicId, id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: '직원을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '재직 복귀 처리에 실패했습니다',
    });
  }
};

// 직원 삭제
export const deleteEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const employee = await employeeService.deleteEmployee(clinicId, id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: '직원을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      message: '직원이 삭제되었습니다',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '직원 삭제에 실패했습니다',
    });
  }
};

// 직원 통계
export const getEmployeeStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;

    const stats = await employeeService.getEmployeeStats(clinicId);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '직원 통계를 불러오는데 실패했습니다',
    });
  }
};
