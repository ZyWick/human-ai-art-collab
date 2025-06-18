import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector} from "react-redux";
import "../../assets/styles/UserAvatars.css";
import { getUserColor, getContrastTextColor } from '../../util/userColor';
import { setShowOutputColors } from "../../redux/roomSlice";

const RoomStatusBar = () => {
  const dispatch = useDispatch();
  const {users, showOutputColors} = useSelector((state) => state.room);
  const containerRef = useRef();
  const headerRef = useRef();
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [hiddenUsers, setHiddenUsers] = useState([]);
  const [toggleSettings, setToggleSettings] = useState(false);

  useEffect(() => {
      setVisibleUsers(users.slice(0, 4));
      setHiddenUsers(users.slice(4));
  },[users])

 const toggleStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    backgroundColor: showOutputColors ? '#4caf50' : '#ccc',
    color: showOutputColors ? 'white' : 'black',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  };
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
    {!toggleSettings ?
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
        {hiddenUsers && hiddenUsers.length > 0 && (
          <div className="avatar more" title={hiddenUsers.map(u => u.username).join(", ")}>
            +{hiddenUsers.length}
          </div>
        )}
      </div> : <button style={toggleStyle} onClick={() => dispatch(setShowOutputColors(!showOutputColors))}>
      Allow output colors
    </button>}
    <button
    onClick={() => setToggleSettings(!toggleSettings)}
    style={{
      padding: "0.85em 0em 0.5em 0em",
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
    }}
  >
    <img
      src="/icons/settings.svg"
      alt="Home"
      style={{ width: "24px", height: "24px" }}
    />
  </button>
      </div>
      )
}

export default RoomStatusBar;


  // const avatarAreaRatio = 0.75;
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