import { useState, useEffect, useContext } from 'react';
import * as Tone from 'tone';
import { AudioContext } from '../context/AudioContext';

export const useAudioStatus = () => {
  const { isAudioInitialized } = useContext(AudioContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAudioContext = async () => {
      try {
        if (Tone.context.state !== 'running' && !isAudioInitialized) {
          await Tone.context.resume();
        }
      } catch (err) {
        setError('Failed to initialize audio context. Please try reloading the page.');
        console.error('Audio initialization error:', err);
      }
    };

    checkAudioContext();
  }, [isAudioInitialized]);

  return { isAudioReady: isAudioInitialized, error };
};