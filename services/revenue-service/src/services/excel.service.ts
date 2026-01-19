import * as XLSX from 'xlsx';
import { prisma } from '../server';
import { DailyReportType } from '@prisma/client';

export interface ParsedIncomeRow {
  reportDate: string;
  chartNumber?: string;
  patientName?: string;
  memo?: string;
  cashAmount?: number;
  cardAmount?: number;
  transferAmount?: number;
}

export interface ParsedExpenseRow {
  reportDate: string;
  memo?: string;
  expenseAmount: number;
  expenseCategory: string;
}

export interface ParseResult {
  incomes: ParsedIncomeRow[];
  expenses: ParsedExpenseRow[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

// Column mapping for Korean headers
const INCOME_COLUMN_MAP: Record<string, keyof ParsedIncomeRow> = {
  '날짜': 'reportDate',
  '일자': 'reportDate',
  '차트번호': 'chartNumber',
  '환자명': 'patientName',
  '환자이름': 'patientName',
  '메모': 'memo',
  '비고': 'memo',
  '현금': 'cashAmount',
  '현금결제': 'cashAmount',
  '카드': 'cardAmount',
  '카드결제': 'cardAmount',
  '이체': 'transferAmount',
  '계좌이체': 'transferAmount',
};

const EXPENSE_COLUMN_MAP: Record<string, keyof ParsedExpenseRow> = {
  '날짜': 'reportDate',
  '일자': 'reportDate',
  '메모': 'memo',
  '비고': 'memo',
  '내용': 'memo',
  '금액': 'expenseAmount',
  '지출금액': 'expenseAmount',
  '분류': 'expenseCategory',
  '카테고리': 'expenseCategory',
  '지출분류': 'expenseCategory',
};

function parseDate(value: any): string | null {
  if (!value) return null;

  // If it's already a string in YYYY-MM-DD format
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // If it's an Excel date number
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
  }

  // Try to parse as date string
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  return null;
}

function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseInt(value.replace(/[,\s]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

export function parseExcelFile(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const result: ParseResult = {
    incomes: [],
    expenses: [],
    errors: [],
    totalRows: 0,
    validRows: 0,
  };

  // Process each sheet
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    if (data.length < 2) continue; // Need at least header + 1 row

    const headers = data[0] as string[];
    const sheetNameLower = sheetName.toLowerCase();

    // Determine sheet type based on name or content
    const isExpenseSheet = sheetNameLower.includes('지출') ||
                          sheetNameLower.includes('expense') ||
                          headers.some(h => h && (h.includes('지출') || h.includes('분류')));

    if (isExpenseSheet) {
      // Parse as expense
      const columnMap = mapColumns(headers, EXPENSE_COLUMN_MAP);

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.every(cell => !cell)) continue;

        result.totalRows++;

        const reportDate = parseDate(row[columnMap.reportDate ?? -1]);
        if (!reportDate) {
          result.errors.push(`Row ${i + 1}: Invalid or missing date`);
          continue;
        }

        const expense: ParsedExpenseRow = {
          reportDate,
          memo: row[columnMap.memo ?? -1]?.toString(),
          expenseAmount: parseNumber(row[columnMap.expenseAmount ?? -1]),
          expenseCategory: row[columnMap.expenseCategory ?? -1]?.toString() || '기타',
        };

        if (expense.expenseAmount > 0) {
          result.expenses.push(expense);
          result.validRows++;
        }
      }
    } else {
      // Parse as income
      const columnMap = mapColumns(headers, INCOME_COLUMN_MAP);

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.every(cell => !cell)) continue;

        result.totalRows++;

        const reportDate = parseDate(row[columnMap.reportDate ?? -1]);
        if (!reportDate) {
          result.errors.push(`Row ${i + 1}: Invalid or missing date`);
          continue;
        }

        const income: ParsedIncomeRow = {
          reportDate,
          chartNumber: row[columnMap.chartNumber ?? -1]?.toString(),
          patientName: row[columnMap.patientName ?? -1]?.toString(),
          memo: row[columnMap.memo ?? -1]?.toString(),
          cashAmount: parseNumber(row[columnMap.cashAmount ?? -1]),
          cardAmount: parseNumber(row[columnMap.cardAmount ?? -1]),
          transferAmount: parseNumber(row[columnMap.transferAmount ?? -1]),
        };

        const totalAmount = (income.cashAmount || 0) + (income.cardAmount || 0) + (income.transferAmount || 0);
        if (totalAmount > 0) {
          result.incomes.push(income);
          result.validRows++;
        }
      }
    }
  }

  return result;
}

function mapColumns<T>(headers: string[], columnMap: Record<string, keyof T>): Record<keyof T, number> {
  const result: Record<string, number> = {};

  headers.forEach((header, index) => {
    if (!header) return;
    const normalizedHeader = header.trim();

    for (const [key, field] of Object.entries(columnMap)) {
      if (normalizedHeader.includes(key) || normalizedHeader === key) {
        result[field as string] = index;
        break;
      }
    }
  });

  return result as Record<keyof T, number>;
}

export async function importParsedData(
  clinicId: string,
  userId: string,
  data: ParseResult
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;

  // Import incomes
  for (const income of data.incomes) {
    try {
      await prisma.dailyReport.create({
        data: {
          clinicId,
          userId,
          type: DailyReportType.INCOME,
          reportDate: income.reportDate,
          chartNumber: income.chartNumber,
          patientName: income.patientName,
          memo: income.memo,
          cashAmount: income.cashAmount || 0,
          cardAmount: income.cardAmount || 0,
          transferAmount: income.transferAmount || 0,
        },
      });
      imported++;
    } catch (error) {
      errors.push(`Failed to import income for ${income.reportDate}: ${error}`);
    }
  }

  // Import expenses
  for (const expense of data.expenses) {
    try {
      await prisma.dailyReport.create({
        data: {
          clinicId,
          userId,
          type: DailyReportType.EXPENSE,
          reportDate: expense.reportDate,
          memo: expense.memo,
          expenseAmount: expense.expenseAmount,
          expenseCategory: expense.expenseCategory,
        },
      });
      imported++;
    } catch (error) {
      errors.push(`Failed to import expense for ${expense.reportDate}: ${error}`);
    }
  }

  return { imported, errors };
}
