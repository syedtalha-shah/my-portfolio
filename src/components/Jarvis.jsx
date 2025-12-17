import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaRobot, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import projectsData from "../assets/data.json";
import { useTheme } from "../context/ThemeContext";
import "../styles/jarvis.scss";

const Jarvis = () => {
  const [isActive, setIsActive] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForWakeWord, setIsWaitingForWakeWord] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const hasGreetedRef = useRef(false);
  const stateRef = useRef({ isActive, isAwake, isWaitingForWakeWord });
  const isRecognitionStoppingRef = useRef(false);
  const recognitionTimeoutRef = useRef(null);
  const commandTimeoutRef = useRef(null);
  const wasIntentionallyStoppedRef = useRef(false);
  const lastStartTimeRef = useRef(0);
  const isRecognitionRunningRef = useRef(false);
  const abortCountRef = useRef(0);
  const lastAbortTimeRef = useRef(0);
  const statusTimeoutRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const lastSpeechEndTimeRef = useRef(0);
  const speechCooldownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const COMMAND_MODE_TIMEOUT = 15000; // 15 seconds of inactivity before returning to wake word mode
  const MIN_RESTART_DELAY = 300; // Minimum delay between start attempts (ms) - reduced
  const MAX_ABORT_RETRIES = 3; // Maximum consecutive aborts before giving up
  const ABORT_COOLDOWN = 2000; // Cooldown period after multiple aborts (ms)
  const SPEECH_COOLDOWN_PERIOD = 1500; // Ignore commands for 2 seconds after speech ends

  // Keep refs in sync with state
  useEffect(() => {
    stateRef.current = { isActive, isAwake, isWaitingForWakeWord };
  }, [isActive, isAwake, isWaitingForWakeWord]);

  // Define functions before useEffects that use them
  const speak = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      
      // Stop recognition while speaking to prevent feedback loop
      if (recognitionRef.current && isRecognitionRunningRef.current) {
        console.log("Stopping recognition while speaking");
        wasIntentionallyStoppedRef.current = true;
        isRecognitionStoppingRef.current = true;
        try {
          recognitionRef.current.abort(); // Use abort instead of stop for immediate cancellation
        } catch (e) {
          try {
            recognitionRef.current.stop();
          } catch (e2) {
            console.log("Error stopping/aborting recognition before speaking:", e2);
          }
        }
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Track when speech starts
      utterance.onstart = () => {
        console.log("Speech started");
        isSpeakingRef.current = true;
        // Clear any pending speech cooldown
        if (speechCooldownRef.current) {
          clearTimeout(speechCooldownRef.current);
          speechCooldownRef.current = null;
        }
      };
      
      // Track when speech ends and restart recognition
      utterance.onend = () => {
        console.log("Speech ended");
        isSpeakingRef.current = false;
        lastSpeechEndTimeRef.current = Date.now();
        
        // Set cooldown period - ignore any commands that come during this period
        speechCooldownRef.current = setTimeout(() => {
          speechCooldownRef.current = null;
          console.log("Speech cooldown period ended");
        }, SPEECH_COOLDOWN_PERIOD);
        
        // Restart recognition after a longer delay to ensure speech fully ends
        setTimeout(() => {
          const state = stateRef.current;
          // Only restart if cooldown period has passed and we're still in the right state
          const timeSinceSpeechEnd = Date.now() - lastSpeechEndTimeRef.current;
          if (timeSinceSpeechEnd >= SPEECH_COOLDOWN_PERIOD - 500) { // Restart near end of cooldown
            if (state.isAwake && state.isActive && !isRecognitionStoppingRef.current && !isRecognitionRunningRef.current && !isSpeakingRef.current) {
              console.log("Restarting recognition after speech cooldown");
              isRecognitionStoppingRef.current = false;
              wasIntentionallyStoppedRef.current = false;
              startCommandListening();
            } else if (state.isWaitingForWakeWord && state.isActive && !isRecognitionStoppingRef.current && !isRecognitionRunningRef.current && !isSpeakingRef.current) {
              console.log("Restarting wake word listening after speech cooldown");
              isRecognitionStoppingRef.current = false;
              wasIntentionallyStoppedRef.current = false;
              startWakeWordListening();
            }
          }
        }, SPEECH_COOLDOWN_PERIOD + 200); // Restart after cooldown period plus buffer
      };
      
      // Handle speech errors
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        isSpeakingRef.current = false;
        lastSpeechEndTimeRef.current = Date.now();
        
        // Set cooldown even on error
        speechCooldownRef.current = setTimeout(() => {
          speechCooldownRef.current = null;
        }, SPEECH_COOLDOWN_PERIOD);
        
        // Restart recognition even on error, but after cooldown
        setTimeout(() => {
          const state = stateRef.current;
          const timeSinceSpeechEnd = Date.now() - lastSpeechEndTimeRef.current;
          if (timeSinceSpeechEnd >= SPEECH_COOLDOWN_PERIOD - 500) {
            if (state.isAwake && state.isActive && !isRecognitionStoppingRef.current && !isRecognitionRunningRef.current && !isSpeakingRef.current) {
              isRecognitionStoppingRef.current = false;
              wasIntentionallyStoppedRef.current = false;
              startCommandListening();
            } else if (state.isWaitingForWakeWord && state.isActive && !isRecognitionStoppingRef.current && !isRecognitionRunningRef.current && !isSpeakingRef.current) {
              isRecognitionStoppingRef.current = false;
              wasIntentionallyStoppedRef.current = false;
              startWakeWordListening();
            }
          }
        }, SPEECH_COOLDOWN_PERIOD + 200);
      };
      
      synthRef.current.speak(utterance);
    }
  };

  const checkWakeWord = (transcript) => {
    const wakeWords = ["hello talha", "hey talha", "hi talha", "talha"];
    return wakeWords.some(word => transcript.includes(word));
  };

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check for browser support
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = true; // Enable interim results to show text as user speaks

    // Handle recognition results - will be set up after functions are defined

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      isRecognitionRunningRef.current = false;
      
      // "aborted" is not really an error - it just means recognition was stopped
      // Don't treat it as an error or try to restart
      if (event.error === "aborted") {
        console.log("Recognition was aborted");
        const now = Date.now();
        const timeSinceLastAbort = now - lastAbortTimeRef.current;
        
        // If aborts are happening too frequently, it's likely a loop
        if (timeSinceLastAbort < 1000) {
          abortCountRef.current += 1;
          console.log(`Abort count: ${abortCountRef.current}`);
          
          // If too many rapid aborts, enter cooldown
          if (abortCountRef.current >= MAX_ABORT_RETRIES) {
            console.log("Too many rapid aborts, entering cooldown period");
            wasIntentionallyStoppedRef.current = true;
            lastAbortTimeRef.current = now;
            
            // Clear any pending restarts
            if (recognitionTimeoutRef.current) {
              clearTimeout(recognitionTimeoutRef.current);
              recognitionTimeoutRef.current = null;
            }
            
            // Wait for cooldown before allowing restart
            recognitionTimeoutRef.current = setTimeout(() => {
              abortCountRef.current = 0;
              wasIntentionallyStoppedRef.current = false;
              const state = stateRef.current;
              if (state.isActive && state.isWaitingForWakeWord && !state.isAwake) {
                console.log("Cooldown ended, restarting wake word listening");
                startWakeWordListening();
              }
            }, ABORT_COOLDOWN);
            return;
          }
        } else {
          // Reset counter if enough time has passed
          abortCountRef.current = 1;
        }
        
        lastAbortTimeRef.current = now;
        wasIntentionallyStoppedRef.current = true;
        return;
      }
      
      // Reset abort counter for non-abort errors
      abortCountRef.current = 0;
      
      if (event.error === "not-allowed") {
        speak("Microphone permission denied. Please allow microphone access to use Jarvis.");
        wasIntentionallyStoppedRef.current = false;
      } else if (event.error === "no-speech") {
        // Silently restart if no speech detected (only if not intentionally stopped)
        if (!wasIntentionallyStoppedRef.current) {
          const state = stateRef.current;
          if (state.isWaitingForWakeWord) {
            restartWakeWordListening();
          } else if (state.isAwake) {
            // Continue command mode
            setTimeout(() => {
              if (stateRef.current.isAwake && stateRef.current.isActive) {
                startCommandListening();
              }
            }, 500);
          }
        }
        wasIntentionallyStoppedRef.current = false;
      } else {
        wasIntentionallyStoppedRef.current = false;
        console.log("Non-critical error, continuing:", event.error);
      }
    };

    // Define handleRecognitionEnd before onend handler
    const handleRecognitionEnd = (state) => {
      // Don't restart if recognition is already running or was intentionally stopped
      if (isRecognitionRunningRef.current || wasIntentionallyStoppedRef.current) {
        console.log("Skipping restart - recognition running or intentionally stopped");
        return;
      }
      
      // Auto-restart if we're waiting for wake word
      if (state.isWaitingForWakeWord && state.isActive && !state.isAwake && !isRecognitionStoppingRef.current) {
        console.log("Auto-restarting wake word listening from onend");
        setTimeout(() => {
          const currentState = stateRef.current;
          if (currentState.isWaitingForWakeWord && currentState.isActive && !currentState.isAwake && !isRecognitionStoppingRef.current && !isRecognitionRunningRef.current && !wasIntentionallyStoppedRef.current) {
            console.log("Actually starting wake word listening from handleRecognitionEnd");
            startWakeWordListening();
          }
        }, MIN_RESTART_DELAY);
      } else if (state.isAwake && state.isActive && !isRecognitionStoppingRef.current) {
        // If awake, continue listening for next command (don't return to wake word mode)
        console.log("Recognition ended while awake, continuing command mode");
        // Restart command listening after a short delay
        setTimeout(() => {
          const currentState = stateRef.current;
          if (currentState.isAwake && currentState.isActive && !isRecognitionStoppingRef.current && !isRecognitionRunningRef.current && !wasIntentionallyStoppedRef.current) {
            startCommandListening();
          }
        }, 500);
      }
    };

    recognitionRef.current.onend = () => {
      console.log("Recognition ended, isStopping:", isRecognitionStoppingRef.current, "wasIntentionallyStopped:", wasIntentionallyStoppedRef.current, "isRunning:", isRecognitionRunningRef.current);
      setIsListening(false);
      isRecognitionRunningRef.current = false;
      const state = stateRef.current;
      
      // If recognition was intentionally stopped, don't auto-restart immediately
      // Wait a bit to ensure it's fully stopped
      if (wasIntentionallyStoppedRef.current) {
        console.log("Recognition was intentionally stopped, not auto-restarting");
        // Don't reset wasIntentionallyStoppedRef here - let it be reset by the function that wants to restart
        isRecognitionStoppingRef.current = false;
        
        // Clear any pending timeouts
        if (recognitionTimeoutRef.current) {
          clearTimeout(recognitionTimeoutRef.current);
          recognitionTimeoutRef.current = null;
        }
        
        // Don't auto-restart if it was intentionally stopped - let the calling function handle restart
        return;
      }
      
      // Clear the stopping flag since recognition has ended
      isRecognitionStoppingRef.current = false;
      
      // Clear any pending timeouts since onend will handle restart
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
      }
      
      // Check if enough time has passed since last start to prevent rapid restarts
      const timeSinceLastStart = Date.now() - lastStartTimeRef.current;
      if (timeSinceLastStart < MIN_RESTART_DELAY) {
        console.log("Too soon to restart, waiting...");
        recognitionTimeoutRef.current = setTimeout(() => {
          const currentState = stateRef.current;
          // Only restart if still active and not intentionally stopped
          if (currentState.isActive && !wasIntentionallyStoppedRef.current) {
            handleRecognitionEnd(currentState);
          }
        }, MIN_RESTART_DELAY - timeSinceLastStart);
        return;
      }
      
      // Only restart if not intentionally stopped
      if (!wasIntentionallyStoppedRef.current) {
        handleRecognitionEnd(state);
      }
    };

    recognitionRef.current.onstart = () => {
      console.log("Recognition started");
      const state = stateRef.current;
      if (state.isWaitingForWakeWord) {
        setStatusMessage("Listening for 'Hello Talha'...");
      } else if (state.isAwake) {
        setStatusMessage("Listening...");
      }
    };

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    // Greet user on page load
    const greetingTimer = setTimeout(() => {
      if (!hasGreetedRef.current) {
        hasGreetedRef.current = true;
        const greeting = "Hello! I'm Jarvis, your AI assistant. Click the button, then say 'Hello Talha' to activate me.";
        speak(greeting);
      }
    }, 2000);

    return () => {
      clearTimeout(greetingTimer);
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      if (speechCooldownRef.current) {
        clearTimeout(speechCooldownRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          try {
            recognitionRef.current.stop();
          } catch (e2) {
            // Ignore
          }
        }
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Set up recognition result handler - will be set up after all functions are defined

  const startWakeWordListening = () => {
    const state = stateRef.current;
    if (!recognitionRef.current) {
      console.warn("Speech recognition not initialized");
      return;
    }
    
    // Don't start if already running
    if (isRecognitionRunningRef.current) {
      console.log("Recognition already running, skipping start");
      return;
    }
    
    // Don't start if we're stopping or already listening
    if (isRecognitionStoppingRef.current) {
      console.log("Recognition is stopping, waiting...");
      return;
    }
    
    // Don't start if Jarvis is currently speaking or in cooldown
    if (isSpeakingRef.current || speechCooldownRef.current) {
      console.log("Jarvis is speaking or in cooldown, skipping wake word start");
      return;
    }
    
    // Don't start if we're too close to when speech ended
    const timeSinceSpeechEnd = Date.now() - lastSpeechEndTimeRef.current;
    if (timeSinceSpeechEnd < SPEECH_COOLDOWN_PERIOD) {
      console.log("Too soon after speech ended, skipping wake word start");
      return;
    }
    
    // Check if enough time has passed since last start
    const timeSinceLastStart = Date.now() - lastStartTimeRef.current;
    if (timeSinceLastStart < MIN_RESTART_DELAY) {
      console.log("Too soon to start, scheduling restart...");
      recognitionTimeoutRef.current = setTimeout(() => {
        if (stateRef.current.isActive && !stateRef.current.isListening && !isRecognitionStoppingRef.current && !isRecognitionRunningRef.current) {
          startWakeWordListening();
        }
      }, MIN_RESTART_DELAY - timeSinceLastStart);
      return;
    }
    
    if (state.isActive && !state.isListening) {
      // Clear any pending timeouts
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
      }
      
      recognitionRef.current.continuous = true;
      try {
        recognitionRef.current.start();
        lastStartTimeRef.current = Date.now();
        isRecognitionRunningRef.current = true;
        setIsListening(true);
        setIsWaitingForWakeWord(true);
        wasIntentionallyStoppedRef.current = false;
        abortCountRef.current = 0; // Reset abort counter on successful start
        setStatusMessage("Listening for 'Hello Talha'...");
        setRecognizedText("");
        console.log("Started wake word listening - ready for 'Hello Talha'");
      } catch (e) {
        // Recognition might already be running - this shouldn't happen but handle it
        console.log("Recognition already running, this shouldn't happen:", e);
        isRecognitionRunningRef.current = false;
        // Don't try to restart here - let onend handle it
      }
    }
  };

  const restartWakeWordListening = () => {
    const state = stateRef.current;
    if (recognitionRef.current && state.isActive && !isRecognitionStoppingRef.current) {
      wasIntentionallyStoppedRef.current = true;
      isRecognitionStoppingRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
      // Wait for onend event to fire before restarting
      recognitionTimeoutRef.current = setTimeout(() => {
        isRecognitionStoppingRef.current = false;
        wasIntentionallyStoppedRef.current = false;
        abortCountRef.current = 0; // Reset abort counter when intentionally restarting
        const currentState = stateRef.current;
        if (currentState.isActive && currentState.isWaitingForWakeWord && !isRecognitionRunningRef.current) {
          startWakeWordListening();
        }
      }, MIN_RESTART_DELAY);
    }
  };

  const handleWakeWordDetected = () => {
    setIsAwake(true);
    setIsWaitingForWakeWord(false);
    setIsListening(false);
    setRecognizedText("");
    wasIntentionallyStoppedRef.current = true;
    isRecognitionStoppingRef.current = true;
    isRecognitionRunningRef.current = false;
    abortCountRef.current = 0; // Reset abort counter
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Error stopping recognition:", e);
      }
    }

    // Respond to wake word
    const responses = [
      "Yes, how can I help you?",
      "At your service!",
      "I'm listening.",
      "How may I assist you?"
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    setStatusMessage("Ready for command");
    speak(response);

    // Switch to command mode after a shorter delay - wait for recognition to fully stop
    setTimeout(() => {
      isRecognitionStoppingRef.current = false;
      wasIntentionallyStoppedRef.current = false;
      const state = stateRef.current;
      if (state.isAwake && state.isActive) {
        startCommandListening();
        // Set initial timeout for command mode
        continueCommandMode();
      }
    }, 800); // Reduced from 1500ms
  };

  const startCommandListening = () => {
    const state = stateRef.current;
    if (!recognitionRef.current || !state.isAwake || !state.isActive || isRecognitionStoppingRef.current) {
      return;
    }
    
    // Don't start if already running or if Jarvis is speaking
    if (isRecognitionRunningRef.current) {
      console.log("Recognition already running, skipping command start");
      return;
    }
    
    // Don't start if Jarvis is currently speaking or in cooldown
    if (isSpeakingRef.current || speechCooldownRef.current) {
      console.log("Jarvis is speaking or in cooldown, skipping command start");
      return;
    }
    
    // Don't start if we're too close to when speech ended
    const timeSinceSpeechEnd = Date.now() - lastSpeechEndTimeRef.current;
    if (timeSinceSpeechEnd < SPEECH_COOLDOWN_PERIOD) {
      console.log("Too soon after speech ended, skipping command start");
      return;
    }
    
    // Check if enough time has passed since last start
    const timeSinceLastStart = Date.now() - lastStartTimeRef.current;
    if (timeSinceLastStart < MIN_RESTART_DELAY) {
      console.log("Too soon to start command listening, scheduling...");
      recognitionTimeoutRef.current = setTimeout(() => {
        if (stateRef.current.isAwake && stateRef.current.isActive && !isRecognitionStoppingRef.current && !isRecognitionRunningRef.current) {
          startCommandListening();
        }
      }, MIN_RESTART_DELAY - timeSinceLastStart);
      return;
    }
    
    // Clear any pending timeouts
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }
    
    recognitionRef.current.continuous = false;
    try {
      recognitionRef.current.start();
      lastStartTimeRef.current = Date.now();
      isRecognitionRunningRef.current = true;
      setIsListening(true);
      wasIntentionallyStoppedRef.current = false;
      abortCountRef.current = 0; // Reset abort counter on successful start
      setStatusMessage("Listening...");
      setRecognizedText("");
      console.log("Started command listening");
    } catch (e) {
      // Recognition might already be running - wait and try again
      console.log("Recognition already running, waiting:", e);
      isRecognitionRunningRef.current = false;
      wasIntentionallyStoppedRef.current = true;
      isRecognitionStoppingRef.current = true;
      
      try {
        recognitionRef.current.stop();
      } catch (stopError) {
        console.log("Error stopping:", stopError);
      }
      
      recognitionTimeoutRef.current = setTimeout(() => {
        isRecognitionStoppingRef.current = false;
        wasIntentionallyStoppedRef.current = false;
        if (stateRef.current.isAwake && stateRef.current.isActive && recognitionRef.current && !isRecognitionRunningRef.current) {
          try {
            recognitionRef.current.continuous = false;
            recognitionRef.current.start();
            lastStartTimeRef.current = Date.now();
            isRecognitionRunningRef.current = true;
            setIsListening(true);
            abortCountRef.current = 0;
            setStatusMessage("Listening...");
            setRecognizedText("");
            console.log("Restarted command listening");
          } catch (restartError) {
            console.error("Failed to restart command listening:", restartError);
            isRecognitionRunningRef.current = false;
          }
        }
      }, MIN_RESTART_DELAY);
    }
  };

  const deactivateJarvis = () => {
    console.log("Deactivating Jarvis");
    setIsActive(false);
    setIsAwake(false);
    setIsWaitingForWakeWord(false);
    setIsListening(false);
    setRecognizedText("");
    setStatusMessage("");
    
    // Clear any pending timeouts
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }
    
    // Reset all flags
    isRecognitionStoppingRef.current = true;
    wasIntentionallyStoppedRef.current = true;
    isRecognitionRunningRef.current = false;
    abortCountRef.current = 0;
    
    // Stop recognition if it's running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Error stopping recognition during deactivation:", e);
      }
    }
    
    // Cancel any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    // Reset stopping flag after a delay
    setTimeout(() => {
      isRecognitionStoppingRef.current = false;
      wasIntentionallyStoppedRef.current = false;
    }, 500);
  };

  const returnToWakeWordMode = () => {
    console.log("Returning to wake word mode");
    setIsAwake(false);
    setIsWaitingForWakeWord(true);
    setIsListening(false);
    setRecognizedText("");
    setStatusMessage("Ready for 'Hello Talha'");
    
    // Clear command mode timeout
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
    
    // Clear any pending timeouts
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }
    
    // Stop recognition if it's running
    if (recognitionRef.current) {
      wasIntentionallyStoppedRef.current = true;
      isRecognitionStoppingRef.current = true;
      isRecognitionRunningRef.current = false;
      abortCountRef.current = 0; // Reset abort counter
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors - recognition might already be stopped
        console.log("Error stopping in returnToWakeWordMode (may be expected):", e);
      }
    }

    // Restart wake word listening - wait for recognition to fully stop via onend event
    // Reduced delay for faster restart
    recognitionTimeoutRef.current = setTimeout(() => {
      isRecognitionStoppingRef.current = false;
      wasIntentionallyStoppedRef.current = false;
      const state = stateRef.current;
      if (state.isActive && !state.isAwake && !state.isListening && !isRecognitionRunningRef.current) {
        console.log("Restarting wake word listening from returnToWakeWordMode");
        startWakeWordListening();
      }
    }, MIN_RESTART_DELAY + 200);
  };

  const handleVoiceCommand = (command) => {
    // Ignore commands that come too soon after Jarvis was speaking
    const timeSinceSpeechEnd = Date.now() - lastSpeechEndTimeRef.current;
    if (timeSinceSpeechEnd < SPEECH_COOLDOWN_PERIOD || isSpeakingRef.current || speechCooldownRef.current) {
      console.log("Ignoring command - too soon after speech or still in cooldown", {
        timeSinceSpeechEnd,
        isSpeaking: isSpeakingRef.current,
        inCooldown: !!speechCooldownRef.current
      });
      return;
    }
    
    setIsListening(false);
    setRecognizedText(command);
    setStatusMessage("Processing...");
    console.log("Processing command:", command);
    
    // Check for deactivation commands
    if (command.includes("goodbye") || command.includes("bye") || command.includes("sleep") || 
        command.includes("deactivate") || command.includes("stop listening") || command.includes("that's all") ||
        command.includes("go to sleep")) {
      // Speak goodbye message and wait for it to finish before deactivating
      const goodbyeMessage = "I'm going to sleep. Click the button to activate me again.";
      
      if (synthRef.current) {
        synthRef.current.cancel();
        
        // Stop recognition immediately
        if (recognitionRef.current && isRecognitionRunningRef.current) {
          wasIntentionallyStoppedRef.current = true;
          isRecognitionStoppingRef.current = true;
          try {
            recognitionRef.current.abort();
          } catch (e) {
            try {
              recognitionRef.current.stop();
            } catch (e2) {
              // Ignore
            }
          }
        }
        
        const utterance = new SpeechSynthesisUtterance(goodbyeMessage);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Deactivate after speech finishes
        utterance.onend = () => {
          console.log("Goodbye speech ended, deactivating");
          setTimeout(() => {
            deactivateJarvis();
          }, 100);
        };
        
        // Also deactivate on error (in case speech fails)
        utterance.onerror = () => {
          console.log("Goodbye speech error, deactivating");
          setTimeout(() => {
            deactivateJarvis();
          }, 100);
        };
        
        synthRef.current.speak(utterance);
      } else {
        // If no speech synthesis, deactivate immediately
        deactivateJarvis();
      }
      return;
    }
    
    // Theme switching commands - check before other commands
    if (command.includes("theme") || command.includes("mode") || command.includes("dark") || command.includes("light")) {
      // Get current theme from DOM attribute for accurate reading (avoids stale state)
      const currentTheme = document.documentElement.getAttribute("data-theme") || theme;
      
      // Check for specific theme requests
      if (command.includes("dark") || command.includes("dark mode") || command.includes("dark theme")) {
        if (currentTheme !== "dark") {
          toggleTheme();
          respond("Switching to dark mode.");
        } else {
          respond("Already in dark mode.");
        }
        return;
      }
      
      if (command.includes("light") || command.includes("light mode") || command.includes("light theme")) {
        if (currentTheme !== "light") {
          toggleTheme();
          respond("Switching to light mode.");
        } else {
          respond("Already in light mode.");
        }
        return;
      }
      
      // Generic theme toggle commands
      if (command.includes("change theme") || command.includes("switch theme") || command.includes("toggle theme") ||
          command.includes("convert theme") || command.includes("change mode") || command.includes("switch mode") ||
          command.includes("toggle mode") || command.includes("change to") || command.includes("switch to") ||
          command.includes("convert to") || command.includes("change the theme") || command.includes("switch the theme") ||
          command.includes("change the mode") || command.includes("switch the mode") || 
          (command.includes("theme") && (command.includes("change") || command.includes("switch") || command.includes("toggle") || command.includes("convert"))) ||
          (command.includes("mode") && (command.includes("change") || command.includes("switch") || command.includes("toggle") || command.includes("convert")))) {
        toggleTheme();
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        respond(`Theme switched to ${newTheme} mode.`);
        return;
      }
    }
    
    // Immediately abort recognition to prevent processing any queued audio
    if (recognitionRef.current) {
      wasIntentionallyStoppedRef.current = true;
      isRecognitionStoppingRef.current = true;
      isRecognitionRunningRef.current = false;
      try {
        recognitionRef.current.abort(); // Use abort for immediate cancellation
      } catch (e) {
        try {
          recognitionRef.current.stop();
        } catch (e2) {
          console.log("Error stopping/aborting recognition after command:", e2);
        }
      }
    }
    
    // Reset the command timeout since we received a command
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
    
    // Navigation commands - check for section names first, then navigation verbs
    // Check for direct section names
    if (command.includes("work") || command.includes("project") || command.includes("portfolio") || command.includes("projects")) {
      if (command.includes("go to") || command.includes("show") || command.includes("navigate") || command.includes("open") || command.includes("take me") || command.includes("scroll")) {
        navigateToSection("work", "Taking you to the projects section.");
        return;
      } else if (command.includes("what") || command.includes("tell") || command.includes("about")) {
        // This is asking about projects, not navigating - handled below
      } else {
        // Assume navigation if just "work" or "projects"
        navigateToSection("work", "Showing you the projects section.");
        return;
      }
    }
    
    if (command.includes("home") || command.includes("main")) {
      if (command.includes("go to") || command.includes("show") || command.includes("navigate") || command.includes("open") || command.includes("take me") || command.includes("scroll")) {
        navigateToSection("home", "Taking you to the home section.");
        return;
      } else {
        navigateToSection("home", "Taking you to the home section.");
        return;
      }
    }
    
    if (command.includes("experience") || command.includes("timeline") || command.includes("history")) {
      navigateToSection("experience", "Displaying the experience timeline.");
      return;
    }
    
    if (command.includes("service")) {
      navigateToSection("services", "Showing the services section.");
      return;
    }
    
    if (command.includes("testimonial") || command.includes("testimony") || command.includes("review")) {
      navigateToSection("testimonial", "Displaying testimonials.");
      return;
    }
    
    if (command.includes("contact") || command.includes("reach") || command.includes("connect")) {
      if (command.includes("go to") || command.includes("show") || command.includes("navigate") || command.includes("open")) {
        navigateToSection("contact", "Opening the contact section.");
        return;
      }
      // If just "contact", might be asking for contact info - handled below
    }
    
    // Navigation verbs with section names
    if (command.includes("go to") || command.includes("show me") || command.includes("navigate to") || command.includes("open") || command.includes("take me to") || command.includes("scroll to")) {
      if (command.includes("home")) {
        navigateToSection("home", "Taking you to the home section.");
        return;
      } else if (command.includes("work") || command.includes("project")) {
        navigateToSection("work", "Showing you the projects section.");
        return;
      } else if (command.includes("experience") || command.includes("timeline")) {
        navigateToSection("experience", "Displaying the experience timeline.");
        return;
      } else if (command.includes("service")) {
        navigateToSection("services", "Showing the services section.");
        return;
      } else if (command.includes("testimonial")) {
        navigateToSection("testimonial", "Displaying testimonials.");
        return;
      } else if (command.includes("contact")) {
        navigateToSection("contact", "Opening the contact section.");
        return;
      } else {
        respond("I can navigate to: home, work, experience, services, testimonials, or contact. Which section would you like to visit?");
        return;
      }
    }
    // Information about Talha - comprehensive prompts
    if (command.includes("who is") || command.includes("who are you") || command.includes("introduce") || 
        command.includes("tell me about") || command.includes("what do you know about") ||
        (command.includes("about") && (command.includes("talha") || command.includes("you") || command.includes("him")))) {
      respond("Talha is a Full Stack Developer specializing in React and Node.js. He has worked with over 100 clients worldwide and completed more than 500 projects. He's an expert in building modern web applications with technologies like React, Node.js, MongoDB, and more. He's passionate about creating efficient, scalable solutions and delivering high-quality software.");
      return;
    }
    
    // Background and experience
    if (command.includes("background") || command.includes("experience") || command.includes("history") || 
        command.includes("where") && command.includes("from") || command.includes("education") || 
        command.includes("qualification") || command.includes("degree")) {
      respond("Talha is a skilled Full Stack Developer with extensive experience in web development. He has successfully completed over 500 projects and worked with more than 100 clients globally. His expertise spans across modern web technologies and he's known for delivering high-quality, scalable applications.");
      return;
    }
    
    // Skills and expertise - expanded
    if (command.includes("skill") || command.includes("what can") || command.includes("expertise") || 
        command.includes("technology") || command.includes("tech stack") || command.includes("technologies") ||
        command.includes("what technologies") || command.includes("what tools") || command.includes("programming languages") ||
        command.includes("languages") || command.includes("framework") || command.includes("stack")) {
      respond("Talha specializes in Full Stack Development with expertise in React, Node.js, MongoDB, TypeScript, JavaScript, and various modern web technologies. He's also skilled in React Native for mobile development, Redux for state management, Express.js for backend, and building scalable, performant applications. He stays updated with the latest industry trends and best practices.");
      return;
    }
    
    // What does Talha do / profession
    if (command.includes("what does") || command.includes("what do") || command.includes("profession") ||
        command.includes("occupation") || command.includes("job") || command.includes("career") ||
        command.includes("developer") || command.includes("programmer") || command.includes("coder")) {
      respond("Talha is a Full Stack Developer who creates web and mobile applications. He works with both frontend and backend technologies to build complete solutions. He specializes in React for frontend development, Node.js for backend services, and MongoDB for databases. He helps clients build modern, efficient applications.");
      return;
    }
    // Projects - expanded prompts
    if (command.includes("project") || command.includes("portfolio") || command.includes("work done") ||
        command.includes("what has") || command.includes("what projects") || command.includes("show projects") ||
        command.includes("list projects") || command.includes("all projects")) {
      if (!command.includes("tell me about") && !command.includes("what is") && !command.includes("describe")) {
        const projectNames = projectsData.projects.map((p) => p.title).join(", ");
        respond(`Talha has worked on several impressive projects including: ${projectNames}. These range from healthcare management systems to AI-powered business platforms. Would you like to know more about any specific project?`);
        return;
      }
    }
    // Specific project questions
    else if (command.includes("trumemo")) {
      const project = projectsData.projects.find(p => p.title.toLowerCase() === "trumemo");
      respond(`Trumemo is ${project?.description || "a robust healthcare management system for agencies supporting individuals with developmental disabilities."}`);
    } else if (command.includes("intralign")) {
      const project = projectsData.projects.find(p => p.title.toLowerCase() === "intralign");
      respond(`Intralign is ${project?.description || "a business development roadmap tool for strategic planning."}`);
    } else if (command.includes("electra")) {
      const project = projectsData.projects.find(p => p.title.toLowerCase() === "electra");
      respond(`Electra is ${project?.description || "an AI-powered multi-agent business assistant platform."}`);
    } else if (command.includes("voyage")) {
      const project = projectsData.projects.find(p => p.title.toLowerCase().includes("voyage"));
      respond(`Voyage Vite is ${project?.description || "a web admin panel for property and vehicle rental operations."}`);
    }
    // Contact information - expanded
    if (command.includes("contact") || command.includes("email") || command.includes("how to reach") || 
        command.includes("reach out") || command.includes("get in touch") || command.includes("connect") ||
        command.includes("phone") || command.includes("number") || command.includes("address") ||
        command.includes("where") && command.includes("contact") || command.includes("how can i") && command.includes("contact")) {
      if (!command.includes("go to") && !command.includes("show") && !command.includes("navigate")) {
        respond("You can contact Talha via email at syedtalha497@gmail.com. You can also use the contact form on this website or reach out via WhatsApp using the WhatsApp button. He's always open to discussing new projects and opportunities.");
        return;
      }
    }
    
    // Availability and hiring
    if (command.includes("available") || command.includes("hire") || command.includes("hiring") ||
        command.includes("freelance") || command.includes("freelancer") || command.includes("for hire") ||
        command.includes("looking for") || command.includes("need") && command.includes("developer") ||
        command.includes("can you") && command.includes("work") || command.includes("open to")) {
      respond("Talha is available for new projects and opportunities. He works as a Full Stack Developer and has extensive experience delivering high-quality solutions. You can contact him via email at syedtalha497@gmail.com or through the contact form to discuss your project requirements.");
      return;
    }
    
    // Services offered
    if (command.includes("service") || command.includes("what services") || command.includes("offer") ||
        command.includes("what do you offer") || command.includes("capabilities") || command.includes("can you build")) {
      if (!command.includes("go to") && !command.includes("show") && !command.includes("navigate")) {
        respond("Talha offers Full Stack Development services including web applications, mobile apps using React Native, backend APIs with Node.js, database design with MongoDB, and complete end-to-end solutions. He specializes in React, Node.js, and modern web technologies.");
        return;
      }
    }
    
    // Years of experience
    if (command.includes("how long") || command.includes("years of experience") || command.includes("experience") && command.includes("how many") ||
        command.includes("how much experience") || command.includes("senior") || command.includes("junior")) {
      respond("Talha has extensive experience in Full Stack Development, having completed over 500 projects and worked with more than 100 clients worldwide. His track record demonstrates strong expertise and reliability in delivering quality software solutions.");
      return;
    }
    
    // Location / where is Talha
    if (command.includes("where") && (command.includes("live") || command.includes("located") || command.includes("from") || command.includes("based")) ||
        command.includes("location") || command.includes("country") || command.includes("city")) {
      respond("Talha is a Full Stack Developer available for projects globally. He has worked with clients worldwide, demonstrating his ability to collaborate across different time zones and regions.");
      return;
    }
    
    // Pricing / rates
    if (command.includes("price") || command.includes("cost") || command.includes("rate") || command.includes("charge") ||
        command.includes("how much") || command.includes("pricing") || command.includes("budget")) {
      respond("For pricing and project details, please contact Talha directly via email at syedtalha497@gmail.com or through the contact form. He provides customized quotes based on project requirements and scope.");
      return;
    }
    
    // Testimonials / reviews
    if (command.includes("testimonial") || command.includes("review") || command.includes("feedback") ||
        command.includes("client") && command.includes("say") || command.includes("what do clients") ||
        command.includes("rating") || command.includes("review")) {
      if (!command.includes("go to") && !command.includes("show") && !command.includes("navigate")) {
        respond("Talha has received positive feedback from over 100 clients worldwide. You can view testimonials in the testimonials section of the portfolio. His track record speaks to his professionalism and quality of work.");
        return;
      }
    }
    // Help - expanded
    if (command.includes("help") || command.includes("what can you do") || command.includes("command") ||
        command.includes("what can i ask") || command.includes("options") || command.includes("capabilities") ||
        command.includes("what questions") || command.includes("how can you help")) {
      respond("I can help you in many ways! I can navigate you to different sections like home, work, experience, services, testimonials, and contact. I can tell you about Talha's background, skills, technologies he uses, projects he's worked on, and how to contact him. I can also change the theme between light and dark mode. Just say 'change theme' or 'switch to dark mode' or 'switch to light mode'. I can also answer questions about his experience, availability, services, and more. Just ask me anything about Talha!");
      return;
    }
    
    // Greetings - expanded
    if (command.includes("hello") || command.includes("hi") || command.includes("hey") || command.includes("greetings") ||
        command.includes("good morning") || command.includes("good afternoon") || command.includes("good evening")) {
      respond("Hello! How can I assist you today? I can help you navigate the portfolio, tell you about Talha's skills and projects, provide contact information, and answer any questions about his work. What would you like to know?");
      return;
    }
    
    // Thank you / goodbye
    if (command.includes("thank") || command.includes("thanks") || command.includes("bye") || command.includes("goodbye") ||
        command.includes("see you") || command.includes("later")) {
      respond("You're welcome! Feel free to ask me anything else about Talha or navigate through the portfolio. Have a great day!");
      return;
    }
    
    // Default response
    respond("I'm not sure I understood that. You can ask me to navigate to different sections (like 'go to work' or 'show me projects'), tell you about Talha, his skills, projects, experience, or how to contact him. Try saying 'help' for more options, or be more specific with your question.");
  };

  const navigateToSection = (sectionId, message) => {
    console.log("Navigating to section:", sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      // Update URL hash
      window.location.hash = `#${sectionId}`;
      // Scroll to element
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      respond(message);
    } else {
      console.error("Section not found:", sectionId);
      respond(`Sorry, I couldn't find the ${sectionId} section. Please try again.`);
    }
  };

  const continueCommandMode = (delayStart = false) => {
    // Clear any existing timeout
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
    
    // Function to start the timeout
    const startTimeout = () => {
      // Set timeout to deactivate after inactivity
      commandTimeoutRef.current = setTimeout(() => {
        const state = stateRef.current;
        if (state.isAwake && state.isActive) {
          console.log("No command received for 15 seconds, deactivating Jarvis");
          // Stop any ongoing speech before speaking
          if (synthRef.current) {
            synthRef.current.cancel();
          }
          setStatusMessage("Going to sleep...");
          const sleepMessage = "I'm going back to sleep. Click the button to activate me again.";
          
          if (synthRef.current) {
            synthRef.current.cancel();
            
            const utterance = new SpeechSynthesisUtterance(sleepMessage);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            
            // Deactivate after speech finishes
            utterance.onend = () => {
              console.log("Sleep speech ended, deactivating");
              setTimeout(() => {
                deactivateJarvis();
              }, 100);
            };
            
            // Also deactivate on error
            utterance.onerror = () => {
              console.log("Sleep speech error, deactivating");
              setTimeout(() => {
                deactivateJarvis();
              }, 100);
            };
            
            synthRef.current.speak(utterance);
          } else {
            // If no speech synthesis, deactivate immediately
            deactivateJarvis();
          }
        }
      }, COMMAND_MODE_TIMEOUT);
    };
    
    // If delayStart is true, wait for speech + cooldown before starting timeout
    // This ensures the timeout starts counting only after recognition has restarted
    if (delayStart) {
      // Wait for speech to finish + cooldown period + buffer for recognition to restart
      setTimeout(() => {
        startTimeout();
      }, SPEECH_COOLDOWN_PERIOD + 500);
    } else {
      // Start timeout immediately (for cases where we're not speaking)
      startTimeout();
    }
  };
  
  const respond = (text) => {
    speak(text);
    
    // Clear status after a short delay
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = setTimeout(() => {
      setStatusMessage("Ready for next command");
      setRecognizedText("");
    }, 2000);
    
    // Continue listening for next command instead of returning to wake word mode
    // Set a timeout to return to wake word mode if no command is given
    // Note: Recognition will restart automatically after speech ends and cooldown (handled in speak function)
    // Delay the timeout start so it begins counting after recognition has restarted
    continueCommandMode(true);
  };

  const toggleJarvis = () => {
    console.log("Jarvis button clicked, isActive:", isActive);
    
    // Check if speech recognition is supported
    if (!recognitionRef.current) {
      speak("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    
    if (!isActive) {
      // Activate Jarvis
      console.log("Activating Jarvis...");
      setIsActive(true);
      // Use setTimeout to ensure state is updated before starting
      setTimeout(() => {
        startWakeWordListening();
      }, 100);
    } else {
      // Deactivate Jarvis
      console.log("Deactivating Jarvis...");
      setIsActive(false);
      setIsAwake(false);
      setIsWaitingForWakeWord(false);
      setIsListening(false);
      
      // Clear any pending timeouts
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
      }
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
        commandTimeoutRef.current = null;
      }
      
      // Reset all flags
      isRecognitionStoppingRef.current = true;
      wasIntentionallyStoppedRef.current = true;
      isRecognitionRunningRef.current = false;
      abortCountRef.current = 0;
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Error stopping recognition:", e);
        }
      }
      
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      
      // Reset stopping flag after a delay
      setTimeout(() => {
        isRecognitionStoppingRef.current = false;
        wasIntentionallyStoppedRef.current = false;
      }, 500);
    }
  };

  // Set up recognition result handler after all functions are defined
  useEffect(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";
      
      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript + " ";
        }
      }
      
      // Show interim results as user speaks
      if (interimTranscript) {
        setRecognizedText(interimTranscript.trim());
        setStatusMessage("Listening...");
      }
      
      // Process final transcript
      if (finalTranscript) {
        const transcript = finalTranscript.toLowerCase().trim();
        const state = stateRef.current;
        
        // Ignore if we're currently speaking or in cooldown
        if (isSpeakingRef.current || speechCooldownRef.current) {
          console.log("Ignoring transcript - Jarvis is speaking or in cooldown");
          return;
        }
        
        if (state.isWaitingForWakeWord) {
          if (checkWakeWord(transcript)) {
            handleWakeWordDetected();
          } else {
            restartWakeWordListening();
          }
        } else if (state.isAwake) {
          handleVoiceCommand(transcript);
        }
      }
    };
  }, []);

  // Determine button state for visual feedback
  const getButtonState = () => {
    if (!isActive) return "idle";
    if (isAwake) return "awake";
    if (isWaitingForWakeWord) return "listening";
    return "idle";
  };

  const buttonState = getButtonState();

  // Check if speech recognition is supported
  const isSpeechSupported = ("webkitSpeechRecognition" in window) || ("SpeechRecognition" in window);

  return (
    <div className="jarvis-wrapper">
      {/* Status and command display */}
      {(isActive && (statusMessage || recognizedText)) && (
        <motion.div
          className="jarvis-status"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {statusMessage && (
            <div className="jarvis-status-message">{statusMessage}</div>
          )}
          {recognizedText && (
            <div className="jarvis-command-text">{recognizedText}</div>
          )}
        </motion.div>
      )}
      
      <motion.button
        className={`jarvis-button ${buttonState}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleJarvis();
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isActive ? "Deactivate Jarvis" : "Activate Jarvis"}
        type="button"
      >
        {buttonState === "listening" || buttonState === "awake" ? (
          <FaMicrophone />
        ) : (
          <FaRobot />
        )}
        
        {(buttonState === "listening" || buttonState === "awake") && (
          <motion.span
            className="jarvis-pulse"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        
        <motion.span
          className="jarvis-tooltip"
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {!isSpeechSupported
            ? "Voice commands not supported"
            : isActive 
            ? "Say 'Hello Talha' to activate" 
            : "Click to activate Jarvis"}
        </motion.span>
      </motion.button>
    </div>
  );
};

export default Jarvis;

