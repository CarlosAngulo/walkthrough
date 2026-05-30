import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { learningStateStore, LearningState } from '@learning-engine/learning-state';
import { overlaySystem } from '@learning-engine/overlay-system';
import { LearningEngineService } from './engine/services/learning-engine.service';
import { COURSE_METADATA } from './course/course-config';

interface Level {
  number: number;
  path: string;
  title: string;
  subtitle: string;
  status: 'done' | 'active' | 'locked' | 'completed';
  emoji: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  academyState = signal<LearningState>(learningStateStore.getState());
  private unsubscribeState?: () => void;
  isCopied = signal(false);
  courseMetadata = COURSE_METADATA;
  
  activeLevelNumber = computed(() => {
    const levelKey = this.learningEngineService.activeLevel();
    const found = this.courseMetadata.levels.find(l => l.statusKey === levelKey);
    return found ? found.number : 1;
  });

  activeTestCommand = computed(() => {
    return `pnpm test:l${this.activeLevelNumber()}`;
  });

  activeLevelPath = computed(() => {
    const levelKey = this.learningEngineService.activeLevel();
    const found = this.courseMetadata.levels.find(l => l.statusKey === levelKey);
    return found ? found.path : '/nivel-1';
  });

  testResults = computed(() => {
    const results = this.learningEngineService.testResults();
    const num = this.activeLevelNumber();
    return results.filter(file => file.filepath.includes(`level${num}`));
  });

  constructor(private learningEngineService: LearningEngineService) {}

  copyCommand(text: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.isCopied.set(true);
        setTimeout(() => this.isCopied.set(false), 2000);
      });
    }
  }

  resetProgress() {
    if (confirm('¿Estás seguro de que deseas reiniciar todo tu progreso y logros?')) {
      learningStateStore.reset();
      this.learningEngineService.triggerRefresh();
    }
  }

  ngOnInit() {
    this.unsubscribeState = learningStateStore.subscribe(state => {
      this.academyState.set({ ...state });
    });
  }

  ngOnDestroy() {
    if (this.unsubscribeState) {
      this.unsubscribeState();
    }
  }

  get completedCount() {
    return computed(() => {
      return Object.values(this.academyState().progress).filter(p => p === 'completed').length;
    });
  }

  get progressPercentage() {
    return computed(() => {
      const total = COURSE_METADATA.levels.length;
      return total > 0 ? (this.completedCount() / total) * 100 : 0;
    });
  }

  // Helper getters for Vitest sidebar integration
  hasTestResults(): boolean {
    const results = this.testResults();
    return results && results.length > 0 && results.some(f => f.tasks.length > 0);
  }

  getTotalTestsCount(): number {
    let count = 0;
    this.testResults().forEach(f => {
      count += f.tasks.length;
    });
    return count;
  }

  getPassedTestsCount(): number {
    let count = 0;
    this.testResults().forEach(f => {
      count += f.tasks.filter(t => t.status === 'pass').length;
    });
    return count;
  }

  getTestsProgressPercentage(): number {
    const total = this.getTotalTestsCount();
    if (total === 0) return 0;
    return (this.getPassedTestsCount() / total) * 100;
  }

  getGlobalTestStatus(): 'pass' | 'fail' | 'pending' {
    if (!this.hasTestResults()) return 'pending';
    
    let hasFail = false;
    let hasPass = false;
    
    this.testResults().forEach(f => {
      f.tasks.forEach(t => {
        if (t.status === 'fail') hasFail = true;
        if (t.status === 'pass') hasPass = true;
      });
    });

    if (hasFail) return 'fail';
    if (hasPass) return 'pass';
    return 'pending';
  }

  getGlobalTestStatusLabel(): string {
    const status = this.getGlobalTestStatus();
    if (status === 'pass') return 'Aprobado';
    if (status === 'fail') return 'Fallando';
    return 'Inactivo';
  }

  triggerTestPing() {
    // Force a fresh refresh request to seed WebSocket ping
    this.learningEngineService.triggerRefresh();
  }

  get levels(): Level[] {
    const storeProgress = this.academyState().progress;
    return this.courseMetadata.levels.map(l => ({
      number: l.number,
      path: l.path,
      title: l.title,
      subtitle: l.subtitle,
      status: (storeProgress[l.statusKey] || 'locked') as 'done' | 'active' | 'locked' | 'completed',
      emoji: l.emoji
    }));
  }
}
