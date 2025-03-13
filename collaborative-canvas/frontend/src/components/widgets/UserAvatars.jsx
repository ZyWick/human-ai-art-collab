import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "../../assets/styles/UserAvatars.css";

const UserAvatars = ({ headerRef }) => {
  const usernames = useSelector((state) => state.room.users);
  const containerRef = useRef(null);
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [hiddenUsers, setHiddenUsers] = useState([]);

  useEffect(() => {
    const resizeHandler = () => {
        if (!headerRef.current || !containerRef.current) return;

        const { width: headerWidth, height: headerHeight } = headerRef.current.getBoundingClientRect();
        const totalAvatarWidth = headerHeight * 0.8 + containerRef.current.getBoundingClientRect().width * 0.03;
        const fitCount = Math.floor((headerWidth * 0.3 - (usernames.length * totalAvatarWidth > headerWidth * 0.3 ? totalAvatarWidth : 0)) / totalAvatarWidth);
        
        setVisibleUsers(usernames.slice(0, fitCount));
        setHiddenUsers(usernames.slice(fitCount));
    };

    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [usernames, headerRef, containerRef]);

  return (
    <div className="avatars-container" ref={containerRef}>
      {visibleUsers.length > 0 &&
        visibleUsers.map((user, index) => (
          <div key={index} className="avatar" title={user}>
            {user[0]}
          </div>
        ))}
      {hiddenUsers.length > 0 && (
        <div className="avatar more" title={hiddenUsers.join(", ")}>
          +{hiddenUsers.length}
        </div>
      )}
    </div>
  );
};

export default UserAvatars;
