export const getCurrencyTextFromNumber = (number: number): string => {
  return number.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });
}

export const getCurrencyNumberFromText = (text: string): number => {
  let cleaned = text.replace(/[^0-9.]/g, "");
  if (text.toLowerCase().includes("crore")) {
    return parseFloat(cleaned) * 10000000;
  } else if (text.toLowerCase().includes("lakh")) {
    return parseFloat(cleaned) * 100000;
  } else if (text.toLowerCase().includes("thousand")) {
    return parseFloat(cleaned) * 1000;
  } else {
    try {
      return parseFloat(cleaned);
    } catch (error) {
      console.log(error)
      return 0;
    }
  }
}

