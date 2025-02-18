import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
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

  const getSubFrequency = useCallback((note) => {
    return Tone.Frequency(note).toFrequency() / 2;
  }, []);

  const adjustNoteForOctave = useMemo(() => (note) => {
    if (!note) return note;
    const [pitch, octave] = note.split(/(\d+)/);
    return `${pitch}${parseInt(octave) + octaveOffset}`;
  }, [octaveOffset]);

  const handleTouchStart = useCallback((e, note) => {
    e.preventDefault();
    const components = audioComponents.current;
    if (!isAudioInitialized || !components?.synth) return;
    
    try {
      components.synth.triggerAttack(note, Tone.now());
      setCurrentNote(note);
    } catch (error) {
      console.error('Error triggering note:', error);
    }
  }, [audioComponents, isAudioInitialized]);

  const handleTouchEnd = useCallback((e, note) => {
    e.preventDefault();
    const components = audioComponents.current;
    if (!isAudioInitialized || note !== currentNote || !components?.synth) return;

    try {
      components.synth.triggerRelease(Tone.now());
      setCurrentNote(null);
    } catch (error) {
      console.error('Error releasing note:', error);
    }
  }, [audioComponents, isAudioInitialized, currentNote]);

  useEffect(() => {
    if (!isAudioInitialized) return;
    
    const components = audioComponents.current;
    let activeNote = null;

    const handleKeyDown = async (e) => {
      if (e.repeat) return;

      // Handle octave switching
      if (e.key === 'z' || e.key === 'x') {
        setOctaveOffset(prev => e.key === 'z' ? Math.max(prev - 1, -2) : Math.min(prev + 1, 2));
        return;
      }

      const baseNote = keyboardMap[e.key.toLowerCase()];
      if (!baseNote) return;

      const note = adjustNoteForOctave(baseNote);
      if (activeNote === note) return;

      try {
        if (!components?.synth || !components?.subOsc) {
          console.error('Synth or SubOsc not initialized');
          return;
        }

        if (activeNote) {
          await components.synth.triggerRelease();
        }

        const subFreq = getSubFrequency(note);
        components.subOsc.frequency.setValueAtTime(subFreq, Tone.now());
        await components.synth.triggerAttack(note, Tone.now());
        
        activeNote = note;
        setCurrentNote(note);
      } catch (error) {
        console.error('Error triggering note:', error);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'z' || e.key === 'x') return;

      const baseNote = keyboardMap[e.key.toLowerCase()];
      if (!baseNote) return;

      const note = adjustNoteForOctave(baseNote);
      if (note !== activeNote) return;

      try {
        if (!components?.synth) {
          console.error('Synth not initialized');
          return;
        }

        components.synth.triggerRelease(Tone.now());
        activeNote = null;
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
      if (components?.synth && activeNote) {
        components.synth.triggerRelease();
      }
    };
  }, [isAudioInitialized, keyboardMap, adjustNoteForOctave, getSubFrequency, audioComponents]);

  const renderKeyboard = useCallback(() => {
    const keys = Object.entries(keyboardMap).map(([key, baseNote]) => {
      const note = adjustNoteForOctave(baseNote);
      return {
        note,
        key,
        type: baseNote.includes('#') ? 'black' : 'white'
      };
    });

    return (
      <div className="keyboard-display">
        {keys.map((key) => (
          <div
            key={key.note}
            className={`key ${key.type} ${currentNote === key.note ? 'active' : ''}`}
            onTouchStart={(e) => handleTouchStart(e, key.note)}
            onTouchEnd={(e) => handleTouchEnd(e, key.note)}
            onMouseDown={(e) => handleTouchStart(e, key.note)}
            onMouseUp={(e) => handleTouchEnd(e, key.note)}
            onMouseLeave={(e) => handleTouchEnd(e, key.note)}
          >
            {key.key}
          </div>
        ))}
      </div>
    );
  }, [keyboardMap, adjustNoteForOctave, currentNote, handleTouchStart, handleTouchEnd]);

  return (
    <div className="keyboard-container">
      {renderKeyboard()}
    </div>
  );
};

export default KeyboardHandler;