import { z } from "zod";

export const UserSignupSchema = z
  .object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email address"),
    password: z
      .string({
        required_error: "Password is required",
      })
      .trim()
      .refine(
        (val: string) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{6,20}$/.test(
            val
          ),
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }
      ),
    confirmPassword: z
      .string({
        required_error: "Confirm password is required",
      })
      .trim()
      .min(1),
    phone: z
      .string({
        required_error: "Phone number is required",
      })
      .regex(/^\+?[1-9]\d{1,14}$/, {
        message:
          "Invalid phone number format. Please use a valid international format (e.g., +1234567890).",
      }),
  })
  .refine(
    (data: { password: any; confirmPassword: any }) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

export const UserSigninSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z
    .string()
    .trim()
    .refine(
      (val) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{6,20}$/.test(
          val
        ),
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
});

export const ConfirmCodeSchema = z.object({
  confirmationCode: z
    .string()
    .trim()
    .min(6, { message: "Code must be at least 6 characters long" })
    .max(6, { message: "Code must be exactly 6 characters long" }),
});

export type UserSignup = z.infer<typeof UserSignupSchema>;
export type ConfirmCode = z.infer<typeof ConfirmCodeSchema>;
export type UserSignin = z.infer<typeof UserSigninSchema>;
