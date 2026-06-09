import { Component, Input } from '@angular/core';
import { ThemeMode, AccentColor } from '../theme.types';

@Component({
  selector: 'app-theme-preview',
  standalone: true,
  templateUrl: './theme-preview.component.html',
  styleUrl: './theme-preview.component.css',
  host: {
    'class': 'theme-preview-card',
    '[style.--preview-font-size.px]': 'resolvedFontSize',
    '[attr.data-preview-theme]': 'resolvedTheme',
    '[attr.data-preview-accent]': 'resolvedAccentColor'
  }
})
export class ThemePreviewComponent {
  // =========================================================================
  // PEDAGOGICAL EXPLANATION: TRADITIONAL INPUTS vs SIGNAL INPUTS ⚡
  // =========================================================================
  // In classic versions of Angular we declare inputs with the imperative @Input() decorator:
  @Input({ required: true }) theme!: any;
  @Input({ required: true }) fontSize!: any;
  @Input({ required: true }) accentColor!: any;

  // Smart resolvers to robustly support Signals passed as a function reference
  // or as resolved primitive values:
  get resolvedTheme(): ThemeMode {
    return typeof this.theme === 'function' ? this.theme() : this.theme;
  }

  get resolvedFontSize(): number {
    return typeof this.fontSize === 'function' ? this.fontSize() : this.fontSize;
  }

  get resolvedAccentColor(): AccentColor {
    return typeof this.accentColor === 'function' ? this.accentColor() : this.accentColor;
  }

  // 💡 ADVANTAGES OF SIGNAL INPUTS (Angular 17.2+):
  // 
  // 1. **Native & Integrated Reactivity:** As read-only signals, they can be directly used
  //    in computed signals (computed()) or effects (effect()) automatically, without lifecycle hooks.
  // 2. **Clean State Derivation:** If you want to derive a state (e.g., doubling the font size),
  //    you simply write: `doubleFontSize = computed(() => this.fontSize() * 2)`. You no longer need
  //    to implement `ngOnChanges` or `ngOnInit` with repetitive manual logic.
  // 3. **Zoneless Architecture / Ultra-performance:** Signal Inputs enable an extremely optimal change
  //    detection model at the individual component level, paving the way to get rid of Zone.js.
  // 4. **Strongly Type-Safe:** Offers a very clean modern syntax: `theme = input.required<ThemeMode>()` or `fontSize = input(16)`.
}
