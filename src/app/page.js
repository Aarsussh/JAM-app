"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { arrayRemove } from "firebase/firestore";


export default function Home() {
  const [jamState, setJamState] = useState(null);
  const [name, setName] = useState("");
  const [timer, setTimer] = useState(60);
  const [flashBuzz, setFlashBuzz] = useState(null);

  useEffect(() => {
  let savedName = localStorage.getItem("jamName");

  if (!savedName) {
    savedName = prompt("Enter your name");
    localStorage.setItem("jamName", savedName);
  }

  const addPlayer = async (playerName) => {
  const ref = doc(db, "jamState", "current");

      if (!jamState?.players?.includes(playerName)) {
        await updateDoc(ref, {
          players: arrayUnion(playerName)
        });
      }
    };

    
    setName(savedName);
    addPlayer(savedName);



  const unsub = onSnapshot(doc(db, "jamState", "current"), (doc) => {

      const data = doc.data();
      setJamState(data);
      setTimer(data.timer);

      if (data?.buzzQueue?.length > 0) {

        const latestBuzz = data.buzzQueue[data.buzzQueue.length - 1];

        if (latestBuzz.time !== lastBuzzTime) {

          setLastBuzzTime(latestBuzz.time);
          setFlashBuzz(latestBuzz.name);

          setTimeout(() => {
            setFlashBuzz(null);
          }, 1500);

        }

      }

    });

  return () => unsub();
  }, []);

  useEffect(() => {
  if (!jamState?.isRunning) return;

  const interval = setInterval(async () => {
    if (timer <= 0) {
      const ref = doc(db, "jamState", "current");

      await updateDoc(ref, {
        isRunning: false,
      });

      return;
    }

    const newTime = timer - 1;
    setTimer(newTime);

    const ref = doc(db, "jamState", "current");

    await updateDoc(ref, {
      timer: newTime,
    });
  }, 1000);

  return () => clearInterval(interval);
}, [jamState?.isRunning, timer]);


useEffect(() => {
  const handleLeave = () => {
    removePlayer();
  };

  window.addEventListener("beforeunload", handleLeave);

  return () => {
    window.removeEventListener("beforeunload", handleLeave);
  };
}, [name]);


  const nextBuzz = async () => {
  if (jamState.buzzQueue.length === 0) return;

  const sorted = [...jamState.buzzQueue].sort(
    (a, b) => a.time - b.time
  );

  const next = sorted[0];
  const remaining = sorted.slice(1);

  const ref = doc(db, "jamState", "current");

  await updateDoc(ref, {
    currentSpeaker: next.name,
    buzzQueue: remaining,
    isRunning: true
  });
};

const clearQueue = async () => {
  const ref = doc(db, "jamState", "current");

  await updateDoc(ref, {
    buzzQueue: [],
  });
};

const startTimer = async () => {
  const ref = doc(db, "jamState", "current");

  await updateDoc(ref, {
    timer: 60,
    isRunning: true,
  });
};


const stopTimer = async () => {
  const ref = doc(db, "jamState", "current");

  await updateDoc(ref, {
    isRunning: false,
  });
};




  if (!jamState) return <div className="p-10">Loading...</div>;

const buzz = async () => {
      if (!name) return;

      const ref = doc(db, "jamState", "current");

      const alreadyBuzzed = jamState.buzzQueue.some(
        (b) => b.name === name
      );

      if (alreadyBuzzed) {
        alert("You already buzzed!");
        return;
      }

      const buzzEntry = {
        name: name,
        time: Date.now()
      };

      await updateDoc(ref, {
        buzzQueue: arrayUnion(buzzEntry),
        isRunning: false
      });
    };

    const becomeMaster = async () => {
        if (jamState.jamMaster && jamState.jamMaster !== "") {
          alert("Jam Master already selected");
          return;
        }

        const ref = doc(db, "jamState", "current");

        await updateDoc(ref, {
          jamMaster: name
        });
      };


      const resetTimer = async () => {
        if (!confirm("Reset the round?")) return;
        const ref = doc(db, "jamState", "current");

        await updateDoc(ref, {
          timer: 60,
          isRunning: false,
          buzzQueue: [],
          currentSpeaker: ""
        });
      };

      const removePlayer = async () => {
        if (!name) return;

        const ref = doc(db, "jamState", "current");

        if (jamState.jamMaster === name) {
          await updateDoc(ref, {
            players: arrayRemove(name),
            jamMaster: ""
          });
        } else {
          await updateDoc(ref, {
            players: arrayRemove(name)
          });
        }
      };



  return (
  <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-8 space-y-8">

      {flashBuzz && (
        <div className="fixed inset-0 bg-red-700 bg-opacity-90 flex items-center justify-center text-5xl font-bold text-white z-50">
          {flashBuzz} BUZZED!
        </div>
      )}


    {/* TIMER */}
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-gray-400">JAM TIMER</h1>
            <div className={`text-7xl font-bold mt-2 ${
                jamState.isRunning ? "text-green-400" : "text-red-400"
              }`}>
                {jamState.timer}
            </div>
    </div>

    {/* CURRENT SPEAKER */}
    <div className="bg-gray-800 shadow-lg p-5 rounded-xl w-80 text-center border border-gray-700">
      <p className="text-gray-400">Current Speaker</p>
      <p className="text-2xl mt-2 font-semibold">
        {jamState.currentSpeaker || "None"}
      </p>
    </div>

    {/* BUZZ BUTTON */}
    <button
      onClick={buzz}
      className="bg-red-600 hover:bg-red-700 text-white text-4xl font-bold px-20 py-10 rounded-full shadow-xl transition"
    >
      BUZZ
    </button>

    {/* BUZZ QUEUE */}
    <div className="bg-gray-800 shadow-lg p-5 rounded-xl w-80 border border-gray-700">
      <p className="text-gray-400 mb-2">Buzz Queue</p>

      <ol className="list-decimal ml-6 space-y-1">
        {jamState.buzzQueue.map((b, i) => (
          <li key={i} className="text-lg">{b.name}</li>
        ))}
      </ol>
    </div>

    {/* LOBBY */}
    <div className="bg-gray-800 shadow-lg p-5 rounded-xl w-80 border border-gray-700">
      <p className="text-gray-400 mb-2">Lobby</p>

      <ul className="list-disc ml-6 space-y-1">
        {jamState.players?.map((p, i) => (
          <li key={i}>
            {p} {jamState.jamMaster === p && (
              <span className="text-purple-400">(Jam Master)</span>
            )}
          </li>
        ))}
      </ul>
    </div>

    {/* JAM MASTER CONTROLS */}
    {jamState.jamMaster === name && (
      <div className="bg-gray-800 shadow-lg p-5 rounded-xl flex flex-wrap gap-3 justify-center border border-gray-700">

        <button
          onClick={startTimer}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Start
        </button>

        <button
          onClick={stopTimer}
          className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded"
        >
          Stop
        </button>

        <button
          onClick={nextBuzz}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Next Buzz
        </button>

        <button
          onClick={clearQueue}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
        >
          Clear Queue
        </button>

        <button
          onClick={resetTimer}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
        >
          Reset Round
        </button>

      </div>
    )}

  </div>
);
}