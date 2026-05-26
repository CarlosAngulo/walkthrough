export interface CourseLevel {
  number: number;
  path: string;
  title: string;
  subtitle: string;
  statusKey: string;
  emoji: string;
}

export const COURSE_METADATA = {
  title: 'Signals Academy',
  subtitle: 'Test-Driven Learning',
  logo: '🧬',
  initialPath: '/nivel-1',
  levels: [
    {
      number: 1,
      path: '/nivel-1',
      title: '1. Writable Signals',
      subtitle: 'signal(), input(), computed()',
      statusKey: 'nivel-1',
      emoji: '⚡',
    },
    {
      number: 2,
      path: '/nivel-2',
      title: '2. Reactive Thinking',
      subtitle: 'Computed chains & derived state',
      statusKey: 'nivel-2',
      emoji: '🧠',
    },
    {
      number: 3,
      path: '/nivel-3',
      title: '3. Effect Architecture',
      subtitle: 'effect(), onCleanup, localStorage',
      statusKey: 'nivel-3',
      emoji: '💾',
    },
    {
      number: 4,
      path: '/nivel-4',
      title: '4. Reactive Architecture',
      subtitle: 'Services, output(), asReadonly()',
      statusKey: 'nivel-4',
      emoji: '🏗️',
    },
    {
      number: 5,
      path: '/nivel-5',
      title: '5. RxJS Boundaries',
      subtitle: 'toSignal(), toObservable()',
      statusKey: 'nivel-5',
      emoji: '🔄',
    },
    {
      number: 6,
      path: '/nivel-6',
      title: '6. Signal Stores',
      subtitle: 'DIY Store + @ngrx/signals',
      statusKey: 'nivel-6',
      emoji: '🗄️',
    },
    {
      number: 7,
      path: '/nivel-7',
      title: '7. Zone-less Angular',
      subtitle: 'OnPush, zoneless, afterRender',
      statusKey: 'nivel-7',
      emoji: '🚀',
    },
  ] as CourseLevel[],
};
