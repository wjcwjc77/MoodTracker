// 创建示例心情图片的占位符
const moodTypes = ['cry', 'sad', 'angry', 'relax', 'pleasure', 'surprise', 'happy', 'excited'];

// 为每种心情创建一个简单的SVG图标作为占位符
const createMoodIcon = (mood: string, size: number = 60) => {
  const colors = {
    cry: '#FB8285',
    sad: '#81F9FF', 
    angry: '#FB83F7',
    relax: '#4FB2FF',
    pleasure: '#48FBD2',
    surprise: '#5DFA60',
    happy: '#5DFA60',
    excited: '#5DFA60'
  };

  const color = colors[mood as keyof typeof colors] || '#E1ECEE';
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="${color}" stroke="#000" stroke-width="2"/>
      <text x="${size/2}" y="${size/2+4}" text-anchor="middle" font-family="Arial" font-size="8" fill="#000">${mood}</text>
    </svg>
  `)}`;
};

export { createMoodIcon, moodTypes };