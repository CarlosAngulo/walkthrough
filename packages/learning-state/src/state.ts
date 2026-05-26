export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedAt: string;
}

export interface LearningState {
  progress: Record<string, 'locked' | 'active' | 'completed'>;
  achievements: Achievement[];
  score: number;
}

const STORAGE_KEY = 'learning_academy_state';

const DEFAULT_STATE: LearningState = {
  progress: {
    'nivel-1': 'active',
    'nivel-2': 'locked',
    'nivel-3': 'locked',
    'nivel-4': 'locked',
    'nivel-5': 'locked',
    'nivel-6': 'locked',
    'nivel-7': 'locked'
  },
  achievements: [],
  score: 0
};

export class LearningStateStore {
  private state: LearningState = { ...DEFAULT_STATE };
  private listeners: Array<(state: LearningState) => void> = [];

  constructor() {
    this.load();
  }

  getState(): LearningState {
    return this.state;
  }

  subscribe(listener: (state: LearningState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
    this.save();
  }

  private save() {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }
  }

  private load() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (data) {
        try {
          this.state = JSON.parse(data);
        } catch {
          this.state = { ...DEFAULT_STATE };
        }
      }
    }
  }

  completeLevel(levelId: string) {
    this.state.progress[levelId] = 'completed';
    
    // Unlock next level sequentially
    const levelsOrder = ['nivel-1', 'nivel-2', 'nivel-3', 'nivel-4', 'nivel-5', 'nivel-6', 'nivel-7'];
    const index = levelsOrder.indexOf(levelId);
    if (index !== -1 && index < levelsOrder.length - 1) {
      const nextLevelId = levelsOrder[index + 1];
      if (this.state.progress[nextLevelId] === 'locked') {
        this.state.progress[nextLevelId] = 'active';
      }
    }

    this.addScore(100);
    this.notify();
  }

  addAchievement(id: string, title: string, description: string, emoji: string) {
    if (this.state.achievements.some(a => a.id === id)) return;

    this.state.achievements.push({
      id,
      title,
      description,
      emoji,
      unlockedAt: new Date().toISOString()
    });
    
    this.addScore(50);
    this.notify();
  }

  addScore(points: number) {
    this.state.score += points;
    this.notify();
  }

  reset() {
    this.state = { ...DEFAULT_STATE, achievements: [] };
    this.notify();
  }
}

export const learningStateStore = new LearningStateStore();
