const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),

  email: z.email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),

  role: z.enum(["OWNER", "ADMIN", "DEVELOPER", "VIEWER"]),

  orgName: z.string(),
});

const loginSchema = z.object({
  email: z.email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

const createTemplateSchema = z.object({
  template_name: z
    .string()
    .trim()
    .min(1, "Template name is required")
    .max(100, "Template name cannot exceed 100 characters"),

  channel: z.enum(["email", "sms", "inapp"], {
    errorMap: () => ({ message: "Invalid channel." }),
  }),

  title: z
    .string()
    .trim()
    .max(255, "Title cannot exceed 255 characters")
    .optional(),

  body: z.string().trim().min(1, "Body is required"),
});

module.exports = { registerSchema, loginSchema , createTemplateSchema};
