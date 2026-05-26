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
  // Rutas futuras:
  // { path: 'nivel-4', loadComponent: () => import('./levels/level4-architecture/product-list.component').then(m => m.ProductListComponent) },
  // { path: 'nivel-5', loadComponent: () => import('./levels/level5-rxjs/github-search.component').then(m => m.GithubSearchComponent) },
  // { path: 'nivel-6', loadComponent: () => import('./levels/level6-stores/todo-list.component').then(m => m.TodoListComponent) },
  // { path: 'nivel-7', loadComponent: () => import('./levels/level7-zoneless/performance-lab.component').then(m => m.PerformanceLabComponent) },
];
