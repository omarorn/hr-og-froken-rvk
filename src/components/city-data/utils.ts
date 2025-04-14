
/**
 * Format a date string for display
 * @param dateString Date string to format
 * @returns Formatted date string in Icelandic format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('is-IS', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
