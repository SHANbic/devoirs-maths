import './App.css'

import { NavLink, Route, Routes, useLocation } from 'react-router-dom'

import { CalculsPage } from './pages/CalculsPage'
import { FractionsPage } from './pages/FractionsPage'
import { ParallelogrammePage } from './pages/ParallelogrammePage'
import { RelatifsPage } from './pages/RelatifsPage'

function App() {
  const location = useLocation()
  const isGeometry = location.pathname.startsWith('/parallelogramme')
  const isFractions = location.pathname.startsWith('/fractions')
  const isCalculs = location.pathname.startsWith('/calculs')

  const badge = isGeometry ? '▱' : isFractions ? '½' : isCalculs ? '∑' : '±'
  const title = isGeometry
    ? 'Géométrie'
    : isFractions
      ? 'Fractions'
      : isCalculs
        ? 'Calculs'
        : 'Nombres relatifs'
  const subtitle = isGeometry
    ? 'Quadrilatères (5e) — propriétés'
    : isFractions
      ? 'Addition et soustraction (5e)'
      : isCalculs
        ? 'Nombres relatifs de \u22129 à +9'
        : 'Quel nombre est le plus petit\u00a0?'

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="badge" aria-hidden="true">
            {badge}
          </div>
          <div className="brandText">
            <div className="title">{title}</div>
            <div className="subtitle">{subtitle}</div>
          </div>
        </div>

        <nav className="tabs" aria-label="Navigation">
          <NavLink className={({ isActive }) => `tab ${isActive ? 'active' : ''}`} to="/">
            Relatifs
          </NavLink>
          <NavLink
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
            to="/calculs"
          >
            Calculs
          </NavLink>
          <NavLink
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
            to="/fractions"
          >
            Fractions
          </NavLink>
          <NavLink
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
            to="/parallelogramme"
          >
            Géométrie
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<RelatifsPage />} />
        <Route path="/calculs" element={<CalculsPage />} />
        <Route path="/fractions" element={<FractionsPage />} />
        <Route path="/parallelogramme" element={<ParallelogrammePage />} />
      </Routes>

      <footer className="footer">
        {isGeometry ? (
          <>
            Astuce&nbsp;: un parallélogramme a ses côtés opposés parallèles, et ses diagonales se coupent en leur
            milieu.
          </>
        ) : isFractions ? (
          <>
            Astuce&nbsp;: pour additionner deux fractions, mets-les d'abord au <strong>même
            dénominateur</strong> (PPCM), puis additionne les numérateurs.
          </>
        ) : isCalculs ? (
          <>
            Astuce&nbsp;: additionner deux nombres de <strong>même signe</strong>, on additionne
            ; de <strong>signes différents</strong>, on soustrait et on garde le signe du plus grand.
          </>
        ) : (
          <>
            Astuce&nbsp;: si \(a &lt; b\), alors <strong>a</strong> est plus petit que <strong>b</strong>.
          </>
        )}
      </footer>
    </div>
  )
}

export default App
