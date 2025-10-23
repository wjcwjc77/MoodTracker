import React, { useState, useEffect, useCallback } from 'react';
import type { MoodType } from '../types/mood';
import type { UnlockStatus } from '../types/advanced';
import { MOOD_CONFIG, ALL_MOOD_OPTIONS } from '../types/mood';
import TodoManager from './TodoManager';
import Toast from './Toast';
import { 
  calculateUnlockStatus, 
  isMoodUnlocked, 
  validateMoodSelection,
} from '../utils/unlockSystem';
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
  const [unlockStatus, setUnlockStatus] = useState<UnlockStatus | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 更新解锁状态
  const updateUnlockStatus = () => {
    const status = calculateUnlockStatus(selectedDate);
    setUnlockStatus(status);
  };

  // 初始化和日期变化时更新解锁状态
  useEffect(() => {
    if (isOpen) {
      updateUnlockStatus();
    }
  }, [isOpen, selectedDate]);

  const handleTodoUnlockChange = useCallback(() => {
    updateUnlockStatus();
  }, []);
  
  
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
  
    const handleMoodSelect = (mood: MoodType) => {
      const validation = validateMoodSelection(selectedDate, mood);
      if (!validation.valid) {
        setToastMessage(validation.reason || '该心情暂未解锁');
        return;
      }
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

    if (!isOpen) return null;


  return (
    <>
      <div className="mood-selector-overlay" onClick={handleOverlayClick}>
        <div className="mood-selector-modal enhanced">
          <div className="mood-selector-header">
            <h3 className="mood-selector-title">选择心情</h3>
            <p className="mood-selector-date">{formatDate(selectedDate)}</p>
            <button className="mood-selector-close" onClick={onClose}>
              ×
            </button>
          </div>
          
          
          
          <div className="mood-selector-content">
            <div className="mood-panel">
              <div className="mood-options-grid">
                {ALL_MOOD_OPTIONS.map((mood) => {
                  const isUnlocked = unlockStatus ? isMoodUnlocked(selectedDate, mood) : false;
                  const isSuperMood = mood === 'kissing';
                  
                  return (
                    <div
                      key={mood}
                      className={`mood-option ${currentMood === mood ? 'selected' : ''} ${
                        !isUnlocked ? 'locked' : ''
                      } ${isSuperMood ? 'super-mood' : ''}`}
                      onClick={() => handleMoodSelect(mood)}
                      title={!isUnlocked ? '该心情暂未解锁' : MOOD_CONFIG[mood].label}
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
                            }).catch(() => {
                              // 如果 moodIcons 模块不存在，使用简单的文本替代
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `<div style="font-size: 40px;">${mood === 'cry' ? '😢' : mood === 'sad' ? '😔' : mood === 'angry' ? '😠' : mood === 'relax' ? '😌' : mood === 'pleasure' ? '😊' : mood === 'surprise' ? '😲' : mood === 'happy' ? '😄' : mood === 'excited' ? '🤩' : mood === 'kissing' ? '😘' : '😐'}</div>`;
                            });
                          }}
                        />
                        {!isUnlocked && (
                          <div className="lock-overlay">
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="mood-label">{MOOD_CONFIG[mood].label}</span>
                    </div>
                  );
                })}
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
            
            <div className="todo-panel">
              <TodoManager 
                date={selectedDate}
                onUnlockChange={handleTodoUnlockChange}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast 提示 */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="warning"
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
};

export default MoodSelector;