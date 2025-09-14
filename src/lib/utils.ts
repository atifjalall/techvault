import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number | string) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(price));
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

// Generate random avatar for new users
export function getRandomAvatar(): string {
  const avatarNumber = Math.floor(Math.random() * 6) + 1;
  return `/profiles/Vector${avatarNumber === 3 ? "_3" : avatarNumber === 4 ? "_4" : avatarNumber === 5 ? "_5" : avatarNumber === 6 ? "_6" : avatarNumber}.png`;
}

// Get user initials for fallback
export function getUserInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  score: number;
  isValid: boolean;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push("At least 8 characters");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("One uppercase letter");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("One lowercase letter");

  if (/\d/.test(password)) score++;
  else feedback.push("One number");

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  else feedback.push("One special character");

  return {
    score,
    isValid: score >= 3,
    feedback,
  };
}
