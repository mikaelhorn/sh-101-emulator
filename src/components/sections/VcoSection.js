import React, { useContext } from 'react';
import { AudioContext } from '../../context/AudioContext';

const VcoSection = () => {
  const {
    waveform,
    setWaveform,
    pulseWidth,
    setPulseWidth,
    noiseLevel,
    setNoiseLevel,
    sourceMix,
    setSourceMix,
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
          <label>MIXER</label>
          <div className="mixer-controls">
            <div>
              <label>VCO</label>
              <div className="slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sourceMix.main}
                  onChange={(e) => setSourceMix({ ...sourceMix, main: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label>SUB</label>
              <div className="slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sourceMix.sub}
                  onChange={(e) => setSourceMix({ ...sourceMix, sub: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label>NOISE</label>
              <div className="slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sourceMix.noise}
                  onChange={(e) => setSourceMix({ ...sourceMix, noise: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VcoSection;