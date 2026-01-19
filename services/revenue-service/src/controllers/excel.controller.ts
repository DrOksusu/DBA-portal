import { Request, Response } from 'express';
import multer from 'multer';
import * as excelService from '../services/excel.service';

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'text/csv',
    ];

    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (xlsx, xls) and CSV files are allowed'));
    }
  },
});

export async function uploadAndParse(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const result = excelService.parseExcelFile(req.file.buffer);

    return res.json({
      success: true,
      data: {
        filename: req.file.originalname,
        totalRows: result.totalRows,
        validRows: result.validRows,
        incomeCount: result.incomes.length,
        expenseCount: result.expenses.length,
        preview: {
          incomes: result.incomes.slice(0, 5),
          expenses: result.expenses.slice(0, 5),
        },
        errors: result.errors.slice(0, 10), // Only return first 10 errors
      },
      // Store parsed data in session or temp storage for import
      parsedData: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: 'Failed to parse Excel file',
      message: error.message,
    });
  }
}

export async function importData(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;
    const userId = req.user?.id;

    if (!clinicId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID and User ID required',
      });
    }

    const { parsedData } = req.body;

    if (!parsedData || (!parsedData.incomes?.length && !parsedData.expenses?.length)) {
      return res.status(400).json({
        success: false,
        error: 'No data to import. Please upload and parse an Excel file first.',
      });
    }

    const result = await excelService.importParsedData(clinicId, userId, parsedData);

    return res.json({
      success: true,
      message: `Successfully imported ${result.imported} records`,
      data: {
        imported: result.imported,
        errors: result.errors,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to import data',
      message: error.message,
    });
  }
}

// Combined upload and import in one step
export async function uploadAndImport(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;
    const userId = req.user?.id;

    if (!clinicId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID and User ID required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Parse
    const parsed = excelService.parseExcelFile(req.file.buffer);

    if (parsed.validRows === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid data found in the file',
        details: parsed.errors,
      });
    }

    // Import
    const result = await excelService.importParsedData(clinicId, userId, parsed);

    return res.json({
      success: true,
      message: `Successfully imported ${result.imported} records`,
      data: {
        filename: req.file.originalname,
        totalRows: parsed.totalRows,
        validRows: parsed.validRows,
        imported: result.imported,
        errors: [...parsed.errors, ...result.errors].slice(0, 20),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to upload and import data',
      message: error.message,
    });
  }
}
