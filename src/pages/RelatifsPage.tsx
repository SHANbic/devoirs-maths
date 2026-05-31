import '../App.css'

import { useEffect, useMemo, useRef, useState } from 'react'

type Question = {
  left: number
  right: number
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function formatSignedFr(n: number, fractionDigits: number) {
  const normalized = Object.is(n, -0) ? 0 : n
  const abs = Math.abs(normalized)
  const str = abs.toFixed(fractionDigits).replace('.', ',')
  if (normalized > 0) return `+${str}`
  if (normalized < 0) return `-${str}`
  return `0${fractionDigits > 0 ? ',' + '0'.repeat(fractionDigits) : ''}`
}

function generateQuestion(maxAbs: number): Question {
  const fractionDigits = 1
  const scale = 10 ** fractionDigits
  const minScaled = Math.round(-maxAbs * scale)
  const maxScaled = Math.round(maxAbs * scale)

  const aScaled = randInt(minScaled, maxScaled)
  let bScaled = randInt(minScaled, maxScaled)
  while (bScaled === aScaled) bScaled = randInt(minScaled, maxScaled)

  return { left: aScaled / scale, right: bScaled / scale }
}

export function RelatifsPage() {
  const [maxAbs, setMaxAbs] = useState(20)
  const [question, setQuestion] = useState<Question>(() => generateQuestion(20))
  const [selected, setSelected] = useState<'left' | 'right' | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const autoNextTimeoutRef = useRef<number | null>(null)

  const smallerSide = useMemo<'left' | 'right'>(() => {
    return question.left < question.right ? 'left' : 'right'
  }, [question.left, question.right])

  function nextQuestion() {
    if (autoNextTimeoutRef.current !== null) {
      window.clearTimeout(autoNextTimeoutRef.current)
      autoNextTimeoutRef.current = null
    }
    setQuestion(generateQuestion(maxAbs))
    setSelected(null)
    setIsCorrect(null)
  }

  function answer(side: 'left' | 'right') {
    if (isCorrect !== null) return
    setSelected(side)
    const ok = side === smallerSide
    setIsCorrect(ok)
    setTotalCount((v) => v + 1)
    if (ok) {
      setCorrectCount((v) => v + 1)
      setStreak((v) => v + 1)
      autoNextTimeoutRef.current = window.setTimeout(() => {
        nextQuestion()
      }, 650)
    } else {
      setStreak(0)
    }
  }

  useEffect(() => {
    nextQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxAbs])

  useEffect(() => {
    return () => {
      if (autoNextTimeoutRef.current !== null) {
        window.clearTimeout(autoNextTimeoutRef.current)
      }
    }
  }, [])

  return (
    <main className="card">
      <div className="pageTop">
        <div className="pageTitle">Relatifs</div>
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

      <div className="prompt">
        Choisis le <strong>plus petit</strong> des deux nombres.
      </div>

      <div className="choices" role="group" aria-label="Choix">
        <button
          className={[
            'choice',
            selected === 'left' ? 'selected' : '',
            isCorrect !== null && smallerSide === 'left' ? 'correct' : '',
            isCorrect === false && selected === 'left' ? 'wrong' : '',
          ].join(' ')}
          onClick={() => answer('left')}
          disabled={isCorrect !== null}
          aria-label={`Nombre de gauche ${formatSignedFr(question.left, 1)}`}
        >
          <span className="choiceValue">{formatSignedFr(question.left, 1)}</span>
        </button>

        <div className="vs" aria-hidden="true">
          vs
        </div>

        <button
          className={[
            'choice',
            selected === 'right' ? 'selected' : '',
            isCorrect !== null && smallerSide === 'right' ? 'correct' : '',
            isCorrect === false && selected === 'right' ? 'wrong' : '',
          ].join(' ')}
          onClick={() => answer('right')}
          disabled={isCorrect !== null}
          aria-label={`Nombre de droite ${formatSignedFr(question.right, 1)}`}
        >
          <span className="choiceValue">{formatSignedFr(question.right, 1)}</span>
        </button>
      </div>

      <div className="feedback" aria-live="polite">
        {isCorrect === null ? (
          <span className="hint">Astuce&nbsp;: plus un nombre est négatif, plus il est petit.</span>
        ) : isCorrect ? (
          <span className="ok">Correct&nbsp;!</span>
        ) : (
          <span className="ko">
            Faux. Le plus petit est{' '}
            <strong>
              {smallerSide === 'left'
                ? formatSignedFr(question.left, 1)
                : formatSignedFr(question.right, 1)}
            </strong>
            .
          </span>
        )}
      </div>

      <div className="actions">
        {isCorrect === false ? (
          <button className="primary" onClick={nextQuestion}>
            Continuer
          </button>
        ) : null}
        <button
          className="ghost"
          onClick={() => {
            setCorrectCount(0)
            setTotalCount(0)
            setStreak(0)
            nextQuestion()
          }}
        >
          Réinitialiser
        </button>
      </div>

      <div className="settings" aria-label="Réglages">
        <label className="rangeRow">
          <span className="rangeLabel">Difficulté (valeur max)&nbsp;: </span>
          <span className="rangeValue">{maxAbs}</span>
          <input
            className="range"
            type="range"
            min={5}
            max={100}
            step={5}
            value={maxAbs}
            onChange={(e) => setMaxAbs(Number(e.target.value))}
            aria-label="Valeur maximale en valeur absolue"
          />
        </label>
      </div>
    </main>
  )
}

