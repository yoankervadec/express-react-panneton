// resetTime.js

import { formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";

// Utility function to get the current timestamp in "yyyy-MM-dd HH:mm" format
export const getCurrentTimeStamp = (currentTimestamp) => {
  const formattedTimestamp = format(currentTimestamp, "yyyy-MM-dd HH:mm");
  return formattedTimestamp;
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
