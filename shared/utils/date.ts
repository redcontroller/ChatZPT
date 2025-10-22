// Date utilities

// Date formatting options
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  LONG: 'MMMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  DATETIME: 'MM/dd/yyyy HH:mm',
  TIME: 'HH:mm',
  RELATIVE: 'relative',
} as const;

// Get current timestamp
export const now = (): Date => new Date();

// Get current timestamp in milliseconds
export const timestamp = (): number => Date.now();

// Get current timestamp in seconds
export const timestampSeconds = (): number => Math.floor(Date.now() / 1000);

// Parse date string or return current date
export const parseDate = (dateInput: string | Date | number | null | undefined): Date => {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'number') return new Date(dateInput);
  return new Date(dateInput);
};

// Check if date is valid
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

// Check if date is today
export const isToday = (date: string | Date): boolean => {
  const inputDate = parseDate(date);
  const today = new Date();
  
  return (
    inputDate.getDate() === today.getDate() &&
    inputDate.getMonth() === today.getMonth() &&
    inputDate.getFullYear() === today.getFullYear()
  );
};

// Check if date is yesterday
export const isYesterday = (date: string | Date): boolean => {
  const inputDate = parseDate(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return (
    inputDate.getDate() === yesterday.getDate() &&
    inputDate.getMonth() === yesterday.getMonth() &&
    inputDate.getFullYear() === yesterday.getFullYear()
  );
};

// Check if date is tomorrow
export const isTomorrow = (date: string | Date): boolean => {
  const inputDate = parseDate(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    inputDate.getDate() === tomorrow.getDate() &&
    inputDate.getMonth() === tomorrow.getMonth() &&
    inputDate.getFullYear() === tomorrow.getFullYear()
  );
};

// Check if date is in the past
export const isPast = (date: string | Date): boolean => {
  const inputDate = parseDate(date);
  return inputDate < new Date();
};

// Check if date is in the future
export const isFuture = (date: string | Date): boolean => {
  const inputDate = parseDate(date);
  return inputDate > new Date();
};

// Get start of day
export const startOfDay = (date: string | Date): Date => {
  const inputDate = parseDate(date);
  const result = new Date(inputDate);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Get end of day
export const endOfDay = (date: string | Date): Date => {
  const inputDate = parseDate(date);
  const result = new Date(inputDate);
  result.setHours(23, 59, 59, 999);
  return result;
};

// Get start of week (Monday)
export const startOfWeek = (date: string | Date): Date => {
  const inputDate = parseDate(date);
  const result = new Date(inputDate);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  result.setDate(diff);
  return startOfDay(result);
};

// Get end of week (Sunday)
export const endOfWeek = (date: string | Date): Date => {
  const inputDate = parseDate(date);
  const result = new Date(inputDate);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is Sunday
  result.setDate(diff);
  return endOfDay(result);
};

// Get start of month
export const startOfMonth = (date: string | Date): Date => {
  const inputDate = parseDate(date);
  const result = new Date(inputDate);
  result.setDate(1);
  return startOfDay(result);
};

// Get end of month
export const endOfMonth = (date: string | Date): Date => {
  const inputDate = parseDate(date);
  const result = new Date(inputDate);
  result.setMonth(result.getMonth() + 1, 0);
  return endOfDay(result);
};

// Add days to date
export const addDays = (date: string | Date, days: number): Date => {
  const inputDate = parseDate(date);
  const result = new Date(inputDate);
  result.setDate(result.getDate() + days);
  return result;
};

// Add months to date
export const addMonths = (date: string | Date, months: number): Date => {
  const inputDate = parseDate(date);
  const result = new Date(inputDate);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Add years to date
export const addYears = (date: string | Date, years: number): Date => {
  const inputDate = parseDate(date);
  const result = new Date(inputDate);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

// Get difference in days between two dates
export const diffInDays = (date1: string | Date, date2: string | Date): number => {
  const d1 = startOfDay(parseDate(date1));
  const d2 = startOfDay(parseDate(date2));
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get difference in hours between two dates
export const diffInHours = (date1: string | Date, date2: string | Date): number => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60));
};

// Get difference in minutes between two dates
export const diffInMinutes = (date1: string | Date, date2: string | Date): number => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60));
};

// Get difference in seconds between two dates
export const diffInSeconds = (date1: string | Date, date2: string | Date): number => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / 1000);
};

// Format date to ISO string
export const toISOString = (date: string | Date): string => {
  return parseDate(date).toISOString();
};

// Format date to local date string
export const toLocalDateString = (date: string | Date): string => {
  return parseDate(date).toLocaleDateString();
};

// Format date to local time string
export const toLocalTimeString = (date: string | Date): string => {
  return parseDate(date).toLocaleTimeString();
};

// Format date to local date time string
export const toLocalDateTimeString = (date: string | Date): string => {
  return parseDate(date).toLocaleString();
};

// Get timezone offset in minutes
export const getTimezoneOffset = (date: string | Date): number => {
  return parseDate(date).getTimezoneOffset();
};

// Convert UTC date to local time
export const utcToLocal = (utcDate: string | Date): Date => {
  const date = parseDate(utcDate);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - (offset * 60 * 1000));
};

// Convert local date to UTC
export const localToUTC = (localDate: string | Date): Date => {
  const date = parseDate(localDate);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() + (offset * 60 * 1000));
};

// Get age from birth date
export const getAge = (birthDate: string | Date): number => {
  const birth = parseDate(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Check if year is leap year
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Get days in month
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Get week number of year
export const getWeekNumber = (date: string | Date): number => {
  const inputDate = parseDate(date);
  const startOfYear = new Date(inputDate.getFullYear(), 0, 1);
  const pastDaysOfYear = (inputDate.getTime() - startOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
};

// Get quarter of year
export const getQuarter = (date: string | Date): number => {
  const inputDate = parseDate(date);
  return Math.floor(inputDate.getMonth() / 3) + 1;
};
