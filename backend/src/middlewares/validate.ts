import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ALLOWED_BRANCHES, ALLOWED_SECTIONS, ALLOWED_YEARS, KIET_EMAIL_DOMAIN } from '../constants/branches';

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: 'Invalid request data',
      });
    }
  };
};

// Custom refinement for branch case-insensitivity
const branchSchema = z
  .string({ required_error: 'Branch is required' })
  .trim()
  .refine(
    (val) => {
      const lower = val.toLowerCase();
      return ALLOWED_BRANCHES.some((b) => b.toLowerCase() === lower);
    },
    {
      message: `Branch must be one of: ${ALLOWED_BRANCHES.join(', ')}`,
    }
  )
  .transform((val) => {
    const matched = ALLOWED_BRANCHES.find((b) => b.toLowerCase() === val.toLowerCase());
    return matched ?? val;
  });

export const studentRegistrationSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'Name must include both first name and last name',
    }),
  collegeId: z
    .string({ required_error: 'College ID is required' })
    .trim()
    .regex(/^\d{15}$/, 'College ID must be exactly 15 digits'),
  year: z.enum(ALLOWED_YEARS, {
    errorMap: () => ({ message: 'Year must be 1 or 2 (1st and 2nd year only)' }),
  }),
  branch: branchSchema,
  section: z.enum(ALLOWED_SECTIONS, {
    errorMap: () => ({ message: 'Section must be A, B, C, D, or E' }),
  }),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit Indian WhatsApp number'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address')
    .refine((val) => val.toLowerCase().endsWith(KIET_EMAIL_DOMAIN), {
      message: 'Only official college emails ending with @kiet.edu are allowed',
    })
    .transform((val) => val.toLowerCase()),
});

export const paymentVerificationSchema = z.object({
  razorpay_order_id: z.string({ required_error: 'razorpay_order_id is required' }).trim().min(1),
  razorpay_payment_id: z.string({ required_error: 'razorpay_payment_id is required' }).trim().min(1),
  razorpay_signature: z.string({ required_error: 'razorpay_signature is required' }).trim().min(1),
});

export const adminManualRegistrationSchema = studentRegistrationSchema.extend({
  paymentStatus: z.enum(['pending', 'success', 'failed']).optional(),
  paymentMethod: z.enum(['razorpay', 'manual_cash']).optional(),
  notes: z.string().optional(),
});

export const adminUpdateStatusSchema = z.object({
  paymentStatus: z.enum(['pending', 'success', 'failed'], {
    errorMap: () => ({ message: 'paymentStatus must be pending, success, or failed' }),
  }),
  notes: z.string().optional(),
});
