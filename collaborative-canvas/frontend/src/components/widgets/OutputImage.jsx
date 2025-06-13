import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setImageZoom } from '../../redux/roomSlice';

const OutputImage = ({
  image,
  index,
  prompt,
  className = 'the-row-image',
  style = {},
}) => {
const showOutputColors = useSelector((state) => state.room.showOutputColors);
const dispatch = useDispatch();

  const insertColorInFilename = (url) => {
    return url.replace(/(\.[^/.]+)$/, '_color$1');
  };

  const src = showOutputColors ? insertColorInFilename(image) : image;

  const defaultStyle = {
    maxHeight: '17.5vh',
    width: '100%',
    objectFit: 'contain',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: '8px',
    ...style, // allows overrides
  };

  return (
    <img
      key={index}
      src={src}
      onClick={() => dispatch(setImageZoom(src))}
      className={className}
      alt={`Generated ${index}`}
      title={prompt}
      style={className === 'imageResult' ? defaultStyle : undefined}
    />
  );
};

export default OutputImage;
