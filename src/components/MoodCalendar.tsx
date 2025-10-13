import dayjs from 'dayjs';

import './MoodCalendar.css';
import logo from '../assets/moo-tracker-logo.png';

function MoodCalendar() {
  const today = dayjs().format('YYYY-MM-DD');
  const todayWeek = dayjs(today).format('dddd');

  return (
    <div className="mood-calendar">
      <div className="calendar-header">
        <img width="36" height="36" src={logo} alt="logo" />
        <h1 className="calendar-title">Mood Tracker</h1>
        <div className="calendar-today">{today}，{todayWeek}</div>
      </div>

      <div className="calendar-body">
        <div>这里开发日历功能</div>
      </div>
    </div>
  );
}

export default MoodCalendar;

