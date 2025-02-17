import React, { useContext } from 'react';
import { AudioContext } from '../../context/AudioContext';

const MasterSection = () => {
  const {
    masterVolume,
    setMasterVolume,
    reverbPreDelay,
    setReverbPreDelay,
    reverbDecay,
    setReverbDecay,
    reverbMix,
    setReverbMix,
    formatValue,
  } = useContext(AudioContext);

  return (
    <div className="control-section">
      <h3>MASTER</h3>
      <div className="control-group">
        <div className="control-item">
          <label>VOLUME</label>
          <div className="value-display">{formatValue(masterVolume, 'percentage')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="control-item">
          <label>REVERB MIX</label>
          <div className="value-display">{formatValue(reverbMix, 'percentage')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={reverbMix}
              onChange={(e) => setReverbMix(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="control-item">
          <label>PRE-DELAY</label>
          <div className="value-display">{formatValue(reverbPreDelay, 'time')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={reverbPreDelay}
              onChange={(e) => setReverbPreDelay(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="control-item">
          <label>DECAY</label>
          <div className="value-display">{formatValue(reverbDecay, 'time')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0.1"
              max="4"
              step="0.1"
              value={reverbDecay}
              onChange={(e) => setReverbDecay(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterSection;