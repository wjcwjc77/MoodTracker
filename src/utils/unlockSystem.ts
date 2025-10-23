import type { MoodType } from '../types/mood';
import type { TodoData, UnlockStatus } from '../types/advanced';
import { UNLOCK_RULES, REWARD_TODOS } from '../types/advanced';
import { getTodosByDate, getCompletedTodoCount } from './todoStorage';

// 计算指定日期的解锁状态
export const calculateUnlockStatus = (date: string): UnlockStatus => {
  const completedTodos = getCompletedTodoCount(date);
  
  // 基础心情始终可用
  const unlockedMoods: MoodType[] = [...UNLOCK_RULES.BASE_MOODS];
  
  // 根据完成的 Todo 数量解锁心情
  UNLOCK_RULES.UNLOCK_SEQUENCE.forEach(rule => {
    if (completedTodos >= rule.requiredTodos) {
      unlockedMoods.push(rule.mood);
    }
  });
  
  return {
    date,
    completedTodos,
    unlockedMoods
  };
};

// 获取可用的心情选项
export const getAvailableMoods = (date: string): MoodType[] => {
  const unlockStatus = calculateUnlockStatus(date);
  return unlockStatus.unlockedMoods;
};

// 检查指定心情是否已解锁
export const isMoodUnlocked = (date: string, mood: MoodType): boolean => {
  const availableMoods = getAvailableMoods(date);
  return availableMoods.includes(mood);
};


// 获取解锁下一个心情所需的 Todo 数量
export const getNextUnlockRequirement = (date: string): { mood: MoodType; required: number; current: number } | null => {
  const completedTodos = getCompletedTodoCount(date);
  
  // 查找下一个可解锁的心情
  for (const rule of UNLOCK_RULES.UNLOCK_SEQUENCE) {
    if (completedTodos < rule.requiredTodos) {
      return {
        mood: rule.mood,
        required: rule.requiredTodos,
        current: completedTodos
      };
    }
  }
  
  return null; // 所有心情都已解锁
};

// 获取解锁提示信息
export const getUnlockHints = (date: string): Array<{ type: 'todo' | 'diary'; message: string; progress?: string }> => {
  const hints = [];
  
  // Todo 解锁提示
  const nextRequirement = getNextUnlockRequirement(date);
  if (nextRequirement) {
    const remaining = nextRequirement.required - nextRequirement.current;
    hints.push({
      type: 'todo' as const,
      message: `完成 ${remaining} 个 Todo 解锁「${getMoodLabel(nextRequirement.mood)}」心情`,
      progress: `${nextRequirement.current}/${nextRequirement.required}`
    });
  }
  
  
  return hints;
};

// 获取心情标签
const getMoodLabel = (mood: MoodType): string => {
  const moodLabels: Record<MoodType, string> = {
    cry: '哭哭',
    sad: '伤心', 
    angry: '生气',
    relax: '轻松',
    pleasure: '愉悦',
    surprise: '惊喜',
    happy: '开心',
    excited: '狂喜',
    kissing: '超级心情'
  };
  return moodLabels[mood] || mood;
};

// 随机获取一个奖励性质的 Todo
export const getRandomRewardTodo = (existingTodos: TodoData[]): string => {
  const existingContents = existingTodos.map(todo => todo.content);
  const availableTodos = REWARD_TODOS.filter(todo => !existingContents.includes(todo));
  
  // 如果所有预设 Todo 都已存在，从全部中随机选择
  if (availableTodos.length === 0) {
    return REWARD_TODOS[Math.floor(Math.random() * REWARD_TODOS.length)];
  }
  
  return availableTodos[Math.floor(Math.random() * availableTodos.length)];
};

// 检查是否可以添加更多 Todo
export const canAddMoreTodos = (date: string): boolean => {
  const todos = getTodosByDate(date);
  return todos.length < UNLOCK_RULES.MAX_TODOS_PER_DAY;
};

// 获取 Todo 添加限制信息
export const getTodoLimitInfo = (date: string): { current: number; max: number; canAdd: boolean } => {
  const todos = getTodosByDate(date);
  const current = todos.length;
  const max = UNLOCK_RULES.MAX_TODOS_PER_DAY;
  
  return {
    current,
    max,
    canAdd: current < max
  };
};

// 验证心情选择是否有效
export const validateMoodSelection = (date: string, mood: MoodType): { valid: boolean; reason?: string } => {
  const availableMoods = getAvailableMoods(date);
  
  if (!availableMoods.includes(mood)) {
    // 检查是否是需要 Todo 解锁的心情
    const nextRequirement = getNextUnlockRequirement(date);
    if (nextRequirement && nextRequirement.mood === mood) {
      const remaining = nextRequirement.required - nextRequirement.current;
      return {
        valid: false,
        reason: `需要完成 ${remaining} 个 Todo 才能解锁「${getMoodLabel(mood)}」心情`
      };
    }
    
    
    return {
      valid: false,
      reason: `「${getMoodLabel(mood)}」心情暂未解锁`
    };
  }
  
  return { valid: true };
};

export const getUnlockProgress = (date: string): { 
  todoProgress: { completed: number; total: number; percentage: number };
  totalUnlocked: number;
  totalAvailable: number;
} => {
  const unlockStatus = calculateUnlockStatus(date);
  const maxTodos = UNLOCK_RULES.MAX_TODOS_PER_DAY;
  
  return {
    todoProgress: {
      completed: unlockStatus.completedTodos,
      total: maxTodos,
      percentage: Math.round((unlockStatus.completedTodos / maxTodos) * 100)
    },
    totalUnlocked: unlockStatus.unlockedMoods.length,
    totalAvailable: UNLOCK_RULES.BASE_MOODS.length + UNLOCK_RULES.UNLOCK_SEQUENCE.length + 1 // +1 for super mood
  };
};

export const resetUnlockStatus = (date: string): void => {
  console.log(`Reset unlock status for ${date} - this is calculated dynamically`);
};