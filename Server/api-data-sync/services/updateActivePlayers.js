//
// updateActivePlayers.js
// Checks and updates "active" every 5 minutes

export const updateActivePlayers = async (connection) => {
  const inactiveQuery = `
    UPDATE clan_members
    SET active = 0
    WHERE last_updated < NOW() - INTERVAL 10 MINUTE;
  `;
  const activeQuery = `
    UPDATE clan_members
    SET active = 1
    WHERE last_updated >= NOW() - INTERVAL 10 MINUTE;
  `;
  try {
    await connection.query(inactiveQuery);
    await connection.query(activeQuery);
  } catch (error) {
    console.error("Error updating active players:", error);
  }
};
