import React, { useContext } from 'react';
import { AudioContext } from '../../context/AudioContext';

const VcoSection = () => {
  const {
    waveform,
    setWaveform,
    pulseWidth,
    setPulseWidth,
    subOscLevel,
    setSubOscLevel,
    noiseLevel,
    setNoiseLevel,
    mainOscLevel,
    setMainOscLevel,
    formatValue,
  } = useContext(AudioContext);

  return (
    <div className="control-section">
      <h3>VCO</h3>
      <div className="control-group">
        <div className="control-item">
          <label>WAVEFORM</label>
          <select value={waveform} onChange={(e) => setWaveform(e.target.value)}>
            <option value="sawtooth">SAW</option>
            <option value="square">SQUARE</option>
            <option value="pulse">PULSE</option>
          </select>
        </div>
        {waveform === 'pulse' && (
          <div className="control-item">
            <label>PWM</label>
            <div className="value-display">{formatValue(pulseWidth, 'percentage')}</div>
            <div className="slider-wrapper">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pulseWidth}
                onChange={(e) => setPulseWidth(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="control-item">
          <label>MAIN OSC</label>
          <div className="value-display">{formatValue(mainOscLevel, 'level')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="-60"
              max="0"
              value={mainOscLevel}
              onChange={(e) => setMainOscLevel(e.target.value)}
            />
          </div>
        </div>
        <div className="control-item">
          <label>SUB OSC</label>
          <div className="value-display">{formatValue(subOscLevel, 'level')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="-60"
              max="0"
              value={subOscLevel}
              onChange={(e) => setSubOscLevel(e.target.value)}
            />
          </div>
        </div>
        <div className="control-item">
          <label>NOISE</label>
          <div className="value-display">{formatValue(noiseLevel, 'level')}</div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="-60"
              max="0"
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VcoSection;