import React, { useContext } from 'react';
import { AudioContext } from '../../context/AudioContext';

const PitchSection = () => {
  const {
    portamento, setPortamento,
    transpose, setTranspose,
  } = useContext(AudioContext);

  return (
    <div className="control-section">
      <h3>PITCH</h3>
      <div className="control-group">
        <div className="control-item">
          <label>GLIDE</label>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={portamento}
              onChange={(e) => setPortamento(e.target.value)}
            />
          </div>
        </div>
        <div className="control-item">
          <label>TRANSPOSE</label>
          <div className="slider-wrapper">
            <input
              type="range"
              min="-24"
              max="24"
              step="12"
              value={transpose}
              onChange={(e) => setTranspose(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchSection;