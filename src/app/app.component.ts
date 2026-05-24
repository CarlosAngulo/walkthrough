import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface Level {
  number: number;
  path: string;
  title: string;
  subtitle: string;
  status: 'done' | 'active' | 'locked';
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
              [routerLink]="level.path"
              routerLinkActive="active"
              class="level-card"
              [class.is-locked]="level.status === 'locked'"
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

        <div class="sidebar-footer">
          <div class="progress-info">
            <span class="progress-label">Progreso General</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 43%"></div>
            </div>
            <span class="progress-text">3 / 7 Niveles</span>
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

    .badge-done {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
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
export class AppComponent {
  levels: Level[] = [
    {
      number: 1,
      path: '/nivel-1',
      title: '1. Writable Signals',
      subtitle: 'signal(), input(), computed()',
      status: 'done',
      emoji: '⚡',
    },
    {
      number: 2,
      path: '/nivel-2',
      title: '2. Reactive Thinking',
      subtitle: 'Computed chains & derived state',
      status: 'done',
      emoji: '🧠',
    },
    {
      number: 3,
      path: '/nivel-3',
      title: '3. Effect Architecture',
      subtitle: 'effect(), onCleanup, localStorage',
      status: 'active',
      emoji: '💾',
    },
    {
      number: 4,
      path: '/nivel-4',
      title: '4. Reactive Architecture',
      subtitle: 'Services, output(), asReadonly()',
      status: 'locked',
      emoji: '🏗️',
    },
    {
      number: 5,
      path: '/nivel-5',
      title: '5. RxJS Boundaries',
      subtitle: 'toSignal(), toObservable()',
      status: 'locked',
      emoji: '🔄',
    },
    {
      number: 6,
      path: '/nivel-6',
      title: '6. Signal Stores',
      subtitle: 'DIY Store + @ngrx/signals',
      status: 'locked',
      emoji: '🗄️',
    },
    {
      number: 7,
      path: '/nivel-7',
      title: '7. Zone-less Angular',
      subtitle: 'OnPush, zoneless, afterRender',
      status: 'locked',
      emoji: '🚀',
    },
  ];
}
