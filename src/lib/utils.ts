import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateSmsCount(message: string): number {
  const length = message.length;
  if (length === 0) return 0;
  if (length <= 160) return 1;
  return Math.ceil(length / 153); // Standard SMS concatenation is 153 chars per segment
}
