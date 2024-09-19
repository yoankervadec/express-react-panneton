import React, { useEffect, useState } from "react";

const PlayerCard = ({ member, closeModal }) => {
  const [playerDetails, setPlayerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!member) return;

    const fetchPlayerDetails = async () => {
      try {
        const encodedTag = encodeURIComponent(member.tag);
        const response = await fetch(`http://10.0.0.111:8080/player_card/${encodedTag}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPlayerDetails(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching player details:", error);
        setError("Failed to load player details");
        setLoading(false);
      }
    };

    fetchPlayerDetails();
  }, [member]);

  if (!member || loading) return null;
  // If there's an error, display the error message
  if (error) {
    return (
      <div className="player-card-wrapper" onClick={closeModal}>
        <div className="player-card-content accent4">
          <span className="close" onClick={closeModal}>&times;</span>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const handleContentClick = (e) => {
    // Prevent click event from propagating to the overlay
    e.stopPropagation();
  };

  return (
    <div className="player-card-wrapper" onClick={closeModal}>
      <div className="player-card-content accent4" onClick={handleContentClick}>
        <div className="player-card-cell-title">
          <span className="close" onClick={closeModal}>&times;</span>
          <h2>{playerDetails.name}</h2>
        </div>
        <div className="player-card-cell">
          <span className="player-card-cell-label">Tag :</span>
          <span className="player-card-cell-data">{playerDetails.tag}</span>
        </div>
        {/* Display additional player details */}
        <div className="player-card-cell">
          <span className="player-card-cell-label">Trophies :</span>
          <span className="player-card-cell-data">{playerDetails.trophies}</span>
        </div>
        <div className="player-card-cell">
          <span className="player-card-cell-label">Arena :</span>
          <span className="player-card-cell-data">{playerDetails.arena}</span>
        </div>
        <div className="player-card-cell">
          <span className="player-card-cell-label">Role :</span>
          <span className="player-card-cell-data">{playerDetails.role}</span>
        </div>
        <div className="player-card-cell">
          <span className="player-card-cell-label">Last Seen :</span>
          <span className="player-card-cell-data">{playerDetails.last_seen}</span>
        </div>
        <div className="player-card-cell">
          <span className="player-card-cell-label">Donations :</span>
          <span className="player-card-cell-data">{playerDetails.donations}</span>
        </div>
        <div className="player-card-cell">
          <span className="player-card-cell-label">Donations Received :</span>
          <span className="player-card-cell-data">{playerDetails.donations_received}</span>
        </div>
        <div className="player-card-cell">
          <span className="player-card-cell-label">Member Since :</span>
          <span className="player-card-cell-data">{playerDetails.created_at}</span>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;