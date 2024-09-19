//
//

// import { insertData } from "../utils/insertData.js";
// import { formatDateLocal } from "../utils/formatDateLocal.js";
// import { format } from "date-fns";

// export const processAndInsertRiverRaceParticipantsData = async (
//   connection,
//   data
// ) => {
//   if (!data) return;

//   for (let clan of data.clans) {
//     if (clan.tag === "#LVUQ9CYC") {
//       for (let participant of clan.participants) {
//         const currentTimestamp = new Date();
//         const formattedDate = formatDateLocal(currentTimestamp);
//         const internalId = `${formattedDate}_${participant.tag}`;

//         const insertParticipantQuery = `
//           INSERT INTO river_race_participants (
//             internal_id,
//             last_updated,
//             player_tag,
//             player_name,
//             player_fame,
//             player_repair_points,
//             player_boat_attacks,
//             player_decks_used,
//             player_decks_used_today)
//           VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?)
//           ON DUPLICATE KEY UPDATE
//             last_updated = VALUES(last_updated),
//             player_name = VALUES(player_name),
//             player_fame = VALUES(player_fame),
//             player_repair_points = VALUES(player_repair_points),
//             player_boat_attacks = VALUES(player_boat_attacks),
//             player_decks_used = VALUES(player_decks_used),
//             player_decks_used_today = VALUES(player_decks_used_today)
//         `;

//         await insertData(connection, insertParticipantQuery, [
//           internalId,
//           participant.tag,
//           participant.name,
//           participant.fame,
//           participant.repairPoints,
//           participant.boatAttacks,
//           participant.decksUsed,
//           participant.decksUsedToday,
//         ]);
//       }
//     }
//   }

//   const currentTime = format(new Date(), "yyyy-MM-dd:mm:ss");
//   console.log(`River race participants updated at ${currentTime}`);
// };
import { insertData } from "../utils/insertData.js";
import { formatDateLocal } from "../utils/formatDateLocal.js";
import { format, subDays } from "date-fns";
import { isNewDayRecord } from "../utils/resetTime.js";

export const processAndInsertRiverRaceParticipantsData = async (
  connection,
  data
) => {
  if (!data) return;

  const currentTimestamp = new Date();
  const hours = currentTimestamp.getHours();
  const minutes = currentTimestamp.getMinutes();

  const formattedDate = formatDateLocal(currentTimestamp); // Get the formatted current date
  const newDayRecord = isNewDayRecord(hours, minutes);

  for (let clan of data.clans) {
    if (clan.tag === "#LVUQ9CYC") {
      for (let participant of clan.participants) {
        // Determine whether to use the current or previous date for internalId
        let recordDate;
        if (hours < 5 || (hours === 5 && minutes < 45)) {
          // Before 5:45 AM, use the previous day's date
          recordDate = formatDateLocal(subDays(currentTimestamp, 1));
        } else {
          // After 5:45 AM, use the current day's date
          recordDate = formattedDate;
        }

        // Generate internal_id based on the determined date and player tag
        const internalId = `${recordDate}_${participant.tag}`;

        if (newDayRecord) {
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
            internalId,
            participant.tag,
            participant.name,
            participant.fame,
            participant.repairPoints,
            participant.boatAttacks,
            participant.decksUsed,
            participant.decksUsedToday,
          ]);
        } else {
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

  const currentTime = format(currentTimestamp, "yyyy-MM-dd HH:mm:ss");
  console.log(`River race participants updated at ${currentTime}`);
};
