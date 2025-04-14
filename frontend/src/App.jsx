import "./App.css";
import Animation from "./Components/Animation";
import { React, useEffect, useRef, useState } from "react";
import io from "socket.io-client";

let mySet = new Set();
const App = () => {

  const messages = Array.from(mySet); // or [...mySet]
  const BASE_URL = import.meta.env.VITE_URL;
  const socket = io.connect(`${BASE_URL}`)
  const [response, setResponse] = useState(new Set());
  const [reRender, SetreRender] = useState(0);
  const [flag, setFlag] = useState(false);
  const [btnText, setBtnText] = useState('Start');


  const recognitionRef = useRef(null);


  socket.on("chat", (payload) => {
    // console.log(payload); // x8WIv7-mJelg7on_ALbx

    let str = `khotrdzpv + ${payload}`
    mySet.add(str)
    SetreRender((prev) => prev + 1)

    console.log(mySet)
  });

  useEffect(() => {

    setResponse([]);
  }, []);



  useEffect(() => {
    initializeRecognition();
  }, []);

  useEffect(() => {
    console.log("showing respnse")
    console.log(response)
  }, [response])



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

      mySet.add(str2)
      SetreRender((prev)=>prev+1)

      handleFetch(spokenCommand);
    };
    recognition.onerror = (error) => {
      console.error("Speech Recognition Error:", error);
      if (error.error === "no-speech") {
        recognition.start(); // Restart on no-speech error
      }
    };
    recognition.onend = () => {
      console.log("SpeechRecognition ended.");
      if (flag) {
        // Only restart if we're still in "listening" mode
        recognition.start();
      }
    };

    recognitionRef.current = recognition; // Save instance to ref
  };

  const toggleListening = (val) => {
    if (val === false || flag) {
      // Stop mic
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // prevent it from auto-restarting
        recognitionRef.current.stop();
      }
      setBtnText('Start');
      setFlag(false);
      console.log("Stopped listening");
    } else {
      // Start mic
      setBtnText('Stop');
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      setFlag(true);
    }
  };
  



  socket.on("chat", (payload) => {
    const ab = payload.split("\r\n");
    if (ab[0] == 'Goodbye!') {
      toggleListening(false);
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
      // console.log("Response:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };



  return (
    <div className="main">
      <div className="chat-container">
        {messages.map((it,idx) => {
          let list = it.split('+');
          let pref = it.slice(0,1);
          if(pref=='s')
            return (
              <div key={idx} className="message message-left">
                <p>{list[1]}</p>
              </div>
            )

          return (
            <div key={idx} className="message message-right">
              <p>{list[1]}</p>
            </div>
          )
        })}



      </div>

      <p className="heading">Try Saying... "Hello Ruby" or "Play Karan Aujla" or ask about any xyz place, thing or personality ! </p>
      <button className="btn1" onClick={() => toggleListening(true)}>{btnText} Listening</button>

      <p className="heading2">Say "Stop it" to stop Ruby</p>

      <Animation />

    </div>
  );
};

export default App;
