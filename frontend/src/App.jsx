import "./App.css";
import Animation from "./Components/Animation";
import { React, useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io.connect(`${import.meta.env.URL}`);

const App = () => {
  const [response, setResponse] = useState([]);
  const [reRender, SetreRender] = useState(0);
  const recognitionRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_URL;

  
  useEffect(() => {
    setResponse([]);
  }, []);

  useEffect(() => {
    initializeRecognition();
  }, []);

  useEffect(()=>{
   console.log(response)
  },[response])

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
      handleFetch(spokenCommand);
    };
    recognition.onerror = (error) => {
      console.error("Speech Recognition Error:", error);
      if (error.error === "no-speech") {
        recognition.start(); // Restart on no-speech error
      }
    };
    recognition.onend = () => {
      console.log("SpeechRecognition ended. Restarting...");
      recognition.start(); // Restart if recognition stops
    };

    recognitionRef.current = recognition; // Save instance to ref
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    location.reload()
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  socket.on("chat", (payload) => {
    const ab = payload.split("\r\n");
    if(ab[0]=='Goodbye!'){
      stopListening();
    }
  });

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
      const data = await res.text();
      console.log("Response:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const TryFetch = async () => {
    console.log("en")
    const url = `${BASE_URL}/try`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      console.log(json);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="main">
      <p className="heading">Try Saying... "Hello Ruby" or "Play Karan Aujla"</p>
      <button className="btn1" onClick={startListening}>Start Listening</button>
      <button className="btn2" onClick={stopListening}>Stop Listening</button>
      <p className="heading2">Say "Stop it" to stop Ruby</p>
      <button onClick={()=>TryFetch()}>Try</button>
      <Animation />
    </div>
  );
};

export default App;
