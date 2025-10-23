import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import type { TodoData } from '../types/advanced';
import { 
  getTodosByDate, 
  addTodo, 
  updateTodo, 
  deleteTodo, 
  toggleTodoCompletion,
  getCompletedTodoCount 
} from '../utils/todoStorage';
import { 
  getRandomRewardTodo, 
  canAddMoreTodos, 
  getTodoLimitInfo 
} from '../utils/unlockSystem';
import './TodoManager.css';

interface TodoManagerProps {
  date: string;
  onUnlockChange?: (completedCount: number) => void;
}

const TodoManager: React.FC<TodoManagerProps> = ({ date, onUnlockChange }) => {
  const [todos, setTodos] = useState<TodoData[]>([]);
  const [newTodoContent, setNewTodoContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 加载指定日期的 Todo 列表
  useEffect(() => {
    const loadTodos = () => {
      try {
        const todosForDate = getTodosByDate(date);
        setTodos(todosForDate);
        
        // 通知父组件解锁状态变化
        const completedCount = getCompletedTodoCount(date);
        onUnlockChange?.(completedCount);
      } catch (error) {
        console.error('Error loading todos:', error);
        setError('加载 Todo 列表失败');
      }
    };

    loadTodos();
  }, [date, onUnlockChange]);

  // 添加新的 Todo
  const handleAddTodo = async () => {
    if (!newTodoContent.trim()) {
      setError('Todo 内容不能为空');
      return;
    }

    if (!canAddMoreTodos(date)) {
      setError('每日最多只能添加 5 个 Todo');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newTodo = addTodo(date, newTodoContent);
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      setNewTodoContent('');
      setIsAdding(false);
      
      // 通知解锁状态变化
      const completedCount = getCompletedTodoCount(date);
      onUnlockChange?.(completedCount);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加随机 Todo
  const handleAddRandomTodo = async () => {
    if (!canAddMoreTodos(date)) {
      setError('每日最多只能添加 5 个 Todo');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const randomContent = getRandomRewardTodo(todos);
      const newTodo = addTodo(date, randomContent);
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      
      // 通知解锁状态变化
      const completedCount = getCompletedTodoCount(date);
      onUnlockChange?.(completedCount);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // 切换 Todo 完成状态
  const handleToggleTodo = async (todoId: string) => {
    setError(null);
    
    try {
      const updatedTodo = toggleTodoCompletion(date, todoId);
      const updatedTodos = todos.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      );
      setTodos(updatedTodos);
      
      // 通知解锁状态变化
      const completedCount = getCompletedTodoCount(date);
      onUnlockChange?.(completedCount);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // 锁定 Todo
  const handleLockTodo = async (todoId: string) => {
    setError(null);
    
    try {
      const updatedTodo = updateTodo(date, todoId, { locked: true });
      const updatedTodos = todos.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      );
      setTodos(updatedTodos);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // 编辑 Todo
  const handleEditTodo = async (todoId: string, newContent: string) => {
    setError(null);
    
    try {
      const updatedTodo = updateTodo(date, todoId, { content: newContent });
      const updatedTodos = todos.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      );
      setTodos(updatedTodos);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // 删除 Todo
  const handleDeleteTodo = async (todoId: string) => {
    setError(null);
    
    try {
      deleteTodo(date, todoId);
      const updatedTodos = todos.filter(todo => todo.id !== todoId);
      setTodos(updatedTodos);
      
      // 通知解锁状态变化
      const completedCount = getCompletedTodoCount(date);
      onUnlockChange?.(completedCount);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTodoContent('');
      setError(null);
    }
  };

  const limitInfo = getTodoLimitInfo(date);
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="todo-manager">
      <div className="todo-header">
        <h3 className="todo-title">今日todo</h3>
        <div className="todo-stats">
          <span className="todo-count">
            {completedCount}/{todos.length} 已完成
          </span>
          <span className="todo-limit">
            {limitInfo.current}/{limitInfo.max}
          </span>
        </div>
      </div>

      {error && (
        <div className="todo-error">
          {error}
        </div>
      )}

      <div className="todo-list">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggleTodo}
            onEdit={handleEditTodo}
            onDelete={handleDeleteTodo}
            onLock={handleLockTodo}
          />
        ))}
        
        {todos.length === 0 && (
          <div className="todo-empty">
            <p>还没有任务，添加一个开始吧！</p>
          </div>
        )}
      </div>

      <div className="">
        {isAdding ? (
          <div className="add-todo-form">
            <input
              type="text"
              className="add-todo-input"
              placeholder="输入新的 Todo..."
              value={newTodoContent}
              onChange={(e) => setNewTodoContent(e.target.value)}
              onKeyDown={handleKeyPress}
              maxLength={100}
              autoFocus
              disabled={isLoading}
            />
            <div className="add-todo-buttons">
              <button
                className="add-todo-btn confirm"
                onClick={handleAddTodo}
                disabled={isLoading || !newTodoContent.trim()}
              >
                {isLoading ? '添加中...' : '确认'}
              </button>
              <button
                className="add-todo-btn cancel"
                onClick={() => {
                  setIsAdding(false);
                  setNewTodoContent('');
                  setError(null);
                }}
                disabled={isLoading}
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="todo-action-buttons">
            <button
              className="action-btn add-btn"
              onClick={() => setIsAdding(true)}
              disabled={!limitInfo.canAdd || isLoading}
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              添加任务
            </button>
            
            <button
              className="action-btn random-btn"
              onClick={handleAddRandomTodo}
              disabled={!limitInfo.canAdd || isLoading}
              title="随机添加一个奖励性质的任务"
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
              </svg>
              随机任务
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoManager;