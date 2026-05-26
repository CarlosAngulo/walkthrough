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
  template: `
    <div class="academy-layout">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-logo">{{ courseMetadata.logo }}</span>
          <div class="brand-text">
            <h1 class="brand-title">{{ courseMetadata.title }}</h1>
            <span class="brand-sub">{{ courseMetadata.subtitle }}</span>
          </div>
        </div>

        <nav class="nav-levels">
          @for (level of levels; track level.path) {
            <a
              [routerLink] class="level-card"
              [class.active]="activeLevelPath() === level.path"
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
            <span class="progress-text">{{ completedCount() }} / {{ courseMetadata.levels.length }} Niveles ({{ academyState().score }} pts)</span>
          </div>
        </div>
      </aside>

      <main class="content-viewport">
        <router-outlet />
      </main>

      <!-- ─── Panel Lateral de Unit Tests en Tiempo Real 🧪 ─── -->
      <aside class="test-panel-sidebar">
        <div class="test-header">
          <div class="test-title-row">
            <span class="test-icon">🧪</span>
            <div>
              <h2 class="test-title">Pruebas Unitarias</h2>
              <span class="test-subtitle">Feedback de Vitest</span>
            </div>
          </div>
          <span class="status-indicator" [class]="getGlobalTestStatus()">
            {{ getGlobalTestStatusLabel() }}
          </span>
        </div>

        <!-- Barra de Progreso del Nivel -->
        @if (hasTestResults()) {
          <div class="test-progress-box">
            <div class="progress-header">
              <span>Retos Aprobados</span>
              <strong>{{ getPassedTestsCount() }} / {{ getTotalTestsCount() }}</strong>
            </div>
            <div class="test-progress-bar">
              <div class="test-progress-fill" [style.width.%]="getTestsProgressPercentage()"></div>
            </div>
          </div>
        }

        <!-- Listado de Tests -->
        <div class="test-list-container">
          @if (!hasTestResults()) {
            <!-- Estado Vacío: Esperando por Vitest -->
            <div class="tests-empty-state">
              <div class="empty-glow-icon">🔬</div>
              <h3>Test Runner Inactivo</h3>
              <p>Para ver el estado de tus retos en esta pantalla en tiempo real, ejecuta el comando de pruebas en tu terminal:</p>
              <div class="cmd-box">
                <code>{{ activeTestCommand() }}</code>
                <div class="cmd-actions">
                  <button class="btn-copy" [class.success]="isCopied()" (click)="copyCommand(activeTestCommand())" title="Copiar comando">
                    {{ isCopied() ? '✓ Copiado' : '📋 Copiar' }}
                  </button>
                  <button class="btn-copy-mock" (click)="triggerTestPing()">Verificar</button>
                </div>
              </div>
              <small class="empty-hint">El reporter transmitirá los resultados al instante mediante WebSockets al guardar archivos.</small>
            </div>
          } @else {
            @for (file of testResults(); track file.filepath) {
              <div class="test-file-card">
                <div class="file-header">
                  <span class="file-icon">📄</span>
                  <span class="file-name">{{ file.name }}</span>
                </div>
                <div class="file-tasks">
                  @for (task of file.tasks; track task.name) {
                    <div class="task-row" [class]="task.status">
                      <div class="task-status-indicator">
                        @if (task.status === 'pass') {
                          <span class="task-chk">🟢</span>
                        } @else if (task.status === 'fail') {
                          <span class="task-chk">🔴</span>
                        } @else {
                          <span class="task-chk">⚪</span>
                        }
                      </div>
                      <div class="task-details">
                        <div class="task-name-text">{{ task.name }}</div>
                        @if (task.status === 'fail' && task.error) {
                          <div class="task-error-box">
                            {{ task.error }}
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>
      </aside>
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
      overflow: hidden;
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

    /* ─── Test Panel Sidebar Styles (Glassmorphism & Rich Aesthetics) ─── */
    .test-panel-sidebar {
      width: 320px;
      min-width: 320px;
      height: 100vh;
      background: rgba(12, 13, 20, 0.85);
      backdrop-filter: blur(32px);
      -webkit-backdrop-filter: blur(32px);
      border-left: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1.25rem;
      overflow-y: auto;
      position: sticky;
      top: 0;
    }

    .test-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .test-title-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .test-icon {
      font-size: 1.6rem;
      filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.4));
    }

    .test-title {
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: #f3f4f6;
      margin: 0;
      line-height: 1.2;
    }

    .test-subtitle {
      font-size: 0.65rem;
      color: #9ca3af;
      font-weight: 500;
    }

    .status-indicator {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }

    .status-indicator.pass {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #4ade80;
    }

    .status-indicator.fail {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #f87171;
    }

    .status-indicator.pending {
      background: rgba(156, 163, 175, 0.1);
      border: 1px solid rgba(156, 163, 175, 0.2);
      color: #9ca3af;
    }

    /* ─── Test Progress Box ─── */
    .test-progress-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 0.75rem 0.9rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: #e5e7eb;
      margin-bottom: 0.4rem;
    }

    .progress-header strong {
      font-family: 'Outfit', sans-serif;
      color: #a855f7;
    }

    .test-progress-bar {
      width: 100%;
      height: 5px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 99px;
      overflow: hidden;
    }

    .test-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #a855f7, #6366f1);
      border-radius: 99px;
      transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* ─── Test Empty State ─── */
    .tests-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2.5rem 1rem;
      flex: 1;
      justify-content: center;
    }

    .empty-glow-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.3));
      animation: pulse-glow 2s infinite alternate;
    }

    @keyframes pulse-glow {
      0% { transform: scale(0.95); opacity: 0.8; }
      100% { transform: scale(1.05); opacity: 1; }
    }

    .tests-empty-state h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: #f3f4f6;
      margin-bottom: 0.5rem;
    }

    .tests-empty-state p {
      font-size: 0.72rem;
      color: #9ca3af;
      line-height: 1.4;
      margin-bottom: 1.5rem;
    }

    .cmd-box {
      display: flex;
      align-items: center;
      background: rgba(12, 13, 20, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.4rem 0.65rem;
      border-radius: 8px;
      width: 100%;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .cmd-box code {
      font-family: 'Fira Code', monospace;
      font-size: 0.75rem;
      color: #38bdf8;
    }

    .btn-copy-mock {
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
      color: #c084fc;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.25rem 0.55rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-copy-mock:hover {
      background: rgba(168, 85, 247, 0.25);
      border-color: rgba(168, 85, 247, 0.4);
    }

    .cmd-actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-copy {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #9ca3af;
      font-size: 0.62rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .btn-copy:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #f3f4f6;
      border-color: rgba(255, 255, 255, 0.15);
    }

    .btn-copy.success {
      background: rgba(34, 197, 94, 0.15);
      border-color: rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }

    .empty-hint {
      font-size: 0.6rem;
      color: #4b5563;
      line-height: 1.3;
    }

    /* ─── Test Cards ─── */
    .test-file-card {
      background: rgba(255, 255, 255, 0.015);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 14px;
      padding: 0.9rem;
      margin-bottom: 1rem;
    }

    .file-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.8rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .file-icon {
      font-size: 1rem;
    }

    .file-name {
      font-family: 'Outfit', sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      color: #e5e7eb;
    }

    .file-tasks {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .task-row {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.25rem 0;
    }

    .task-status-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 1px;
    }

    .task-chk {
      font-size: 0.85rem;
    }

    .task-details {
      flex: 1;
      min-width: 0;
    }

    .task-name-text {
      font-size: 0.75rem;
      font-weight: 500;
      color: #d1d5db;
      line-height: 1.35;
    }

    .task-row.pass .task-name-text {
      color: #f3f4f6;
    }

    .task-row.fail .task-name-text {
      color: #fca5a5;
    }

    .task-error-box {
      background: rgba(239, 68, 68, 0.08);
      border-left: 2px solid #f87171;
      padding: 0.4rem 0.5rem;
      border-radius: 2px 4px 4px 2px;
      font-size: 0.65rem;
      color: #fca5a5;
      margin-top: 0.35rem;
      line-height: 1.35;
      font-family: system-ui, sans-serif;
      word-break: break-word;
    }
  `],
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
