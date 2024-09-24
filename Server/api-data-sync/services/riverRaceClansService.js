//
// riverRaceClansService.js

import { insertData } from "../utils/insertData.js";
import { differenceInHours, format } from "date-fns";
import {
  getLastRecordCreationTime,
  getCurrentTimeStamp,
} from "../utils/resetTime.js";
import { getSumDecksUsedToday } from "./getSumDecksUsedToday.js";

export const processAndInsertRiverRaceClanData = async (connection, data) => {
  if (!data) return;

  const currentTimestamp = new Date();
  const formattedTimestamp = getCurrentTimeStamp(currentTimestamp);

  const lastRecordCreationTime = await getLastRecordCreationTime(connection);

  let totalDecksUsedToday;
  try {
    totalDecksUsedToday = await getSumDecksUsedToday();
  } catch (error) {
    console.error("Error while fetching total decks used today: ", error);
    return;
  }

  const hoursSinceLastRecord = lastRecordCreationTime
    ? differenceInHours(formattedTimestamp, new Date(lastRecordCreationTime))
    : Infinity;

  console.log(
    `Total Decks: ${totalDecksUsedToday}, Hours since last record: ${hoursSinceLastRecord}`
  );

  const shouldCreateNewRecords =
    totalDecksUsedToday === 0 && hoursSinceLastRecord >= 16;

  console.log(shouldCreateNewRecords);

  for (let clan of data.clans) {
    const lastRecordDate = format(
      new Date(lastRecordCreationTime || formattedTimestamp),
      "yyyy-MM-dd"
    );

    const newRecordDate = format(new Date(), "yyyy-MM-dd");

    const internalId = `${lastRecordDate}_${clan.tag}`;
    const newInternalId = `${newRecordDate}_${clan.tag}`;

    if (shouldCreateNewRecords) {
      const insertClanQuery = `
      INSERT INTO river_race_clans (
        internal_id,
        clan_name,
        clan_tag,
        clan_fame,
        clan_repair_points,
        clan_period_points)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
      try {
        await insertData(connection, insertClanQuery, [
          newInternalId,
          clan.name,
          clan.tag,
          clan.fame,
          clan.repairPoints,
          clan.periodPoints,
        ]);
      } catch (error) {
        console.error("Error inserting clan data: ", error);
      }
    } else {
      const updateClanQuery = `
        UPDATE river_race_clans
        SET
          clan_fame = GREATEST(clan_fame, ?),
          clan_repair_points = GREATEST(clan_repair_points, ?),
          clan_period_points = GREATEST(clan_period_points, ?)
        WHERE internal_id = ?;
      `;
      try {
        await insertData(connection, updateClanQuery, [
          clan.fame,
          clan.repairPoints,
          clan.periodPoints,
          internalId,
        ]);
      } catch (error) {
        console.error("Error updating clan data: ", error);
      }
    }
  }
};
