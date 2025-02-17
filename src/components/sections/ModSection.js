import React, { useContext } from 'react';
import { AudioContext } from '../../context/AudioContext';

const ModSection = () => {
  const {
    lfoWaveform,
    setLfoWaveform,
    lfoFrequency,
    setLfoFrequency,
    vcoModAmount,
    setVcoModAmount,
    vcfModAmount,
    setVcfModAmount,
    formatValue,
  } = useContext(AudioContext);

  return (
    <div className="control-section">
      <h3>MOD</h3>
      <div className="control-group">
        <div className="control-item">
          <label>LFO WAVE</label>
          <select value={lfoWaveform} onChange={(e) => setLfoWaveform(e.target.value)}>
            <option value="sine">SINE</option>
            <option value="square">SQUARE</option>
            <option value="sawtooth">SAW</option>
            <option value="triangle">TRI</option>
          </select>
        </div>
        <div className="control-item">
          <label>RATE</label>
          {/* <div className="value-display">{formatValue(lfoFrequency, 'frequency')}</div> */}
          <div className="slider-wrapper">
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={lfoFrequency}
              onChange={(e) => setLfoFrequency(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="control-item">
          <label>VCO MOD</label>
          {/* <div className="value-display">{formatValue(vcoModAmount, 'percentage')}</div> */}
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={vcoModAmount}
              onChange={(e) => setVcoModAmount(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="control-item">
          <label>VCF MOD</label>
          {/* <div className="value-display">{formatValue(vcfModAmount, 'percentage')}</div> */}
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={vcfModAmount}
              onChange={(e) => setVcfModAmount(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModSection;