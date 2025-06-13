import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setImageZoom } from "../../redux/roomSlice";
import "../../assets/styles/imageZoom.css"; // Import the CSS below

export default function ImageZoom() {
  const dispatch = useDispatch();
  const zoomSrc = useSelector((state) => state.room.imageZoom);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") dispatch(setImageZoom(null));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  return (zoomSrc &&
    <div className="image-zoom-overlay" onClick={() => dispatch(setImageZoom(null))}>
      <img
        src={zoomSrc}
        alt="Zoomed"
        className="image-zoom-img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
