import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";
import { formatDistanceToNow } from "date-fns";

dotenv.config();

const app = express();
app.use(cors());

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the MySQL database.");
  }
});

// Sample route
app.get("/", (req, res) => {
  return res.json("From backend");
});

// Clan members Table
app.get("/clan_members", (req, res) => {
  db.query(
    "SELECT name, tag, role, last_seen FROM clan_members ORDER BY last_seen DESC",
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database query error" });
      }

      // Modify 'last_seen' to show relative time
      const modifiedResults = results.map((member) => {
        return {
          ...member,
          last_seen: formatDistanceToNow(new Date(member.last_seen), {
            addSuffix: true,
          }), // "X minutes ago"
        };
      });

      return res.json(modifiedResults);
    }
  );
});
// Clan members Table

// River Race Table
app.get("/clan_war", (req, res) => {
  db.query("SELECT * FROM river_race_clans", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query error" });
    }
    return res.json(results);
  });
});

// Start the server
app.listen(8080, () => {
  console.log("Listening on port 8080...");
});
// River Race Table

// Player Card
app.get("/player_card/:tag", (req, res) => {
  const playerTag = req.params.tag;

  const query = `
    SELECT
      name,
      trophies,
      arena,
      tag,
      role,
      last_seen,
      level,
      donations,
      donations_received,
      DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at
    FROM
      clan_members
    WHERE
      tag = ?
  `;

  // Execute the query
  db.query(query, [playerTag], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }

    // If player not found
    if (result.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }

    // Format the 'last_seen' field
    const player = result[0];

    let formattedLastSeen = "Never"; // Default in case last_seen is null or invalid
    if (player.last_seen) {
      try {
        formattedLastSeen = formatDistanceToNow(new Date(player.last_seen), {
          addSuffix: true,
        });
      } catch (e) {
        console.error("Invalid date format:", player.last_seen);
      }
    }

    // Return player details with formatted 'last_seen'
    const formattedPlayer = {
      ...player,
      last_seen: formattedLastSeen, // "X minutes ago" or "Never"
    };

    res.json(formattedPlayer);
  });
});
// Player Card
