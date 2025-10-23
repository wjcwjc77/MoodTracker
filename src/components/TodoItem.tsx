import React, { useState } from 'react';
import type { TodoData } from '../types/advanced';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import './TodoItem.css';

interface TodoItemProps {
  todo: TodoData;
  onToggle: (todoId: string) => void;
  onEdit: (todoId: string, newContent: string) => void;
  onDelete: (todoId: string) => void;
  onLock: (todoId: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onEdit,
  onDelete,
  onLock
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(todo.content);
  const [showToast, setShowToast] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 当 todo.content 变化时，同步更新 editContent
  React.useEffect(() => {
    setEditContent(todo.content);
  }, [todo.content]);

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent.trim() !== todo.content) {
      onEdit(todo.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(todo.content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleToggleClick = () => {
    // 如果任务已锁定，不允许取消勾选
    if (todo.locked && todo.completed) {
      setShowToast(true);
      return;
    }
    
    // 如果是要标记为完成，显示确认对话框
    if (!todo.completed) {
      setShowConfirmDialog(true);
    } else {
      // 如果是要取消完成，直接执行
      onToggle(todo.id);
    }
  };

  const handleConfirmComplete = () => {
    setShowConfirmDialog(false);
    onToggle(todo.id);
    onLock(todo.id);
  };

  const handleCancelComplete = () => {
    setShowConfirmDialog(false);
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  return (
    <>
      <div className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.locked ? 'locked' : ''}`}>
        <div className="todo-content">
          <button
            className={`todo-checkbox ${todo.completed ? 'checked' : ''} ${todo.locked ? 'locked' : ''}`}
            onClick={handleToggleClick}
            aria-label={todo.completed ? '标记为未完成' : '标记为已完成'}
            disabled={todo.locked && todo.completed}
          >
            {todo.completed && (
              <svg className="check-icon" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
              </svg>
            )}
            {todo.locked && (
              <svg className="lock-icon" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              </svg>
            )}
          </button>
        
        {isEditing ? (
          <input
            type="text"
            className="todo-edit-input"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyPress}
            maxLength={100}
            autoFocus
            disabled={todo.locked}
          />
        ) : (
          <span 
            className={`todo-text ${todo.completed ? 'completed-text' : ''} ${todo.locked ? 'locked-text' : ''}`}
            onClick={() => !todo.locked && setIsEditing(true)}
          >
            {todo.content}
          </span>
        )}
      </div>
      
      <div className="todo-actions">
        {!isEditing && !todo.locked && (
          <>
            <button
              className="todo-action-btn edit-btn"
              onClick={() => setIsEditing(true)}
              aria-label="编辑"
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
              </svg>
            </button>
            <button
              className="todo-action-btn delete-btn"
              onClick={() => onDelete(todo.id)}
              aria-label="删除"
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>

    {/* Toast 提示 */}
    {showToast && (
      <Toast
        message="该任务已锁定，无法修改"
        type="warning"
        onClose={handleCloseToast}
      />
    )}

    {/* 确认对话框 */}
    <ConfirmDialog
      isOpen={showConfirmDialog}
      title="确认完成任务"
      message="完成后该任务将被锁定，无法再次修改或删除。确定要完成这个任务吗？"
      confirmText="确认完成"
      cancelText="取消"
      onConfirm={handleConfirmComplete}
      onCancel={handleCancelComplete}
    />
  </>
  );
};

export default TodoItem;