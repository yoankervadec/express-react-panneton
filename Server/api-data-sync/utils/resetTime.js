// resetTime.js

import { formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";

// Utility function to get the formatted date
export const getCurrentTimeStamp = (currentTimestamp) => {
  const formattedTimestamp = format(currentTimestamp, "yyyy-MM-dd HH:mm");
  return formattedTimestamp;
};

// Function to get the sum of the decks used in the current period
export const sumDecksUsedToday = async (connection) => {
  try {
    // Fetch the latest last_record_time from record_metadata
    const lastRecordQuery = `
      SELECT last_record_time
      FROM record_metadata
      ORDER BY last_record_time DESC
      LIMIT 1;
    `;

    const [lastRecordResult] = await connection.query(lastRecordQuery);
    const lastRecordCreatedAtTime = lastRecordResult.length
      ? lastRecordResult[0].last_record_time
      : null;

    if (!lastRecordCreatedAtTime) {
      console.error("No last record creation time found.");
      return 0; // Return default value to avoid further errors
    }

    // Format to "yyyy-MM-dd HH:mm" in local timezone
    const formattedDateTime = formatInTimeZone(
      lastRecordCreatedAtTime,
      "America/Montreal", // Adjust this to your timezone
      "yyyy-MM-dd"
    );

    // Query to calculate totalDecks ignoring seconds
    const decksQuery = `
      SELECT SUM(player_decks_used_today) as totalDecks
      FROM river_race_participants
      WHERE DATE_FORMAT(date_created, '%Y-%m-%d') = ?
      OR DATE_FORMAT(date_created, '%Y-%m-%d %H:%i:%s') LIKE CONCAT(?, '%');
    `;

    const [decksResult] = await connection.query(decksQuery, [
      formattedDateTime,
      formattedDateTime,
    ]);

    // Convert totalDecks to an integer, return 0 if null
    const totalDecks =
      decksResult[0].totalDecks !== null
        ? parseInt(decksResult[0].totalDecks, 10)
        : 0;

    return totalDecks;
  } catch (error) {
    console.error("Error executing queries:", error);
    return 0; // Return default value in case of error
  }
};

// Function to get the last record creation time from the database
export const getLastRecordCreationTime = async (connection) => {
  const query = `
    SELECT last_record_time
    FROM record_metadata
    ORDER BY last_record_time DESC
    LIMIT 1;
  `;
  const [rows] = await connection.query(query);

  if (rows.length) {
    const lastRecordTime = rows[0].last_record_time;

    // Format to "yyyy-MM-dd HH:mm" to disregard seconds
    const formattedTime = formatInTimeZone(
      lastRecordTime,
      "America/Montreal",
      "yyyy-MM-dd HH:mm:ss"
    );
    return formattedTime;
  }
  // console.log(`Formatted last record time without seconds: ${formattedTime}`);

  return null;
};

// Function to insert a new record creation time (keep multiple records)
export const updateLastRecordCreationTime = async (connection, timestamp) => {
  const query = `
    INSERT INTO record_metadata (last_record_time)
    VALUES (?);
  `;
  await connection.query(query, [timestamp]);
};
