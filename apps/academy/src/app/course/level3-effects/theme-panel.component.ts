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
  // Configuración del Nivel y Recompensa
  // No modifiques esta sección de código ya que define la lógica de progreso y logros del curso.
  // ==========================================
  protected override level = 'nivel-3';

  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L3_EFFECTS',
      'Side Effect Architect 💾',
      'Sincronizaste de forma impecable el DOM y localStorage usando efectos y onCleanup.',
      '💾'
    );
    learningStateStore.completeLevel(this.level);
  }

  // ==========================================
  // Fin de la sección de configuración del nivel. El resto del código es tu área de trabajo para el reto de este nivel.
  // ==========================================
  
  // ==========================================
  // RETO 1: Variables de Configuración como Signals
  // ==========================================
  // TODO: Convierte estas tres propiedades en Writable Signals con sus respectivos valores por defecto:
  // - theme: ThemeMode (inicializada en 'dark')
  // - fontSize: number (inicializada en 16)
  // - accentColor: AccentColor (inicializada en 'purple')
  // Pista: theme = signal<ThemeMode>('dark');
  theme: ThemeMode = 'dark';
  fontSize = 16;
  accentColor: AccentColor = 'purple';

  // Analítica simulada para contar cambios (usada para pruebas)
  analyticsLogCount = 0;

  // ==========================================
  // RETO 2: Inicialización desde LocalStorage
  // ==========================================
  // TODO: Al arrancar el componente, debemos cargar las preferencias previas guardadas en localStorage.
  // La clave que debes usar es: 'academy-theme-preferences'.
  // Pista: Para hacerlo súper elegante y evitar desajustes iniciales, puedes crear un método privado de ayuda
  // que intente recuperar las configuraciones, y usarlas directamente para inicializar tus señales:
  //
  // private getSavedPrefs(): ThemePreferences {
  //   const saved = localStorage.getItem('academy-theme-preferences');
  //   return saved ? JSON.parse(saved) : { theme: 'dark', fontSize: 16, accentColor: 'purple' };
  // }
  //
  // Y luego inicializar tus señales llamando a ese método:
  // theme = signal<'dark' | 'light'>(this.getSavedPrefs().theme);
  // (repite para las otras 2).
  // Si decides usar este enfoque elegante, ¡puedes borrar el código de ngOnInit!

  ngOnInit() {
    super.ngOnInit();
    this.loadSavedPreferences();
  }

  private loadSavedPreferences() {
    // Actualmente recuperamos y actualizamos de forma manual imperativa al iniciar:
    const saved = localStorage.getItem('academy-theme-preferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved) as ThemePreferences;
        this.theme = prefs.theme;
        this.fontSize = prefs.fontSize;
        this.accentColor = prefs.accentColor;
      } catch (e) {
        console.error('Error cargando preferencias:', e);
      }
    }
  }

  constructor() {
    super();
    this.setupThemeEffects();
  }

  private setupThemeEffects() {
    // ==========================================
    // RETO 3: Effect() para Sincronizar Estado (LocalStorage)
    // ==========================================
    // TODO: Registra un effect() en este método. Los efectos observan automáticamente
    // cualquier señal leída en su interior y se ejecutan cada vez que cambien.
    // Tu efecto debe realizar esta acción secundaria crítica:
    // 1. Serializar el estado actual completo ({ theme, fontSize, accentColor })
    //    y guardarlo en localStorage con la clave 'academy-theme-preferences'.
    //
    // *Nota de Arquitectura:* La sincronización del DOM se realiza de forma 100%
    // declarativa gracias al nuevo componente autónomo <app-theme-preview> y sus bindings.
    // ¡Tu efecto ya no necesita manipular el DOM de forma imperativa!
    //
    // Pista de código:
    // effect(() => {
    //   const currentTheme = this.theme();
    //   const currentSize = this.fontSize();
    //   const currentAccent = this.accentColor();
    //
    //   // Guardar en LocalStorage
    //   const prefs = { theme: currentTheme, fontSize: currentSize, accentColor: currentAccent };
    //   localStorage.setItem('academy-theme-preferences', JSON.stringify(prefs));
    // });
    //
    // Una vez que implementes este effect(), ¡puedes borrar el método privado 'saveToLocalStorage'!

    // ==========================================
    // RETO 4: onCleanup para Analíticas con Debounce
    // ==========================================
    // TODO: En analíticas reales, no queremos reportar al servidor cada pequeño cambio intermedio del usuario
    // (por ejemplo, si desliza el slider de fuente rápido o clickea colores repetidamente). Queremos aplicar un debounce.
    // 1. Dentro de un effect() (puede ser un segundo efecto o el mismo), lee los valores de tus señales.
    // 2. Crea un setTimeout de 800ms que, al cumplirse, incremente 'this.analyticsLogCount' en 1 (simulando el reporte).
    // 3. Usa la función callback 'onCleanup' que recibe el efecto para borrar (clearTimeout) el timer anterior.
    //    Esto evitará múltiples reportes y cancelará envíos viejos si el usuario vuelve a cambiar de opinión rápido.
    //
    // Pista de código:
    // effect((onCleanup) => {
    //   const currentTheme = this.theme(); // Lee la señal para registrar dependencia reactiva
    //   const currentSize = this.fontSize();
    //   const currentAccent = this.accentColor();
    //
    //   const timer = setTimeout(() => {
    //     this.analyticsLogCount++;
    //     console.log(`[Analytics] Preferencias enviadas: Tema=${currentTheme}, Fuente=${currentSize}px, Color=${currentAccent}`);
    //   }, 800);
    //
    //   onCleanup(() => {
    //     clearTimeout(timer); // Cancela el envío si el efecto se dispara de nuevo antes de 800ms
    //   });
    // });
  }

  // ==========================================
  // RETO 5: Simplificación de Setters
  // ==========================================

  setTheme(t: ThemeMode) {
    // Actualmente funciona mutando la variable primitiva y disparando recálculos de forma manual:
    this.theme = t;
    this.saveToLocalStorage();

    // TODO con Signals: Cuando 'theme' sea un signal, simplemente actualiza su valor:
    // this.theme.set(t);
    // ¡Y elimina todo el código imperativo manual de arriba! El efecto en el constructor se encargará solo.
  }

  setFontSize(size: number) {
    // Limitar el tamaño de fuente entre 14px y 24px por accesibilidad
    const clamped = Math.max(14, Math.min(24, size));
    
    // Asignación tradicional y recálculos manuales:
    this.fontSize = clamped;
    this.saveToLocalStorage();

    // TODO con Signals: Cuando 'fontSize' sea una señal, actualízala:
    // this.fontSize.set(clamped);
    // Y elimina el código manual.
  }

  setAccentColor(color: AccentColor) {
    // Asignación tradicional y recálculos manuales:
    this.accentColor = color;
    this.saveToLocalStorage();

    // TODO con Signals: Cuando 'accentColor' sea una señal, actualízala:
    // this.accentColor.set(color);
    // Y elimina el código manual.
  }

  // ==========================================
  // Métodos Utilitarios Manuales (A ELIMINAR al refactorizar)
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
