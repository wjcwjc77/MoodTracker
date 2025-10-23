import type { MoodData, MoodType } from '../types/mood';

const STORAGE_KEY = 'mood-tracker-data';

// 获取所有心情数据
export const getMoodData = (): MoodData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading mood data from localStorage:', error);
    return [];
  }
};

// 保存心情数据
export const saveMoodData = (moodData: MoodData[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moodData));
  } catch (error) {
    console.error('Error saving mood data to localStorage:', error);
  }
};

// 添加或更新心情记录
export const addMoodRecord = (date: string, mood: MoodType, score: number): void => {
  const allData = getMoodData();
  const existingIndex = allData.findIndex(item => item.date === date);
  
  const newRecord: MoodData = {
    date,
    mood,
    score,
    timestamp: Date.now(),
  };

  if (existingIndex >= 0) {
    // 更新现有记录
    allData[existingIndex] = newRecord;
  } else {
    // 添加新记录
    allData.push(newRecord);
  }

  saveMoodData(allData);
};

// 获取指定日期的心情记录
export const getMoodByDate = (date: string): MoodData | undefined => {
  const allData = getMoodData();
  return allData.find(item => item.date === date);
};

// 删除指定日期的心情记录
export const deleteMoodRecord = (date: string): void => {
  const allData = getMoodData();
  const filteredData = allData.filter(item => item.date !== date);
  saveMoodData(filteredData);
};

// 获取最近N天的心情数据
export const getRecentMoodData = (days: number): MoodData[] => {
  const allData = getMoodData();
  const today = new Date();
  const recentDates: string[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    recentDates.push(date.toISOString().split('T')[0]);
  }
  
  return recentDates.map(date => {
    const moodData = allData.find(item => item.date === date);
    return moodData || { date, mood: 'relax' as MoodType, score: 0, timestamp: 0 };
  });
};