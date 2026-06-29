import React from "react";
import { useNavigate } from "react-router-dom";

const MEDALS = ["🥇", "🥈", "🥉", "🏅", "🏅"];

export default function End({ users, finalWord }) {
  const navigate = useNavigate();
  const sorted = [...users].sort((a, b) => b.score - a.score);

  return (
    <main className="page" style={{ justifyContent: "center" }}>
      <div className="end-wrap">
        <div className="end-title">
          Game&nbsp;<span>Over</span>
        </div>

        {sorted.length > 0 && sorted[0].score >= 5 && (
          <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", textAlign: "center" }}>
            🎉&nbsp;<strong style={{ color: "var(--text)" }}>{sorted[0].username}</strong>&nbsp;wins!
          </p>
        )}

        <div className="ranking-list">
          {sorted.map((u, i) => (
            <div key={i} className="ranking-item">
              <span className="rank-medal">{MEDALS[i] ?? "🏅"}</span>
              <span className="rank-name">{u.username}</span>
              <span className="rank-score">{u.score}</span>
            </div>
          ))}
        </div>

        {finalWord && (
          <p className="end-word">
            Last word:&nbsp;<strong>{finalWord}</strong>
          </p>
        )}

        <button
          className="btn btn-primary"
          style={{ width: "100%" }}
          onClick={() => navigate("/")}
        >
          Play Again
        </button>
      </div>
    </main>
  );
}
