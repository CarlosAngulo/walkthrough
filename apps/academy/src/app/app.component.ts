import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { learningStateStore, LearningState } from '@learning-engine/learning-state';
import { overlaySystem } from '@learning-engine/overlay-system';

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
  template: `
    <div class="academy-layout">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-logo">🧬</span>
          <div class="brand-text">
            <h1 class="brand-title">Signals Academy</h1>
            <span class="brand-sub">Test-Driven Learning</span>
          </div>
        </div>

        <nav class="nav-levels">
          @for (level of levels; track level.path) {
            <a
              [routerLink] class="level-card"
              [class.active]="activeLevelPath === level.path"
              [class.is-locked]="level.status === 'locked'"
              [routerLink]="level.status !== 'locked' ? level.path : null"
            >
              <span class="level-badge" [class]="'badge-' + level.status">
                {{ level.emoji }}
              </span>
              <div class="level-info">
                <strong>{{ level.title }}</strong>
                <small>{{ level.subtitle }}</small>
              </div>
              @if (level.status === 'locked') {
                <span class="lock-icon">🔒</span>
              }
            </a>
          }
        </nav>

        <!-- Logros Desbloqueados -->
        @if (academyState().achievements.length > 0) {
          <div class="achievements-section">
            <span class="progress-label">Logros Desbloqueados</span>
            <div class="achievements-list">
              @for (ach of academyState().achievements; track ach.id) {
                <div class="ach-badge" [title]="ach.description">
                  <span class="ach-emoji">{{ ach.emoji }}</span>
                  <div class="ach-info">
                    <strong>{{ ach.title }}</strong>
                    <small>¡Desbloqueado!</small>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <div class="sidebar-footer">
          <div class="progress-info">
            <span class="progress-label">Progreso General</span>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progressPercentage()"></div>
            </div>
            <span class="progress-text">{{ completedCount() }} / 7 Niveles ({{ academyState().score }} pts)</span>
          </div>
        </div>
      </aside>

      <main class="content-viewport">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
    }

    .academy-layout {
      display: flex;
      height: 100%;
      width: 100%;
      background-color: #0c0d14;
      color: #f3f4f6;
    }

    /* ─── Sidebar ─── */
    .sidebar {
      width: 280px;
      min-width: 280px;
      height: 100vh;
      background: rgba(12, 13, 20, 0.85);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      overflow-y: auto;
      position: sticky;
      top: 0;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      margin-bottom: 2rem;
    }

    .brand-logo {
      font-size: 2rem;
      filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.4));
    }

    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.2;
    }

    .brand-sub {
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #9ca3af;
    }

    /* ─── Navigation Levels ─── */
    .nav-levels {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      flex: 1;
    }

    .level-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0.75rem;
      border-radius: 12px;
      text-decoration: none;
      color: #d1d5db;
      transition: all 0.2s ease;
      position: relative;
      border: 1px solid transparent;
      cursor: pointer;
    }

    .level-card:hover:not(.is-locked) {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.06);
    }

    .level-card.active {
      background: rgba(168, 85, 247, 0.1);
      border-color: rgba(168, 85, 247, 0.25);
      color: #f3f4f6;
    }

    .level-card.active .level-badge {
      box-shadow: 0 0 12px rgba(168, 85, 247, 0.4);
    }

    .level-card.is-locked {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }

    .level-badge {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
      transition: box-shadow 0.2s ease;
    }

    .badge-completed {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }

    .badge-active {
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .badge-locked {
      background: rgba(107, 114, 128, 0.1);
      border: 1px solid rgba(107, 114, 128, 0.2);
    }

    .level-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .level-info strong {
      font-family: 'Outfit', sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .level-info small {
      font-size: 0.7rem;
      color: #6b7280;
      margin-top: 1px;
    }

    .lock-icon {
      margin-left: auto;
      font-size: 0.8rem;
    }

    /* ─── Achievements Section ─── */
    .achievements-section {
      margin-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 1rem;
      margin-bottom: 1.5rem;
    }

    .achievements-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.5rem;
      max-height: 150px;
      overflow-y: auto;
    }

    .ach-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.5rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      font-size: 0.75rem;
    }

    .ach-emoji {
      font-size: 1.1rem;
      filter: drop-shadow(0 0 4px rgba(168, 85, 247, 0.3));
    }

    .ach-info strong {
      display: block;
      font-size: 0.72rem;
      font-weight: 600;
      color: #e5e7eb;
    }

    .ach-info small {
      font-size: 0.65rem;
      color: #22c55e;
    }

    /* ─── Sidebar Footer / Progress ─── */
    .sidebar-footer {
      margin-top: auto;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .progress-info {
      padding: 0 0.5rem;
    }

    .progress-label {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b7280;
      display: block;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 999px;
      margin: 0.5rem 0;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #a855f7, #ec4899);
      border-radius: 999px;
      transition: width 0.5s ease;
    }

    .progress-text {
      font-size: 0.72rem;
      color: #9ca3af;
    }

    /* ─── Main Viewport ─── */
    .content-viewport {
      flex: 1;
      overflow-y: auto;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      min-height: 100vh;
    }

    /* ─── Responsive ─── */
    @media (max-width: 768px) {
      .academy-layout {
        flex-direction: column;
      }

      .sidebar {
        width: 100%;
        min-width: 100%;
        height: auto;
        position: relative;
        flex-direction: row;
        flex-wrap: wrap;
        padding: 1rem;
        gap: 0.5rem;
      }

      .brand {
        margin-bottom: 0.5rem;
        width: 100%;
      }

      .nav-levels {
        flex-direction: row;
        overflow-x: auto;
        gap: 0.25rem;
        width: 100%;
        padding-bottom: 0.5rem;
      }

      .level-card {
        min-width: max-content;
        padding: 0.5rem 0.6rem;
      }

      .level-info small {
        display: none;
      }

      .sidebar-footer {
        display: none;
      }

      .content-viewport {
        min-height: auto;
        padding: 1rem;
      }
    }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  academyState = signal<LearningState>(learningStateStore.getState());
  private unsubscribeState?: () => void;
  activeLevelPath = '/nivel-1';

  ngOnInit() {
    this.unsubscribeState = learningStateStore.subscribe(state => {
      this.academyState.set({ ...state });
    });

    // Establish Vite HMR WebSocket handshake in dev mode
    if ((import.meta as any).hot) {
      const hot = (import.meta as any).hot;
      
      // Delay slightly to ensure angular app is bootstraped and anchors are in DOM
      setTimeout(() => {
        hot.send('learning-engine:ping');
      }, 500);

      hot.on('learning-engine:status', (data: any) => {
        overlaySystem.update(data.evaluations);
        
        if (data.isValid) {
          // Add achievement and mark level 1 completed
          learningStateStore.addAchievement(
            'L1_SIGNALS',
            'Writable Signals Master ⚡',
            'Declaraste con éxito writable, input y computed signals.',
            '⚡'
          );
          learningStateStore.completeLevel('nivel-1');
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeState) {
      this.unsubscribeState();
    }
    overlaySystem.destroy();
  }

  get completedCount() {
    return computed(() => {
      return Object.values(this.academyState().progress).filter(p => p === 'completed').length;
    });
  }

  get progressPercentage() {
    return computed(() => {
      const total = Object.keys(this.academyState().progress).length;
      return (this.completedCount() / total) * 100;
    });
  }

  get levels(): Level[] {
    const storeProgress = this.academyState().progress;
    return [
      {
        number: 1,
        path: '/nivel-1',
        title: '1. Writable Signals',
        subtitle: 'signal(), input(), computed()',
        status: storeProgress['nivel-1'] || 'locked',
        emoji: '⚡',
      },
      {
        number: 2,
        path: '/nivel-2',
        title: '2. Reactive Thinking',
        subtitle: 'Computed chains & derived state',
        status: storeProgress['nivel-2'] || 'locked',
        emoji: '🧠',
      },
      {
        number: 3,
        path: '/nivel-3',
        title: '3. Effect Architecture',
        subtitle: 'effect(), onCleanup, localStorage',
        status: storeProgress['nivel-3'] || 'locked',
        emoji: '💾',
      },
      {
        number: 4,
        path: '/nivel-4',
        title: '4. Reactive Architecture',
        subtitle: 'Services, output(), asReadonly()',
        status: storeProgress['nivel-4'] || 'locked',
        emoji: '🏗️',
      },
      {
        number: 5,
        path: '/nivel-5',
        title: '5. RxJS Boundaries',
        subtitle: 'toSignal(), toObservable()',
        status: storeProgress['nivel-5'] || 'locked',
        emoji: '🔄',
      },
      {
        number: 6,
        path: '/nivel-6',
        title: '6. Signal Stores',
        subtitle: 'DIY Store + @ngrx/signals',
        status: storeProgress['nivel-6'] || 'locked',
        emoji: '🗄️',
      },
      {
        number: 7,
        path: '/nivel-7',
        title: '7. Zone-less Angular',
        subtitle: 'OnPush, zoneless, afterRender',
        status: storeProgress['nivel-7'] || 'locked',
        emoji: '🚀',
      },
    ];
  }
}
