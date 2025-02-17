import React, { useContext, useEffect } from 'react';
import { useAudioSetup } from '../hooks/useAudioSetup';
import { AudioContext } from '../context/AudioContext';
import TabSection from './sections/TabSection';
import KeyboardHandler from './sections/KeyboardHandler';
import Visualizer from './sections/Visualizer';
import './SH101Emulator.css';

const SH101Emulator = () => {
  const { isAudioInitialized } = useContext(AudioContext);
  useAudioSetup();

  useEffect(() => {
    console.log('SH101Emulator rendered, isAudioInitialized:', isAudioInitialized);
  }, [isAudioInitialized]);

  if (!isAudioInitialized) {
    return null;
  }

  return (
    <div className="sh101-emulator">
      <TabSection />
      <div className="bottom-section">
        <KeyboardHandler />
        <Visualizer />
      </div>
    </div>
  );
};

export default SH101Emulator;
