import '../App.css'

import { useEffect, useMemo, useRef, useState } from 'react'

type Question = {
  a: number
  b: number
}

const MINUS = '\u2212'

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randNonZero(maxAbs: number) {
  let n = 0
  while (n === 0) n = randInt(-maxAbs, maxAbs)
  return n
}

function formatSigned(n: number) {
  if (n < 0) return `${MINUS}${Math.abs(n)}`
  return `+${n}`
}

function generateQuestion(): Question {
  return { a: randNonZero(9), b: randNonZero(9) }
}

function Operand({ n, position }: { n: number; position: 'first' | 'second' }) {
  let display: string
  if (position === 'first') {
    display = n < 0 ? formatSigned(n) : `${n}`
  } else {
    display = n > 0 ? `${n}` : `(${formatSigned(n)})`
  }
  return (
    <span className="calcOperand" aria-hidden="true">
      {display}
    </span>
  )
}

export function CalculsPage() {
  const [question, setQuestion] = useState<Question>(() => generateQuestion())

  const [answer, setAnswer] = useState('')
  const [validated, setValidated] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const [correctCount, setCorrectCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [streak, setStreak] = useState(0)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const autoNextTimeoutRef = useRef<number | null>(null)

  const result = useMemo(() => question.a + question.b, [question])

  function nextQuestion() {
    if (autoNextTimeoutRef.current !== null) {
      window.clearTimeout(autoNextTimeoutRef.current)
      autoNextTimeoutRef.current = null
    }
    setQuestion(generateQuestion())
    setAnswer('')
    setValidated(false)
    setIsCorrect(null)
    window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  function check() {
    if (validated) return
    const value = parseInt(answer, 10)
    if (!Number.isFinite(value)) return

    const ok = value === result
    setIsCorrect(ok)
    setValidated(true)
    setTotalCount((v) => v + 1)
    if (ok) {
      setCorrectCount((v) => v + 1)
      setStreak((v) => v + 1)
      autoNextTimeoutRef.current = window.setTimeout(() => {
        nextQuestion()
      }, 800)
    } else {
      setStreak(0)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!validated) {
        check()
      } else {
        nextQuestion()
      }
    }
  }

  function toggleSign() {
    if (validated) return
    setAnswer((a) => (a.startsWith('-') ? a.slice(1) : `-${a}`))
    window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  useEffect(() => {
    return () => {
      if (autoNextTimeoutRef.current !== null) {
        window.clearTimeout(autoNextTimeoutRef.current)
      }
    }
  }, [])

  const { a, b } = question

  return (
    <main className="card">
      <div className="pageTop">
        <div className="pageTitle">Calculs</div>
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
        Additionne des nombres <strong>positifs et négatifs</strong> (de {MINUS}9 à +9).
      </div>

      <div
        className="fracEq"
        aria-label={`${formatSigned(a)} plus ${formatSigned(b)}`}
      >
        <Operand n={a} position="first" />
        <span className="fracOp" aria-hidden="true">
          +
        </span>
        <Operand n={b} position="second" />
        <span className="fracOp" aria-hidden="true">
          =
        </span>
        <span className="calcInputGroup">
          <button
            type="button"
            className={`signToggle ${answer.startsWith('-') ? 'active' : ''}`}
            onClick={toggleSign}
            disabled={validated}
            aria-pressed={answer.startsWith('-')}
            aria-label="Changer le signe du résultat (positif ou négatif)"
            title="Changer le signe (+ / −)"
          >
            ±
          </button>
          <input
            ref={inputRef}
            className="fracInput calcAnswer"
            inputMode="numeric"
            pattern="-?\d*"
            value={answer}
            onChange={(e) => {
              const raw = e.target.value
              const neg = raw.trimStart().startsWith('-')
              const digits = raw.replace(/[^0-9]/g, '')
              setAnswer((neg ? '-' : '') + digits)
            }}
            onKeyDown={onKeyDown}
            disabled={validated}
            aria-label="Résultat du calcul"
            placeholder="?"
          />
        </span>
      </div>

      <div className="feedback" aria-live="polite">
        {!validated ? (
          <span className="hint">
            Astuce&nbsp;: ajouter un nombre négatif revient à reculer sur la droite graduée.
          </span>
        ) : isCorrect ? (
          <span className="ok">Correct&nbsp;!</span>
        ) : (
          <span className="ko">
            Faux. {a < 0 ? formatSigned(a) : `${a}`} + {b > 0 ? `${b}` : `(${formatSigned(b)})`} ={' '}
            <strong>{formatSigned(result).replace('+', '')}</strong>.
          </span>
        )}
      </div>

      <div className="actions">
        {!validated ? (
          <button className="primary" onClick={check}>
            Vérifier
          </button>
        ) : (
          <button className="primary" onClick={() => nextQuestion()}>
            Question suivante
          </button>
        )}
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
    </main>
  )
}
