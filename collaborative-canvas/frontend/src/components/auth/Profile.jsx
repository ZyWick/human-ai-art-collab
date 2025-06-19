import React, { useState, useEffect } from "react";
import axios from "axios";

const REACT_APP_BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const Profile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${REACT_APP_BACKEND_URL}/auth/profile/${userId}`
        );
        setUser(response.data);
        setUsername(response.data.username);
        setEmail(response.data.email);
        setProfilePicture(response.data.profilePicture);
      } catch (error) {
        alert("Failed to fetch profile: " + error.response.data.error);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/auth/profile/${userId}`, {
        username,
        email,
        profilePicture,
      });
      alert("Profile updated successfully");
    } catch (error) {
      alert("Update failed: " + error.response.data.error);
    }
  };

  return (
    <div>
      <h1>Profile</h1>
      {user && (
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
          />
          <button onClick={handleUpdate}>Update Profile</button>
        </div>
      )}
    </div>
  );
};

export default Profile;
