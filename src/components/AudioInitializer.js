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
      
      // Wait for the context to be fully running
      if (context.state === 'running') {
        console.log('Audio context is running');
        await new Promise(resolve => setTimeout(resolve, 100)); // Give context time to stabilize
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
      <h2>Welcome to SH-101 Emulator</h2>
      <p>Click the button below to start audio</p>
      <button onClick={handleInitClick}>Initialize Audio</button>
    </div>
  );
};

export default AudioInitializer;