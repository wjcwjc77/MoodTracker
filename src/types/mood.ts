// 心情类型定义
export type MoodType = 'cry' | 'sad' | 'angry' | 'relax' | 'pleasure' | 'surprise' | 'happy' | 'excited';

// 心情数据接口
export interface MoodData {
  date: string;
  mood: MoodType;
  score: number;
  timestamp: number;
}

// 心情配置
export const MOOD_CONFIG: Record<MoodType, { score: number; label: string; color: string }> = {
  cry: { score: 1, label: '哭哭', color: '#FB8285' },
  sad: { score: 2, label: '伤心', color: '#81F9FF' },
  angry: { score: 3, label: '生气', color: '#FB83F7' },
  relax: { score: 4, label: '轻松', color: '#4FB2FF' },
  pleasure: { score: 5, label: '愉悦', color: '#48FBD2' },
  surprise: { score: 6, label: '惊喜', color: '#5DFA60' },
  happy: { score: 7, label: '开心', color: '#5DFA60' },
  excited: { score: 8, label: '狂喜', color: '#5DFA60' },
};

// 心情选项列表
export const MOOD_OPTIONS: MoodType[] = ['cry', 'sad', 'angry', 'relax', 'pleasure', 'surprise', 'happy', 'excited'];