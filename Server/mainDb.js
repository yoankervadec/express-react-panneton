//
//

import { format } from "date-fns";
import { getConnection } from "./api-data-sync/config/dbConfig.js";
import { fetchData } from "./api-data-sync/utils/fetchData.js";
import { processAndInsertClanMembersData } from "./api-data-sync/services/clanMembersService.js";
import { processAndInsertRiverRaceClanData } from "./api-data-sync/services/riverRaceClansService.js";
import { processAndInsertRiverRaceParticipantsData } from "./api-data-sync/services/riverRaceParticipantsService.js";
import { processAndInsertPeriodLogsData } from "./api-data-sync/services/periodLogsService.js";
import { updateActivePlayers } from "./api-data-sync/services/updateActivePlayers.js";

// Main function to run every 1 minute
const main = async () => {
  let connection;

  try {
    connection = await getConnection();

    const clanMembersData = await fetchData("/clans/%23LVUQ9CYC/members");
    await processAndInsertClanMembersData(connection, clanMembersData);

    const riverRaceData = await fetchData(
      "/clans/%23LVUQ9CYC/currentriverrace"
    );
    await processAndInsertRiverRaceClanData(connection, riverRaceData);
    await processAndInsertRiverRaceParticipantsData(connection, riverRaceData);
    await processAndInsertPeriodLogsData(connection, riverRaceData);
  } catch (error) {
    console.error(`Error: ${error}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  const currentTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  console.log(`Main function last ran at: ${currentTime}`);
};

// Secondary function to run every 5 minutes
const secondary = async () => {
  let connection;

  try {
    connection = await getConnection();
    await updateActivePlayers(connection);
  } catch (error) {
    console.error(`Error updating active players: ${error}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  const currentTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  console.log(`Secondary functions last ran at: ${currentTime}`);
};

// Run the main function every 1 minute
setInterval(main, 60 * 1000);

// Run the main function every 5 minutes
setInterval(secondary, 5 * 60 * 1000);

console.log("api-data-sync is running...");
