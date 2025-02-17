import React, { useContext } from 'react';
import { AudioContext } from '../../context/AudioContext';

const AdsrSection = () => {
  const {
    attack, setAttack,
    decay, setDecay,
    sustain, setSustain,
    release, setRelease,
    formatValue,
  } = useContext(AudioContext);

  return (
    <div className="control-section">
      <h3>ENV</h3>
      <div className="control-group">
        <div className="control-item">
          <label>A</label>
          <div className="value-display">{formatValue(attack, 'time')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={attack}
              onChange={(e) => setAttack(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="control-item">
          <label>D</label>
          <div className="value-display">{formatValue(decay, 'time')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={decay}
              onChange={(e) => setDecay(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="control-item">
          <label>S</label>
          <div className="value-display">{formatValue(sustain, 'percentage')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sustain}
              onChange={(e) => setSustain(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="control-item">
          <label>R</label>
          <div className="value-display">{formatValue(release, 'time')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={release}
              onChange={(e) => setRelease(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsrSection;