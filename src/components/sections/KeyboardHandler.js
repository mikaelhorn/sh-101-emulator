import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AudioContext } from '../../context/AudioContext';
import * as Tone from 'tone';
import './KeyboardHandler.css';

const KeyboardHandler = () => {
  const { audioComponents, isAudioInitialized } = useContext(AudioContext);
  const [currentNote, setCurrentNote] = useState(null);
  const [octaveOffset, setOctaveOffset] = useState(0);

  const keyboardMap = useMemo(() => ({
    'a': 'C4',
    'w': 'C#4',
    's': 'D4',
    'e': 'D#4',
    'd': 'E4',
    'f': 'F4',
    't': 'F#4',
    'g': 'G4',
    'y': 'G#4',
    'h': 'A4',
    'u': 'A#4',
    'j': 'B4',
    'k': 'C5',
  }), []);

  const getSubFrequency = (note) => {
    return Tone.Frequency(note).toFrequency() / 2;
  };

  const adjustNoteForOctave = (note) => {
    if (!note) return note;
    const [pitch, octave] = note.split(/(\d+)/);
    return `${pitch}${parseInt(octave) + octaveOffset}`;
  };

  useEffect(() => {
    if (!isAudioInitialized) return;

    const handleKeyDown = async (e) => {
      if (e.repeat) return;
      console.log('Key down:', e.key); // Debug log

      // Handle octave switching
      if (e.key === 'z') {
        setOctaveOffset(prev => Math.max(prev - 1, -2)); // Limit to 2 octaves down
        return;
      }
      if (e.key === 'x') {
        setOctaveOffset(prev => Math.min(prev + 1, 2)); // Limit to 2 octaves up
        return;
      }

      const baseNote = keyboardMap[e.key.toLowerCase()];
      if (!baseNote) return;

      const note = adjustNoteForOctave(baseNote);
      if (currentNote === note) return;

      try {
        const { synth, subOsc } = audioComponents.current;
        if (!synth || !subOsc) {
          console.error('Synth or SubOsc not initialized');
          return;
        }

        if (currentNote) {
          await synth.triggerRelease();
        }

        const subFreq = getSubFrequency(note);
        subOsc.frequency.setValueAtTime(subFreq, Tone.now());
        console.log('Triggering note:', note); // Debug log
        await synth.triggerAttack(note, Tone.now());
        
        setCurrentNote(note);
      } catch (error) {
        console.error('Error triggering note:', error);
      }
    };

    const handleKeyUp = (e) => {
      console.log('Key up:', e.key); // Debug log

      // Don't handle octave switch keys
      if (e.key === 'z' || e.key === 'x') return;

      const baseNote = keyboardMap[e.key.toLowerCase()];
      if (!baseNote) return;

      const note = adjustNoteForOctave(baseNote);
      if (note !== currentNote) return;

      try {
        const { synth } = audioComponents.current;
        if (!synth) {
          console.error('Synth not initialized');
          return;
        }

        console.log('Releasing note:', note); // Debug log
        synth.triggerRelease(Tone.now());
        setCurrentNote(null);
      } catch (error) {
        console.error('Error releasing note:', error);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      const { synth } = audioComponents.current;
      if (synth && currentNote) {
        synth.triggerRelease();
      }
    };
  }, [currentNote, audioComponents, isAudioInitialized, keyboardMap, octaveOffset]);

  const renderKeyboard = () => {
    const keys = Object.entries(keyboardMap).map(([key, baseNote]) => {
      const note = adjustNoteForOctave(baseNote);
      return {
        note,
        key,
        type: baseNote.includes('#') ? 'black' : 'white'
      };
    });

    const handleTouchStart = (e, note) => {
      e.preventDefault(); // Prevent double-firing on mobile
      if (!isAudioInitialized) return;
      
      try {
        const { synth } = audioComponents.current;
        if (!synth) {
          console.error('Synth not initialized');
          return;
        }

        synth.triggerAttack(note, Tone.now());
        setCurrentNote(note);
      } catch (error) {
        console.error('Error triggering note:', error);
      }
    };

    const handleTouchEnd = (e, note) => {
      e.preventDefault();
      if (!isAudioInitialized || note !== currentNote) return;

      try {
        const { synth } = audioComponents.current;
        if (!synth) {
          console.error('Synth not initialized');
          return;
        }

        synth.triggerRelease(Tone.now());
        setCurrentNote(null);
      } catch (error) {
        console.error('Error releasing note:', error);
      }
    };

    const handleMouseDown = (e, note) => {
      e.preventDefault();
      handleTouchStart(e, note);
    };

    const handleMouseUp = (e, note) => {
      e.preventDefault();
      handleTouchEnd(e, note);
    };

    return (
      <div className="keyboard-display">
        {keys.map((key) => (
          <div
            key={key.note}
            className={`key ${key.type} ${currentNote === key.note ? 'active' : ''}`}
            onTouchStart={(e) => handleTouchStart(e, key.note)}
            onTouchEnd={(e) => handleTouchEnd(e, key.note)}
            onMouseDown={(e) => handleMouseDown(e, key.note)}
            onMouseUp={(e) => handleMouseUp(e, key.note)}
            onMouseLeave={(e) => handleMouseUp(e, key.note)}
          >
            {key.key}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="keyboard-container">
      {renderKeyboard()}
    </div>
  );
};

export default KeyboardHandler;