import '../App.css'

import { useEffect, useMemo, useRef, useState } from 'react'

type Op = '+' | '-'

type Question = {
  a: number
  b: number
  c: number
  d: number
  op: Op
}

type Level = 'facile' | 'moyen' | 'difficile'

type StepStatus = 'idle' | 'ok' | 'ko'

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a || 1
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

function simplify(n: number, d: number): { n: number; d: number } {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d)
  return { n: n / g, d: d / g }
}

const FACILE_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [2, 4],
  [2, 6],
  [2, 8],
  [3, 6],
  [3, 9],
  [3, 12],
  [4, 8],
  [4, 12],
  [5, 10],
  [5, 15],
  [6, 12],
  [2, 10],
]

const MOYEN_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [2, 3],
  [3, 4],
  [4, 6],
  [6, 8],
  [4, 5],
  [3, 5],
  [2, 5],
  [3, 7],
  [4, 9],
  [6, 9],
  [6, 10],
  [8, 12],
  [10, 15],
]

const DIFFICILE_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [12, 18],
  [9, 12],
  [8, 12],
  [10, 12],
  [14, 21],
  [15, 20],
  [12, 15],
  [10, 25],
  [9, 15],
  [8, 18],
  [6, 14],
  [12, 16],
]

function generateQuestion(level: Level): Question {
  const pairs =
    level === 'facile' ? FACILE_PAIRS : level === 'moyen' ? MOYEN_PAIRS : DIFFICILE_PAIRS

  const [pb, pd] = pick(pairs)
  const [b, d] = Math.random() < 0.5 ? [pb, pd] : [pd, pb]

  const a = randInt(1, b - 1)
  const c = randInt(1, d - 1)
  const op: Op = Math.random() < 0.5 ? '+' : '-'

  if (op === '-') {
    const left = a * d
    const right = c * b
    if (left <= right) {
      // Avoid zero or negative result by swapping the two fractions.
      return { a: c, b: d, c: a, d: b, op }
    }
  }

  return { a, b, c, d, op }
}

function FractionView({
  num,
  den,
  ariaLabel,
}: {
  num: React.ReactNode
  den: React.ReactNode
  ariaLabel?: string
}) {
  return (
    <span className="frac" role="math" aria-label={ariaLabel}>
      <span className="fracNum">{num}</span>
      <span className="fracBar" aria-hidden="true" />
      <span className="fracDen">{den}</span>
    </span>
  )
}

