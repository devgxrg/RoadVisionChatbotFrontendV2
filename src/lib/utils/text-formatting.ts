/**
 * Convert text to title case (capitalize first letter of each word)
 * Preserves backend-formatted text that's already properly capitalized
 * Example: "co-operation marketing and textiles department" 
 *          becomes "Co-Operation Marketing And Textiles Department"
 * Example: "Road Construction And Maintenance" stays "Road Construction And Maintenance"
 */
export const toTitleCase = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // Check if ALL words are already properly capitalized
  const words = text.split(' ').filter(word => word.length > 0);
  const allWordsCapitalized = words.every(word => word.charAt(0) === word.charAt(0).toUpperCase());
  
  // If all words already start with uppercase, return as-is
  if (allWordsCapitalized) {
    return text;
  }
  
  // Otherwise, apply title case to all words
  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Handle hyphenated words like "co-operation"
      return word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-');
    })
    .join(' ');
};
