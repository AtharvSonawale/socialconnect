import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(3), // email or username
  password: z.string().min(6),
});

export const postCreateSchema = z.object({
  content: z.string().max(280),
  category: z
    .enum(["general", "announcement", "question"])
    .optional()
    .default("general"),
  image_url: z.string().url().optional(),
});

export const profileUpdateSchema = z.object({
  bio: z.string().max(160).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  website: z.string().url().nullable().optional(),
  location: z.string().nullable().optional(),
  profile_visibility: z
    .enum(["public", "private", "followers_only"])
    .optional(),
});

export const commentCreateSchema = z.object({
  content: z.string().min(1).max(200),
});
