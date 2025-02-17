import React, { useContext } from 'react';
import { AudioContext } from '../../context/AudioContext';

const TapeDelaySection = () => {
  const {
    delayTime,
    setDelayTime,
    delayFeedback,
    setDelayFeedback,
    delayMix,
    setDelayMix,
    pitchShift,
    setPitchShift,
    formatValue,
  } = useContext(AudioContext);

  return (
    <div className="control-section">
      <h3>TAPE DELAY</h3>
      <div className="control-group">
        <div className="control-item">
          <label>MIX</label>
          <div className="value-display">{formatValue(delayMix, 'percentage')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={delayMix}
              onChange={(e) => setDelayMix(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="control-item">
          <label>TIME</label>
          <div className="value-display">{formatValue(delayTime, 'time')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.01"
              value={delayTime}
              onChange={(e) => setDelayTime(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="control-item">
          <label>FEEDBACK</label>
          <div className="value-display">{formatValue(delayFeedback, 'percentage')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.01"
              value={delayFeedback}
              onChange={(e) => setDelayFeedback(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="control-item">
          <label>PITCH</label>
          <div className="value-display">{pitchShift > 0 ? `+${pitchShift}` : pitchShift}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={pitchShift}
              onChange={(e) => setPitchShift(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TapeDelaySection;