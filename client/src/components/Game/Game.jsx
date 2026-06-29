import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { VALID_WORDS } from "../../data/words";

const ROWS = 6;
const COLS = 5;
const REVEAL_STAGGER = 100; // ms per tile
const REVEAL_DURATION = 500; // ms per tile flip
const TOTAL_SECONDS = 7 * 60;

const MEDALS = ["🥇", "🥈", "🥉", "🏅"];

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(""));
}
function emptyStates() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(""));
}

function evaluateGuess(guess, target) {
  const result = Array(COLS).fill("absent");
  const targetArr = target.toUpperCase().split("");
  const guessArr = guess.toUpperCase().split("");

  // First pass: correct positions
  guessArr.forEach((ch, i) => {
    if (ch === targetArr[i]) {
      result[i] = "correct";
      targetArr[i] = null;
    }
  });

  // Second pass: present letters
  guessArr.forEach((ch, i) => {
    if (result[i] === "correct") return;
    const j = targetArr.indexOf(ch);
    if (j !== -1) {
      result[i] = "present";
      targetArr[j] = null;
    }
  });

  return result;
}

export default function Game({ socket, username, room, users, setUsers, words, setFinalWord }) {
  const navigate = useNavigate();

  const [board, setBoard] = useState(emptyBoard);
  const [tileStates, setTileStates] = useState(emptyStates);
  const [keyStates, setKeyStates] = useState({});
  const [activeRow, setActiveRow] = useState(0);
  const [message, setMessage] = useState("");
  const [shakeRow, setShakeRow] = useState(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [banner, setBanner] = useState({ text: "", type: "", key: 0 });
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);

  // Refs for values needed in callbacks without stale closures
  const activeRowRef = useRef(0);
  const currentWordIdxRef = useRef(0);
  const wordsRef = useRef(words);
  const roomRef = useRef(room);
  const isRevealingRef = useRef(false);

  useEffect(() => { wordsRef.current = words; }, [words]);
  useEffect(() => { roomRef.current = room; }, [room]);

  // Timer
  useEffect(() => {
    if (secondsLeft <= 0) {
      socket.emit("end game", roomRef.current);
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, socket]);

  function showMessage(msg, durationMs = 2200) {
    setMessage(msg);
    setTimeout(() => setMessage(""), durationMs);
  }

  function showBanner(text, type) {
    setBanner((prev) => ({ text, type, key: prev.key + 1 }));
  }

  function resetBoard() {
    setBoard(emptyBoard());
    setTileStates(emptyStates());
    setKeyStates({});
    setActiveRow(0);
    activeRowRef.current = 0;
  }

  const currentWord = useCallback(() => {
    const ws = wordsRef.current;
    if (!ws || ws.length === 0) return "";
    const idx = currentWordIdxRef.current;
    return ws[Math.min(idx, ws.length - 1)]?.word ?? "";
  }, []);

  function advanceWord() {
    currentWordIdxRef.current = Math.min(
      currentWordIdxRef.current + 1,
      (wordsRef.current?.length ?? 1) - 1
    );
    resetBoard();
  }

  function submitGuess() {
    const row = activeRowRef.current;
    const guess = board[row].join("");
    if (guess.length < COLS) {
      showMessage("Word must be 5 letters.");
      setShakeRow(row);
      setTimeout(() => setShakeRow(null), 500);
      return;
    }
    if (!VALID_WORDS.has(guess.toLowerCase())) {
      showMessage("Not in word list.");
      setShakeRow(row);
      setTimeout(() => setShakeRow(null), 500);
      return;
    }

    const target = currentWord();
    const result = evaluateGuess(guess, target);
    const totalRevealMs = COLS * REVEAL_STAGGER + REVEAL_DURATION;

    setIsRevealing(true);
    isRevealingRef.current = true;
    setTileStates((prev) => {
      const next = prev.map((r) => [...r]);
      result.forEach((s, i) => { next[row][i] = s; });
      return next;
    });

    // Update key states after last tile reveals
    setTimeout(() => {
      setKeyStates((prev) => {
        const next = { ...prev };
        const priority = { correct: 3, present: 2, absent: 1 };
        result.forEach((s, i) => {
          const letter = guess[i];
          if ((priority[s] ?? 0) > (priority[prev[letter]] ?? 0)) {
            next[letter] = s;
          }
        });
        return next;
      });

      const isCorrect = result.every((s) => s === "correct");
      if (isCorrect) {
        socket.emit("game update", { room: roomRef.current, correct: true });
        setTimeout(() => {
          setIsRevealing(false);
          isRevealingRef.current = false;
          advanceWord();
        }, 400);
      } else if (row >= ROWS - 1) {
        showMessage(`The word was ${target.toUpperCase()}.`, 3500);
        socket.emit("game update", { room: roomRef.current, correct: false });
        setTimeout(() => {
          setIsRevealing(false);
          isRevealingRef.current = false;
          advanceWord();
        }, 1800);
      } else {
        setIsRevealing(false);
        isRevealingRef.current = false;
        setActiveRow(row + 1);
        activeRowRef.current = row + 1;
      }
    }, totalRevealMs);
  }

  const handleKey = useCallback(
    (key) => {
      if (isRevealingRef.current) return;
      const row = activeRowRef.current;

      if (key === "BACKSPACE" || key === "⌫") {
        setBoard((prev) => {
          const next = prev.map((r) => [...r]);
          for (let i = COLS - 1; i >= 0; i--) {
            if (next[row][i] !== "") { next[row][i] = ""; break; }
          }
          return next;
        });
        return;
      }
      if (key === "ENTER") {
        submitGuess();
        return;
      }
      const letter = key.toUpperCase();
      if (!/^[A-Z]$/.test(letter)) return;
      setBoard((prev) => {
        const next = prev.map((r) => [...r]);
        for (let i = 0; i < COLS; i++) {
          if (next[row][i] === "") { next[row][i] = letter; break; }
        }
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Physical keyboard
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKey(e.key === "Backspace" ? "BACKSPACE" : e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  // Socket events
  useEffect(() => {
    if (!room) { navigate("/"); return; }

    const onUpdateGameUsers = (data) => setUsers(data);
    const onBanner = ({ username: name, correct }) => {
      showBanner(correct ? `${name}  +1` : `${name}  −1`, correct ? "positive" : "negative");
    };
    const onEndGame = (data) => {
      setFinalWord(currentWord());
      setUsers(data);
      socket.emit("leave", roomRef.current);
      navigate("/end");
    };

    socket.on("update game users", onUpdateGameUsers);
    socket.on("banner", onBanner);
    socket.on("end game", onEndGame);
    return () => {
      socket.off("update game users", onUpdateGameUsers);
      socket.off("banner", onBanner);
      socket.off("end game", onEndGame);
    };
  }, [socket, room, navigate, setUsers, setFinalWord, currentWord]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const isUrgent = secondsLeft <= 60;
  const progress = (secondsLeft / TOTAL_SECONDS) * 100;

  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  return (
    <main
      className="page"
      style={{ alignItems: "center", paddingTop: 16, paddingBottom: 24 }}
    >
      {/* Header */}
      <div className="game-header">
        <div className="logo" style={{ fontSize: "1.6rem" }}>
          <span>S</span>pardle!
        </div>
        <div className="game-timer-block">
          <span className={`game-timer${isUrgent ? " urgent" : ""}`}>
            {mins}:{secs}
          </span>
          <div className="game-progress">
            <div
              className={`game-progress-bar${isUrgent ? " urgent" : ""}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      {sortedUsers.length > 0 && (
        <div className="scoreboard">
          {sortedUsers.map((u, i) => (
            <div key={i} className="score-pill">
              <span className="score-name">{u.username}</span>
              <span className="score-val">{u.score}</span>
            </div>
          ))}
        </div>
      )}

      {/* Banner */}
      <div className="banner">
        {banner.text && (
          <span
            key={banner.key}
            className={`banner-fade ${banner.type}`}
          >
            {banner.text}
          </span>
        )}
      </div>

      {/* Tile grid */}
      <div className="grid">
        {board.map((rowLetters, rowIdx) => (
          <div
            key={rowIdx}
            className={`grid-row${shakeRow === rowIdx ? " shake" : ""}`}
          >
            {rowLetters.map((letter, colIdx) => {
              const state = tileStates[rowIdx][colIdx];
              const isFilled = letter !== "" && !state;
              return (
                <div
                  key={colIdx}
                  className={`tile${isFilled ? " filled" : ""}${state ? ` ${state}` : ""}`}
                  style={state ? { "--reveal-delay": `${colIdx * REVEAL_STAGGER}ms` } : undefined}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Message */}
      <div className="game-message">{message}</div>

      {/* Keyboard */}
      <div className="keyboard">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="key-row">
            {row.map((k) => (
              <button
                key={k}
                className={`key${k.length > 1 ? " wide" : ""}${keyStates[k] ? ` ${keyStates[k]}` : ""}`}
                onClick={() => handleKey(k)}
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
