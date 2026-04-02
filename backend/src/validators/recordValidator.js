const { z } = require('zod');

const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['Income', 'Expense']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().datetime().optional().or(z.date().optional()),
  notes: z.string().optional()
});

const updateRecordSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(['Income', 'Expense']).optional(),
  category: z.string().optional(),
  date: z.string().datetime().optional().or(z.date().optional()),
  notes: z.string().optional()
});

const queryRecordSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['Income', 'Expense']).optional(),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10")
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  queryRecordSchema
};
