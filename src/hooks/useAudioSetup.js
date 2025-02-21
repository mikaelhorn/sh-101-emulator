import { useEffect, useContext, useCallback } from 'react';
import * as Tone from 'tone';
import { AudioContext } from '../context/AudioContext';

export const useAudioSetup = () => {
  const {
    audioComponents,
    isAudioInitialized,
    setIsAudioInitialized,
    masterVolume,
    waveform,
    pulseWidth,
    mainOscLevel,
    attack,
    decay,
    sustain,
    release,
    filterCutoff,
    filterResonance,
    lfoWaveform,
    lfoFrequency,
    vcoModAmount,
    vcfModAmount,
    noiseLevel,
    subOscLevel,
    filterEnvAmount,
    sequence,
    currentStep,
    setCurrentStep,
    isPlaying,
    tempo,
    swing,
    setIsPlaying,
    delayTime,
    delayMix,
    delayFeedback,
    pitchShift
  } = useContext(AudioContext);

  const createAudioNode = useCallback(async (createFn) => {
    try {
      const node = await createFn();
      await new Promise(resolve => setTimeout(resolve, 10));
      return node;
    } catch (error) {
      console.error('Error creating audio node:', error);
      throw error;
    }
  }, []);

  // Initial audio setup effect - only run once when initialized
  useEffect(() => {
    if (!isAudioInitialized) return;
    let isComponentMounted = true;

    const setupAudioComponents = async () => {
      try {
        const context = Tone.getContext();
        if (context.state !== 'running') {
          await context.resume();
          if (context.state !== 'running') {
            throw new Error('Audio context not running');
          }
        }

        if (!isComponentMounted) return;

        // Clean up existing components
        Object.values(audioComponents.current).forEach(component => {
          if (component?.dispose) {
            try {
              component.disconnect();
              component.dispose();
            } catch (e) {
              console.warn('Cleanup warning:', e);
            }
          }
        });

        audioComponents.current = {};
        const components = audioComponents.current;

        // Create components with initial values
        components.masterGain = await createAudioNode(() => 
          new Tone.Gain(masterVolume).toDestination()
        );

        components.tapeDelay = await createAudioNode(() =>
          new Tone.FeedbackDelay({
            delayTime,
            feedback: delayFeedback,
            wet: delayMix
          })
        );
        components.tapeDelay.connect(components.masterGain);

        if (pitchShift !== 0) {
          components.pitchShift = await createAudioNode(() =>
            new Tone.PitchShift({
              pitch: pitchShift,
              windowSize: 0.1
            })
          );
          components.pitchShift.connect(components.masterGain);
        }

        components.synth = await createAudioNode(() =>
          new Tone.MonoSynth({
            oscillator: {
              type: waveform === 'pulse' ? 'pulse' : waveform,
              width: pulseWidth
            },
            envelope: {
              attack,
              decay,
              sustain,
              release
            },
            filter: {
              type: "lowpass",
              frequency: filterCutoff,
              rolloff: -24,
              Q: filterResonance
            },
            filterEnvelope: {
              attack,
              decay,
              sustain,
              release,
              baseFrequency: filterCutoff,
              octaves: filterEnvAmount * 7,
              exponent: 2
            }
          })
        );

        // Connect synth through effects chain
        if (components.pitchShift) {
          components.synth.disconnect();
          components.synth.connect(components.tapeDelay);
          components.tapeDelay.connect(components.pitchShift);
          components.pitchShift.connect(components.masterGain);
        } else {
          components.synth.disconnect();
          components.synth.connect(components.tapeDelay);
          components.tapeDelay.connect(components.masterGain);
        }

        // Set up sub oscillator if needed
        if (subOscLevel > -60) {
          components.subOsc = await createAudioNode(() =>
            new Tone.Oscillator({
              type: waveform === 'pulse' ? 'pulse' : waveform,
              volume: subOscLevel
            })
          );
          components.subOsc.connect(components.masterGain);
          components.subOsc.start();
        }

        // Set up noise if needed
        if (noiseLevel > -60) {
          components.noise = await createAudioNode(() =>
            new Tone.Noise({
              type: 'white',
              volume: noiseLevel
            })
          );
          components.noise.connect(components.masterGain);
          components.noise.start();
        }

        // Set up LFO if needed
        if (vcoModAmount > 0 || vcfModAmount > 0) {
          components.lfo = await createAudioNode(() =>
            new Tone.LFO({
              type: lfoWaveform,
              frequency: lfoFrequency,
              min: -1,
              max: 1
            })
          );

          if (vcoModAmount > 0) {
            const vcoScale = await createAudioNode(() => new Tone.Gain(vcoModAmount * 100));
            components.lfo.connect(vcoScale);
            vcoScale.connect(components.synth.detune);
          }

          if (vcfModAmount > 0) {
            const vcfScale = await createAudioNode(() => new Tone.Gain(vcfModAmount * 2000));
            components.lfo.connect(vcfScale);
            vcfScale.connect(components.synth.filter.frequency);
          }

          components.lfo.start();
        }

        await Tone.loaded();
        console.log('Audio components setup complete');

      } catch (error) {
        console.error('Error in audio setup:', error);
        if (isComponentMounted) {
          Object.values(audioComponents.current).forEach(component => {
            if (component?.dispose) {
              try {
                component.disconnect();
                component.dispose();
              } catch (e) {
                console.warn('Cleanup warning:', e);
              }
            }
          });
          audioComponents.current = {};
          setIsAudioInitialized(false);
        }
      }
    };

    setupAudioComponents();

    return () => {
      isComponentMounted = false;
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      Object.values(audioComponents.current).forEach(component => {
        if (component?.dispose) {
          try {
            component.disconnect();
            component.dispose();
          } catch (e) {
            console.warn('Cleanup warning:', e);
          }
        }
      });
      audioComponents.current = {};
    };
  }, [isAudioInitialized]); // Only depend on isAudioInitialized

  // Separate effects for real-time parameter updates
  useEffect(() => {
    const components = audioComponents.current;
    if (!components?.synth) return;

    // Update synth parameters in real-time
    components.synth.set({
      oscillator: {
        type: waveform === 'pulse' ? 'pulse' : waveform,
        width: pulseWidth
      }
    });
    
    if (components.subOsc) {
      components.subOsc.type = waveform === 'pulse' ? 'pulse' : waveform;
    }
  }, [waveform, pulseWidth]);

  useEffect(() => {
    const components = audioComponents.current;
    if (!components?.synth) return;

    components.synth.envelope.set({
      attack,
      decay,
      sustain,
      release
    });

    components.synth.filterEnvelope.set({
      attack,
      decay,
      sustain,
      release
    });
  }, [attack, decay, sustain, release]);

  useEffect(() => {
    const components = audioComponents.current;
    if (!components?.synth) return;

    components.synth.filter.set({
      frequency: filterCutoff,
      Q: filterResonance
    });

    components.synth.filterEnvelope.set({
      baseFrequency: filterCutoff,
      octaves: filterEnvAmount * 7
    });
  }, [filterCutoff, filterResonance, filterEnvAmount]);

  useEffect(() => {
    const components = audioComponents.current;
    if (!components?.lfo) return;

    components.lfo.set({
      type: lfoWaveform,
      frequency: lfoFrequency
    });
  }, [lfoWaveform, lfoFrequency]);

  useEffect(() => {
    const components = audioComponents.current;
    if (!components?.masterGain) return;
    components.masterGain.gain.rampTo(masterVolume, 0.1);
  }, [masterVolume]);

  useEffect(() => {
    const components = audioComponents.current;
    if (!components?.synth) return;
    components.synth.volume.rampTo(mainOscLevel, 0.1);
  }, [mainOscLevel]);

  useEffect(() => {
    const components = audioComponents.current;
    if (!components?.subOsc) return;
    components.subOsc.volume.rampTo(subOscLevel, 0.1);
  }, [subOscLevel]);

  useEffect(() => {
    const components = audioComponents.current;
    if (!components?.noise) return;
    components.noise.volume.rampTo(noiseLevel, 0.1);
  }, [noiseLevel]);

  // Effect controls
  useEffect(() => {
    const components = audioComponents.current;
    if (!components?.tapeDelay) return;

    components.tapeDelay.delayTime.rampTo(delayTime, 0.1);
    components.tapeDelay.feedback.rampTo(delayFeedback, 0.1);
    components.tapeDelay.wet.rampTo(delayMix, 0.1);
  }, [delayTime, delayFeedback, delayMix]);

  useEffect(() => {
    const components = audioComponents.current;
    if (!components?.pitchShift) return;
    components.pitchShift.pitch = pitchShift;
  }, [pitchShift]);

  // Transport controls
  useEffect(() => {
    if (!isAudioInitialized) return;
    Tone.Transport.bpm.value = tempo;
  }, [isAudioInitialized, tempo]);

  useEffect(() => {
    if (!isAudioInitialized) return;
    Tone.Transport.swing = swing;
  }, [isAudioInitialized, swing]);

  // Sequencer effect
  useEffect(() => {
    if (!isAudioInitialized || !isPlaying) return;

    const components = audioComponents.current;
    if (!components?.synth) return;

    if (components.sequenceEvent) {
      components.sequenceEvent.dispose();
    }

    try {
      components.sequenceEvent = new Tone.Sequence(
        (time, step) => {
          Tone.Draw.schedule(() => {
            setCurrentStep(step);
          }, time);

          if (!sequence) return;
          Object.entries(sequence).forEach(([noteKey, steps]) => {
            if (!steps?.[step]) return;

            const isHighOctave = noteKey.endsWith('_high');
            const baseNote = isHighOctave ? noteKey.replace('_high', '') : noteKey;
            const note = isHighOctave ? Tone.Frequency(baseNote).transpose(12) : baseNote;

            components.synth.triggerAttackRelease(note, '32n', time);

            if (components.subOsc) {
              const subFreq = Tone.Frequency(note).transpose(-12).toFrequency();
              components.subOsc.frequency.setValueAtTime(subFreq, time);
            }
          });
        },
        Array.from({ length: 16 }, (_, i) => i),
        '16n'
      ).start(0);

    } catch (error) {
      console.error('Error setting up sequence:', error);
      setIsPlaying(false);
    }

    return () => {
      if (components.sequenceEvent) {
        components.sequenceEvent.dispose();
        components.sequenceEvent = null;
      }
    };
  }, [isAudioInitialized, isPlaying, sequence, setCurrentStep, setIsPlaying]);

  // Play/Stop control
  useEffect(() => {
    const components = audioComponents.current;
    if (!components?.synth) return;
    
    if (isPlaying) {
      Tone.Transport.start();
    } else {
      Tone.Transport.pause();
      setCurrentStep(-1);
    }
  }, [isPlaying, setCurrentStep]);

  return null;
};