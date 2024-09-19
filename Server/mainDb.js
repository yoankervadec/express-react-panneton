//
//

import { getConnection } from "./api-data-sync/config/dbConfig.js";
import { fetchData } from "./api-data-sync/utils/fetchData.js";
import { processAndInsertClanMembersData } from "./api-data-sync/services/clanMembersService.js";
import { processAndInsertRiverRaceClanData } from "./api-data-sync/services/riverRaceClansService.js";
import { processAndInsertRiverRaceParticipantsData } from "./api-data-sync/services/riverRaceParticipantsService.js";
import { processAndInsertPeriodLogsData } from "./api-data-sync/services/periodLogsService.js";

// Main function to run every minute
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

    // const periodLogsData = await fetchData(
    //   "/clans/%23LVUQ9CYC/currentriverrace"
    // );
  } catch (error) {
    console.error(`Error: ${error}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run the main function every minute
setInterval(main, 60 * 1000);

console.log("api-data-sync is running...");
