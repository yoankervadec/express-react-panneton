//
// riverRaceParticipantsService.js
// Updates river_race_participants table every 1 minute

import { insertData } from "../utils/insertData.js";
import { differenceInHours, format } from "date-fns";
import {
  sumDecksUsedToday,
  getLastRecordCreationTime,
  updateLastRecordCreationTime,
  getCurrentTimeStamp,
} from "../utils/resetTime.js";

export const processAndInsertRiverRaceParticipantsData = async (
  connection,
  data
) => {
  if (!data) return;

  // Get and format date & time values
  const currentTimestamp = new Date();
  const formattedTimestamp = getCurrentTimeStamp(currentTimestamp);

  // Get the last time records were created
  const lastRecordCreationTime = await getLastRecordCreationTime(connection);

  // Calculate total decks used for the clan
  const totalDecksUsedToday = await sumDecksUsedToday(
    connection,
    lastRecordCreationTime
  );

  // Calculated the hours passed since the last records were created
  const hoursSinceLastRecord = lastRecordCreationTime
    ? differenceInHours(formattedTimestamp, new Date(lastRecordCreationTime))
    : Infinity;

  // Log for temporary debugging
  console.log(
    `Total Decks: ${totalDecksUsedToday}, Hours since last record: ${hoursSinceLastRecord}`
  );

  // Creates a 10-hours cooldown to avoid creating multiple records when totalDecksUsedToday = 0
  const shouldCreateNewRecords =
    totalDecksUsedToday === 0 && hoursSinceLastRecord >= 10;

  for (let clan of data.clans) {
    if (clan.tag === "#LVUQ9CYC") {
      for (let participant of clan.participants) {
        // Innitialize internalIds dates
        const lastRecordDate = format(
          new Date(lastRecordCreationTime || formattedTimestamp),
          "yyyy-MM-dd"
        );
        const newRecordDate = format(new Date(), "yyyy-MM-dd");

        const internalId = `${lastRecordDate}_${participant.tag}`;
        const newInternalId = `${newRecordDate}_${participant.tag}`;

        // Insert new records for the day
        if (shouldCreateNewRecords) {
          const insertParticipantQuery = `
            INSERT INTO river_race_participants (
              internal_id,
              last_updated,
              player_tag,
              player_name,
              player_fame,
              player_repair_points,
              player_boat_attacks,
              player_decks_used,
              player_decks_used_today)
            VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?);
          `;
          await insertData(connection, insertParticipantQuery, [
            newInternalId,
            participant.tag,
            participant.name,
            participant.fame,
            participant.repairPoints,
            participant.boatAttacks,
            participant.decksUsed,
            participant.decksUsedToday,
          ]);

          // Update the last record creation time
          await updateLastRecordCreationTime(connection, formattedTimestamp);
        } else {
          // Update existing records
          const updateParticipantQuery = `
            UPDATE river_race_participants
            SET
              last_updated = CURRENT_TIMESTAMP,
              player_name = ?,
              player_fame = ?,
              player_repair_points = ?,
              player_boat_attacks = ?,
              player_decks_used = ?,
              player_decks_used_today = ?
            WHERE internal_id = ?;
          `;
          await insertData(connection, updateParticipantQuery, [
            participant.name,
            participant.fame,
            participant.repairPoints,
            participant.boatAttacks,
            participant.decksUsed,
            participant.decksUsedToday,
            internalId,
          ]);
        }
      }
    }
  }
};
