//
// riverRaceParticipantsService.js
// Updates river_race_participants table every 1 minute

import { insertData } from "../utils/insertData.js";
import { differenceInHours, format } from "date-fns";
import {
  getLastRecordCreationTime,
  updateLastRecordCreationTime,
  getCurrentTimeStamp,
} from "../utils/resetTime.js";
import { getSumDecksUsedToday } from "./getSumDecksUsedToday.js";

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
  let totalDecksUsedToday;
  try {
    totalDecksUsedToday = await getSumDecksUsedToday();
  } catch (error) {
    console.error("Error fetching total decks used today:", error);
    return; // Exit early if the data can't be fetched
  }

  // Calculated the hours passed since the last records were created
  const hoursSinceLastRecord = lastRecordCreationTime
    ? differenceInHours(formattedTimestamp, new Date(lastRecordCreationTime))
    : Infinity;

  // Creates a 16-hours cooldown to avoid creating multiple records when totalDecksUsedToday = 0
  const shouldCreateNewRecords =
    totalDecksUsedToday === 0 && hoursSinceLastRecord >= 16;

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
          // Update existing records preventing values from decreasing
          const updateParticipantQuery = `
            UPDATE river_race_participants
            SET
              last_updated = CURRENT_TIMESTAMP,
              player_name = ?,
              player_fame = GREATEST(player_fame, ?),
              player_repair_points = GREATEST(player_repair_points, ?),
              player_boat_attacks = GREATEST(player_boat_attacks, ?),
              player_decks_used = GREATEST(player_decks_used, ?),
              player_decks_used_today = GREATEST(player_decks_used_today, ?)
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
