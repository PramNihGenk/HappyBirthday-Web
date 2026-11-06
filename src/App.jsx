import { useState } from 'react'
import NameStep from './components/NameStep'
import GiftStep from './components/GiftStep'
import WishesStep from './components/WishesStep'
import CandleStep from './components/CandleStep'
import ClosingStep from './components/ClosingStep'

const STEPS = ['name', 'gift', 'wishes', 'candle', 'closing']

export default function App() {
  const [currentStep, setCurrentStep] = useState('name')
  const [userName, setUserName] = useState('')

  const handleNameSubmit = (name) => {
    setUserName(name)
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
    setCurrentStep('gift') // Let them keep their name or restart with gift
  }

  const stepIndex = STEPS.indexOf(currentStep)

  return (
    <div className="sweet-app">
      {/* Background soft ambient gradient & glow */}
      <div className="ambient-glow glow-top" />
      <div className="ambient-glow glow-bottom" />

      {/* Floating Sparkles in Background */}
      <div className="ambient-particles" aria-hidden="true">
        <span className="particle p1">✨</span>
        <span className="particle p2">🌸</span>
        <span className="particle p3">⭐</span>
        <span className="particle p4">🌷</span>
        <span className="particle p5">✨</span>
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

        {/* Dynamic Content based on currentStep */}
        <main className="step-content">
          {currentStep === 'name' && (
            <NameStep onNext={handleNameSubmit} />
          )}

          {currentStep === 'gift' && (
            <GiftStep userName={userName} onOpen={handleOpenGift} />
          )}

          {currentStep === 'wishes' && (
            <WishesStep userName={userName} onNext={handleWishesNext} />
          )}

          {currentStep === 'candle' && (
            <CandleStep userName={userName} onNext={handleCandleNext} />
          )}

          {currentStep === 'closing' && (
            <ClosingStep userName={userName} onRestart={handleRestart} />
          )}
        </main>
      </div>
    </div>
  )
}
