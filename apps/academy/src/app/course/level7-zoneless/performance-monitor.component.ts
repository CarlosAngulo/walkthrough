import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningComponent } from '../../engine/learning.component';
import { learningStateStore } from '@learning-engine/learning-state';

@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance-monitor.component.html',
  host: {
    class: 'block-performance-monitor'
  }
  // TODO: Challenge L7_ON_PUSH_STRATEGY - Configure changeDetection to ChangeDetectionStrategy.OnPush
})
export class PerformanceMonitorComponent extends LearningComponent implements OnInit, AfterViewChecked, OnDestroy {
  protected override level = 'nivel-7';

  @ViewChild('statsCanvas') statsCanvas!: ElementRef<HTMLCanvasElement>;

  // Traditional state variables (non-reactive JS)
  // TODO: Challenge L7_STATE_SIGNALS - Convert these properties to Signals (signal(), computed())
  fpsList: number[] = [];
  averageFps = 0;

  // Simulation logs record
  logs: string[] = [];

  // Internal simulation variables
  protected isSimulating = false;
  protected cpuLoadActive = false;
  private animationFrameId?: number;
  private lastFrameTime = performance.now();

  // TODO: Challenge L7_AFTER_RENDER_HOOK - Inject or import afterRender or afterNextRender
  // in the constructor to interact optimally with the DOM/Canvas,
  // and completely remove dependency on the ngAfterViewChecked hook.

  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L7_ZONELESS_PERF',
      'Zoneless Performance Master 🚀',
      'You successfully migrated a high-intensity component to pure Zone-less using OnPush, afterRender, and Signals.',
      '🚀'
    );
    learningStateStore.completeLevel(this.level);
  }

  ngOnInit() {
    super.ngOnInit();
    this.startSimulation();
  }

  // TODO: Remove this traditional Zone.js-dependent hook
  ngAfterViewChecked() {
    this.drawCanvas();
  }

  private startSimulation() {
    this.isSimulating = true;
    const runSimulation = (time: number) => {
      if (!this.isSimulating) return;

      const delta = time - this.lastFrameTime;
      this.lastFrameTime = time;
      // Avoid division by zero in ultra-fast virtual testing environments
      const currentFps = delta > 0 ? Math.round(1000 / delta) : 60;

      // Simulate CPU load if active
      if (this.cpuLoadActive) {
        const start = performance.now();
        while (performance.now() - start < 12) {
          // Heavy CPU loop to simulate lag and FPS drops
          Math.sqrt(Math.random() * 1000);
        }
      }

      // Update traditional state variables
      this.fpsList.push(currentFps);
      if (this.fpsList.length > 30) {
        this.fpsList.shift();
      }

      // Calculate average FPS traditionally
      const sum = this.fpsList.reduce((a, b) => a + b, 0);
      this.averageFps = this.fpsList.length ? Math.round(sum / this.fpsList.length) : 0;

      // Eventually add an interesting log
      if (currentFps < 45 && Math.random() < 0.1) {
        this.logs.unshift(`[${new Date().toLocaleTimeString()}] ⚠️ Frame Drop: ${currentFps} FPS detected.`);
        if (this.logs.length > 8) this.logs.pop();
      }

      this.animationFrameId = requestAnimationFrame(runSimulation);
    };

    this.animationFrameId = requestAnimationFrame(runSimulation);
  }

  protected toggleCpuLoad() {
    this.cpuLoadActive = !this.cpuLoadActive;
    this.logs.unshift(
      `[${new Date().toLocaleTimeString()}] ${
        this.cpuLoadActive ? '🔥 Simulated CPU Load ACTIVATED (12ms loop per frame)' : '🟢 Simulated CPU Load DEACTIVATED'
      }`
    );
    if (this.logs.length > 8) this.logs.pop();
  }

  protected clearStats() {
    this.fpsList = [];
    this.averageFps = 0;
    this.logs = [`[${new Date().toLocaleTimeString()}] 🧹 History reset`];
  }

  private drawCanvas() {
    if (!this.statsCanvas) return;
    const canvas = this.statsCanvas.nativeElement;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch (e) {
      // Avoid errors and logs in virtual testing environments (like JSDOM)
      return;
    }
    if (!ctx) return;

    // Dimensions
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.6)');
    bgGradient.addColorStop(1, 'rgba(30, 41, 59, 0.8)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw FPS bars
    const barWidth = width / 30;
    const list = this.fpsList;

    list.forEach((fps, index) => {
      const x = index * barWidth;
      const pct = Math.min(fps / 60, 1);
      const barHeight = height * pct * 0.8;
      const y = height - barHeight;

      // Curated color depending on performance (Premium HSL)
      let hue = 140; // green
      if (fps < 30) {
        hue = 340; // red/pink
      } else if (fps < 50) {
        hue = 45; // orange/yellow
      }

      ctx.fillStyle = `hsla(${hue}, 85%, 60%, 0.75)`;
      ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

      // Neon borders
      ctx.strokeStyle = `hsla(${hue}, 85%, 60%, 1)`;
      ctx.strokeRect(x + 2, y, barWidth - 4, barHeight);
    });
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.isSimulating = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
