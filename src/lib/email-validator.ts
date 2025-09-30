import disposableDomains from "disposable-email-domains";

// Additional domains not in the package (keep updated)
const additionalDisposableDomains = [
  "tempmail.com",
  "guerrillamail.com",
  "mailinator.com",
  "10minutemail.com",
  "throwaway.email",
  "temp-mail.org",
  "getnada.com",
  "maildrop.cc",
  "trashmail.com",
];

const allDisposableDomains = new Set([
  ...disposableDomains,
  ...additionalDisposableDomains,
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split("@")[1];

  if (!domain) return false;

  return allDisposableDomains.has(domain);
}

export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Check for disposable email
  if (isDisposableEmail(email)) {
    return {
      valid: false,
      error:
        "Temporary email addresses are not allowed. Please use a permanent email address.",
    };
  }

  return { valid: true };
}
