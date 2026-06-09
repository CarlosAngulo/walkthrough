import '../../../test-setup';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PerformanceMonitorComponent } from './performance-monitor.component';
import { isSignal } from '@angular/core';
import '@learning-engine/test-integration';

describe('Level 7: Zone-less Angular & Optimal Rendering 🚀 - PerformanceMonitorComponent', () => {
  let component: PerformanceMonitorComponent;
  let fixture: ComponentFixture<PerformanceMonitorComponent>;
  let animationCallbacks: FrameRequestCallback[] = [];

  // Helper helpers to support reading state whether it is a Signal or normal property
  function getFpsList(comp: any): number[] {
    return typeof comp.fpsList === 'function' ? comp.fpsList() : comp.fpsList;
  }

  function getAverageFps(comp: any): number {
    return typeof comp.averageFps === 'function' ? comp.averageFps() : comp.averageFps;
  }

  function getLogs(comp: any): string[] {
    return typeof comp.logs === 'function' ? comp.logs() : comp.logs;
  }

  beforeEach(async () => {
    animationCallbacks = [];
    
    // Stub requestAnimationFrame and cancelAnimationFrame to run synchronously in our control
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      animationCallbacks.push(cb);
      return animationCallbacks.length;
    });

    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      animationCallbacks = [];
    });

    await TestBed.configureTestingModule({
      imports: [PerformanceMonitorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PerformanceMonitorComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Architectural Structure - AST Semantic Analysis 🧬', () => {
    it('should comply with the Zoneless configuration in app.config.ts', () => {
      const configPath = 'src/app/app.config.ts';
      expect(configPath).toSatisfyRules(['L7_ZONELESS_PROVIDER']);
    });

    it('should comply with design rules for the PerformanceMonitorComponent component', () => {
      const componentPath = 'src/app/course/level7-zoneless/performance-monitor.component.ts';
      expect(componentPath).toSatisfyRules([
        'L7_ON_PUSH_STRATEGY',
        'L7_AFTER_RENDER_HOOK',
        'L7_STATE_SIGNALS'
      ]);
    });
  });

  describe('Functional Behavior ⚡', () => {
    it('should initialize simulation in ngOnInit and populate FPS history', () => {
      fixture.detectChanges(); // Executes ngOnInit
      
      expect(component['isSimulating']).toBe(true);
      expect(animationCallbacks.length).toBe(1);

      // Trigger first frame
      const cb = animationCallbacks.shift();
      if (cb) cb(performance.now() + 16.67); // ~60fps delta
      
      fixture.detectChanges();

      const list = getFpsList(component);
      expect(list.length).toBeGreaterThan(0);
      expect(getAverageFps(component)).toBeGreaterThan(0);
    });

    it('should limit FPS history to the last 30 records', () => {
      fixture.detectChanges();

      // Force 35 simulation frame ticks
      for (let i = 0; i < 35; i++) {
        const cb = animationCallbacks.shift();
        if (cb) {
          cb(performance.now() + 16.67);
        }
      }

      fixture.detectChanges();
      const list = getFpsList(component);
      expect(list.length).toBe(30); // Maximum sample limit
    });

    it('should toggle heavy CPU simulation load state with toggleCpuLoad()', () => {
      fixture.detectChanges();
      
      expect(component['cpuLoadActive']).toBe(false);

      component['toggleCpuLoad']();
      expect(component['cpuLoadActive']).toBe(true);
      
      const logs = getLogs(component);
      expect(logs[0]).toContain('Simulated CPU Load ACTIVATED');

      component['toggleCpuLoad']();
      expect(component['cpuLoadActive']).toBe(false);
      expect(getLogs(component)[0]).toContain('Simulated CPU Load DEACTIVATED');
    });

    it('should correctly reset metrics history and logs in clearStats()', () => {
      fixture.detectChanges();

      // Add some simulated frames
      const cb = animationCallbacks.shift();
      if (cb) cb(performance.now() + 16.67);
      fixture.detectChanges();

      expect(getFpsList(component).length).toBe(1);

      component['clearStats']();
      fixture.detectChanges();

      expect(getFpsList(component).length).toBe(0);
      expect(getAverageFps(component)).toBe(0);
      expect(getLogs(component)[0]).toContain('History reset');
    });
  });
});
