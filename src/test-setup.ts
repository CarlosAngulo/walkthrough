console.log('=== TEST SETUP EXECUTING ===');

import '@analogjs/vitest-angular/setup-zone';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

console.log('=== INITIALIZING TEST ENVIRONMENT ===');
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
console.log('=== TEST ENVIRONMENT INITIALIZED ===');
