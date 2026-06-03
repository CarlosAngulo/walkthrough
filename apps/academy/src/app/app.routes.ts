import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'nivel-1',
    pathMatch: 'full',
  },
  {
    path: 'nivel-1',
    loadComponent: () =>
      import('./course/level1-counter/counter.component').then(
        (m) => m.CounterComponent
      ),
  },
  {
    path: 'nivel-2',
    loadComponent: () =>
      import('./course/level2-state/task-filter.component').then(
        (m) => m.TaskFilterComponent
      ),
  },
  {
    path: 'nivel-3',
    loadComponent: () =>
      import('./course/level3-effects/theme-panel.component').then(
        (m) => m.ThemePanelComponent
      ),
  },
  {
    path: 'nivel-4',
    loadComponent: () =>
      import('./course/level4-architecture/product-list.component').then(
        (m) => m.ProductListComponent
      ),
  },
  {
    path: 'nivel-5',
    loadComponent: () =>
      import('./course/level5-interop/rxjs-boundaries.component').then(
        (m) => m.RxjsBoundariesComponent
      ),
  },
  {
    path: 'nivel-6',
    loadComponent: () =>
      import('./course/level6-stores/messages-list.component').then(
        (m) => m.MessagesListComponent
      ),
  },
  {
    path: 'nivel-7',
    loadComponent: () =>
      import('./course/level7-zoneless/performance-monitor.component').then(
        (m) => m.PerformanceMonitorComponent
      ),
  },
];

