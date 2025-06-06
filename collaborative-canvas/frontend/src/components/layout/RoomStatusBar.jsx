import React, { useRef, useState, useEffect } from "react";
import { useSelector} from "react-redux";
import "../../assets/styles/UserAvatars.css";
import { getUserColor, getContrastTextColor } from '../../util/userColor';
import { useNavigate } from "react-router-dom";
const RoomStatusBar = () => {

  const navigate = useNavigate();
  const users = useSelector((state) => state.room.users);
  const containerRef = useRef();
  const headerRef = useRef();
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [hiddenUsers, setHiddenUsers] = useState([]);
  const avatarAreaRatio = 0.75;

  useEffect(() => {
      setVisibleUsers(users.slice(0, 4));
      setHiddenUsers(users.slice(4));
  },[users])

  //  useEffect(() => {
  //   const resizeHandler = () => {
  //     if (!headerRef.current || !containerRef.current) return;

  //     const { width: headerWidth, height: headerHeight } =
  //       headerRef.current.getBoundingClientRect();
  //     const totalAvatarWidth =
  //       headerHeight * 0.7 +
  //       containerRef.current.getBoundingClientRect().width * 0.03;
  //     const fitCount = Math.floor(
  //     (headerWidth * avatarAreaRatio -
  //       (users?.length * totalAvatarWidth > headerWidth * avatarAreaRatio
  //         ? totalAvatarWidth
  //         : 0)) /
  //       totalAvatarWidth
  //   );
    
  //     setVisibleUsers(users.slice(0, fitCount));
  //     setHiddenUsers(users.slice(fitCount));
  //   };

  //   resizeHandler();
  //   window.addEventListener("resize", resizeHandler);
  //   return () => window.removeEventListener("resize", resizeHandler);
  // }, [users, headerRef, containerRef]);

    return (
     <div 
     ref = {headerRef}
     style={{  
        position: "absolute",
        maxWidth: "33vh",
        height: "2.812em",
          minWidth: "240px",
        right: "2.5%",
        top: "2%",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.125)",
        paddingInline: "13px",
        alignItems:"center",
        display:"flex",
        justifyContent: "space-between",
        zIndex: "99",
        }}>
    <div className="avatars-container" ref={containerRef}>
        {visibleUsers.length > 0 &&
  visibleUsers.map((user, index) => {
    const bgColor = getUserColor(user?.userId);
    const textColor = getContrastTextColor(bgColor);

    return (
      <div
        key={index}
        className="avatar"
        title={user.username}
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {user.username[0]}
      </div>
    );
  })}
        {hiddenUsers.length > 0 && (
          <div className="avatar more" title={hiddenUsers.map(u => u.username).join(", ")}>
            +{hiddenUsers.length} {console.log(hiddenUsers)}
          </div>
        )}
      </div>
    <button
    onClick={() =>  navigate("/home")}
    style={{
      padding: "0.85em 0em 0.5em 0em",
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
    }}
  >
    <img
      src="/icons/home-svgrepo-com.svg"
      alt="Home"
      style={{ width: "24px", height: "24px" }}
    />
  </button>
      </div>
      )
}

export default RoomStatusBar;