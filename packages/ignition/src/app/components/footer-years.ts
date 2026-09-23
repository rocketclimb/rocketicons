const COPYRIGHT_START_YEAR = 2024;

export const formatCopyrightYears = (currentYear: number) =>
  currentYear > COPYRIGHT_START_YEAR
    ? `${COPYRIGHT_START_YEAR}–${currentYear}`
    : `${COPYRIGHT_START_YEAR}`;
