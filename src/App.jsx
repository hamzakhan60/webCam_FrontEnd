import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AuthPage from './pages/Auth'
import FocusMeet from './focusMeet'
import MeetingOrganizer from './pages/organizerScreen'
import AttendeeScreen from './pages/AttendeeScreen'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/focus-meet" element={<FocusMeet />} />
        <Route path='/organizer' element={<MeetingOrganizer/>} />
        <Route path="/attendee" element={<AttendeeScreen/>} />
      </Routes>
    </Router>
  )
}

export default App
