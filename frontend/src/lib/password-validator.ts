import { z } from "zod";

// Define the password policy type
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays: number;
}

// Default password policy (fallback if settings are not available)
export const defaultPasswordPolicy: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  expiryDays: 90
};

/**
 * Creates a Zod schema for password validation based on the provided password policy
 * @param policy The password policy to use for validation
 * @returns A Zod schema for password validation
 */
export function createPasswordSchema(policy: PasswordPolicy = defaultPasswordPolicy) {
  let schema = z.string().min(policy.minLength, `Password must be at least ${policy.minLength} characters`);
  
  if (policy.requireUppercase) {
    schema = schema.regex(/[A-Z]/, "Password must contain at least one uppercase letter");
  }
  
  if (policy.requireLowercase) {
    schema = schema.regex(/[a-z]/, "Password must contain at least one lowercase letter");
  }
  
  if (policy.requireNumbers) {
    schema = schema.regex(/[0-9]/, "Password must contain at least one number");
  }
  
  if (policy.requireSpecialChars) {
    schema = schema.regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");
  }
  
  return schema;
}

/**
 * Validates a password against the provided password policy
 * @param password The password to validate
 * @param policy The password policy to use for validation
 * @returns An object with a valid flag and any error messages
 */
export function validatePassword(password: string, policy: PasswordPolicy = defaultPasswordPolicy): { valid: boolean; errors: string[] } {
  const schema = createPasswordSchema(policy);
  const result = schema.safeParse(password);
  
  if (result.success) {
    return { valid: true, errors: [] };
  } else {
    return { 
      valid: false, 
      errors: result.error.errors.map(err => err.message)
    };
  }
}

/**
 * Formats the password policy into a human-readable string
 * @param policy The password policy to format
 * @returns A string describing the password policy
 */
export function formatPasswordPolicy(policy: PasswordPolicy = defaultPasswordPolicy): string {
  const requirements = [];
  
  requirements.push(`At least ${policy.minLength} characters`);
  
  if (policy.requireUppercase) {
    requirements.push("At least one uppercase letter");
  }
  
  if (policy.requireLowercase) {
    requirements.push("At least one lowercase letter");
  }
  
  if (policy.requireNumbers) {
    requirements.push("At least one number");
  }
  
  if (policy.requireSpecialChars) {
    requirements.push("At least one special character (!@#$%^&*(),.?\":{}|<>)");
  }
  
  return requirements.join("\n• ");
}
