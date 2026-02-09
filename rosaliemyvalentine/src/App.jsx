import { useEffect, useMemo, useState } from "react";
import "./styles.css";

/**
 * Cards unlock day-by-day in America/Montreal.
 * Dates: Feb 9–14, 2026 (inclusive) -> 6 cards.
 *
 * Tip for testing:
 *   Add ?date=2026-02-09 in the URL to simulate a date.
 */

const TIME_ZONE = "America/Montreal";

const CARDS = [
  {
    letter: "S",
    title: "S comme Sourire",
    body: "Celui que tu me donnes sans même t’en rendre compte.",
    icon: "❤",
    unlockDate: "2026-02-09",
  },
  {
    letter: "A",
    title: "A comme Attendre",
    body: "Parce que certaines choses valent la peine d’être attendues.",
    icon: "❤",
    unlockDate: "2026-02-10",
  },
  {
    letter: "I",
    title: "I comme Instant",
    body: "Ceux que je préfère sont toujours ceux passés avec toi.",
    icon: "❤",
    unlockDate: "2026-02-11",
  },
  {
    letter: "S",
    title: "S comme Surprise",
    body: "Et celle-ci… elle arrive tranquillement.",
    icon: "☾",
    unlockDate: "2026-02-12",
  },
  {
    letter: "O",
    title: "O comme Occasion",
    body: "Une occasion parfaite pour se choisir, juste nous deux.",
    icon: "❤",
    unlockDate: "2026-02-13",
  },
  {
    letter: "N",
    title: "N comme Nous",
    body: "Parce que tout prend plus de sens quand c’est avec toi.",
    icon: "❤",
    hint: "(Indice final : relis les lettres…)",
    unlockDate: "2026-02-14",
  },
];

const STORAGE_KEY = "rosalie_cards_revealed_v1";

function getYYYYMMDDInTZ(date = new Date(), timeZone = TIME_ZONE) {
  // Get date parts in a specific time zone using Intl.
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA gives YYYY-MM-DD
  return fmt.format(date);
}

function getSimulatedDateFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const d = params.get("date");
  // basic validation YYYY-MM-DD
  if (!d) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  return null;
}

function formatDateFR(yyyyMmDd) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dt);
}

function isUnlocked(card, todayYYYYMMDD) {
  return todayYYYYMMDD >= card.unlockDate;
}

function Card({ data, revealed, locked, onReveal, index, todayYYYYMMDD }) {
  const unlockLabel = formatDateFR(data.unlockDate);

  return (
    <button
      className={`card ${revealed ? "revealed" : ""} ${locked ? "locked" : ""}`}
      onClick={onReveal}
      aria-label={`Carte ${index + 1}`}
      type="button"
      disabled={locked && !revealed}
    >
      <div className="cardInner">
        <div className="cardFront">
          <div className="bigLetter">{data.letter}</div>

          {locked && !revealed ? (
            <>
              <div className="tap lockText">🔒 Disponible le {unlockLabel}</div>
              <div className="tap smallMuted">
                (Aujourd’hui : {formatDateFR(todayYYYYMMDD)})
              </div>
            </>
          ) : (
            <div className="tap">Appuie pour révéler</div>
          )}
        </div>

        <div className="cardBack">
          <div className="bigLetter small">{data.letter}</div>
          <div className="title">{data.title}</div>
          <div className="body">{data.body}</div>
          {data.hint && <div className="hint">{data.hint}</div>}
          <div className="icon">{data.icon}</div>
        </div>
      </div>
    </button>
  );
}

export default function App() {
  const simulated = useMemo(() => getSimulatedDateFromQuery(), []);
  const [todayYYYYMMDD, setTodayYYYYMMDD] = useState(
    simulated ?? getYYYYMMDDInTZ(new Date(), TIME_ZONE)
  );

  // Update "today" every minute (in case user crosses midnight while open).
  useEffect(() => {
    if (simulated) return;
    const id = setInterval(() => {
      setTodayYYYYMMDD(getYYYYMMDDInTZ(new Date(), TIME_ZONE));
    }, 60_000);
    return () => clearInterval(id);
  }, [simulated]);

  const [revealed, setRevealed] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Array(CARDS.length).fill(false);
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === CARDS.length) {
        return parsed.map(Boolean);
      }
      return Array(CARDS.length).fill(false);
    } catch {
      return Array(CARDS.length).fill(false);
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(revealed));
  }, [revealed]);

  const unlockCount = useMemo(
    () => CARDS.filter((c) => isUnlocked(c, todayYYYYMMDD)).length,
    [todayYYYYMMDD]
  );

  const allUnlocked = unlockCount === CARDS.length;
  const revealedCount = revealed.filter(Boolean).length;

  const allRevealed = useMemo(() => revealed.every(Boolean), [revealed]);
  const word = useMemo(() => CARDS.map((c) => c.letter).join(""), []);

  function reveal(i) {
    const locked = !isUnlocked(CARDS[i], todayYYYYMMDD);
    if (locked && !revealed[i]) return;

    setRevealed((prev) => {
      if (prev[i]) return prev;
      const next = [...prev];
      next[i] = true;
      return next;
    });
  }

  function resetReveals() {
    setRevealed(Array(CARDS.length).fill(false));
  }

  return (
    <div className="page">
      <header className="header">
        <div className="badge">💌</div>
        <h1>Ma Valentine</h1>
        <p>
          Une carte par jour, du <b>9</b> au <b>14 février 2026</b>.
        </p>
        <p className="smallMuted">
          Cartes disponibles aujourd’hui : <b>{unlockCount}</b>/6
        </p>
        {simulated && (
          <p className="smallMuted">
            Mode test activé (date simulée : <b>{formatDateFR(todayYYYYMMDD)}</b>)
          </p>
        )}
      </header>

      <main className="grid">
        {CARDS.map((c, i) => {
          const locked = !isUnlocked(c, todayYYYYMMDD);
          return (
            <Card
              key={`${c.letter}-${i}`}
              data={c}
              index={i}
              revealed={revealed[i]}
              locked={locked}
              todayYYYYMMDD={todayYYYYMMDD}
              onReveal={() => reveal(i)}
            />
          );
        })}
      </main>

      <footer className="footer">
        <div className="progress">
          <span>Progression</span>
          <div className="bar">
            <div
              className="fill"
              style={{
                width: `${(revealedCount / CARDS.length) * 100}%`,
              }}
            />
          </div>
          <span>
            {revealedCount}/{CARDS.length}
          </span>
        </div>

        {allRevealed ? (
          <div className="revealBox">
            <div className="revealTitle">Le mot est…</div>
            <div className="revealWord">{word}</div>
            <div className="revealMsg">
              Ce soir, je t’emmène au <b>Saison</b>. ❤
            </div>

            <div className="actions">
              <button className="secondary" onClick={resetReveals} type="button">
                Recommencer
              </button>
            </div>
          </div>
        ) : (
          <div className="smallMuted">
            {allUnlocked
              ? "Toutes les cartes sont disponibles, à toi de les révéler 😉"
              : "Reviens demain pour la prochaine carte ✨"}
          </div>
        )}
      </footer>
    </div>
  );
}
