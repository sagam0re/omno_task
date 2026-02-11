export const maskCardNumber = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\D/g, "");

  if (cleanNumber.length < 10) {
    return "*".repeat(cleanNumber.length - 4) + cleanNumber.slice(-4);
  }

  const maskLength = cleanNumber.length - 10;
  const first4 = cleanNumber.slice(0, 4);
  const last4 = cleanNumber.slice(-4);

  return `${first4}${"*".repeat(maskLength)}${last4}`;
};
