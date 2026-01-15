type GameHistory = {
  gameName: string;
  level: number;
  score: number;
  stars: number;
  completedAt: string;
};

const HISTORY_KEY = 'childgame-history';

export function saveGameResult(result: Omit<GameHistory, 'completedAt'>) {
  const history = getGameHistory();
  const newEntry: GameHistory = {
    ...result,
    completedAt: new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  // Thêm vào đầu danh sách (mới nhất trước)
  history.unshift(newEntry);
  
  // Chỉ giữ 50 kết quả gần nhất
  const limitedHistory = history.slice(0, 50);
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
}

export function getGameHistory(): GameHistory[] {
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function clearGameHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function getGameStats() {
  const history = getGameHistory();
  const totalGames = history.length;
  const totalScore = history.reduce((sum, game) => sum + game.score, 0);
  const totalStars = history.reduce((sum, game) => sum + game.stars, 0);
  const averageScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
  
  // Thống kê theo game
  const gameStats = history.reduce((acc, game) => {
    if (!acc[game.gameName]) {
      acc[game.gameName] = { count: 0, totalScore: 0, totalStars: 0, maxLevel: 0 };
    }
    acc[game.gameName].count++;
    acc[game.gameName].totalScore += game.score;
    acc[game.gameName].totalStars += game.stars;
    acc[game.gameName].maxLevel = Math.max(acc[game.gameName].maxLevel, game.level);
    return acc;
  }, {} as Record<string, { count: number; totalScore: number; totalStars: number; maxLevel: number }>);
  
  return {
    totalGames,
    totalScore,
    totalStars,
    averageScore,
    gameStats
  };
}