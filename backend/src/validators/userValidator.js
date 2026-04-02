const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Viewer', 'Analyst', 'Admin']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
});

const updateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['Viewer', 'Analyst', 'Admin']).optional(),
  isActive: z.boolean().optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema
};
