/**
 * Validation utilities for PharmaLink
 */

/**
 * Validate a Rwandan phone number
 * @param phone - Phone number to validate
 * @returns boolean indicating if phone number is valid
 */
export function isValidRwandanPhone(phone: string): boolean {
  const pattern = /^(\+250|0)(7[238]\d{7})$/;
  return pattern.test(phone);
}

/**
 * Validate a Rwandan postal code
 * @param postalCode - Postal code to validate
 * @returns boolean indicating if postal code is valid
 */
export function isValidPostalCode(postalCode: string): boolean {
  // Rwanda uses a simple numeric postal code system
  return /^\d{4}$/.test(postalCode);
}

/**
 * Validate an email address
 * @param email - Email to validate
 * @returns boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}