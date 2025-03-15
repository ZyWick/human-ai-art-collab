import React, {useState, useRef}  from "react";
import { useSelector } from "react-redux";
import DesignDetails from "../widgets/DesignDetails";
import ChatBox from "../widgets/ChatBox"
import UploadButton from "../widgets/UploadButton";
import '../../assets/styles/dashboard.css'
import SelectedImage from "../widgets/SelectedImage"

const Sidebar = () => {
  const selectedImageId = useSelector((state) => state.selection.selectedImageId);
const designDetails = useSelector((state) => state.room.designDetails);
  const chatRef = useRef(null);
  const [isUploadingImg, setIsUploadingImg] = useState(false)

  const isDesignDetailsEmpty = Object.entries(designDetails)
      .filter(([key]) => key !== "others") 
      .some(([, value]) => !value?.trim()); 

  return (
    <div
    style={{
      width: "100%",
      height: "100%",
      backgroundColor: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >{!isDesignDetailsEmpty ?  <UploadButton isUploadingImg={isUploadingImg} setIsUploadingImg={setIsUploadingImg}/> : <p style={{ fontSize: "0.75em", marginBottom: "0"}}>Complete design details to add images</p>}
  {!isUploadingImg && (
    selectedImageId ? (
      <SelectedImage selectedImageId={selectedImageId}/>
    ) :  (
      <div style={{
        width: "90%",
        height: "100%",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        overflowY: "auto",
        borderRadius: "8px",
        boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
        padding: "1em",
        marginTop: "1em"
      }}>
        <DesignDetails chatRef={chatRef}/>
        <ChatBox chatRef={chatRef}/>
        </div>
    ))}
  </div>
  );
};

export default Sidebar;
