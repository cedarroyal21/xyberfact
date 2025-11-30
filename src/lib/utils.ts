import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColor(score: number): string {
  if (score >= 70) {
    return 'text-accent'; // green
  }
  if (score >= 40) {
    return 'text-yellow-500'; // yellow
  }
  return 'text-destructive'; // red
}
