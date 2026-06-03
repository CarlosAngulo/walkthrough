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
  // TODO: Reto L7_ON_PUSH_STRATEGY - Configura changeDetection a ChangeDetectionStrategy.OnPush
})
export class PerformanceMonitorComponent extends LearningComponent implements OnInit, AfterViewChecked, OnDestroy {
  protected override level = 'nivel-7';

  @ViewChild('statsCanvas') statsCanvas!: ElementRef<HTMLCanvasElement>;

  // Variables de estado tradicionales (JS no reactivo)
  // TODO: Reto L7_STATE_SIGNALS - Convertir estas propiedades a Signals (signal(), computed())
  fpsList: number[] = [];
  averageFps = 0;

  // Registro de logs de simulación
  logs: string[] = [];

  // Variables internas de la simulación
  protected isSimulating = false;
  protected cpuLoadActive = false;
  private animationFrameId?: number;
  private lastFrameTime = performance.now();

  // TODO: Reto L7_AFTER_RENDER_HOOK - Inyectar o importar afterRender o afterNextRender
  // en el constructor para interactuar de manera óptima con el DOM/Canvas,
  // y eliminar por completo la dependencia del gancho ngAfterViewChecked.

  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L7_ZONELESS_PERF',
      'Zoneless Performance Master 🚀',
      'Lograste migrar un componente de alta intensidad a Zone-less puro usando OnPush, afterRender y Signals.',
      '🚀'
    );
    learningStateStore.completeLevel(this.level);
  }

  ngOnInit() {
    super.ngOnInit();
    this.startSimulation();
  }

  // TODO: Eliminar este hook tradicional dependiente de Zone.js
  ngAfterViewChecked() {
    this.drawCanvas();
  }

  private startSimulation() {
    this.isSimulating = true;
    const runSimulation = (time: number) => {
      if (!this.isSimulating) return;

      const delta = time - this.lastFrameTime;
      this.lastFrameTime = time;
      // Evitar división por cero en entornos virtuales ultra-rápidos
      const currentFps = delta > 0 ? Math.round(1000 / delta) : 60;

      // Simular carga de CPU si está activa
      if (this.cpuLoadActive) {
        const start = performance.now();
        while (performance.now() - start < 12) {
          // Bucle pesado de CPU para simular lag y bajas de FPS
          Math.sqrt(Math.random() * 1000);
        }
      }

      // Actualizar variables de estado tradicionales
      this.fpsList.push(currentFps);
      if (this.fpsList.length > 30) {
        this.fpsList.shift();
      }

      // Calcular promedio de FPS tradicionalmente
      const sum = this.fpsList.reduce((a, b) => a + b, 0);
      this.averageFps = this.fpsList.length ? Math.round(sum / this.fpsList.length) : 0;

      // Eventualmente agregar un log interesante
      if (currentFps < 45 && Math.random() < 0.1) {
        this.logs.unshift(`[${new Date().toLocaleTimeString()}] ⚠️ Frame Drop: ${currentFps} FPS detectado.`);
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
        this.cpuLoadActive ? '🔥 Carga de CPU simulada ACTIVADA (Bucle de 12ms por frame)' : '🟢 Carga de CPU simulada DESACTIVADA'
      }`
    );
    if (this.logs.length > 8) this.logs.pop();
  }

  protected clearStats() {
    this.fpsList = [];
    this.averageFps = 0;
    this.logs = [`[${new Date().toLocaleTimeString()}] 🧹 Historial reiniciado`];
  }

  private drawCanvas() {
    if (!this.statsCanvas) return;
    const canvas = this.statsCanvas.nativeElement;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch (e) {
      // Evitar errores y logs en entornos virtuales de testeo (como JSDOM)
      return;
    }
    if (!ctx) return;

    // Dimensiones
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Fondo degradado
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.6)');
    bgGradient.addColorStop(1, 'rgba(30, 41, 59, 0.8)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Dibujar rejilla
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Dibujar barras de FPS
    const barWidth = width / 30;
    const list = this.fpsList;

    list.forEach((fps, index) => {
      const x = index * barWidth;
      const pct = Math.min(fps / 60, 1);
      const barHeight = height * pct * 0.8;
      const y = height - barHeight;

      // Color curado dependiendo del rendimiento (Premium HSL)
      let hue = 140; // verde
      if (fps < 30) {
        hue = 340; // rojo/rosa
      } else if (fps < 50) {
        hue = 45; // naranja/amarillo
      }

      ctx.fillStyle = `hsla(${hue}, 85%, 60%, 0.75)`;
      ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

      // Bordes neon
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
