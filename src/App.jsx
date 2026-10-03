import { useState, useEffect, useRef } from 'react'
import './App.css'

const BOOT_LINES = [
  'AZURE BIOS v9.5 — Iniciando...',
  'Detectando nubes................. OK',
  'Cargando React 19............... OK',
  'Montando /api/hello.............. OK',
  'Conectando al cloud.............. OK',
  'Inyectando serotonina............ OK',
]

const QUOTES = [
  'El código que funciona a la primera es un bug disfrazado de feature.',
  'En producción no hay bugs, solo características sorpresa.',
  'El cloud es la computadora de otra persona... con más facturas.',
  'Si funciona, no lo toques. Si no funciona, reinícialo todo.',
  '99 bugs en el código, parcheas uno, 127 bugs en el código.',
  'CSS es fácil, dijo nadie jamás.',
  'Hoy no es buen día para hacer deploy. Ningún día lo es.',
  'La documentación se escribirá luego. Siempre es "luego".',
  'Un semáforo en rojo es solo un race condition mal gestionado.',
  'El mejor lenguaje de programación es el que ya sabes usar.',
]

const DESKTOP_BG = ['#008080', '#3a1ea1', '#8b3e2f', '#1f6f3f']

const APPS = {
  mipc: { title: 'Mi PC', icon: '🖥️' },
  notas: { title: 'Bloc de notas — sin_titulo.txt', icon: '📝' },
  frases: { title: 'Frases Random v1.0', icon: '💬' },
  snake: { title: 'Snake.exe', icon: '🐍' },
  acerca: { title: 'Acerca de AzureOS 95', icon: 'ℹ️' },
  vacio: { title: 'Carpeta vacía', icon: '📁' },
}

