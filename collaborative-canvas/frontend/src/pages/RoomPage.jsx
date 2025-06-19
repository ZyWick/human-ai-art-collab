import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { joinRoomService } from "../util/roomService";
import Layout from "../components/layout/Layout";
import "../App.css";

const RoomPage = () => {
  const { joinCode } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    joinRoomService(joinCode, dispatch, navigate);
  }, [joinCode, dispatch, navigate]);

  return (
    <div className="room-container">
      <Layout />
    </div>
  );
};

export default RoomPage;
