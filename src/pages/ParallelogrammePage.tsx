import "../App.css";

import { useMemo, useState } from "react";

type Figure = "parallelogramme" | "rectangle" | "losange" | "carre";
type VisualKind =
  | "none"
  | "sides"
  | "angles"
  | "diagonals"
  | "symmetry"
  | "rightAngles"
  | "equalDiagonals"
  | "perpendicularDiagonals"
  | "allSidesEqual";

type QuizQuestion = {
  id: string;
  figure: Figure;
  statement: string;
  answer: boolean;
  explanation: string;
  visual: VisualKind;
};

const QUESTIONS: QuizQuestion[] = [
  {
    id: "opposite-sides-parallel",
    figure: "parallelogramme",
    statement: "Dans un parallélogramme, les côtés opposés sont parallèles.",
    answer: true,
    explanation:
      "C’est la définition : un parallélogramme est un quadrilatère dont les côtés opposés sont parallèles deux à deux.",
    visual: "sides",
  },
  {
    id: "opposite-sides-equal",
    figure: "parallelogramme",
    statement:
      "Dans un parallélogramme, les côtés opposés ont la même longueur.",
    answer: true,
    explanation:
      "Les côtés opposés d’un parallélogramme sont de même longueur (et parallèles).",
    visual: "sides",
  },
  {
    id: "opposite-angles-equal",
    figure: "parallelogramme",
    statement: "Dans un parallélogramme, les angles opposés sont égaux.",
    answer: true,
    explanation:
      "Les angles opposés d’un parallélogramme sont égaux, et deux angles consécutifs sont supplémentaires.",
    visual: "angles",
  },
  {
    id: "consecutive-angles-90",
    figure: "parallelogramme",
    statement:
      "Dans un parallélogramme, deux angles consécutifs font toujours 90°.",
    answer: false,
    explanation:
      "Deux angles consécutifs sont supplémentaires (leur somme vaut 180°), pas forcément 90°. 90° partout, c’est le cas particulier du rectangle.",
    visual: "angles",
  },
  {
    id: "diagonals-bisect",
    figure: "parallelogramme",
    statement:
      "Dans un parallélogramme, les diagonales se coupent en leur milieu.",
    answer: true,
    explanation:
      "Les diagonales d’un parallélogramme se coupent en leur milieu (elles se “bisectent”).",
    visual: "diagonals",
  },
  {
    id: "diagonals-equal",
    figure: "parallelogramme",
    statement:
      "Dans un parallélogramme, les diagonales ont toujours la même longueur.",
    answer: false,
    explanation:
      "Les diagonales ne sont pas forcément de même longueur. Elles le sont dans un rectangle (cas particulier).",
    visual: "diagonals",
  },
  {
    id: "center-symmetry",
    figure: "parallelogramme",
    statement:
      "Un parallélogramme a un centre de symétrie : le point d’intersection des diagonales.",
    answer: true,
    explanation:
      "Le point d’intersection des diagonales est le centre de symétrie du parallélogramme.",
    visual: "symmetry",
  },
  {
    id: "rectangle-right-angles",
    figure: "rectangle",
    statement: "Dans un rectangle, les 4 angles sont droits.",
    answer: true,
    explanation:
      "Un rectangle est un parallélogramme qui possède un angle droit : alors les 4 angles sont droits.",
    visual: "rightAngles",
  },
  {
    id: "rectangle-diagonals-equal",
    figure: "rectangle",
    statement: "Dans un rectangle, les diagonales ont la même longueur.",
    answer: true,
    explanation:
      "Dans un rectangle, les diagonales sont de même longueur (et se coupent en leur milieu).",
    visual: "equalDiagonals",
  },
  {
    id: "rectangle-diagonals-perpendicular",
    figure: "rectangle",
    statement: "Dans un rectangle, les diagonales sont perpendiculaires.",
    answer: false,
    explanation:
      "Ce n’est pas vrai en général. Les diagonales perpendiculaires, c’est le cas du losange (et du carré).",
    visual: "diagonals",
  },
  {
    id: "losange-all-sides-equal",
    figure: "losange",
    statement: "Dans un losange, les 4 côtés ont la même longueur.",
    answer: true,
    explanation:
      "C’est la définition d’un losange : un parallélogramme avec 4 côtés de même longueur.",
    visual: "allSidesEqual",
  },
  {
    id: "losange-right-angles",
    figure: "losange",
    statement: "Dans un losange, les 4 angles sont droits.",
    answer: false,
    explanation:
      "Pas forcément. Un losange peut avoir des angles qui ne sont pas droits. S’ils sont droits, alors c’est un carré.",
    visual: "angles",
  },
  {
    id: "losange-diagonals-perpendicular",
    figure: "losange",
    statement: "Dans un losange, les diagonales sont perpendiculaires.",
    answer: true,
    explanation:
      "Dans un losange, les diagonales sont perpendiculaires (et se coupent en leur milieu).",
    visual: "perpendicularDiagonals",
  },
  {
    id: "losange-diagonals-equal",
    figure: "losange",
    statement: "Dans un losange, les diagonales ont toujours la même longueur.",
    answer: false,
    explanation:
      "Les diagonales d’un losange ne sont pas forcément égales. Elles le sont dans le carré.",
    visual: "diagonals",
  },
  {
    id: "carre-definition",
    figure: "carre",
    statement: "Un carré est à la fois un rectangle et un losange.",
    answer: true,
    explanation:
      "Oui : un carré a 4 angles droits (rectangle) et 4 côtés égaux (losange).",
    visual: "rightAngles",
  },
  {
    id: "carre-diagonals-perpendicular",
    figure: "carre",
    statement: "Dans un carré, les diagonales sont perpendiculaires.",
    answer: true,
    explanation:
      "Oui, comme dans un losange. Et en plus elles ont la même longueur (comme dans un rectangle).",
    visual: "perpendicularDiagonals",
  },
  {
    id: "carre-diagonals-equal",
    figure: "carre",
    statement: "Dans un carré, les diagonales ont la même longueur.",
    answer: true,
    explanation: "Oui, comme dans un rectangle.",
    visual: "equalDiagonals",
  },
];

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function QuadSvg({ figure, visual }: { figure: Figure; visual: VisualKind }) {
  // ABCD (A en bas-gauche, B en bas-droite, C en haut-droite, D en haut-gauche)
  const points = (() => {
    if (figure === "rectangle") {
      const A = { x: 90, y: 220 };
      const B = { x: 310, y: 220 };
      const C = { x: 310, y: 90 };
      const D = { x: 90, y: 90 };
      return { A, B, C, D };
    }
    if (figure === "carre") {
      const A = { x: 120, y: 220 };
      const B = { x: 300, y: 220 };
      const C = { x: 300, y: 40 };
      const D = { x: 120, y: 40 };
      return { A, B, C, D };
    }
    if (figure === "losange") {
      const A = { x: 200, y: 240 };
      const B = { x: 340, y: 140 };
      const C = { x: 200, y: 40 };
      const D = { x: 60, y: 140 };
      return { A, B, C, D };
    }
    // parallélogramme
    const A = { x: 80, y: 220 };
    const B = { x: 260, y: 220 };
    const D = { x: 140, y: 90 };
    const C = { x: 320, y: 90 };
    return { A, B, C, D };
  })();

  const { A, B, C, D } = points;

  const mid = (p: { x: number; y: number }, q: { x: number; y: number }) => ({
    x: (p.x + q.x) / 2,
    y: (p.y + q.y) / 2,
  });
  const O = mid(A, C);

  const showSides = visual === "sides" || visual === "allSidesEqual";
  const showAngles = visual === "angles" || visual === "rightAngles";
  const showDiagonals =
    visual === "diagonals" ||
    visual === "equalDiagonals" ||
    visual === "perpendicularDiagonals" ||
    visual === "symmetry";
  const showSym = visual === "symmetry";
  const showRightAngles = visual === "rightAngles";
  const showEqualDiagonals = visual === "equalDiagonals";
  const showPerpDiagonals = visual === "perpendicularDiagonals";
  const showAllSidesEqual = visual === "allSidesEqual";

  return (
    <svg
      className="paraSvg"
      viewBox="0 0 400 280"
      role="img"
      aria-label="Schéma du quadrilatère"
    >
      <defs>
        <marker
          id="tick"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
          orient="auto"
        >
          <path d="M1,4 L7,4" stroke="currentColor" strokeWidth="2" />
        </marker>
      </defs>

      <polygon
        points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`}
        className="paraShape"
      />

      {showDiagonals ? (
        <>
          <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} className="paraDiag" />
          <line x1={B.x} y1={B.y} x2={D.x} y2={D.y} className="paraDiag" />
          <circle cx={O.x} cy={O.y} r="4" className="paraPoint" />
          <text x={O.x + 8} y={O.y - 8} className="paraLabel">
            O
          </text>
        </>
      ) : null}

      {showPerpDiagonals ? (
        <path
          d={`M ${O.x - 10} ${O.y} L ${O.x - 10} ${O.y - 18} L ${O.x + 8} ${O.y - 18}`}
          className="paraRightAngle"
        />
      ) : null}

      {showEqualDiagonals ? (
        <>
          <circle cx={mid(A, C).x} cy={mid(A, C).y} r="0" />
          <line
            x1={A.x}
            y1={A.y}
            x2={C.x}
            y2={C.y}
            className="paraDiag"
            markerStart="url(#tick)"
            markerEnd="url(#tick)"
          />
          <line
            x1={B.x}
            y1={B.y}
            x2={D.x}
            y2={D.y}
            className="paraDiag"
            markerStart="url(#tick)"
            markerEnd="url(#tick)"
          />
        </>
      ) : null}

      {showSym ? (
        <>
          <line x1={O.x} y1={20} x2={O.x} y2={260} className="paraAxis" />
          <line x1={20} y1={O.y} x2={380} y2={O.y} className="paraAxis" />
          <circle cx={O.x} cy={O.y} r="4" className="paraPoint" />
          <text x={O.x + 8} y={O.y - 8} className="paraLabel">
            Centre
          </text>
        </>
      ) : null}

      {showSides ? (
        <>
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} className="paraSide" />
          <line x1={D.x} y1={D.y} x2={C.x} y2={C.y} className="paraSide" />
          <line x1={A.x} y1={A.y} x2={D.x} y2={D.y} className="paraSide2" />
          <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} className="paraSide2" />
        </>
      ) : null}

      {showAllSidesEqual ? (
        <>
          <circle cx={mid(A, B).x} cy={mid(A, B).y} r="0" />
          <line
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            className="paraSide"
            markerStart="url(#tick)"
            markerEnd="url(#tick)"
          />
          <line
            x1={B.x}
            y1={B.y}
            x2={C.x}
            y2={C.y}
            className="paraSide2"
            markerStart="url(#tick)"
            markerEnd="url(#tick)"
          />
          <line
            x1={C.x}
            y1={C.y}
            x2={D.x}
            y2={D.y}
            className="paraSide"
            markerStart="url(#tick)"
            markerEnd="url(#tick)"
          />
          <line
            x1={D.x}
            y1={D.y}
            x2={A.x}
            y2={A.y}
            className="paraSide2"
            markerStart="url(#tick)"
            markerEnd="url(#tick)"
          />
        </>
      ) : null}

      {showAngles ? (
        <>
          <path d="M80 220 L120 220 L100 190 Z" className="paraAngle" />
          <path d="M320 90 L280 90 L300 120 Z" className="paraAngle" />
        </>
      ) : null}

      {showRightAngles ? (
        <>
          <path
            d={`M ${A.x} ${A.y} L ${A.x + 22} ${A.y} L ${A.x + 22} ${A.y - 22} L ${A.x} ${A.y - 22}`}
            className="paraRightAngle"
          />
          <path
            d={`M ${B.x} ${B.y} L ${B.x - 22} ${B.y} L ${B.x - 22} ${B.y - 22} L ${B.x} ${B.y - 22}`}
            className="paraRightAngle"
          />
        </>
      ) : null}

      <circle cx={A.x} cy={A.y} r="3" className="paraVertex" />
      <circle cx={B.x} cy={B.y} r="3" className="paraVertex" />
      <circle cx={C.x} cy={C.y} r="3" className="paraVertex" />
      <circle cx={D.x} cy={D.y} r="3" className="paraVertex" />

      <text x={A.x - 12} y={A.y + 18} className="paraLabel">
        A
      </text>
      <text x={B.x + 8} y={B.y + 18} className="paraLabel">
        B
      </text>
      <text x={C.x + 8} y={C.y - 8} className="paraLabel">
        C
      </text>
      <text x={D.x - 12} y={D.y - 8} className="paraLabel">
        D
      </text>
    </svg>
  );
}

export function ParallelogrammePage() {
  const [order, setOrder] = useState(() => shuffle(QUESTIONS));
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);

  const exhausted = idx >= order.length;
  const q = exhausted ? null : order[idx]!;
  const figure = q?.figure ?? "parallelogramme";

  const feedback = useMemo(() => {
    if (answered === null || !q) return null;
    const ok = answered === q.answer;
    return { ok };
  }, [answered, q]);

  function answer(v: boolean) {
    if (answered !== null || !q) return;
    setAnswered(v);
    setTotalCount((n) => n + 1);
    if (v === q.answer) {
      setCorrectCount((n) => n + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }

  function next() {
    setAnswered(null);
    setIdx((i) => i + 1);
  }

  return (
    <main className="card">
      <div className="pageTop">
        <div>
          <div className="pageTitle">Quadrilatères</div>
          <div className="subtitle">Niveau 5e — Réponds Vrai ou Faux.</div>
        </div>
        <div className="stats" aria-label="Statistiques">
          <div className="stat">
            <div className="statLabel">Score</div>
            <div className="statValue">
              {correctCount}/{totalCount}
            </div>
          </div>
          <div className="stat">
            <div className="statLabel">Série</div>
            <div className="statValue">{streak}</div>
          </div>
        </div>
      </div>

      <div className="paraHeader">
        <div className="paraStatement">
          {exhausted ? (
            <div>Pool de questions épuisé.</div>
          ) : (
            <div>
              <span className="hint">
                ({idx + 1}/{order.length}){" "}
              </span>
              {q!.statement}
            </div>
          )}
        </div>
      </div>

      {exhausted ? null : <QuadSvg figure={figure} visual={q!.visual} />}

      <div className="actions">
        <button
          className="primary"
          onClick={() => answer(true)}
          disabled={answered !== null || exhausted}
          aria-label="Répondre vrai"
        >
          Vrai
        </button>
        <button
          className="ghost"
          onClick={() => answer(false)}
          disabled={answered !== null || exhausted}
          aria-label="Répondre faux"
        >
          Faux
        </button>

        {answered !== null && !exhausted ? (
          <button className="primary" onClick={next}>
            Continuer
          </button>
        ) : null}
        {exhausted ? (
          <button
            className="primary"
            onClick={() => {
              setOrder(shuffle(QUESTIONS));
              setIdx(0);
              setAnswered(null);
              setCorrectCount(0);
              setTotalCount(0);
              setStreak(0);
            }}
          >
            Recommencer
          </button>
        ) : null}
      </div>

      <div className="feedback" aria-live="polite">
        {exhausted ? (
          <span className="hint">
            Tu as fait toutes les questions disponibles pour l’instant.
          </span>
        ) : answered === null ? (
          <span className="hint">Regarde le schéma si ça t’aide.</span>
        ) : feedback?.ok ? (
          <span className="ok">Correct&nbsp;!</span>
        ) : (
          <span className="ko">Incorrect.</span>
        )}
        {answered !== null && q ? (
          <div className="paraExplanation">{q.explanation}</div>
        ) : null}
      </div>
    </main>
  );
}
