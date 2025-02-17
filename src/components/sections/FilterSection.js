import React, { useContext } from 'react';
import { AudioContext } from '../../context/AudioContext';

const FilterSection = () => {
  const {
    filterCutoff,
    setFilterCutoff,
    filterResonance,
    setFilterResonance,
    filterEnvAmount,
    setFilterEnvAmount,
    formatValue
  } = useContext(AudioContext);

  // Convert linear slider value (0-1) to logarithmic frequency (20-20000 Hz)
  const logToFreq = (value) => {
    return Math.pow(10, value * 3 + 1.3); // Maps 0-1 to 20-20000 Hz
  };

  // Convert frequency to linear slider value
  const freqToLog = (freq) => {
    return (Math.log10(freq) - 1.3) / 3;
  };

  return (
    <div className="control-section">
      <h3>Filter</h3>
      <div className="control-group">
        <div className="control-item">
          <label>Cutoff</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={freqToLog(filterCutoff)}
            onChange={(e) => setFilterCutoff(logToFreq(Number(e.target.value)))}
          />
          <div className="value-display">{formatValue(filterCutoff, 'frequency')}</div>
        </div>
        <div className="control-item">
          <label>Resonance</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={filterResonance}
            onChange={(e) => setFilterResonance(Number(e.target.value))}
          />
          <div className="value-display">{filterResonance.toFixed(1)}</div>
        </div>
        <div className="control-item">
          <label>Env Amt</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={filterEnvAmount}
            onChange={(e) => setFilterEnvAmount(Number(e.target.value))}
          />
          <div className="value-display">{formatValue(filterEnvAmount, 'percentage')}</div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;