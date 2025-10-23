import type { MoodType } from './mood';

// Todo 数据接口
export interface TodoData {
  id: string;
  date: string; // YYYY-MM-DD 格式
  content: string;
  completed: boolean;
  locked?: boolean; // 是否锁定（完成确认后无法修改）
  timestamp: number;
}

// 日记数据接口
export interface DiaryData {
  date: string; // YYYY-MM-DD 格式
  content: string;
  timestamp: number;
}

// 解锁状态接口
export interface UnlockStatus {
  date: string;
  completedTodos: number;
  unlockedMoods: MoodType[];
}

// 扩展的心情数据接口
export interface ExtendedMoodData {
  date: string;
  mood: MoodType;
  score: number;
  timestamp: number;
  isSuperMood?: boolean; // 是否为超级心情
}

// Todo 存储数据格式
export interface TodoStorageData {
  [date: string]: TodoData[];
}

// 日记存储数据格式
export interface DiaryStorageData {
  [date: string]: DiaryData;
}

// 解锁状态缓存格式
export interface UnlockStatusCache {
  [date: string]: UnlockStatus;
}

// 存储键值常量
export const STORAGE_KEYS = {
  MOOD_DATA: 'mood-tracker-data',
  TODO_DATA: 'mood-tracker-todos',
  DIARY_DATA: 'mood-tracker-diaries',
  UNLOCK_STATUS: 'mood-tracker-unlock-status'
} as const;

// 解锁规则常量
export const UNLOCK_RULES = {
  BASE_MOODS: ['cry', 'sad', 'angry', 'relax'] as MoodType[],
  UNLOCK_SEQUENCE: [
    { requiredTodos: 1, mood: 'pleasure' as MoodType },
    { requiredTodos: 2, mood: 'surprise' as MoodType },
    { requiredTodos: 3, mood: 'happy' as MoodType },
    { requiredTodos: 4, mood: 'excited' as MoodType },
    { requiredTodos: 5, mood: 'kissing' as MoodType }
  ],
  // SUPER_MOOD: 'kissing' as MoodType,
  MAX_TODOS_PER_DAY: 5
} as const;

// 奖励性质的 Todo 内容库
export const REWARD_TODOS = [
  // 休闲娱乐类
  '今晚九点之前下班，然后去便利店买点零食和一瓶饮料',
  '玩一个小时的游戏或者看一个小时的游戏直播',
  
  // 美食享受类
  '写一篇日记，不要写任何关于工作的内容，纯记录自己的感悟想法或者八卦',
  '回家的路上顺便买点水果',
  
  // 运动健康类
  '睡觉前深蹲20次',
  
  // 学习成长类
  '整理房间',
  '认真听完一期播客，并记录下几个让你有启发的观点。',

  // 社交互动类
  '给最好的朋友发个问候消息',
  '和家人聊天',
  '制作歌单，根据你最近的心情，创建一个新的播放列表，并为它起个名字。'
  
  // 自我关爱类
] as const;

// Todo 操作类型
export type TodoAction = 'add' | 'edit' | 'delete' | 'toggle' | 'random';

// 日记操作类型
export type DiaryAction = 'save' | 'delete' | 'edit';

// 解锁提示信息类型
export interface UnlockHint {
  type: 'todo' | 'diary';
  message: string;
  requiredCount?: number;
  currentCount?: number;
}