
import { addDays, subDays, startOfToday, parse } from "date-fns";

export const parseNaturalLanguageDate = (text: string): Date | null => {
  const normalizedText = text.toLowerCase().trim();
  
  switch (normalizedText) {
    case "tomorrow":
      return addDays(startOfToday(), 1);
    case "yesterday":
      return subDays(startOfToday(), 1);
    case "today":
      return startOfToday();
    default:
      try {
        // Try to parse as a regular date string
        const date = parse(text, 'yyyy-MM-dd', new Date());
        return date;
      } catch {
        return null;
      }
  }
};