function useClock() {
  const [now, setNow] = useState(null)
  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

function useDrag(onMove) {
  const drag = useRef(null)
  return {
    onPointerDown: (e) => {
      if (e.target.closest('button')) return
      drag.current = { sx: e.clientX, sy: e.clientY }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e) => {
      if (!drag.current) return
      const dx = e.clientX - drag.current.sx
      const dy = e.clientY - drag.current.sy
      if (dx || dy) onMove(dx, dy)
    },
    onPointerUp: () => {
      drag.current = null
    },
  }
}

function RetroWindow({ win, baseX, baseY, onFocus, onClose, onMove, children }) {
  const drag = useDrag((dx, dy) => {
    const maxX = Math.max(0, window.innerWidth - 120)
    const maxY = Math.max(0, window.innerHeight - 140)
    onMove(win.id, Math.min(Math.max(baseX + dx, 0), maxX), Math.min(Math.max(baseY + dy, 0), maxY))
  })
  return (
    <div className="win95-window" style={{ left: win.x, top: win.y, zIndex: win.z }} onMouseDown={() => onFocus(win.id)}>
      <div className="win95-titlebar" {...drag}>
        <span>
          {APPS[win.app].icon} {APPS[win.app].title}
        </span>
        <button type="button" className="win95-close" onClick={() => onClose(win.id)} aria-label="Cerrar">
          ✕
        </button>
      </div>
      <div className="win95-body">{children}</div>
    </div>
  )
}

function MiPcApp({ onCrash }) {
  const [api, setApi] = useState('_probando conexión..._')
  useEffect(() => {
    let alive = true
    fetch('/api/hello')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad'))))
      .then((d) => alive && setApi('✅ ' + (d.mensaje || 'API funcionando')))
      .catch(() => alive && setApi('📴 API no disponible en modo local'))
    return () => {
      alive = false
    }
  }, [])
  return (
    <div className="app-mipc">
      <h3>💻 Propiedades del sistema</h3>
      <table>
        <tbody>
          <tr>
            <td>Procesador:</td>
            <td>Cloud Neural x64 @ ∞ GHz</td>
          </tr>
          <tr>
            <td>Memoria RAM:</td>
            <td>64 TB de pura ilusión</td>
          </tr>
          <tr>
            <td>Disco:</td>
            <td>Azure Blob Storage (ilimitado*)</td>
          </tr>
          <tr>
            <td>GPU:</td>
            <td>Pixel Shader del 95</td>
          </tr>
          <tr>
            <td>API:</td>
            <td>{api}</td>
          </tr>
        </tbody>
      </table>
      <p className="fine-print">*sujeto a facturación mensual sorpresa</p>
      <button type="button" className="win95-btn danger" onClick={onCrash}>
        💣 Provocar error fatal
      </button>
    </div>
  )
}

function NotepadApp() {
  const [text, setText] = useState(
    'LISTA DE TAREAS DEL SISTEMA:\n\n[x] Arrancar en modo retro\n[x] Causar nostalgia\n[ ] Conquistar el mundo\n[ ] Escribir la documentacion (luego)\n\nNota: si borras esto, es TU culpa.',
  )
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return (
    <div className="app-notas">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        aria-label="Bloc de notas"
      />
      <div className="notas-meta">
        {text.length} caracteres · {words} palabras · guardado en ninguna parte
      </div>
    </div>
  )
}

function FrasesApp() {
  const [i, setI] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [n, setN] = useState(1)
  const otra = () => {
    let next = i
    while (next === i) next = Math.floor(Math.random() * QUOTES.length)
    setI(next)
    setN((v) => v + 1)
  }
  return (
    <div className="app-frases">
      <blockquote key={n}>
        <span className="quote-mark">“</span>
        {QUOTES[i]}
      </blockquote>
      <button type="button" className="win95-btn" onClick={otra}>
        🎲 Otra frase
      </button>
      <div className="frases-meta">Frase #{n} de {QUOTES.length}</div>
    </div>
  )
}

const GRID = 14

function randFood(body) {
  for (;;) {
    const f = [Math.floor(Math.random() * GRID), Math.floor(Math.random() * GRID)]
    if (!body.some((c) => c[0] === f[0] && c[1] === f[1])) return f
  }
}

function SnakeApp() {
  const [snake, setSnake] = useState([[7, 7], [7, 6], [7, 5]])
  const [food, setFood] = useState([3, 3])
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [dead, setDead] = useState(false)
  const dir = useRef([1, 0])

  const setDir = (d) => {
    if (d[0] === -dir.current[0] && d[1] === -dir.current[1]) return
    dir.current = d
  }

  useEffect(() => {
    const map = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      w: [0, -1],
      s: [0, 1],
      a: [-1, 0],
      d: [1, 0],
    }
    const onKey = (e) => {
      const d = map[e.key]
      if (d) {
        e.preventDefault()
        setDir(d)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (dead) return
    const t = setTimeout(() => {
      const head = [snake[0][0] + dir.current[0], snake[0][1] + dir.current[1]]
      const hitWall = head[0] < 0 || head[0] >= GRID || head[1] < 0 || head[1] >= GRID
      const hitSelf = snake.some((c) => c[0] === head[0] && c[1] === head[1])
      if (hitWall || hitSelf) {
        setDead(true)
        setBest((b) => Math.max(b, score))
        return
      }
      const next = [head, ...snake]
      if (head[0] === food[0] && head[1] === food[1]) {
        setScore((s) => s + 1)
        setFood(randFood(next))
      } else {
        next.pop()
      }
      setSnake(next)
    }, 150)
    return () => clearTimeout(t)
  }, [snake, food, dead, score])

  const restart = () => {
    setSnake([[7, 7], [7, 6], [7, 5]])
    setFood([3, 3])
    setScore(0)
    setDead(false)
    dir.current = [1, 0]
  }

  const cells = []
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const isHead = snake[0][0] === x && snake[0][1] === y
      const isBody = !isHead && snake.some((c) => c[0] === x && c[1] === y)
      const isFood = food[0] === x && food[1] === y
      cells.push(
        <div
          key={`${x}-${y}`}
          className={'cell' + (isHead ? ' head' : '') + (isBody ? ' body' : '') + (isFood ? ' foodc' : '')}
        >
          {isFood ? '🍎' : ''}
        </div>,
      )
    }
  }

  return (
    <div className="app-snake">
      <div className="snake-hud">
        <span>🍎 {score}</span>
        <span>🏆 {best}</span>
      </div>
      <div className="snake-board">
        {cells}
        {dead && (
          <div className="snake-over">
            <p>💀 Game Over</p>
            <button type="button" className="win95-btn" onClick={restart}>
              Reiniciar
            </button>
          </div>
        )}
      </div>
      <div className="snake-controls">
        <button type="button" className="win95-btn pad" onClick={() => setDir([0, -1])} aria-label="Arriba">
          ▲
        </button>
        <div>
          <button type="button" className="win95-btn pad" onClick={() => setDir([-1, 0])} aria-label="Izquierda">
            ◀
          </button>
          <button type="button" className="win95-btn pad" onClick={() => setDir([1, 0])} aria-label="Derecha">
            ▶
          </button>
          <button type="button" className="win95-btn pad" onClick={() => setDir([0, 1])} aria-label="Abajo">
            ▼
          </button>
        </div>
      </div>
      <p className="snake-tip">Usa las flechas / WASD del teclado</p>
    </div>
  )
}

