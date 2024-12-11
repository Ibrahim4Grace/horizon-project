import { z, ZodDate } from 'zod';
import validator from 'validator';

const sanitizeInput = (value) => {
  return validator.trim(validator.escape(value));
};

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const registerSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .transform(sanitizeInput),

  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform(sanitizeInput),

  course_interest: z
    .string()
    .trim()
    .min(1, 'Course is required')
    .transform(sanitizeInput),

  class_option: z
    .string()
    .trim()
    .min(1, 'Class option is required')
    .transform(sanitizeInput),

  phone_number: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .transform(sanitizeInput),

  password: z
    .string()
    .min(8)
    .regex(
      passwordRegex,
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export const adminRegisterSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .transform(sanitizeInput),

  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform(sanitizeInput),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .optional()
    .transform(sanitizeInput),

  phone_number: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .transform(sanitizeInput),
});

export const verifySchema = z.object({
  otp: z.string().trim().min(1, 'otp is required').transform(sanitizeInput),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform(sanitizeInput),

  password: z
    .string()
    .min(8)
    .regex(
      passwordRegex,
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export const forgetPswdSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform(sanitizeInput),
});

export const newPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .transform(sanitizeInput),
    confirm_password: z
      .string()
      .min(8, 'Confirm password is required')
      .regex(
        passwordRegex,
        'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
      )
      .transform(sanitizeInput),
  })
  .superRefine(({ new_password, confirm_password }, ctx) => {
    if (new_password !== confirm_password) {
      ctx.addIssue({
        path: ['confirm_password'],
        message: 'Passwords must match',
      });
    }
  });

export const courseSchema = z.object({
  price: z.string().trim().min(1, 'Price is required').transform(sanitizeInput),
  name: z
    .string()
    .trim()
    .min(1, 'Course name is required')
    .transform(sanitizeInput),
});

export const pinSchema = z.object({
  price: z.string().trim().min(1, 'Price is required').transform(sanitizeInput),
  name: z
    .string()
    .trim()
    .min(1, 'Pin name is required')
    .transform(sanitizeInput),
});

export const otpSchema = z.object({
  reference: z
    .string()
    .trim()
    .min(1, 'Reference is required')
    .transform(sanitizeInput),

  otp: z.string().trim().min(1, 'Otp is required').transform(sanitizeInput),
});

export const updateDataSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Full nme is required')
    .transform(sanitizeInput),
  email: z.string().trim().min(1, 'Email is required').transform(sanitizeInput),
  dob: z.string().trim().min(1, 'Dob is required').transform(sanitizeInput),
  phone_number: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .transform(sanitizeInput),
  home_address: z
    .string()
    .trim()
    .min(1, 'Home address is required')
    .transform(sanitizeInput),
  current_password: z
    .string()
    .optional()
    .refine((value) => {
      if (value && value.length < 8) {
        return false;
      }
      return true;
    }, 'Password must be at least 8 characters long')
    .transform(sanitizeInput),
  new_password: z
    .string()
    .optional()
    .refine((value) => {
      if (value && value.length < 8) {
        return false;
      }
      return true;
    }, 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character')

    .transform(sanitizeInput),
});

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Full nme is required')
    .transform(sanitizeInput),
  email: z.string().trim().min(1, 'Email is required').transform(sanitizeInput),
  message: z
    .string()
    .trim()
    .min(1, 'message is required')
    .transform(sanitizeInput),
});

export const updateadminSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Full nme is required')
    .transform(sanitizeInput),
  email: z.string().trim().min(1, 'Email is required').transform(sanitizeInput),
  phone_number: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .transform(sanitizeInput),
  current_password: z
    .string()
    .optional()
    .refine((value) => {
      if (value && value.length < 8) {
        return false;
      }
      return true;
    }, 'Password must be at least 8 characters long')
    .transform(sanitizeInput),
  new_password: z
    .string()
    .optional()
    .refine((value) => {
      if (value && value.length < 8) {
        return false;
      }
      return true;
    }, 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character')

    .transform(sanitizeInput),
});
