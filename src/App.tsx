import './App.css'
import MoodCalendar from './components/MoodCalendar'

function App() {
  return (
    <div className="app">
      <MoodCalendar />
      <footer className="app-footer">
        <p className="footer-text">
          记录心情的节奏~
        </p>
      </footer>
    </div>
  )
}

export default App
