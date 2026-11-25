import { useState, useEffect } from 'react'
import DashboardNavbar from './components/DashboardNavbar'
import DashboardSidebarLeft from './components/DashboardSidebarLeft'
import DashboardSidebarRight from './components/DashboardSidebarRight'
import SelectPerson from './components/SelectPerson'
import GiftStep from './components/GiftStep'
import WishesStep from './components/WishesStep'
import CandleStep from './components/CandleStep'
import ClosingStep from './components/ClosingStep'
import QATestingPanel from './components/QATestingPanel'
import SettingsModal from './components/SettingsModal'
import GuestbookModal from './components/GuestbookModal'
import SplashScreen from './components/SplashScreen'

const STEPS = ['select', 'candle', 'wishes', 'gift', 'closing']

export default function App() {
  const [currentStep, setCurrentStep] = useState('select')
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [mockDate, setMockDate] = useState(null)
  const [mobileTab, setMobileTab] = useState('stage') // 'stage' | 'circle' | 'console'
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isGuestbookOpen, setIsGuestbookOpen] = useState(false)
  const [particlesEnabled, setParticlesEnabled] = useState(true)
  const [showSplash, setShowSplash] = useState(true)

  // Color scheme state: 'system' | 'light' | 'dark'
  const [colorMode, setColorMode] = useState(() => {
    try {
      const stored = localStorage.getItem('color-scheme')
      if (stored === 'dark' || stored === 'light') return stored
    } catch {
      // ignore
    }
    return 'system'
  })

  // System OS theme detection
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // Listen to OS scheme changes and multi-tab storage events
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMediaChange = (e) => {
      setSystemPrefersDark(e.matches)
    }

    const handleStorageChange = (e) => {
      if (e.key === 'color-scheme') {
        if (e.newValue === 'dark' || e.newValue === 'light') {
          setColorMode(e.newValue)
        } else {
          setColorMode('system')
        }
      }
    }

    mql.addEventListener('change', handleMediaChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      mql.removeEventListener('change', handleMediaChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Resolved effective mode: 'dark' or 'light'
  const resolvedMode = colorMode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : colorMode

  // Sync with document element and <meta name="color-scheme">
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-color-mode', resolvedMode)
      const meta = document.querySelector('meta[name="color-scheme"]')
      if (meta) {
        meta.content = colorMode === 'system' ? 'light dark' : colorMode
      }
    } catch (err) {
      console.warn('Failed to sync color-scheme', err)
    }
  }, [resolvedMode, colorMode])

  const handleSetColorMode = (mode) => {
    setColorMode(mode)
    try {
      if (mode === 'system') {
        localStorage.removeItem('color-scheme')
      } else {
        localStorage.setItem('color-scheme', mode)
      }
    } catch (err) {
      console.warn('Failed to persist color-scheme', err)
    }
  }

  const handleToggleColorMode = () => {
    const nextMode = resolvedMode === 'dark' ? 'light' : 'dark'
    handleSetColorMode(nextMode)
  }

  const theme = selectedPerson?.gender || 'female'
  const userName = selectedPerson?.name || ''

  const goToStep = (step) => {
    const targetIdx = STEPS.indexOf(step)
    if (targetIdx !== -1) {
      setCurrentStep(step)
      setMaxUnlockedIndex((prev) => Math.max(prev, targetIdx))
    }
  }

  const handleSelectPerson = (person) => {
    setSelectedPerson(person)
    goToStep('candle')
    setMobileTab('stage')
  }

  const handleCandleNext = () => {
    goToStep('wishes')
  }

  const handleWishesNext = () => {
    goToStep('gift')
  }

  const handleOpenGift = () => {
    goToStep('closing')
  }

  const handleRestart = () => {
    setCurrentStep('select')
    setSelectedPerson(null)
    setMockDate(null)
    setMobileTab('stage')
    setMaxUnlockedIndex(0)
  }

  const stepIndex = STEPS.indexOf(currentStep)

  const femaleParticles = [
    { emoji: '🌸', className: 'p1' },
    { emoji: '🍓', className: 'p2' },
    { emoji: '🍰', className: 'p3' },
    { emoji: '💖', className: 'p4' },
    { emoji: '✨', className: 'p5' },
  ]

  const maleParticles = [
    { emoji: '🍃', className: 'p1' },
    { emoji: '🍵', className: 'p2' },
    { emoji: '🧁', className: 'p3' },
    { emoji: '🤍', className: 'p4' },
    { emoji: '✨', className: 'p5' },
  ]

  const particles = theme === 'female' ? femaleParticles : maleParticles

  return (
    <div className="sweet-app" data-theme={theme} data-color-mode={resolvedMode}>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {/* Background ambient glows */}
      <div className="ambient-glow glow-top" />
      <div className="ambient-glow glow-bottom" />

      {/* Floating Particles */}
      {particlesEnabled && (
        <div className="ambient-particles" aria-hidden="true">
          {particles.map((p, i) => (
            <span key={i} className={`particle ${p.className}`}>{p.emoji}</span>
          ))}
        </div>
      )}

      <div className="dashboard-wrapper">
        {/* Modern Top Header / Navbar */}
        <DashboardNavbar
          currentStep={currentStep}
          stepIndex={stepIndex}
          steps={STEPS}
          onOpenGuestbook={() => setIsGuestbookOpen(true)}
          theme={theme}
          selectedPerson={selectedPerson}
          mockDate={mockDate}
          onReset={handleRestart}
          onStepChange={(s) => {
            const targetIdx = STEPS.indexOf(s)
            if (targetIdx <= maxUnlockedIndex) {
              setCurrentStep(s)
            }
          }}
          maxUnlockedIndex={maxUnlockedIndex}
          resolvedMode={resolvedMode}
          onToggleColorMode={handleToggleColorMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Mobile Navigation Segment Pills (visible only on small screens) */}
        <div className="mobile-dash-tabs" role="tablist" aria-label="Navigasi Dashboard Mobile">
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'stage'}
            className={`dash-tab-btn ${mobileTab === 'stage' ? 'is-active' : ''}`}
            onClick={() => setMobileTab('stage')}
          >
            <span>✨ Panggung</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'circle'}
            className={`dash-tab-btn ${mobileTab === 'circle' ? 'is-active' : ''}`}
            onClick={() => setMobileTab('circle')}
          >
            <span>👥 Circle (12)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'console'}
            className={`dash-tab-btn ${mobileTab === 'console' ? 'is-active' : ''}`}
            onClick={() => setMobileTab('console')}
          >
            <span>🎧 Audio & Info</span>
          </button>
        </div>

        {/* Modern 3-Column Bento Dashboard Grid Layout */}
        <div className="dashboard-grid">
          {/* Left Column: Birthday Timeline & Sahabat Roster */}
          <div className={`grid-col col-left ${mobileTab === 'circle' ? 'mobile-visible' : ''}`}>
            <DashboardSidebarLeft
              selectedPerson={selectedPerson}
              onSelectPerson={handleSelectPerson}
              onHighlightPerson={(person) => {
                // Only highlight/preview — do NOT navigate to surprise steps
                setSelectedPerson(person)
              }}
              mockDate={mockDate}
              currentStep={currentStep}
            />
          </div>

          {/* Center Column: The Main Celebration Stage */}
          <div className={`grid-col col-center ${mobileTab === 'stage' ? 'mobile-visible' : ''}`}>
            <div className="app-container">
              {/* Step Progress Indicators */}
              <div className="step-indicators">
                {STEPS.map((step, idx) => (
                  <div
                    key={step}
                    className={`step-dot ${idx === stepIndex ? 'active' : idx < stepIndex ? 'completed' : ''}`}
                    title={`Tahap ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Dynamic Content */}
              <main className="step-content">
                {currentStep === 'select' && (
                  <SelectPerson onSelectPerson={handleSelectPerson} mockDate={mockDate} />
                )}

                {currentStep === 'gift' && (
                  <GiftStep userName={userName} person={selectedPerson} onOpen={handleOpenGift} />
                )}

                {currentStep === 'wishes' && (
                  <WishesStep userName={userName} person={selectedPerson} onNext={handleWishesNext} />
                )}

                {currentStep === 'candle' && (
                  <CandleStep userName={userName} person={selectedPerson} onNext={handleCandleNext} />
                )}

                {currentStep === 'closing' && (
                  <ClosingStep userName={userName} person={selectedPerson} onRestart={handleRestart} />
                )}
              </main>
            </div>
          </div>

          {/* Right Column: Audio & Ambience Console + Profile & Quotes */}
          <div className={`grid-col col-right ${mobileTab === 'console' ? 'mobile-visible' : ''}`}>
            <DashboardSidebarRight
              selectedPerson={selectedPerson}
              currentStep={currentStep}
              mockDate={mockDate}
              resolvedMode={resolvedMode}
              onToggleColorMode={handleToggleColorMode}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal (Theme, Audio, Visuals) */}
      <GuestbookModal
        isOpen={isGuestbookOpen}
        onClose={() => setIsGuestbookOpen(false)}
        selectedPerson={selectedPerson}
        mockDate={mockDate}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        colorMode={colorMode}
        resolvedMode={resolvedMode}
        onSetColorMode={handleSetColorMode}
        particlesEnabled={particlesEnabled}
        onToggleParticles={() => setParticlesEnabled((prev) => !prev)}
        theme={theme}
        selectedPerson={selectedPerson}
      />

      {/* QC & QA Testing Console Widget */}
      <QATestingPanel
        currentStep={currentStep}
        onStepChange={(s) => goToStep(s)}
        selectedPerson={selectedPerson}
        onPersonSelect={(p) => {
          setSelectedPerson(p)
          if (currentStep === 'select') {
            goToStep('candle')
          }
        }}
        theme={theme}
        mockDate={mockDate}
        onMockDateChange={(d) => setMockDate(d)}
        onReset={handleRestart}
      />
    </div>
  )
}
