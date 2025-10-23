import React from 'react';
import type { MoodType } from '../types/mood';
import { MOOD_CONFIG, MOOD_OPTIONS } from '../types/mood';
import './MoodSelector.css';

interface MoodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mood: MoodType) => void;
  onClear?: () => void;
  selectedDate: string;
  currentMood?: MoodType;
  
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  onClear,
  selectedDate,
  currentMood
}) => {
  if (!isOpen) return null;

  const handleMoodSelect = (mood: MoodType) => {
    onSelect(mood);
    onClose();
  };

  const handleClearMood = () => {
    if (onClear) {
      onClear();
    }
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mood-selector-overlay" onClick={handleOverlayClick}>
      <div className="mood-selector-modal">
        <div className="mood-selector-header">
          <h3 className="mood-selector-title">选择心情</h3>
          <p className="mood-selector-date">{formatDate(selectedDate)}</p>
          <button className="mood-selector-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="mood-selector-content">
          <div className="mood-options-grid">
            {MOOD_OPTIONS.map((mood) => (
              <div
                key={mood}
                className={`mood-option ${currentMood === mood ? 'selected' : ''}`}
                onClick={() => handleMoodSelect(mood)}
              >
                <div className="mood-icon">
                  <img
                    src={new URL(`../assets/moods-select/${mood === 'excited' ? 'so-happy' : mood}.png`, import.meta.url).href}
                    alt={MOOD_CONFIG[mood].label}
                    onError={(e) => {
                      // 如果图片加载失败，使用SVG占位符
                      const target = e.target as HTMLImageElement;
                      import('../utils/moodIcons').then(({ createMoodIcon }) => {
                        target.src = createMoodIcon(mood, 60);
                      });
                    }}
                  />
                </div>
                <span className="mood-label">{MOOD_CONFIG[mood].label}</span>
              </div>
            ))}
          </div>
          
          {/* 清除心情按钮 */}
          {currentMood && (
            <div className="mood-actions">
              <button 
                className="clear-mood-btn"
                onClick={handleClearMood}
              >
                清除心情记录
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodSelector;