import './App.css'
import './styles/animations.css'
import MoodCalendar from './components/MoodCalendar'

function App() {
  return (
    <div className="app">
      <div className="main-container">
        <div className="app-title">
          Mood Tracker
        </div>
        
        <div className="content-area">
          <MoodCalendar />
        </div>
        
        <div className="divider-section">
          <div className="divider-line divider-line-left" />
          <div className="divider-dot" />
          <div className="divider-text">
            你的心流 · 你的节奏 ·
          </div>
          <div className="divider-dot" />
          <div className="divider-line divider-line-right" />
        </div>
      </div>
    </div>
  )
}

export default App
