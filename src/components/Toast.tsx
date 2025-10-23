import React, { useEffect, useState } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'warning', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 延迟显示，触发入场动画
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    // 自动隐藏
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 等待退场动画完成
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const handleClick = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-visible' : ''}`} onClick={handleClick}>
      <div className="toast-content">
        <div className="toast-icon">
          {type === 'warning' && '⚠️'}
          {type === 'error' && '❌'}
          {type === 'info' && 'ℹ️'}
          {type === 'success' && '✅'}
        </div>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={handleClick}>×</button>
      </div>
    </div>
  );
};

export default Toast;