export function FractionsPage() {
  const [level, setLevel] = useState<Level>('moyen')
  const [question, setQuestion] = useState<Question>(() => generateQuestion('moyen'))

  const [interNum, setInterNum] = useState('')
  const [interDen, setInterDen] = useState('')
  const [finalNum, setFinalNum] = useState('')
  const [finalDen, setFinalDen] = useState('')

  const [interStatus, setInterStatus] = useState<StepStatus>('idle')
  const [finalStatus, setFinalStatus] = useState<StepStatus>('idle')
  const [interMessage, setInterMessage] = useState<string | null>(null)
  const [finalMessage, setFinalMessage] = useState<string | null>(null)
  const [validated, setValidated] = useState(false)

  const [correctCount, setCorrectCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showSteps, setShowSteps] = useState(false)

  const interNumRef = useRef<HTMLInputElement | null>(null)
  const autoNextTimeoutRef = useRef<number | null>(null)

  const solution = useMemo(() => {
    const { a, b, c, d, op } = question
    const common = lcm(b, d)
    const factB = common / b
    const factD = common / d
    const aScaled = a * factB
    const cScaled = c * factD
    const numUnreduced = op === '+' ? aScaled + cScaled : aScaled - cScaled
    const reduced = simplify(numUnreduced, common)
    return {
      common,
      factB,
      factD,
      aScaled,
      cScaled,
      numUnreduced,
      denUnreduced: common,
      reduced,
    }
  }, [question])

  function nextQuestion(nextLevel?: Level) {
    if (autoNextTimeoutRef.current !== null) {
      window.clearTimeout(autoNextTimeoutRef.current)
      autoNextTimeoutRef.current = null
    }
    setQuestion(generateQuestion(nextLevel ?? level))
    setInterNum('')
    setInterDen('')
    setFinalNum('')
    setFinalDen('')
    setInterStatus('idle')
    setFinalStatus('idle')
    setInterMessage(null)
    setFinalMessage(null)
    setValidated(false)
    setShowSteps(false)
    window.requestAnimationFrame(() => {
      interNumRef.current?.focus()
    })
  }

  function check() {
    if (validated) return
    const { b, d } = question

    const inum = parseInt(interNum, 10)
    const iden = parseInt(interDen, 10)
    const fnum = parseInt(finalNum, 10)
    const fden = parseInt(finalDen, 10)

    let interOk: boolean
    let interMsg: string | null = null
    if (
      !Number.isFinite(inum) ||
      !Number.isFinite(iden) ||
      iden === 0
    ) {
      interOk = false
      interMsg = 'Saisis un numérateur et un dénominateur (≠ 0).'
    } else if (iden % b !== 0 || iden % d !== 0) {
      interOk = false
      interMsg = `Le dénominateur doit être un multiple commun de ${b} et ${d} (par exemple ${solution.common}).`
    } else if (inum * solution.denUnreduced !== solution.numUnreduced * iden) {
      interOk = false
      interMsg = 'La valeur de cette fraction n\u2019est pas correcte.'
    } else {
      interOk = true
    }

    let finalOk: boolean
    let finalMsg: string | null = null
    if (
      !Number.isFinite(fnum) ||
      !Number.isFinite(fden) ||
      fden === 0
    ) {
      finalOk = false
      finalMsg = 'Saisis un numérateur et un dénominateur (≠ 0).'
    } else if (fnum * solution.denUnreduced !== solution.numUnreduced * fden) {
      finalOk = false
      finalMsg = 'La valeur de cette fraction n\u2019est pas correcte.'
    } else if (gcd(fnum, fden) !== 1) {
      finalOk = false
      finalMsg = `La fraction n\u2019est pas simplifiée au maximum (divise encore par ${gcd(fnum, fden)}).`
    } else {
      finalOk = true
    }

    setInterStatus(interOk ? 'ok' : 'ko')
    setFinalStatus(finalOk ? 'ok' : 'ko')
    setInterMessage(interMsg)
    setFinalMessage(finalMsg)
    setValidated(true)

    const allOk = interOk && finalOk
    setTotalCount((v) => v + 1)
    if (allOk) {
      setCorrectCount((v) => v + 1)
      setStreak((v) => v + 1)
      autoNextTimeoutRef.current = window.setTimeout(() => {
        nextQuestion()
      }, 1100)
    } else {
      setStreak(0)
      setShowSteps(true)
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

  useEffect(() => {
    nextQuestion(level)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  useEffect(() => {
    return () => {
      if (autoNextTimeoutRef.current !== null) {
        window.clearTimeout(autoNextTimeoutRef.current)
      }
    }
  }, [])

  const { a, b, c, d, op } = question
  const opSign = op === '+' ? '+' : '−'
  const allOk = validated && interStatus === 'ok' && finalStatus === 'ok'

  return (
    <main className="card">
      <div className="pageTop">
        <div className="pageTitle">Fractions</div>
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
        Calcule en deux étapes&nbsp;: d'abord la somme sur un <strong>dénominateur commun</strong>,
        puis la fraction <strong>simplifiée</strong>.
      </div>

      <div
        className="fracEq"
        aria-label={`${a} sur ${b} ${op === '+' ? 'plus' : 'moins'} ${c} sur ${d}`}
      >
        <FractionView num={a} den={b} ariaLabel={`${a} sur ${b}`} />
        <span className="fracOp" aria-hidden="true">
          {opSign}
        </span>
        <FractionView num={c} den={d} ariaLabel={`${c} sur ${d}`} />

        <span className="fracOp" aria-hidden="true">
          =
        </span>

        <span
          className={`fracStep ${
            validated ? (interStatus === 'ok' ? 'ok' : 'ko') : ''
          }`}
        >
          <span className="fracStepLabel">Sur dénominateur commun</span>
          <FractionView
            num={
              <input
                ref={interNumRef}
                className="fracInput"
                inputMode="numeric"
                pattern="-?\d*"
                value={interNum}
                onChange={(e) => setInterNum(e.target.value.replace(/[^0-9-]/g, ''))}
                onKeyDown={onKeyDown}
                disabled={validated}
                aria-label="Numérateur de la fraction sur dénominateur commun"
                placeholder="?"
              />
            }
            den={
              <input
                className="fracInput"
                inputMode="numeric"
                pattern="\d*"
                value={interDen}
                onChange={(e) => setInterDen(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={onKeyDown}
                disabled={validated}
                aria-label="Dénominateur de la fraction sur dénominateur commun"
                placeholder="?"
              />
            }
          />
        </span>

        <span className="fracOp" aria-hidden="true">
          =
        </span>

        <span
          className={`fracStep ${
            validated ? (finalStatus === 'ok' ? 'ok' : 'ko') : ''
          }`}
        >
          <span className="fracStepLabel">Simplifiée</span>
          <FractionView
            num={
              <input
                className="fracInput"
                inputMode="numeric"
                pattern="-?\d*"
                value={finalNum}
                onChange={(e) => setFinalNum(e.target.value.replace(/[^0-9-]/g, ''))}
                onKeyDown={onKeyDown}
                disabled={validated}
                aria-label="Numérateur de la fraction simplifiée"
                placeholder="?"
              />
            }
            den={
              <input
                className="fracInput"
                inputMode="numeric"
                pattern="\d*"
                value={finalDen}
                onChange={(e) => setFinalDen(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={onKeyDown}
                disabled={validated}
                aria-label="Dénominateur de la fraction simplifiée"
                placeholder="?"
              />
            }
          />
        </span>
      </div>

      <div className="feedback" aria-live="polite">
        {!validated ? (
          <span className="hint">
            Astuce&nbsp;: PPCM({b}, {d}) sert à mettre les deux fractions au même dénominateur,
            puis PGCD pour simplifier.
          </span>
        ) : allOk ? (
          <span className="ok">Bravo, les deux étapes sont correctes&nbsp;!</span>
        ) : (
          <div className="feedbackList">
            <div>
              <strong>Étape 1 (dénominateur commun)&nbsp;:</strong>{' '}
              {interStatus === 'ok' ? (
                <span className="ok">correct</span>
              ) : (
                <span className="ko">{interMessage ?? 'incorrect'}</span>
              )}
            </div>
            <div>
              <strong>Étape 2 (simplifiée)&nbsp;:</strong>{' '}
              {finalStatus === 'ok' ? (
                <span className="ok">correct</span>
              ) : (
                <span className="ko">{finalMessage ?? 'incorrect'}</span>
              )}
            </div>
            <div>
              Réponse attendue&nbsp;:{' '}
              <strong>
                {solution.numUnreduced}/{solution.common}
              </strong>{' '}
              ={' '}
              <strong>
                {solution.reduced.n}/{solution.reduced.d}
              </strong>
              .
            </div>
          </div>
        )}
      </div>

      {showSteps ? (
        <div className="steps" aria-label="Étapes de résolution">
          <div className="stepsTitle">Étapes</div>
          <ol className="stepsList">
            <li>
              Dénominateur commun&nbsp;: PPCM({b},&nbsp;{d}) ={' '}
              <strong>{solution.common}</strong>.
            </li>
            <li>
              On met chaque fraction sur {solution.common}&nbsp;:{' '}
              <FractionView num={a} den={b} /> ={' '}
              <FractionView num={`${a}×${solution.factB}`} den={`${b}×${solution.factB}`} /> ={' '}
              <FractionView num={solution.aScaled} den={solution.common} />
              {' ; '}
              <FractionView num={c} den={d} /> ={' '}
              <FractionView num={`${c}×${solution.factD}`} den={`${d}×${solution.factD}`} /> ={' '}
              <FractionView num={solution.cScaled} den={solution.common} />.
            </li>
            <li>
              On {op === '+' ? 'additionne' : 'soustrait'} les numérateurs&nbsp;:{' '}
              <FractionView num={solution.aScaled} den={solution.common} /> {opSign}{' '}
              <FractionView num={solution.cScaled} den={solution.common} /> ={' '}
              <FractionView num={solution.numUnreduced} den={solution.common} />.
            </li>
            {solution.numUnreduced !== solution.reduced.n ||
            solution.common !== solution.reduced.d ? (
              <li>
                On simplifie en divisant par PGCD({solution.numUnreduced}, {solution.common}) ={' '}
                <strong>{gcd(solution.numUnreduced, solution.common)}</strong>&nbsp;:{' '}
                <FractionView num={solution.numUnreduced} den={solution.common} /> ={' '}
                <FractionView num={solution.reduced.n} den={solution.reduced.d} />.
              </li>
            ) : (
              <li>La fraction est déjà irréductible (PGCD = 1).</li>
            )}
          </ol>
        </div>
      ) : null}

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
        {!validated ? (
          <button className="ghost" onClick={() => setShowSteps((v) => !v)}>
            {showSteps ? 'Cacher les étapes' : 'Voir les étapes'}
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
        <div className="figureTabs" role="tablist" aria-label="Niveau de difficulté">
          {(['facile', 'moyen', 'difficile'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              role="tab"
              aria-selected={level === lvl}
              className={`figureTab ${level === lvl ? 'active' : ''}`}
              onClick={() => setLevel(lvl)}
            >
              {lvl === 'facile'
                ? 'Facile (multiples)'
                : lvl === 'moyen'
                  ? 'Moyen (PPCM simple)'
                  : 'Difficile (PPCM)'}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
