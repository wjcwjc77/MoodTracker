// 心情类型定义
export type MoodType = '狂喜' | '开心' | '还行' | '不爽' | '超烂' | null;

// 心情数据接口
export interface MoodData {
  [key: string]: MoodType; // key格式: "YYYY-MM-DD"
}

// 心情emoji映射
export const moodEmoji: { [key in Exclude<MoodType, null>]: string } = {
  '狂喜': '🤩',
  '开心': '😊',
  '还行': '😐',
  '不爽': '😞',
  '超烂': '😭'
};

// 心情颜色映射
export const moodColor: { [key in Exclude<MoodType, null>]: string } = {
  '狂喜': '#ff6b9d',
  '开心': '#feca57',
  '还行': '#48dbfb',
  '不爽': '#ff9ff3',
  '超烂': '#9c88ff'
};

