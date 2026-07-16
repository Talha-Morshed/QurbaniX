/**
 * Validates whether the given email address has a correct email format.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates whether the given phone number is a valid Bangladeshi number.
 * Must be exactly 11 digits and start with "01".
 * @param {string} phone
 * @returns {boolean}
 */
export function validatePhone(phone) {
  if (!phone) return false;
  const cleanPhone = phone.trim();
  const phoneRegex = /^01\d{9}$/;
  return phoneRegex.test(cleanPhone);
}
