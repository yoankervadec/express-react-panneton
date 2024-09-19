import React, { useEffect, useState } from "react";

const ClanWarData = () => {
  const [clans, setClans] = useState([]);

  // Fetch data from the backend on component mount
  useEffect(() => {
    fetch("http://10.0.0.111:8080/clan_war")
      .then((response) => response.json()) // Parse JSON response
      .then((data) => setClans(data)) // Set the data in state
      .catch((error) => console.error("Error fetching clan war information:", error));
  }, []); // Empty dependency array ensures this effect runs once on mount

  return (
      <>
        <div className="table-wrapper">
          <table className="main-table">
            <thead>
              <tr>
                <th>Created At</th>
                <th>Clan Name</th>
                <th>Clan Tag</th>
                <th>Clan Fame</th>
                <th>Clan Repair Points</th>
                <th>Clan Period Points</th>
              </tr>
            </thead>
            <tbody>
              {clans.map((clan) => (
                <tr key={clan.clan_tag}>
                  <td>{clan.date_created}</td>
                  <td>{clan.clan_name}</td>
                  <td>{clan.clan_tag}</td>
                  <td>{clan.clan_fame}</td>
                  <td>{clan.clan_repair_points}</td>
                  <td>{clan.clan_period_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
  );
};

export default ClanWarData;