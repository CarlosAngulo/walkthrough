import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { LearningComponent } from '../../engine/learning.component';
import { learningStateStore } from '@learning-engine/learning-state';
import { ThemePreviewComponent } from './theme-preview/theme-preview.component';
import { ThemeMode, AccentColor, ThemePreferences } from './theme.types';

@Component({
  selector: 'app-theme-panel',
  standalone: true,
  imports: [ThemePreviewComponent],
  templateUrl: './theme-panel.component.html',
  host: {
    class: 'block-theme-panel'
  }
})
export class ThemePanelComponent extends LearningComponent implements OnInit {
  

  // ==========================================
  // Level Configuration and Reward
  // Do not modify this code section as it defines the course progress and achievements logic.
  // ==========================================
  protected override level = 'nivel-3';

  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L3_EFFECTS',
      'Side Effect Architect 💾',
      'You flawlessly synchronized the DOM and localStorage using effects and onCleanup.',
      '💾'
    );
    learningStateStore.completeLevel(this.level);
  }

  // ==========================================
  // End of level configuration section. The rest of the code is your workspace for this level's challenge.
  // ==========================================
  
  // ==========================================
  // CHALLENGE 1: Configuration Variables as Signals
  // ==========================================
  // TODO: Convert these three properties into Writable Signals with their respective default values:
  // - theme: ThemeMode (initialized to 'dark')
  // - fontSize: number (initialized to 16)
  // - accentColor: AccentColor (initialized to 'primary')
  // Hint: theme = signal<ThemeMode>('dark');
  theme: ThemeMode = 'dark';
  fontSize = 16;
  accentColor: AccentColor = 'primary';

  // Simulated analytics counter (used for tests)
  analyticsLogCount = 0;

  // ==========================================
  // CHALLENGE 2: Initialization from LocalStorage
  // ==========================================
  // TODO: When launching the component, we must load the previous preferences saved in localStorage.
  // The key you must use is: 'academy-theme-preferences'.
  // Hint: To make it super elegant and avoid initial layout shifts, you can create a private helper method
  // that attempts to retrieve the settings, and use them directly to initialize your signals:
  //
  // private getSavedPrefs(): ThemePreferences {
  //   const saved = localStorage.getItem('academy-theme-preferences');
  //   return saved ? JSON.parse(saved) : { theme: 'dark', fontSize: 16, accentColor: 'primary' };
  // }
  //
  // and then return to where your variables are defined to initialize them calling that method:
  // theme = signal<'dark' | 'light'>(this.getSavedPrefs().theme);
  // (repeat for the other 2).
  // If you decide to use this elegant approach, you can delete the code in ngOnInit!

  ngOnInit() {
    super.ngOnInit();
    this.loadSavedPreferences();
  }

  private loadSavedPreferences() {
    // Currently we retrieve and manually update imperatively on startup:
    const saved = localStorage.getItem('academy-theme-preferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved) as ThemePreferences;
        this.theme = prefs.theme;
        this.fontSize = prefs.fontSize;
        this.accentColor = prefs.accentColor;
      } catch (e) {
        console.error('Error loading preferences:', e);
      }
    }
  }

  constructor() {
    super();
    this.setupThemeEffects();
  }

  private setupThemeEffects() {
    // ==========================================
    // CHALLENGE 3: effect() to Synchronize State (LocalStorage)
    // ==========================================
    // TODO: Register an effect() in this method. Effects automatically observe
    // any signal read inside them and run every time they change.
    // Your effect should perform this critical side action:
    // 1. Serialize the full current state ({ theme, fontSize, accentColor })
    //    and save it in localStorage under the key 'academy-theme-preferences'.
    //
    // *Architectural Note:* DOM synchronization is done 100% declaratively
    // thanks to the new autonomous component <app-theme-preview> and its bindings.
    // Your effect no longer needs to manipulate the DOM imperatively!
    //
    // Code Hint:
    // effect(() => {
    //   const currentTheme = this.theme();
    //   const currentSize = this.fontSize();
    //   const currentAccent = this.accentColor();
    //
    //   // Save to LocalStorage
    //   const prefs = { theme: currentTheme, fontSize: currentSize, accentColor: currentAccent };
    //   localStorage.setItem('academy-theme-preferences', JSON.stringify(prefs));
    // });
    //
    // Once you implement this effect(), you can delete the private method 'saveToLocalStorage'!

    // ==========================================
    // CHALLENGE 4: onCleanup for Analytics with Debounce
    // ==========================================
    // TODO: In real analytics, we do not want to report to the server on every small intermediate change by the user
    // (for example, if they slide the font slider quickly or click colors repeatedly). We want to apply a debounce.
    // 1. Inside an effect() (it can be a second effect or the same one), read the values of your signals.
    // 2. Create a setTimeout of 800ms that, upon completion, increments 'this.analyticsLogCount' by 1 (simulating the report).
    // 3. Use the callback function 'onCleanup' that the effect receives to clear (clearTimeout) the previous timer.
    //    This will prevent multiple reports and cancel old submissions if the user changes their mind quickly again.
    //
    // Code Hint:
    // effect((onCleanup) => {
    //   const currentTheme = this.theme(); // Read the signal to register reactive dependency
    //   const currentSize = this.fontSize();
    //   const currentAccent = this.accentColor();
    //
    //   const timer = setTimeout(() => {
    //     this.analyticsLogCount++;
    //     console.log(`%c[Analytics] Preferences sent: Theme=${currentTheme}, Font=${currentSize}px, Color=${currentAccent}`, 'color: rgb(31, 230, 58); font-weight: bold; background: #1a1a1a; padding: 4px 12px; border-radius: 4px;');
    //   }, 800);
    //
    //   onCleanup(() => {
    //     clearTimeout(timer); // Cancels sending if the effect fires again before 800ms
    //   });
    // });
  }

  // ==========================================
  // CHALLENGE 5: Simplifying Setters
  // ==========================================

  setTheme(t: ThemeMode) {
    // Currently works by mutating the primitive variable and firing recalculations manually:
    this.theme = t;
    this.saveToLocalStorage();

    // TODO with Signals: When 'theme' is a signal, simply update its value:
    // this.theme.set(t);
    // And remove all the manual imperative code above! The constructor effect will handle it alone.
  }

  setFontSize(size: number) {
    // Limit font size between 14px and 24px for accessibility
    const clamped = Math.max(14, Math.min(24, size));
    
    // Traditional assignment and manual recalculations:
    this.fontSize = clamped;
    this.saveToLocalStorage();

    // TODO with Signals: When 'fontSize' is a signal, update it:
    // this.fontSize.set(clamped);
    // And remove the manual code.
  }

  setAccentColor(color: AccentColor) {
    // Traditional assignment and manual recalculations:
    this.accentColor = color;
    this.saveToLocalStorage();

    // TODO with Signals: When 'accentColor' is a signal, update it:
    // this.accentColor.set(color);
    // And remove the manual code.
  }

  // ==========================================
  // Manual Utility Methods (TO BE REMOVED upon refactoring)
  // ==========================================
  private saveToLocalStorage() {
    const prefs: ThemePreferences = {
      theme: this.theme,
      fontSize: this.fontSize,
      accentColor: this.accentColor
    };
    localStorage.setItem('academy-theme-preferences', JSON.stringify(prefs));
  }
}
