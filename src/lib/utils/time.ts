/**
 * Time utility functions
 */

/**
 * Converts minutes to HH:MM format
 * @param minutes - Total minutes
 * @returns Formatted string in HH:MM format
 */
export function formatMinutesToHHMM(minutes: number): string {
  if (minutes < 0) return "00:00";
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = remainingMinutes.toString().padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes}`;
}

/**
 * Converts minutes to a human-readable duration string
 * @param minutes - Total minutes
 * @returns Formatted string like "2h 30m" or "45m"
 */
export function formatMinutesToHumanReadable(minutes: number): string {
  if (minutes < 0) return "0m";
  if (minutes === 0) return "0m";
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculates the duration between two dates in minutes
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Duration in minutes
 */
export function calculateDurationInMinutes(startDate: Date, endDate: Date): number {
  const durationMs = endDate.getTime() - startDate.getTime();
  return Math.max(0, Math.round(durationMs / (1000 * 60)));
}