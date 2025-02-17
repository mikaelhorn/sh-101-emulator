import React, { useState, useCallback } from 'react';
import * as Tone from 'tone';

const AudioInitializer = ({ onInitialized }) => {
  const [error, setError] = useState(null);

  const handleInitClick = useCallback(async () => {
    try {
      await Tone.start();
      console.log('Starting audio context...');
      
      // Ensure the context is running
      const context = Tone.getContext();
      await context.resume();
      
      if (context.state === 'running') {
        console.log('Audio context is running');
        onInitialized();
      } else {
        throw new Error('Could not start audio context');
      }
    } catch (err) {
      console.error('Audio initialization error:', err);
      setError('Failed to initialize audio. Please try again.');
    }
  }, [onInitialized]);

  if (error) {
    return (
      <div className="audio-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="audio-initializer">
      <button onClick={handleInitClick} className="start-button">
        Start Synthesizer
      </button>
      <p>Click to activate audio synthesis</p>
    </div>
  );
};

export default AudioInitializer;