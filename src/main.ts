import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { CounterComponent } from './app/counter/counter.component';

bootstrapApplication(CounterComponent).catch((err) =>
  console.error(err)
);
