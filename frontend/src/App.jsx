import "./App.css";
import Animation from "./Components/Animation";
import { React, useEffect, useRef, useState } from "react";
import io from "socket.io-client";

let mySet = new Set();
const App = () => {

  const messages = Array.from(mySet); // or [...mySet]
  const BASE_URL = import.meta.env.VITE_URL;
  const socket = io.connect(`${BASE_URL}`);
  const [response, setResponse] = useState(new Set());
  const [reRender, SetreRender] = useState(0);
  const [flag, setFlag] = useState(false);
  const [btnText, setBtnText] = useState('Start');

  useEffect(() => {
  // Load voices
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}, []);


  const recognitionRef = useRef(null);

  // --- 👇 Frontend Text-to-Speech ---
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
  
    // Wait until voices are loaded
    const voices = window.speechSynthesis.getVoices();
  
    // Try to find a female voice
    const femaleVoice = voices.find(
      (voice) => voice.name.toLowerCase().includes("female") || voice.name.toLowerCase().includes("woman") || voice.name.toLowerCase().includes("zira") || voice.name.includes("Google UK English Female")
    );
  
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    } else {
      console.warn("Female voice not found. Using default voice.");
    }
  
    utterance.pitch = 1.2; // Slightly higher pitch for a more feminine tone
    utterance.rate = 1.3;
  
    window.speechSynthesis.speak(utterance);
  };



  useEffect(() => {
    setResponse([]);
  }, []);

  useEffect(() => {
    initializeRecognition();
  }, []);

  useEffect(() => {
    console.log("showing response");
    console.log(response);
  }, [response]);

  const initializeRecognition = () => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      console.error("SpeechRecognition API not supported in this browser.");
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onstart = () => console.log("Listening...");
    recognition.onresult = (event) => {
      const spokenCommand = event.results[event.results.length - 1][0].transcript;
      console.log("Recognized Command:", spokenCommand);
      let str2 = `stznpqez + ${spokenCommand}`;
      mySet.add(str2);
      SetreRender((prev) => prev + 1);

      handleFetch(spokenCommand);
    };
    recognition.onerror = (error) => {
      console.error("Speech Recognition Error:", error);
      if (error.error === "no-speech") {
        recognition.start();
      }
    };
    recognition.onend = () => {
      console.log("SpeechRecognition ended.");
      if (flag) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
  };

  const toggleListening = (val) => {
    if (val === false || flag) {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      setBtnText('Start');
      setFlag(false);
      console.log("Stopped listening");
    } else {
      setBtnText('Stop');
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      setFlag(true);
    }
  };

  const handleFetch = async (command) => {
    console.log("Fetching command:", command);
    try {
      const res = await fetch(`${BASE_URL}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      });
      const payload = await res.text();
    
      let str = `khotrdzpv + ${payload}`;
      mySet.add(str);
      SetreRender((prev) => prev + 1);
      speakText(payload);
      console.log("Incoming from res:", payload);
  
      const ab = payload.split("\r\n");
      if (ab[0] === 'Goodbye!') {
        toggleListening(false);
      }

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="main">
      <div className="chat-container">
        {messages.map((it, idx) => {
          let list = it.split('+');
          let pref = it.slice(0, 1);
          if (pref === 's') {
            return (
              <div key={idx} className="message message-left">
                <p>{list[1]}</p>
              </div>
            );
          }

          return (
            <div key={idx} className="message message-right">
              <p>{list[1]}</p>
            </div>
          );
        })}
      </div>

      <p className="heading">Try Saying... "Hello Ruby" or "Play Karan Aujla" or ask about any xyz place, thing or personality!</p>
      <button className="btn1" onClick={() => toggleListening(true)}>{btnText} Listening</button>
      <p className="heading2">Say "Stop it" to stop Ruby</p>
      <Animation />
    </div>
  );
};

export default App;
