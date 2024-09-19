// resetTime.js

// Function to check if it's 5:45 AM

export const isNewDayRecord = (hours, minutes) => {
  // Adjust for a 4-hour difference between local time and UTC
  return hours === 5 && minutes === 45; // Check for 05:45 AM local time
};