function AcercaApp() {
  return (
    <div className="app-acerca">
      <div className="acerca-logo">☁️</div>
      <h3>AzureOS 95</h3>
      <p>
        Versión 9.5 · Build 2026.10
        <br />
        Este sistema operativo es 100% falso.
        <br />
        Ningún servidor fue dañado en su creación.
      </p>
      <p className="fine-print">Hecho con React 19 + Vite 8</p>
    </div>
  )
}

function VacioApp() {
  return <div className="app-vacio">Esta carpeta está vacía. Como mis planes del fin de semana.</div>
}

const RENDERERS = {
  mipc: MiPcApp,
  notas: NotepadApp,
  frases: FrasesApp,
  snake: SnakeApp,
  acerca: AcercaApp,
  vacio: VacioApp,
}

function BootScreen({ onDone }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (step < BOOT_LINES.length) {
      const t = setTimeout(() => setStep((s) => s + 1), 300)
      return () => clearTimeout(t)
    }
    const t = setTimeout(onDone, 1700)
    return () => clearTimeout(t)
  }, [step, onDone])
  return (
    <div className="boot-screen">
      {BOOT_LINES.slice(0, step).map((l) => (
        <p key={l}>{l}</p>
      ))}
      {step >= BOOT_LINES.length && (
        <div className="boot-logo">
          <h1>☁️ AzureOS 95</h1>
          <div className="boot-bar">
            <div className="boot-bar-fill" />
          </div>
        </div>
      )}
    </div>
  )
}

function BsodScreen({ onReboot }) {
  useEffect(() => {
    const onAny = () => onReboot()
    window.addEventListener('keydown', onAny)
    return () => window.removeEventListener('keydown', onAny)
  }, [onReboot])
  return (
    <div className="bsod" onClick={onReboot} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onReboot()}>
      <div>
        <p className="bsod-title">AzureOS</p>
        <p>Ha ocurrido un problema y el sistema necesita reiniciarse. Lo sentimos 😅</p>
        <p>
          Código: <b>AZURE_KERNEL_PANIC_0x00000095</b>
        </p>
        <p className="bsod-blink">Presiona cualquier tecla o haz clic para reiniciar_</p>
      </div>
    </div>
  )
}

