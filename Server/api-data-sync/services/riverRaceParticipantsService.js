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

  const currentTimestamp = new Date();
  const formattedTimestamp = getCurrentTimeStamp(currentTimestamp);

  // Get the last time records were created
  const lastRecordCreationTime = await getLastRecordCreationTime(connection);

  // Calculate total decks used for the clan
  const totalDecks = await sumDecksUsedToday(
    connection,
    lastRecordCreationTime
  );

  const hoursSinceLastRecord = lastRecordCreationTime
    ? differenceInHours(formattedTimestamp, new Date(lastRecordCreationTime))
    : Infinity; // If no record exists, treat it as infinite hours ago
  console.log(`Last record creation time fetched: ${lastRecordCreationTime}`);

  // Determine if new records should be created (based on totalDecks = 0 and the 10-hour cooldown)
  console.log(
    `Total Decks: ${totalDecks}, Hours since last record: ${hoursSinceLastRecord}`
  );
  const shouldCreateNewRecords = totalDecks === 0 && hoursSinceLastRecord >= 10;
  console.log(`Should create new records: ${shouldCreateNewRecords}`);

  for (let clan of data.clans) {
    if (clan.tag === "#LVUQ9CYC") {
      for (let participant of clan.participants) {
        // Use the last record creation time for the internalId
        const recordDate = format(
          new Date(lastRecordCreationTime || formattedTimestamp),
          "yyyy-MM-dd"
        );
        const internalId = `${recordDate}_${participant.tag}`;

        if (shouldCreateNewRecords) {
          // Insert new records if fame has reset and 10-hour cooldown has passed
          const currentDate = format(new Date(), "yyyy-MM-dd"); // Get the current date in "yyyy-MM-dd" format
          const InsertinternalId = `${currentDate}_${participant.tag}`;
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
            InsertinternalId,
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
          // Update existing records if total fame has not yet reset
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
