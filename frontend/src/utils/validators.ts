// Validation functions
export const validateEmail = (email: string): string | undefined => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email address";
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (password.length < 8) return "Password must be at least 8 characters long";
  return undefined;
};

export const validateName = (
  name: string,
  fieldName: string
): string | undefined => {
  if (name.trim().length === 0) return `${fieldName} is required`;
  return undefined;
};
