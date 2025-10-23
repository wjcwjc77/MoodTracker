// 心情类型定义 - 添加超级心情 kissing
export type MoodType = 'cry' | 'sad' | 'angry' | 'relax' | 'pleasure' | 'surprise' | 'happy' | 'excited' | 'kissing';

// 心情数据接口
export interface MoodData {
  date: string;
  mood: MoodType;
  score: number;
  timestamp: number;
}

// 心情配置 - 添加超级心情 kissing 配置
export const MOOD_CONFIG: Record<MoodType, { score: number; label: string; color: string }> = {
  cry: { score: 1, label: '哭哭', color: '#FB8285' },
  sad: { score: 2, label: '伤心', color: '#81F9FF' },
  angry: { score: 3, label: '生气', color: '#FB83F7' },
  relax: { score: 4, label: '轻松', color: '#4FB2FF' },
  pleasure: { score: 5, label: '愉悦', color: '#48FBD2' },
  surprise: { score: 6, label: '惊喜', color: '#5DFA60' },
  happy: { score: 7, label: '开心', color: '#5DFA60' },
  excited: { score: 8, label: '狂喜', color: '#5DFA60' },
  kissing: { score: 9, label: '超级心情', color: '#FF8C00' }, // 超级心情，橙色主题
};

// 心情选项列表 - 添加超级心情，但通常不在常规选项中显示，需要特殊解锁
export const MOOD_OPTIONS: MoodType[] = ['cry', 'sad', 'angry', 'relax', 'pleasure', 'surprise', 'happy', 'excited'];

// 所有心情选项（包括超级心情）
export const ALL_MOOD_OPTIONS: MoodType[] = ['cry', 'sad', 'angry', 'relax', 'pleasure', 'surprise', 'happy', 'excited', 'kissing'];