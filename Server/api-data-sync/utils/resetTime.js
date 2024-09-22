// resetTime.js

import { formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";

// Utility function to get the current timestamp in "yyyy-MM-dd HH:mm" format
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
    const lastRecordCreatedOnDate = lastRecordResult.length
      ? lastRecordResult[0].last_record_time
      : null;

    if (!lastRecordCreatedOnDate) {
      console.error("No last record creation time found.");
      return 0;
    }

    // Format to "yyyy-MM-dd HH:mm" in local timezone
    const formattedLastRecordCreatedOnDate = formatInTimeZone(
      lastRecordCreatedOnDate,
      "America/Montreal", // Adjust this to your timezone
      "yyyy-MM-dd"
    );

    // Query to calculate totalDecksUsedToday ignoring seconds
    const decksQuery = `
      SELECT SUM(player_decks_used_today) as totalDecksUsedToday
      FROM river_race_participants
      WHERE DATE_FORMAT(date_created, '%Y-%m-%d') = ?;
    `;

    const [decksResult] = await connection.query(decksQuery, [
      formattedLastRecordCreatedOnDate,
      formattedLastRecordCreatedOnDate,
    ]);

    // Convert totalDecksUsedToday to an integer, return 0 if null
    const totalDecksUsedToday =
      decksResult[0].totalDecksUsedToday !== null
        ? parseInt(decksResult[0].totalDecksUsedToday, 10)
        : 0;

    return totalDecksUsedToday;
  } catch (error) {
    console.error("Error executing queries:", error);
    return 0;
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
