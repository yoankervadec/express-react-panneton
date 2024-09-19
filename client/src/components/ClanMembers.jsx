import React, { useEffect, useState } from "react";
import PlayerCard from "./PlayerCard";

const ClanMembers = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null); // State for selected member
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  // Open the modal with selected member data
  const openModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  // Fetch the clan members on component mount
  useEffect(() => {
    fetch("http://10.0.0.111:8080/clan_members")
      .then((response) => response.json())
      .then((data) => setMembers(data)) // Set the fetched members data
      .catch((error) => console.error("Error fetching members:", error));
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <>
      <div className="table-wrapper">
        <table className="main-table">
          <colgroup>
            <col span="1" style={{ width: "45%" }} />
            <col span="1" style={{ width: "33%" }} />
            <col span="1" style={{ width: "33%" }} />
          </colgroup>
          <thead  className="accent2">
            <tr>
              <th><h2>Name</h2></th>
              <th><h2>Role</h2></th>
              <th><h2>Last Seen</h2></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.tag}>
                <td onClick={() => openModal(member)} style={{ cursor: "pointer" }}>
                  {member.name}
                </td>
                <td>{member.role}</td>
                <td>{member.last_seen}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Render the modal if it's open */}
        {isModalOpen && (
          <PlayerCard member={selectedMember} closeModal={closeModal} />
        )}
      </div>
    </>
  );
};

export default ClanMembers;