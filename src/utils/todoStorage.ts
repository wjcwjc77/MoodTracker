import type { TodoData, TodoStorageData } from '../types/advanced';
import { STORAGE_KEYS } from '../types/advanced';

// 获取所有 Todo 数据
export const getAllTodos = (): TodoStorageData => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TODO_DATA);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading todo data from localStorage:', error);
    return {};
  }
};

// 获取指定日期的 Todo 列表
export const getTodosByDate = (date: string): TodoData[] => {
  const allTodos = getAllTodos();
  return allTodos[date] || [];
};

// 保存 Todo 数据
export const saveTodoData = (todoData: TodoStorageData): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TODO_DATA, JSON.stringify(todoData));
  } catch (error) {
    console.error('Error saving todo data to localStorage:', error);
    throw new Error('保存 Todo 数据失败，请检查存储空间');
  }
};

// 保存指定日期的 Todo 列表
export const saveTodosByDate = (date: string, todos: TodoData[]): void => {
  const allTodos = getAllTodos();
  if (todos.length === 0) {
    // 如果 Todo 列表为空，删除该日期的记录
    delete allTodos[date];
  } else {
    allTodos[date] = todos;
  }
  saveTodoData(allTodos);
};

// 生成唯一的 Todo ID
export const generateTodoId = (): string => {
  return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 添加新的 Todo
export const addTodo = (date: string, content: string): TodoData => {
  const todos = getTodosByDate(date);
  
  // 检查是否超过每日限制
  if (todos.length >= 5) {
    throw new Error('每日最多只能添加 5 个 Todo');
  }
  
  // 检查内容是否为空
  if (!content.trim()) {
    throw new Error('Todo 内容不能为空');
  }
  
  // 检查内容长度
  if (content.length > 100) {
    throw new Error('Todo 内容不能超过 100 个字符');
  }
  
  const newTodo: TodoData = {
    id: generateTodoId(),
    date,
    content: content.trim(),
    completed: false,
    timestamp: Date.now()
  };
  
  const updatedTodos = [...todos, newTodo];
  saveTodosByDate(date, updatedTodos);
  
  return newTodo;
};

// 更新 Todo
export const updateTodo = (date: string, todoId: string, updates: Partial<Pick<TodoData, 'content' | 'completed' | 'locked'>>): TodoData => {
  const todos = getTodosByDate(date);
  const todoIndex = todos.findIndex(todo => todo.id === todoId);
  
  if (todoIndex === -1) {
    throw new Error('Todo 不存在');
  }
  
  // 如果任务已锁定，不允许修改内容
  if (todos[todoIndex].locked && updates.content !== undefined) {
    throw new Error('该任务已锁定，无法修改');
  }
  
  // 如果更新内容，进行验证
  if (updates.content !== undefined) {
    if (!updates.content.trim()) {
      throw new Error('Todo 内容不能为空');
    }
    if (updates.content.length > 100) {
      throw new Error('Todo 内容不能超过 100 个字符');
    }
    updates.content = updates.content.trim();
  }
  
  const updatedTodo = {
    ...todos[todoIndex],
    ...updates,
    timestamp: Date.now()
  };
  
  const updatedTodos = [...todos];
  updatedTodos[todoIndex] = updatedTodo;
  
  saveTodosByDate(date, updatedTodos);
  
  return updatedTodo;
};

// 删除 Todo
export const deleteTodo = (date: string, todoId: string): void => {
  const todos = getTodosByDate(date);
  const todo = todos.find(todo => todo.id === todoId);
  
  if (!todo) {
    throw new Error('Todo 不存在');
  }
  
  // 如果任务已锁定，不允许删除
  if (todo.locked) {
    throw new Error('该任务已锁定，无法删除');
  }
  
  const filteredTodos = todos.filter(todo => todo.id !== todoId);
  saveTodosByDate(date, filteredTodos);
};

// 切换 Todo 完成状态
export const toggleTodoCompletion = (date: string, todoId: string): TodoData => {
  const todos = getTodosByDate(date);
  const todo = todos.find(todo => todo.id === todoId);
  
  if (!todo) {
    throw new Error('Todo 不存在');
  }
  
  // 如果任务已锁定且已完成，不允许取消完成
  if (todo.locked && todo.completed) {
    throw new Error('该任务已锁定，无法修改');
  }
  
  return updateTodo(date, todoId, { completed: !todo.completed });
};

// 获取指定日期已完成的 Todo 数量
export const getCompletedTodoCount = (date: string): number => {
  const todos = getTodosByDate(date);
  return todos.filter(todo => todo.completed).length;
};

// 清除指定日期的所有 Todo
export const clearTodosByDate = (date: string): void => {
  saveTodosByDate(date, []);
};

// 获取最近 N 天的 Todo 统计
export const getRecentTodoStats = (days: number): Array<{ date: string; total: number; completed: number }> => {
  const today = new Date();
  const stats = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const todos = getTodosByDate(dateStr);
    const completed = todos.filter(todo => todo.completed).length;
    
    stats.push({
      date: dateStr,
      total: todos.length,
      completed
    });
  }
  
  return stats;
};

// 数据迁移和清理
export const cleanupOldTodos = (daysToKeep: number = 30): void => {
  const allTodos = getAllTodos();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
  
  const cleanedTodos: TodoStorageData = {};
  
  Object.keys(allTodos).forEach(date => {
    if (date >= cutoffDateStr) {
      cleanedTodos[date] = allTodos[date];
    }
  });
  
  saveTodoData(cleanedTodos);
};