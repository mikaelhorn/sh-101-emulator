import React, { useContext } from 'react';
import { AudioContext } from '../../context/AudioContext';

const GranularSection = () => {
  const {
    grainSize,
    setGrainSize,
    grainOverlap,
    setGrainOverlap,
    grainPlaybackRate,
    setGrainPlaybackRate,
    grainMix,
    setGrainMix,
    formatValue,
  } = useContext(AudioContext);

  return (
    <div className="control-section">
      <h3>GRANULAR</h3>
      <div className="control-group">
        <div className="control-item">
          <label>MIX</label>
          {/* <div className="value-display">{formatValue(grainMix, 'percentage')}</div> */}
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={grainMix}
              onChange={(e) => setGrainMix(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="control-item">
          <label>GRAIN SIZE</label>
          {/* <div className="value-display">{formatValue(grainSize, 'time')}</div> */}
          <div className="slider-wrapper">
            <input
              type="range"
              min="0.01"
              max="0.5"
              step="0.01"
              value={grainSize}
              onChange={(e) => setGrainSize(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="control-item">
          <label>OVERLAP</label>
          {/* <div className="value-display">{formatValue(grainOverlap, 'time')}</div> */}
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={grainOverlap}
              onChange={(e) => setGrainOverlap(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="control-item">
          <label>RATE</label>
          {/* <div className="value-display">{grainPlaybackRate.toFixed(2)}x</div> */}
          <div className="slider-wrapper">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.01"
              value={grainPlaybackRate}
              onChange={(e) => setGrainPlaybackRate(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GranularSection;