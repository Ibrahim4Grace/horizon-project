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

export const adminRegisterSchema = z
  .object({
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
  .superRefine(({ password, confirm_password }, ctx) => {
    if (password !== confirm_password) {
      ctx.addIssue({
        path: ['confirm_password'],
        message: 'Passwords must match',
      });
    }
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
  course_name: z
    .string()
    .trim()
    .min(1, 'Course name is required')
    .transform(sanitizeInput),
});

// NOT USE
export const passwordSchema = z
  .object({
    current_password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .transform(sanitizeInput),
    new_password: z
      .string()
      .min(6, 'New password is required')
      .regex(
        passwordRegex,
        'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
      )
      .transform(sanitizeInput),
    confirm_password: z
      .string()
      .min(8, 'Confirm password is required')
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

export const plansSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Plan name is required')
    .transform(sanitizeInput),
  price: z.number().optional(),
  currency: z
    .string()
    .trim()
    .min(1, 'Plan name is required')
    .transform(sanitizeInput),
  duration: z.string().trim().optional().transform(sanitizeInput),
  features: z
    .string()
    .trim()
    .min(1, 'Features is required')
    .transform(sanitizeInput),
});

export const chargeRequestSchema = z.object({
  planId: z.string().nonempty('Plan ID is required'),
  card: z
    .object({
      number: z
        .string()
        .regex(/^\d{15,19}$/, { message: 'Invalid card number' }),
      cvv: z.string().regex(/^\d{3,4}$/, { message: 'Invalid CVV' }),
      expiryMonth: z
        .string()
        .regex(/^(0[1-9]|1[0-2])$/, { message: 'Invalid expiry month' }),
      expiryYear: z
        .string()
        .regex(/^\d{4}$/, { message: 'Invalid expiry year' }),
    })
    .refine(
      (card) => {
        const currentDate = new Date();
        const cardDate = new Date(
          card.expiryYear,
          parseInt(card.expiryMonth) - 1
        );
        return cardDate >= currentDate;
      },
      { message: 'Card has expired' }
    ),
});

export const pinSchema = z.object({
  reference: z
    .string()
    .trim()
    .min(1, 'Reference is required')
    .transform(sanitizeInput),

  pin: z.string().trim().min(1, 'Pin is required').transform(sanitizeInput),
});

export const otpSchema = z.object({
  reference: z
    .string()
    .trim()
    .min(1, 'Reference is required')
    .transform(sanitizeInput),

  otp: z.string().trim().min(1, 'Otp is required').transform(sanitizeInput),
});

export const coordinatesSchema = z.object({
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
});

const addressSchema = z.object({
  street: z.string().nonempty(),
  city: z.string().nonempty(),
  state: z.string().nonempty(),
  country: z.string().length(2),
  zipcode: z.string().nonempty(),
});

export const companyLocationSchema = z.object({
  name: z.string().trim().min(1, 'Company name is required'),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  radius: z.number().min(1).max(1000).default(20),
  address: z.array(addressSchema).length(1),
});
export const reminderSchema = z.object({
  clockInReminder: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/, 'Invalid time format'),
  clockOutReminder: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/, 'Invalid time format'),
});

export const notificationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title type is required')
    .transform(sanitizeInput),
  body: z.string().trim().min(1, 'Body is required').transform(sanitizeInput),
  deviceToken: z
    .string()
    .trim()
    .min(1, 'Token is required')
    .transform(sanitizeInput),
});
