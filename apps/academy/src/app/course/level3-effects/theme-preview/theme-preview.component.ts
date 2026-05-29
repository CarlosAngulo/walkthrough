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
  // EXPLICACIÓN PEDAGÓGICA: INPUTS TRADICIONALES vs SIGNAL INPUTS ⚡
  // =========================================================================
  // En las versiones clásicas de Angular declaramos inputs con el decorador imperativo @Input():
  @Input({ required: true }) theme!: any;
  @Input({ required: true }) fontSize!: any;
  @Input({ required: true }) accentColor!: any;

  // Resolutores inteligentes para dar soporte robusto a Signals pasados como referencia de función
  // o como valores primitivos resueltos:
  get resolvedTheme(): ThemeMode {
    return typeof this.theme === 'function' ? this.theme() : this.theme;
  }

  get resolvedFontSize(): number {
    return typeof this.fontSize === 'function' ? this.fontSize() : this.fontSize;
  }

  get resolvedAccentColor(): AccentColor {
    return typeof this.accentColor === 'function' ? this.accentColor() : this.accentColor;
  }

  // 💡 VENTAJAS DE LOS SIGNAL INPUTS (Angular 17.2+):
  // 
  // 1. **Reactividad Nativa e Integrada:** Al ser señales de lectura, se pueden usar directamente
  //    en señales computadas (computed()) o efectos (effect()) de manera automática, sin hooks de ciclo de vida.
  // 2. **Derivación de Estado Limpia:** Si quieres derivar un estado (por ejemplo, duplicar el tamaño de fuente),
  //    simplemente escribes: `doubleFontSize = computed(() => this.fontSize() * 2)`. Ya no necesitas
  //    implementar `ngOnChanges` ni `ngOnInit` con lógica manual repetitiva.
  // 3. **Arquitectura Zoneless / Ultra-rendimiento:** Los Signal Inputs habilitan un modelo de detección
  //    de cambios extremadamente óptimo a nivel de componente singular, pavimentando el camino para prescindir de Zone.js.
  // 4. **Tipado Fuertemente Seguro:** Ofrece una sintaxis moderna muy limpia: `theme = input.required<ThemeMode>()` o `fontSize = input(16)`.
}
