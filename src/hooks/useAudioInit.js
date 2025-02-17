import { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';

export const useAudioInit = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  const initAudio = useCallback(async () => {
    try {
      await Tone.start();

      // Wait for the context to be running
      const context = Tone.getContext();
      while (context.state !== 'running') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setIsReady(true);
      return true;
    } catch (err) {
      setError('Failed to initialize audio. Please try again.');
      console.error('Audio initialization error:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    const handleGesture = () => {
      if (!isReady) {
        initAudio();
      }
    };

    window.addEventListener('click', handleGesture);
    window.addEventListener('keydown', handleGesture);
    window.addEventListener('touchstart', handleGesture);

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
  }, [isReady, initAudio]);

  return { isReady, error, initAudio };
};