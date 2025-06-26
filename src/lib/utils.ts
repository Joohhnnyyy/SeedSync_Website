import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ✅ Use environment variable for backend base URL, fallback to Render URL
export const BASE_URL = import.meta.env.VITE_API_URL || "https://backed-23ow.onrender.com";

// Helper to prefix API routes
export function apiUrl(path: string) {
  // If path already starts with http, return as is
  if (/^https?:\/\//.test(path)) return path;
  // Ensure no double slashes
  return `${BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
}