function OffScreen({ onPower }) {
  return (
    <div className="off-screen">
      <p>Es seguro apagar el equipo.</p>
      <button type="button" className="win95-btn power" onClick={onPower}>
        ⏻ Encender
      </button>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('boot')
  const [windows, setWindows] = useState([])
  const [startOpen, setStartOpen] = useState(false)
  const [menu, setMenu] = useState(null)
  const [bgIndex, setBgIndex] = useState(0)
  const [flicker, setFlicker] = useState(false)
  const zTop = useRef(10)
  const base = useRef({ x: 0, y: 0 })
  const now = useClock()

  const focusWindow = (id) => {
    zTop.current += 1
    const z = zTop.current
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z } : w)))
  }

  const openApp = (app) => {
    setStartOpen(false)
    setMenu(null)
    const exists = windows.find((w) => w.app === app)
    if (exists) {
      focusWindow(exists.id)
      return
    }
    const n = windows.length
    base.current = { x: (40 + n * 28) % 260, y: (24 + n * 24) % 160 }
    zTop.current += 1
    setWindows((ws) => [...ws, { id: `${app}-${Date.now()}`, app, x: base.current.x, y: base.current.y, z: zTop.current }])
  }

  const closeWindow = (id) => setWindows((ws) => ws.filter((w) => w.id !== id))
  const moveWindow = (id, x, y) => setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)))

  const crash = () => {
    setWindows([])
    setStartOpen(false)
    setScreen('bsod')
  }

  const reboot = () => {
    setWindows([])
    setScreen('boot')
  }

  const powerOff = () => {
    setWindows([])
    setStartOpen(false)
    setMenu(null)
    setScreen('off')
  }

  const refresh = () => {
    setFlicker(true)
    setTimeout(() => setFlicker(false), 280)
  }

  const openContextMenu = (e) => {
    e.preventDefault()
    setMenu({ x: Math.min(e.clientX, window.innerWidth - 190), y: Math.min(e.clientY, window.innerHeight - 180) })
  }

  if (screen === 'boot') return <BootScreen onDone={() => setScreen('os')} />
  if (screen === 'bsod') return <BsodScreen onReboot={reboot} />
  if (screen === 'off') return <OffScreen onPower={() => setScreen('boot')} />

  const icons = [
    { id: 'mipc', label: 'Mi PC', icon: '🖥️' },
    { id: 'notas', label: 'Bloc de notas', icon: '📝' },
    { id: 'frases', label: 'Frases Random', icon: '💬' },
    { id: 'snake', label: 'Snake.exe', icon: '🐍' },
  ]

  const hh = now ? String(now.getHours()).padStart(2, '0') : '--'
  const mm = now ? String(now.getMinutes()).padStart(2, '0') : '--'

  return (
    <div
      className={'desktop' + (flicker ? ' flicker' : '')}
      style={{ background: DESKTOP_BG[bgIndex] }}
      onContextMenu={openContextMenu}
      onClick={() => {
        setStartOpen(false)
        setMenu(null)
      }}
    >
      <div className="desktop-icons">
        {icons.map((ic) => (
          <button type="button" key={ic.id} className="desktop-icon" onClick={() => openApp(ic.id)}>
            <span className="icon-emoji">{ic.icon}</span>
            <span className="icon-label">{ic.label}</span>
          </button>
        ))}
      </div>

      {windows.map((w) => {
        const Content = RENDERERS[w.app]
        const extra = w.app === 'mipc' ? { onCrash: crash } : {}
        return (
          <RetroWindow
            key={w.id}
            win={w}
            baseX={w.x}
            baseY={w.y}
            onFocus={focusWindow}
            onClose={closeWindow}
            onMove={moveWindow}
          >
            <Content {...extra} />
          </RetroWindow>
        )
      })}

      {startOpen && (
        <div className="start-menu" onClick={(e) => e.stopPropagation()}>
          <div className="start-banner">
            <span>AzureOS 95</span>
          </div>
          <div className="start-items">
            {['mipc', 'notas', 'frases', 'snake'].map((a) => (
              <button type="button" key={a} onClick={() => openApp(a)}>
                {APPS[a].icon} {APPS[a].title.split(' — ')[0]}
              </button>
            ))}
            <div className="start-divider" />
            <button type="button" onClick={() => openApp('acerca')}>
              ℹ️ Acerca de AzureOS
            </button>
            <button type="button" onClick={reboot}>
              ♻️ Reiniciar
            </button>
            <button type="button" onClick={powerOff}>
              ⏻ Apagar equipo...
            </button>
          </div>
        </div>
      )}

      {menu && (
        <div
          className="context-menu"
          style={{ left: menu.x, top: menu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" onClick={refresh}>
            🔄 Actualizar
          </button>
          <button type="button" onClick={() => openApp('vacio')}>
            📁 Nueva carpeta
          </button>
          <button type="button" onClick={() => setBgIndex((i) => (i + 1) % DESKTOP_BG.length)}>
            🎨 Cambiar fondo
          </button>
          <button type="button" onClick={crash}>
            💀 Pantallazo azul
          </button>
        </div>
      )}

      <div className="taskbar" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={'start-btn' + (startOpen ? ' active' : '')}
          onClick={() => setStartOpen((v) => !v)}
        >
          ☁️ Inicio
        </button>
        <div className="taskbar-windows">
          {windows.map((w) => (
            <button type="button" key={w.id} className="taskbar-item" onClick={() => focusWindow(w.id)}>
              {APPS[w.app].icon} {APPS[w.app].title.split(' — ')[0]}
            </button>
          ))}
        </div>
        <div className="tray">
          <span>🔊</span>
          <span>📶</span>
          <span className="clock">
            {hh}:{mm}
          </span>
        </div>
      </div>
    </div>
  )
}
