//
// getSumDecksUsedToday.js

import { fetchData } from "../utils/fetchData.js";

// Function to calculate the sum of decksUsedToday
export async function getSumDecksUsedToday() {
  try {
    // Fetch river race data
    const riverRaceData = await fetchData(
      "/clans/%23LVUQ9CYC/currentriverrace"
    );

    const participants = riverRaceData.clan.participants || [];

    // Sum the `decksUsedToday` values
    const totalDecksUsedToday = participants.reduce((sum, participant) => {
      return sum + (participant.decksUsedToday || 0); // Safeguard for missing values
    }, 0);

    return totalDecksUsedToday; // Return the total sum
  } catch (error) {
    console.error("Error calculating decksUsedToday sum:", error);
    throw error;
  }
}
