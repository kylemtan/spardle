import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="page">
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div className="page-nav">
          <div className="logo" style={{ fontSize: "1.6rem" }}><span>S</span>pardle!</div>
          <Link to="/" className="btn btn-ghost" style={{ padding: "8px 18px", fontSize: "0.8rem" }}>Back</Link>
        </div>

        <div className="prose">
          <div>
            <h2>About Spardle</h2>
            <p>
              Spardle is a real-time multiplayer word game built on top of the classic
              5-letter Wordle format. Challenge friends in a private room or jump into a
              public lobby and compete against strangers.
            </p>
          </div>

          <div>
            <h2>Tech Stack</h2>
            <ul>
              <li>React + Vite — client</li>
              <li>Express + Socket.IO — real-time game server</li>
              <li>Hosted on Render</li>
            </ul>
          </div>

          <div>
            <h2>Created by</h2>
            <p>
              Kyle Macasilli-Tan ·{" "}
              <a href="https://kylemtan.com" target="_blank" rel="noreferrer">
                kylemtan.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
