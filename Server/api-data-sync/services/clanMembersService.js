//
// clanMembersService.js
// Update clan_members table every 1 minute

import { formatLastSeen } from "../utils/formatLastSeen.js";
import { insertData } from "../utils/insertData.js";

export const processAndInsertClanMembersData = async (connection, data) => {
  if (!data) return;

  for (let item of data.items) {
    const lastSeenFormatted = formatLastSeen(item.lastSeen);
    const insertClanMemberQuery = `
      INSERT INTO clan_members (
        name, trophies, arena, tag, role, last_seen, level, donations, donations_received)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        last_updated = CURRENT_TIMESTAMP,
        name = VALUES(name),
        trophies = VALUES(trophies),
        arena = VALUES(arena),
        role = VALUES(role),
        last_seen = VALUES(last_seen),
        level = VALUES(level),
        donations = VALUES(donations),
        donations_received = VALUES(donations_received)
    `;
    await insertData(connection, insertClanMemberQuery, [
      item.name,
      item.trophies,
      item.arena.name,
      item.tag,
      item.role,
      lastSeenFormatted,
      item.expLevel,
      item.donations,
      item.donationsReceived,
    ]);
  }
};
