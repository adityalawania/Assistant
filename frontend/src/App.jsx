// App.jsx
import "./App.css";
import Animation from "./Components/Animation";
import { memo, React, useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';

const App = () => {
  const [messages, setMessages] = useState([]);
  const BASE_URL = import.meta.env.VITE_URL;
  const flagRef = useRef(false);
  const [btnText, setBtnText] = useState("Start");
  const recognitionRef = useRef(null);

  useEffect(() => {
    window.speechSynthesis.getVoices(); // Pre-load voices
   
  }, []);

  // 👇 Speak Text with female voice
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    const femaleVoice = voices.find((voice) =>
      ["female", "woman", "zira", "google uk english female"].some((key) =>
        voice.name.toLowerCase().includes(key)
      )
    );

    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.pitch = 1;
    utterance.rate = 1.6;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    initializeRecognition();
  }, []);

  const initializeRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onstart = () => console.log("🎙️ Listening...");
    recognition.onresult = (event) => {
      const command = event.results[event.results.length - 1][0].transcript;
      addMessage(command, "user");
      console.log("Command:", command);
      handleFetch(command);
    };

    recognition.onerror = (error) => {
      console.error("Speech Recognition Error:", error);
      if (error.error === "no-speech") recognition.start();
    };

    recognition.onend = () => {
      console.log("🔇 Stopped listening.");
      if (flagRef.current) recognition.start(); // Use ref instead of state
    };
    

    recognitionRef.current = recognition;
  };

  const toggleListening = (val) => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
  
    if (val === false || flagRef.current) {
      recognition.onend = null;
      recognition.stop();
      setBtnText("Start");
      flagRef.current = false;
    } else {
      recognition.start();
      setBtnText("Stop");
      flagRef.current = true;
    }
  };


  

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { text, sender }]);
  };

  const handleFetch = async (command) => {
    try {
      const res = await fetch(`${BASE_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
  
      const resultText = await res.text();
      console.log("🤖 Raw Response:", resultText);
  
      let result = {};
      try {
        result = JSON.parse(resultText);
      } catch {
        result = { message: resultText }; // fallback
      }
  
      const { message, video_url } = result;
  
      addMessage(message, "bot");
      speakText(message);
  
      if (video_url) {

        toast.warning('If video is not played , Maybe your pop-ups are blocked !', {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          });
        
        const autoplayUrl = video_url.replace("watch?v=", "embed/") + "?autoplay=1";
        window.open(autoplayUrl, "_blank"); // Autoplay YouTube video
       
      }
  
      if (message.toLowerCase().includes("goodbye")) {
        toggleListening(false);
      }
    } catch (err) {
      console.error("Error fetching response:", err);
    }
  };
  
  

  return (
    <div className="main">
      <ToastContainer />
      <div className="chat-container">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === "bot" ? "message-left" : "message-right"}`}
          >
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      
      <p className="heading">
        Try Saying... "Hello Ruby" or "Play Karan Aujla" or ask about any xyz place, thing or personality!
      </p>
      <button className="btn1" onClick={() => toggleListening(true)}>
        {btnText} Listening
      </button>
      <p className="heading2">Say "Stop it" to stop Ruby</p>
      <Animation />
    </div>
  );
};


export default App;
