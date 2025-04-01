
/**
 * Service for time-related functionality
 */

// Time zone for Iceland (always UTC+0)
const ICELAND_TIMEZONE = "Atlantic/Reykjavik";

/**
 * Get the current time in Iceland
 * @returns Current time information
 */
export const getCurrentTime = (): {
  isoString: string;
  timestamp: number;
  formatted: string;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number;
  date: number;
  month: number;
  year: number;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
} => {
  // Get current date
  const now = new Date();
  
  // Format time options
  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: ICELAND_TIMEZONE,
    hour12: false
  };
  
  // Get formatted time string
  const formattedTime = now.toLocaleTimeString("is-IS", timeFormatOptions);
  
  // Get hour of the day
  const hour = now.getHours();
  
  // Determine time of day
  let timeOfDay: "morning" | "afternoon" | "evening" | "night";
  if (hour >= 5 && hour < 12) {
    timeOfDay = "morning";
  } else if (hour >= 12 && hour < 18) {
    timeOfDay = "afternoon";
  } else if (hour >= 18 && hour < 22) {
    timeOfDay = "evening";
  } else {
    timeOfDay = "night";
  }
  
  return {
    isoString: now.toISOString(),
    timestamp: now.getTime(),
    formatted: formattedTime,
    hour: hour,
    minute: now.getMinutes(),
    second: now.getSeconds(),
    dayOfWeek: now.getDay(),
    date: now.getDate(),
    month: now.getMonth() + 1, // JavaScript months are 0-based
    year: now.getFullYear(),
    timeOfDay
  };
};

/**
 * Get day name in Icelandic
 * @param dayIndex Day of week (0-6, where 0 is Sunday)
 * @returns Day name in Icelandic
 */
export const getIcelandicDayName = (dayIndex: number): string => {
  const days = [
    "Sunnudagur",
    "Mánudagur",
    "Þriðjudagur",
    "Miðvikudagur",
    "Fimmtudagur",
    "Föstudagur",
    "Laugardagur"
  ];
  
  return days[dayIndex % 7];
};

/**
 * Get month name in Icelandic
 * @param monthIndex Month (1-12)
 * @returns Month name in Icelandic
 */
export const getIcelandicMonthName = (monthIndex: number): string => {
  const months = [
    "Janúar",
    "Febrúar",
    "Mars",
    "Apríl",
    "Maí",
    "Júní",
    "Júlí",
    "Ágúst",
    "September",
    "Október",
    "Nóvember",
    "Desember"
  ];
  
  // Adjust for 1-based month index
  return months[(monthIndex - 1) % 12];
};

/**
 * Format a date in Icelandic
 * @param date Date to format
 * @param format Format type
 * @returns Formatted date string
 */
export const formatIcelandicDate = (
  date: Date = new Date(),
  format: "short" | "medium" | "long" = "medium"
): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const dayOfWeek = date.getDay();
  
  switch (format) {
    case "short":
      return `${day}.${month}.${year}`;
    case "long":
      return `${getIcelandicDayName(dayOfWeek)}, ${day}. ${getIcelandicMonthName(month)} ${year}`;
    case "medium":
    default:
      return `${day}. ${getIcelandicMonthName(month)} ${year}`;
  }
};

/**
 * Get greeting based on time of day in Icelandic
 * @returns Appropriate greeting for the current time
 */
export const getTimeBasedGreeting = (): string => {
  const { hour } = getCurrentTime();
  
  if (hour >= 5 && hour < 12) {
    return "Góðan morgun";
  } else if (hour >= 12 && hour < 18) {
    return "Góðan dag";
  } else if (hour >= 18 && hour < 22) {
    return "Gott kvöld";
  } else {
    return "Góða nótt";
  }
};

/**
 * Check if a business is open based on current time and opening hours
 * @param openingHours Array of opening periods
 * @returns Whether the business is currently open
 */
export const isBusinessOpen = (
  openingHours: Array<{
    day: number;
    open: string;
    close: string;
  }>
): boolean => {
  const { dayOfWeek, hour, minute } = getCurrentTime();
  
  // Find today's opening hours
  const todayHours = openingHours.find(period => period.day === dayOfWeek);
  
  if (!todayHours) {
    return false; // Closed if no hours defined for today
  }
  
  // Parse opening hours
  const [openHour, openMinute] = todayHours.open.split(":").map(Number);
  const [closeHour, closeMinute] = todayHours.close.split(":").map(Number);
  
  // Calculate minutes since midnight for current time and opening/closing times
  const currentMinutes = hour * 60 + minute;
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;
  
  // Check if current time is within opening hours
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};
