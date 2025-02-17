import React, { createContext, useRef, useState, useEffect } from 'react';
import * as Tone from 'tone';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const audioComponents = useRef({});
  const sequenceEvent = useRef(null);

  // Initialize sequence with one octave of notes
  const initializeSequence = () => {
    const notes = ['B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3', 'C3'];
    const newSequence = {};
    notes.forEach(note => {
      newSequence[note] = Array(16).fill(false);
      newSequence[note + '_high'] = Array(16).fill(false);
    });
    return newSequence;
  };

  // Audio state
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.6); // Reduced from 0.75 to 0.6
  const [sequence, setSequence] = useState(initializeSequence);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [swing, setSwing] = useState(0);

  // Tape Delay state
  const [delayTime, setDelayTime] = useState(0.3);
  const [delayFeedback, setDelayFeedback] = useState(0.3);
  const [delayMix, setDelayMix] = useState(0.3);
  const [pitchShift, setPitchShift] = useState(0);

  // Reverb state
  const [reverbPreDelay, setReverbPreDelay] = useState(0.1);
  const [reverbDecay, setReverbDecay] = useState(1.5);
  const [reverbMix, setReverbMix] = useState(0.3);

  useEffect(() => {
    console.log('AudioProvider rendered, isAudioInitialized:', isAudioInitialized);
    return () => {
      // Clean up any audio components when the provider unmounts
      Object.values(audioComponents.current).forEach(component => {
        if (component?.dispose) {
          component.dispose();
        }
      });
    };
  }, [isAudioInitialized]);

  // LFO state
  const [lfoWaveform, setLfoWaveform] = useState('sine');
  const [lfoFrequency, setLfoFrequency] = useState(5);
  const [lfoTarget, setLfoTarget] = useState('pitch');
  const [vcoModAmount, setVcoModAmount] = useState(0);
  const [vcfModAmount, setVcfModAmount] = useState(0);
  const [modAmount, setModAmount] = useState(0);

  // VCO state
  const [waveform, setWaveform] = useState('sawtooth');
  const [pulseWidth, setPulseWidth] = useState(0.5);
  const [mainOscLevel, setMainOscLevel] = useState(-12);
  const [subOscLevel, setSubOscLevel] = useState(-60);
  const [noiseLevel, setNoiseLevel] = useState(-60);

  // Filter state
  const [filterCutoff, setFilterCutoff] = useState(20000);
  const [filterResonance, setFilterResonance] = useState(1);
  const [filterEnvAmount, setFilterEnvAmount] = useState(0);

  // ADSR state
  const [attack, setAttack] = useState(0.1);
  const [decay, setDecay] = useState(0.1);
  const [sustain, setSustain] = useState(0.7);
  const [release, setRelease] = useState(0.1);

  // Updated Sequencer state
  const [steps] = useState(8);

  // Pitch state
  const [portamento, setPortamento] = useState(0);
  const [transpose, setTranspose] = useState(0);

  const formatValue = (value, type) => {
    if (typeof value !== 'number') {
      return value;
    }
    switch(type) {
      case 'frequency':
        return `${Math.round(value)} Hz`;
      case 'time':
        return `${value.toFixed(2)} s`;
      case 'percentage':
        return `${Math.round(value * 100)}%`;
      case 'level':
        return `${Math.round(value)} dB`;
      default:
        return value.toFixed(2);
    }
  };

  // Add transport control to context
  const startTransport = () => {
    if (!sequenceEvent.current && Tone.Transport) {
      const events = Array(16).fill(null).map((_, i) => i);
      
      sequenceEvent.current = new Tone.Sequence(
        (time, step) => {
          setCurrentStep(step);
          
          const { synth, subOsc } = audioComponents.current;
          if (!synth || !subOsc) return;

          // Play notes for each active row
          Object.entries(sequence).forEach(([noteKey, steps]) => {
            if (!steps?.[step]) return;
            
            const isHighOctave = noteKey.endsWith('_high');
            const baseNote = isHighOctave ? noteKey.replace('_high', '') : noteKey;
            const note = isHighOctave ? Tone.Frequency(baseNote).transpose(12) : baseNote;
            
            // Set sub oscillator frequency one octave below
            const subFreq = Tone.Frequency(note).transpose(-1).toFrequency();
            subOsc.frequency.setValueAtTime(subFreq, time);
            // Trigger main synth with envelope
            synth.triggerAttackRelease(note, '32n', time);
          });
        },
        events,
        '16n'
      ).start(0);

      Tone.Transport.start();
    }
  };

  const stopTransport = () => {
    if (Tone.Transport) {
      Tone.Transport.stop();
      setCurrentStep(-1);
      if (sequenceEvent.current) {
        sequenceEvent.current.dispose();
        sequenceEvent.current = null;
      }
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause audio when tab is hidden
        if (sequenceEvent.current) {
          Tone.Transport.pause();
        }
      } else if (isPlaying) {
        // Resume audio when tab is visible again and was playing
        Tone.Transport.start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  useEffect(() => {
    if (Tone.Transport) {
      Tone.Transport.bpm.value = tempo;
      Tone.Transport.swing = swing;
      Tone.Transport.swingSubdivision = '16n';
    }
  }, [tempo, swing]);

  useEffect(() => {
    if (isPlaying) {
      startTransport();
    } else {
      stopTransport();
    }
  }, [isPlaying, sequence]);

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      if (sequenceEvent.current) {
        sequenceEvent.current.dispose();
      }
      if (Tone.Transport) {
        Tone.Transport.stop();
      }
      Object.values(audioComponents.current).forEach(component => {
        if (component?.dispose) {
          component.dispose();
        }
      });
    };
  }, []);

  const contextValue = {
    audioComponents,
    isAudioInitialized,
    setIsAudioInitialized,
    masterVolume, setMasterVolume,
    // Tape Delay
    delayTime, setDelayTime,
    delayFeedback, setDelayFeedback,
    delayMix, setDelayMix,
    pitchShift, setPitchShift,
    // Reverb
    reverbPreDelay, setReverbPreDelay,
    reverbDecay, setReverbDecay,
    reverbMix, setReverbMix,
    // LFO
    lfoWaveform, setLfoWaveform,
    lfoFrequency, setLfoFrequency,
    lfoTarget, setLfoTarget,
    vcoModAmount, setVcoModAmount,
    vcfModAmount, setVcfModAmount,
    modAmount, setModAmount,
    // VCO
    waveform, setWaveform,
    pulseWidth, setPulseWidth,
    mainOscLevel, setMainOscLevel,
    subOscLevel, setSubOscLevel,
    noiseLevel, setNoiseLevel,
    // Filter
    filterCutoff, setFilterCutoff,
    filterResonance, setFilterResonance,
    filterEnvAmount, setFilterEnvAmount,
    // ADSR
    attack, setAttack,
    decay, setDecay,
    sustain, setSustain,
    release, setRelease,
    // Sequencer
    sequence, setSequence,
    currentStep, setCurrentStep,
    steps,
    tempo, setTempo,
    swing, setSwing,
    isPlaying, setIsPlaying,
    // Pitch
    portamento, setPortamento,
    transpose, setTranspose,
    // Utilities
    formatValue,
    // Transport control
    startTransport,
    stopTransport,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};