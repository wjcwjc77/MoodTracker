import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import './MoodCalendar.css';
import MoodSelector from './MoodSelector';
import type { MoodType } from '../types/mood';
import { MOOD_CONFIG } from '../types/mood';
import { getMoodByDate, addMoodRecord, getRecentMoodData } from '../utils/moodStorage';

function MoodCalendar() {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);

  const calendarData = useMemo(() => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startOfWeek = startOfMonth.startOf('week');

    const firstWeekday = startOfMonth.day(); // 0 = Sunday, 1 = Monday, etc.
    const daysInMonth = endOfMonth.date();
    const totalCells = firstWeekday + daysInMonth;
    const weeksNeeded = Math.ceil(totalCells / 7);

    // 计算结束日期，确保有足够的行数
    const endOfWeek = startOfWeek.add(weeksNeeded * 7 - 1, 'day');

    const days = [];
    let current = startOfWeek;

    while (current.isBefore(endOfWeek) || current.isSame(endOfWeek, 'day')) {
      days.push(current);
      current = current.add(1, 'day');
    }

    return { days, weeksNeeded };
  }, [currentDate]);

  // 获取指定日期的心情数据
  const getMoodData = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    return getMoodByDate(dateStr);
  };

  // 强制刷新状态，用于触发重新渲染
  const [refreshKey, setRefreshKey] = useState(0);

  // 生成近7天心情曲线数据 - 添加依赖项以实现实时更新
  const recentMoodData = useMemo(() => {
    const recent7Days = getRecentMoodData(7);
    return recent7Days.map(data => ({
      date: dayjs(data.date).format('MM.DD'),
      score: data.score,
      color: data.score > 0 ? MOOD_CONFIG[data.mood].color : '#E1ECEE'
    }));
  }, [selectedDate, showMoodSelector, refreshKey]); // 添加refreshKey依赖项

  const getScoreColor = (score: number): string => {
    if (score === 0) return '#E1ECEE';
    if (score <= 2) return '#FB8285'; // 低分：红色系
    if (score <= 4) return '#4FB2FF'; // 中低分：蓝色系
    if (score <= 6) return '#48FBD2'; // 中高分：青色系
    return '#5DFA60'; 
  };

  const generateMoodLineSegments = (data: typeof recentMoodData) => {
    if (data.length === 0) return [];

    const segments: Array<{ path: string; color: string }> = [];

    const validData = data.map((item, index) => ({
      ...item,
      originalIndex: index,
      x: index * 33 + 16,
      y: 49 - Math.max(item.score * 6, 3)
    })).filter(item => item.score > 0);

    if (validData.length === 0) return segments;

    for (let i = 0; i < validData.length - 1; i++) {
      const startPoint = validData[i];
      const endPoint = validData[i + 1];

      const path = `M ${startPoint.x},${startPoint.y} L ${endPoint.x},${endPoint.y}`;
      const color = getScoreColor(startPoint.score);

      segments.push({ path, color });
    }

    return segments;
  };

  const handleDateClick = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    setSelectedDate(dateStr);
    setShowMoodSelector(true);
  };

  const handleMoodSelect = useCallback((mood: MoodType) => {
    const score = MOOD_CONFIG[mood].score;
    addMoodRecord(selectedDate, mood, score);
    setShowMoodSelector(false);
    setSelectedDate('');
    setRefreshKey(prev => prev + 1); // 触发重新渲染
  }, [selectedDate]);

  const handleClearMood = useCallback(() => {
    import('../utils/moodStorage').then(({ deleteMoodRecord }) => {
      deleteMoodRecord(selectedDate);
      setShowMoodSelector(false);
      setSelectedDate('');
      setRefreshKey(prev => prev + 1); // 触发重新渲染
    });
  }, [selectedDate]);

  // 关闭心情选择器
  const closeMoodSelector = useCallback(() => {
    setShowMoodSelector(false);
    setSelectedDate('');
  }, []);

  // 生成年份选项（过去三年和未来三年）
  const getYearOptions = () => {
    const currentYear = dayjs().year();
    const years = [];
    for (let i = currentYear - 3; i <= currentYear + 3; i++) {
      years.push(i);
    }
    return years;
  };

  // 生成月份选项
  const getMonthOptions = () => {
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  };

  // 跳转到今天
  const goToToday = () => {
    setCurrentDate(dayjs());
    setShowYearDropdown(false);
    setShowMonthDropdown(false);
  };

  // 选择年份
  const selectYear = (year: number) => {
    setCurrentDate(currentDate.year(year));
    setShowYearDropdown(false);
  };

  // 选择月份
  const selectMonth = (monthIndex: number) => {
    setCurrentDate(currentDate.month(monthIndex));
    setShowMonthDropdown(false);
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setShowYearDropdown(false);
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 渲染星期标题
  const renderWeekHeaders = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="calendar-week-header">
        {weekdays.map(day => (
          <div key={day} className="week-header-cell">
            {day}
          </div>
        ))}
      </div>
    );
  };

  // 渲染日期单元格
  const renderDateCell = (date: Dayjs) => {
    const isCurrentMonth = date.month() === currentDate.month();
    const isToday = date.isSame(dayjs(), 'day');
    const moodData = getMoodData(date);
    const isSuperMoodDay = moodData && moodData.mood === 'kissing';

    return (
      <div
        key={date.format('YYYY-MM-DD')}
        className={`calendar-date-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSuperMoodDay ? 'super-mood-day' : ''}`}
        onClick={() => handleDateClick(date)}
      >
        <div className="date-number">
          {isCurrentMonth ? date.format('DD') : date.format('MM.DD')}
        </div>
        <div className="mood-area">
          {moodData && (
            <div className="mood-display">
              <img
                src={new URL(`../assets/moods-show/${moodData.mood === 'excited' ? 'so-happy' : moodData.mood}.png`, import.meta.url).href}
                alt={MOOD_CONFIG[moodData.mood].label}
                className="mood-show-icon"
                onError={(e) => {
                  // 如果图片加载失败，使用SVG占位符
                  const target = e.target as HTMLImageElement;
                  import('../utils/moodIcons').then(({ createMoodIcon }) => {
                    target.src = createMoodIcon(moodData.mood, 30);
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染日历网格
  const renderCalendarGrid = () => {
    const weeks = [];
    for (let i = 0; i < calendarData.days.length; i += 7) {
      const week = calendarData.days.slice(i, i + 7);
      weeks.push(
        <div key={i} className="calendar-week-row">
          {week.map(date => renderDateCell(date))}
        </div>
      );
    }
    return weeks;
  };

  return (
    <div className="mood-calendar">
      {/* 顶部区域 */}
      <div className="calendar-header">
        <div className="header-left">
          <div className="date-info">
            <div className="year-selector" ref={yearDropdownRef}>
              <span
                className="year"
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowMonthDropdown(false);
                }}
              >
                {currentDate.format('YYYY')}
              </span>
              {showYearDropdown && (
                <div className="dropdown year-dropdown">
                  {getYearOptions().map(year => (
                    <div
                      key={year}
                      className={`dropdown-item ${year === currentDate.year() ? 'active' : ''}`}
                      onClick={() => selectYear(year)}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="month-selector" ref={monthDropdownRef}>
              <span
                className="month"
                onClick={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowYearDropdown(false);
                }}
              >
                {currentDate.format('MMMM')}
              </span>
              {showMonthDropdown && (
                <div className="dropdown month-dropdown">
                  {getMonthOptions().map((month, index) => (
                    <div
                      key={month}
                      className={`dropdown-item ${index === currentDate.month() ? 'active' : ''}`}
                      onClick={() => selectMonth(index)}
                    >
                      {month}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="today-btn" onClick={goToToday}>
              Today
            </button>
            <span className="subtitle">为你的每日心情盖戳～</span>
          </div>
        </div>

        <div className="header-right">
          <div className="mood-chart">
            <div className="chart-title">心情曲线</div>
            <div className="chart-content">
              <div className="y-axis">
                {[8, 6, 4, 2].map(score => (
                  <div key={score} className="y-axis-label">
                    {score}
                  </div>
                ))}
              </div>
              <div className="chart-area">
                <svg className="mood-line" viewBox="0 0 232 49">
                  {/* 绘制网格线 */}
                  <defs>
                    <pattern id="grid" width="33" height="6.125" patternUnits="userSpaceOnUse">
                      <path d="M 33 0 L 0 0 0 6.125" fill="none" stroke="#E1ECEE" strokeWidth="0.5" opacity="0.3" />
                    </pattern>
                  </defs>
                  <rect width="232" height="49" fill="url(#grid)" />

                  {/* 绘制多段折线图 - 根据心情分值使用不同颜色 */}
                  {generateMoodLineSegments(recentMoodData).map((segment, index) => (
                    <path
                      key={index}
                      d={segment.path}
                      stroke={segment.color}
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </svg>
                {recentMoodData.map((data, index) => (
                  <div
                    key={index}
                    className="mood-point"
                    style={{
                      left: `${index * 33 + 16}px`,
                      top: `${49 - Math.max(data.score * 6, 3)}px`,
                    }}
                  >
                    <div
                      className="point-outer"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: `2px solid ${data.score > 0 ? data.color : '#E1ECEE'}`
                      }}
                    >
                      <div
                        className="point-inner"
                        style={{ backgroundColor: data.score > 0 ? data.color : '#E1ECEE' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 日历主体 */}
      <div className="calendar-body">
        {renderWeekHeaders()}
        <div className="calendar-grid">
          {renderCalendarGrid()}
        </div>
      </div>

      {/* 心情选择器弹窗 */}
      <MoodSelector
        isOpen={showMoodSelector}
        onClose={closeMoodSelector}
        onSelect={handleMoodSelect}
        onClear={handleClearMood}
        selectedDate={selectedDate}
        currentMood={selectedDate ? getMoodByDate(selectedDate)?.mood : undefined}
      />
    </div>
  );
}

export default MoodCalendar;

