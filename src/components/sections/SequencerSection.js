import React, { useContext } from 'react';
import { AudioContext } from '../../context/AudioContext';
import './SequencerSection.css';

const SequencerSection = () => {
  const {
    sequence,
    setSequence,
    currentStep,
    isPlaying,
    setIsPlaying,
    tempo,
    setTempo,
    swing,
    setSwing,
    formatValue
  } = useContext(AudioContext);

  // Define exactly one octave of notes in descending order
  const availableNotes = [
    'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 
    'E3', 'D#3', 'D3', 'C#3', 'C3'
  ];

  const toggleStep = (note, step) => {
    setSequence(prev => {
      const newSequence = { ...prev };
      // Initialize the sequence for this note if it doesn't exist
      if (!newSequence[note]) {
        newSequence[note] = Array(16).fill(false);
      }
      
      // Get current state for this step
      const currentState = newSequence[note][step];
      const currentHighState = newSequence[note + '_high']?.[step];

      // Clear any other notes at this step first
      availableNotes.forEach(n => {
        if (n !== note && newSequence[n]) {
          newSequence[n][step] = false;
          if (newSequence[n + '_high']) {
            newSequence[n + '_high'][step] = false;
          }
        }
      });

      // Toggle between states: off -> normal -> high -> off
      if (!currentState && !currentHighState) {
        // Turn on normal note
        newSequence[note][step] = true;
      } else if (currentState && !currentHighState) {
        // Switch to high note
        newSequence[note][step] = false;
        if (!newSequence[note + '_high']) {
          newSequence[note + '_high'] = Array(16).fill(false);
        }
        newSequence[note + '_high'][step] = true;
      } else {
        // Turn off both
        newSequence[note][step] = false;
        if (newSequence[note + '_high']) {
          newSequence[note + '_high'][step] = false;
        }
      }
      
      return newSequence;
    });
  };

  const getStepState = (note, step) => {
    const normal = sequence[note]?.[step];
    const high = sequence[note + '_high']?.[step];
    return high ? 'high' : normal ? 'normal' : '';
  };

  return (
    <div className="control-section sequencer">
      <h3>SEQUENCER</h3>
      <div className="sequencer-content">
        <div className="sequencer-controls">
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? 'STOP' : 'PLAY'}
          </button>

          <div className="control-item">
            <label>TEMPO</label>
            <div className="value-display">{tempo} BPM</div>
            <div className="slider-wrapper horizontal">
              <input
                type="range"
                min="60"
                max="200"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <div className="control-item">
            <label>SWING</label>
            <div className="value-display">{formatValue(swing, 'percentage')}</div>
            <div className="slider-wrapper horizontal">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={swing}
                onChange={(e) => setSwing(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
        
        <div className="sequence-grid">
          <div className="step-markers">
            {Array(16).fill(null).map((_, i) => (
              <div key={i} className={`step-marker ${i % 4 === 0 ? 'beat' : ''}`}>
                {i + 1}
              </div>
            ))}
          </div>
          <div className="grid-content">
            <div className="grid-lines">
              {Array(16).fill(null).map((_, i) => (
                <div key={i} className={`grid-line ${i % 4 === 0 ? 'beat' : ''}`} />
              ))}
            </div>
            {availableNotes.map(note => (
              <div key={note} className={`sequence-row ${note.includes('#') ? 'black-note' : 'white-note'}`}>
                <div className="note-label">{note}</div>
                {Array(16).fill(null).map((_, step) => (
                  <button
                    key={step}
                    className={`step-button ${getStepState(note, step)} ${currentStep === step ? 'current' : ''}`}
                    onClick={() => toggleStep(note, step)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequencerSection;