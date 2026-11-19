import { useState } from 'react'
import SelectPerson from './components/SelectPerson'
import GiftStep from './components/GiftStep'
import WishesStep from './components/WishesStep'
import CandleStep from './components/CandleStep'
import ClosingStep from './components/ClosingStep'
import QATestingPanel from './components/QATestingPanel'

const STEPS = ['select', 'gift', 'wishes', 'candle', 'closing']

export default function App() {
  const [currentStep, setCurrentStep] = useState('select')
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [mockDate, setMockDate] = useState(null)

  const theme = selectedPerson?.gender || 'female'
  const userName = selectedPerson?.name || ''

  const handleSelectPerson = (person) => {
    setSelectedPerson(person)
    setCurrentStep('gift')
  }

  const handleOpenGift = () => {
    setCurrentStep('wishes')
  }

  const handleWishesNext = () => {
    setCurrentStep('candle')
  }

  const handleCandleNext = () => {
    setCurrentStep('closing')
  }

  const handleRestart = () => {
    setCurrentStep('select')
    setSelectedPerson(null)
    setMockDate(null)
  }

  const stepIndex = STEPS.indexOf(currentStep)

  const femaleParticles = [
    { emoji: '💖', className: 'p1' },
    { emoji: '🌸', className: 'p2' },
    { emoji: '⭐', className: 'p3' },
    { emoji: '💗', className: 'p4' },
    { emoji: '✨', className: 'p5' },
  ]

  const maleParticles = [
    { emoji: '⚡', className: 'p1' },
    { emoji: '🌟', className: 'p2' },
    { emoji: '🚀', className: 'p3' },
    { emoji: '💫', className: 'p4' },
    { emoji: '✨', className: 'p5' },
  ]

  const particles = theme === 'female' ? femaleParticles : maleParticles

  return (
    <div className="sweet-app" data-theme={theme}>
      {/* Background ambient glows */}
      <div className="ambient-glow glow-top" />
      <div className="ambient-glow glow-bottom" />

      {/* Floating Particles */}
      <div className="ambient-particles" aria-hidden="true">
        {particles.map((p, i) => (
          <span key={i} className={`particle ${p.className}`}>{p.emoji}</span>
        ))}
      </div>

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

      {/* QC & QA Testing Console Widget */}
      <QATestingPanel
        currentStep={currentStep}
        onStepChange={(s) => setCurrentStep(s)}
        selectedPerson={selectedPerson}
        onPersonSelect={(p) => {
          setSelectedPerson(p)
          if (currentStep === 'select') {
            // keep on current or let them teleport
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
