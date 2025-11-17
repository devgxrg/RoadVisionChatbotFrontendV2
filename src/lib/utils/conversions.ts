export const getCurrencyTextFromNumber = (number: number): string => {
  let crore = number / 10000000;
  let result = crore.toString() + " Crores"

  return result;
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

