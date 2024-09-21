//
//

import { insertData } from "../utils/insertData.js";
import { format } from "date-fns";

export const processAndInsertPeriodLogsData = async (connection, data) => {
  if (!data) return;

  const sectionIndex = data.sectionIndex || "N/A";
  const masterPeriodIndex = data.periodIndex || "N/A";
  const periodType = data.periodType || "N/A";
  const periodLogs = data.periodLogs || [];

  for (let periodLog of periodLogs) {
    const periodIndex = periodLog.periodIndex || "N/A";
    const items = periodLog.items || [];

    for (let item of items) {
      const clanTag = item.clan.tag || "N/A";
      const internalId = `${sectionIndex}_${masterPeriodIndex}_${periodIndex}_${clanTag}`;
      const insertPeriodLogQuery = `
        INSERT INTO period_logs (
          last_updated,
          internal_id,
          section_index,
          master_period_index,
          period_type,
          period_index,
          clan_tag,
          points_earned,
          progress_start_of_day,
          progress_end_of_day,
          end_of_day_rank,
          progress_earned,
          num_of_defenses_remaining,
          progress_earned_from_defenses)
        VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          last_updated = VALUES(last_updated),
          section_index = VALUES(section_index),
          master_period_index = VALUES(master_period_index),
          period_type = VALUES(period_type),
          period_index = VALUES(period_index),
          clan_tag = VALUES(clan_tag),
          points_earned = VALUES(points_earned),
          progress_start_of_day = VALUES(progress_start_of_day),
          progress_end_of_day = VALUES(progress_end_of_day),
          end_of_day_rank = VALUES(end_of_day_rank),
          progress_earned = VALUES(progress_earned),
          num_of_defenses_remaining = VALUES(num_of_defenses_remaining),
          progress_earned_from_defenses = VALUES(progress_earned_from_defenses)
      `;
      await insertData(connection, insertPeriodLogQuery, [
        internalId,
        sectionIndex,
        masterPeriodIndex,
        periodType,
        periodIndex,
        clanTag,
        item.pointsEarned || 0,
        item.progressStartOfDay || 0,
        item.progressEndOfDay || 0,
        item.endOfDayRank || 0,
        item.progressEarned || 0,
        item.numOfDefensesRemaining || 0,
        item.progressEarnedFromDefenses || 0,
      ]);
    }
  }

  // const currentTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  // console.log(`Period Logs updated at ${currentTime}`);
};
