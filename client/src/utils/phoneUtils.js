/**
 * Formats a phone number by prepending country code if needed
 * @param {string} phoneNumber - The phone number to format
 * @param {string} countryCode - Country code to prepend (default: "91")
 * @returns {string} - Formatted phone number with country code
 */
export const formatPhoneNumber = (phoneNumber, countryCode = "91") => {
  if (!phoneNumber) return "";
  
  // Remove any non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");
  
  // If already starts with country code, return as is
  if (cleaned.startsWith(countryCode)) {
    return cleaned;
  }
  
  // If starts with +, remove it and check
  if (cleaned.startsWith("+")) {
    const withoutPlus = cleaned.substring(1);
    if (withoutPlus.startsWith(countryCode)) {
      return withoutPlus;
    }
    return countryCode + withoutPlus;
  }
  
  // Prepend country code
  return countryCode + cleaned;
};

/**
 * Formats phone number for dialing (adds country code)
 * Does NOT format callerId numbers
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatDialNumber = (phoneNumber) => {
  return formatPhoneNumber(phoneNumber, "91");
};
