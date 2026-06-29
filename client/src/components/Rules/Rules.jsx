import React from "react";
import { Link } from "react-router-dom";

export default function Rules() {
  return (
    <main className="page">
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div className="page-nav">
          <div className="logo" style={{ fontSize: "1.6rem" }}><span>S</span>pardle!</div>
          <Link to="/" className="btn btn-ghost" style={{ padding: "8px 18px", fontSize: "0.8rem" }}>Back</Link>
        </div>

        <div className="prose">
          <div>
            <h2>How to Play</h2>
            <p>
              Spardle is real-time multiplayer Wordle. The first player to reach
              <strong> 5 points</strong> wins — or the highest score when the 7-minute
              timer runs out.
            </p>
          </div>

          <div>
            <h2>Scoring</h2>
            <ul>
              <li>Guess the word within 6 tries →&nbsp;<strong>+1 point</strong></li>
              <li>Use all 6 guesses without solving it →&nbsp;<strong>−1 point</strong> (min 0)</li>
            </ul>
          </div>

          <div>
            <h2>Tile Colors</h2>
            <div className="example-row">
              <div className="example-tile correct">W</div>
              <div className="example-tile empty">O</div>
              <div className="example-tile empty">R</div>
              <div className="example-tile empty">D</div>
              <div className="example-tile empty">S</div>
            </div>
            <p><strong style={{ color: "var(--tile-correct)" }}>Green</strong> — letter is in the correct position.</p>

            <div className="example-row" style={{ marginTop: 16 }}>
              <div className="example-tile empty">S</div>
              <div className="example-tile present">P</div>
              <div className="example-tile empty">A</div>
              <div className="example-tile empty">R</div>
              <div className="example-tile empty">K</div>
            </div>
            <p><strong style={{ color: "var(--tile-present)" }}>Yellow</strong> — letter is in the word, wrong position.</p>

            <div className="example-row" style={{ marginTop: 16 }}>
              <div className="example-tile empty">C</div>
              <div className="example-tile empty">L</div>
              <div className="example-tile empty">A</div>
              <div className="example-tile absent">N</div>
              <div className="example-tile empty">E</div>
            </div>
            <p><strong style={{ color: "var(--text-muted)" }}>Gray</strong> — letter is not in the word.</p>
          </div>

          <div>
            <h2>Tips</h2>
            <ul>
              <li>All players receive the same set of 20 words per game.</li>
              <li>You can see everyone's score update in real time.</li>
              <li>A banner flashes when any player scores or loses a point.</li>
              <li>Press <strong>Enter</strong> to submit, <strong>Backspace</strong> to delete.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
