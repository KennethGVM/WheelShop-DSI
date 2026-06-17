export const formatNicaraguanPhone = (value: string): string => {
  if (!value || value === '+505 ' || value === '+505') return '';

  const rawText = value.replace(/^\+505\s?/, '');

  let digits = rawText.replace(/\D/g, '');


  if (digits.length >= 11 && digits.startsWith('505')) {
    digits = digits.substring(3);
  }

  digits = digits.substring(0, 8);

  if (digits.length === 0) return '';

  if (digits.length <= 4) {
    return `+505 ${digits}`;
  }

  return `+505 ${digits.slice(0, 4)}-${digits.slice(4)}`;
};

export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
