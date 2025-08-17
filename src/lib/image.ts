"use client";
export function validateImage(file: File) {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file.type)) throw new Error("Only JPEG/PNG allowed");
  const max = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE || 2097152);
  if (file.size > max) throw new Error("Max 2MB");
}
