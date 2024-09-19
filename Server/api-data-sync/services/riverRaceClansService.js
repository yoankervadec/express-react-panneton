//
//

import { insertData } from "../utils/insertData.js";
import { format } from "date-fns";

export const processAndInsertRiverRaceClanData = async (connection, data) => {
  if (!data) return;

  for (let clan of data.clans) {
    const insertClanQuery = `
      INSERT INTO river_race_clans (
        clan_name,
        clan_tag,
        clan_fame,
        clan_repair_points,
        clan_period_points)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        clan_name = VALUES(clan_name),
        clan_fame = VALUES(clan_fame),
        clan_repair_points = VALUES(clan_repair_points),
        clan_period_points = VALUES(clan_period_points)
    `;
    await insertData(connection, insertClanQuery, [
      clan.name,
      clan.tag,
      clan.fame,
      clan.repairPoints,
      clan.periodPoints,
    ]);
  }

  const currentTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  console.log(`River race clans updated at ${currentTime}`);
};
