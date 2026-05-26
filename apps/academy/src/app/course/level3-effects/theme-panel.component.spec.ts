import '../../../test-setup';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ThemePanelComponent } from './theme-panel.component';
import { isSignal } from '@angular/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Import our custom Vitest matchers to extend expect
import '@learning-engine/test-integration';

describe('Nivel 3: Effect Architecture 💾 - ThemePanelComponent', () => {
  let component: ThemePanelComponent;
  let fixture: ComponentFixture<ThemePanelComponent>;

  describe('Estructura Arquitectónica - Análisis Semántico AST 🧬', () => {
    it('debería cumplir con todas las reglas de diseño reactivo y evitar anti-patrones', () => {
      const componentPath = 'src/app/course/level3-effects/theme-panel.component.ts';
      
      expect(componentPath).toSatisfyRules([
        'L3_THEME_SIGNAL',
        'L3_FONT_SIZE_SIGNAL',
        'L3_ACCENT_COLOR_SIGNAL'
      ]);
    });
  });

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    // Configurar temporizadores falsos de Vitest para simular tiempo
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [ThemePanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('RETO 1: Variables de Configuración como Signals', () => {
    it('debería declarar "theme", "fontSize" y "accentColor" como Writable Signals de Angular', async () => {
      await createComponent();

      expect(component.theme).toBeDefined();
      expect(component.fontSize).toBeDefined();
      expect(component.accentColor).toBeDefined();

      expect(isSignal(component.theme)).withContext(
        '¡Alerta! "theme" debe ser un Signal mutable de Angular. Reemplázala usando la función: signal("dark").'
      ).toBe(true);

      expect(isSignal(component.fontSize)).withContext(
        '¡Alerta! "fontSize" debe ser un Signal mutable de Angular. Reemplázala usando la función: signal(16).'
      ).toBe(true);

      expect(isSignal(component.accentColor)).withContext(
        '¡Alerta! "accentColor" debe ser un Signal mutable de Angular. Reemplázala usando la función: signal("purple").'
      ).toBe(true);
    });

    it('debería inicializar las señales con sus valores por defecto', async () => {
      await createComponent();

      expect((component.theme as any)()).toBe('dark');
      expect((component.fontSize as any)()).toBe(16);
      expect((component.accentColor as any)()).toBe('purple');
    });
  });

  describe('RETO 2: Inicialización desde LocalStorage', () => {
    it('debería cargar preferencias previas desde localStorage si existen en el arranque', async () => {
      // Simular almacenamiento previo
      const savedPrefs = {
        theme: 'light',
        fontSize: 20,
        accentColor: 'cyan'
      };
      localStorage.setItem('academy-theme-preferences', JSON.stringify(savedPrefs));

      // Crear el componente ahora
      await createComponent();

      expect((component.theme as any)()).withContext(
        'El componente debería haber leído "theme" desde localStorage y cargado "light".'
      ).toBe('light');

      expect((component.fontSize as any)()).withContext(
        'El componente debería haber leído "fontSize" desde localStorage y cargado 20.'
      ).toBe(20);

      expect((component.accentColor as any)()).withContext(
        'El componente debería haber leído "accentColor" desde localStorage y cargado "cyan".'
      ).toBe('cyan');
    });
  });

  describe('RETO 3: Effect() para Sincronizar Estado (LocalStorage y DOM)', () => {
    it('debería persistir automáticamente en localStorage cada vez que cambian las señales', async () => {
      await createComponent();

      if (isSignal(component.theme) && typeof (component.theme as any).set === 'function') {
        // Inicialmente debe guardarse en localStorage por el primer disparo del efecto
        let saved = JSON.parse(localStorage.getItem('academy-theme-preferences') || '{}');
        expect(saved.theme).toBe('dark');

        // Cambiar señales
        (component.theme as any).set('light');
        (component.fontSize as any).set(22);
        (component.accentColor as any).set('pink');
        
        // Propagar cambios
        fixture.detectChanges();
        
        // Darle un ciclo de microtareas a los efectos de Angular para ejecutarse
        await fixture.whenStable();

        // Verificar localStorage
        saved = JSON.parse(localStorage.getItem('academy-theme-preferences') || '{}');
        expect(saved.theme).withContext('effect() debería haber guardado el nuevo tema en localStorage.').toBe('light');
        expect(saved.fontSize).withContext('effect() debería haber guardado el nuevo tamaño de fuente en localStorage.').toBe(22);
        expect(saved.accentColor).withContext('effect() debería haber guardado el nuevo color en localStorage.').toBe('pink');
      } else {
        expect.fail('No se puede probar la persistencia automática porque las propiedades no son señales aún.');
      }
    });

    it('debería sincronizar reactivamente las propiedades CSS del Preview Card en el DOM', async () => {
      await createComponent();

      // Crear elemento preview en el DOM del test fixture si es necesario
      const cardEl = fixture.nativeElement.querySelector('.theme-preview-card') || document.querySelector('.theme-preview-card');
      
      if (isSignal(component.theme) && cardEl) {
        (component.theme as any).set('light');
        (component.fontSize as any).set(18);
        (component.accentColor as any).set('cyan');

        fixture.detectChanges();
        await fixture.whenStable();

        // Verificar el DOM
        expect(cardEl.style.getPropertyValue('--preview-font-size')).toBe('18px');
        expect(cardEl.getAttribute('data-preview-theme')).toBe('light');
        expect(cardEl.getAttribute('data-preview-accent')).toBe('cyan');
      } else {
        expect.fail('No se puede probar la sincronización del DOM porque no hay señales o el preview card no se renderizó.');
      }
    });
  });

  describe('RETO 4: onCleanup para Temporizadores Analíticos (Debounce)', () => {
    it('debería retrasar el reporte analítico aplicando un debounce de 800ms', async () => {
      await createComponent();

      if (isSignal(component.theme) && typeof (component.theme as any).set === 'function') {
        expect(component.analyticsLogCount).toBe(0);

        // Disparar cambio
        (component.theme as any).set('light');
        fixture.detectChanges();
        await fixture.whenStable();

        // Avanzar el reloj 400ms (mitad del debounce). Aún no debe reportar.
        vi.advanceTimersByTime(400);
        expect(component.analyticsLogCount).withContext(
          'Debounce activo: Tras 400ms, el contador analítico aún no debería incrementarse.'
        ).toBe(0);

        // Avanzar otros 400ms (total 800ms). Ahora sí debe reportar.
        vi.advanceTimersByTime(400);
        expect(component.analyticsLogCount).withContext(
          'Debounce completado: Tras 800ms, el reporte analítico debería haberse ejecutado una vez.'
        ).toBe(1);
      } else {
        expect.fail('No se pueden evaluar las analíticas porque las propiedades no son señales.');
      }
    });

    it('debería cancelar temporizadores anteriores usando onCleanup ante múltiples cambios rápidos', async () => {
      await createComponent();

      if (isSignal(component.theme) && typeof (component.theme as any).set === 'function') {
        expect(component.analyticsLogCount).toBe(0);

        // Serie de cambios extremadamente rápidos (menos de 800ms entre ellos)
        (component.theme as any).set('light');
        fixture.detectChanges(); await fixture.whenStable();
        vi.advanceTimersByTime(300); // 300ms transcurridos

        (component.fontSize as any).set(18);
        fixture.detectChanges(); await fixture.whenStable();
        vi.advanceTimersByTime(300); // 600ms transcurridos en total, pero el nuevo timer solo lleva 300ms

        (component.accentColor as any).set('pink');
        fixture.detectChanges(); await fixture.whenStable();
        
        // Avanzar 500ms más (el primer timer ya habría expirado, pero gracias a onCleanup debe estar cancelado)
        vi.advanceTimersByTime(500);
        expect(component.analyticsLogCount).withContext(
          'onCleanup falló: Los temporizadores de cambios anteriores no se cancelaron, provocando logs analíticos prematuros.'
        ).toBe(0);

        // Avanzar 300ms más (total 800ms desde el último cambio)
        vi.advanceTimersByTime(300);
        expect(component.analyticsLogCount).withContext(
          '¡Excelente! onCleanup canceló con éxito los timers previos y solo reportó una vez el estado final tras los 800ms.'
        ).toBe(1);
      } else {
        expect.fail('No se pueden evaluar analíticas rápidas sin señales.');
      }
    });
  });

  describe('Análisis Arquitectónico (Efectos Saludables) 🧐', () => {
    it('no debería mutar ni escribir en señales observables dentro de effect()', () => {
      const filePath = resolve(__dirname, 'theme-panel.component.ts');
      const code = readFileSync(filePath, 'utf-8');

      // Buscar si el constructor o el effect contiene llamadas a `.set(` o `.update(`
      // sobre las propiedades observables dentro del bloque de efecto.
      // Escribir en la misma señal que observamos causa un ciclo infinito.
      // Un chequeo simple es buscar si se llama a `.set` o `.update` sobre theme, fontSize, accentColor
      // dentro del constructor.
      // Si el código es resuelto correctamente, los setters usan .set(), pero el effect no debe llamarlos.
      // Verifiquemos si "this.theme.set" o similar aparece en el constructor de alguna forma incorrecta.
      // Nota: En la plantilla o solución limpia no debe haber llamadas recursivas.
      
      const lines = code.split('\n');
      let insideConstructor = false;
      let constructorBrackets = 0;
      let cyclicCallsCount = 0;

      for (const line of lines) {
        if (line.includes('constructor(') || line.includes('constructor ()')) {
          insideConstructor = true;
        }
        if (insideConstructor) {
          if (line.includes('{')) constructorBrackets++;
          if (line.includes('}')) constructorBrackets--;

          // Buscar llamadas recursivas de mutación a nuestras señales
          if (
            line.includes('this.theme.set') || 
            line.includes('this.fontSize.set') || 
            line.includes('this.accentColor.set') ||
            line.includes('this.theme.update') || 
            line.includes('this.fontSize.update') || 
            line.includes('this.accentColor.update')
          ) {
            cyclicCallsCount++;
          }

          if (constructorBrackets === 0 && line.includes('}')) {
            insideConstructor = false;
          }
        }
      }

      expect(cyclicCallsCount).withContext(
        '¡Alerta de Arquitectura! Has llamado a métodos de escritura (.set o .update) sobre tus señales dentro del constructor/effect(). Esto puede generar recursividad infinita (loops reactivos) y bloqueos del navegador. Los efectos deben ser de solo lectura para las señales de su propio contexto.'
      ).toBe(0);
    });

    it('no debería declarar computed() dentro de un effect()', () => {
      const filePath = resolve(__dirname, 'theme-panel.component.ts');
      const code = readFileSync(filePath, 'utf-8');

      // Detectar si "computed(" aparece dentro de "effect("
      // Busquemos si existe un "computed" en el constructor
      const lines = code.split('\n');
      let insideConstructor = false;
      let constructorBrackets = 0;
      let computedInsideConstructor = false;

      for (const line of lines) {
        if (line.includes('constructor(') || line.includes('constructor ()')) {
          insideConstructor = true;
        }
        if (insideConstructor) {
          if (line.includes('{')) constructorBrackets++;
          if (line.includes('}')) constructorBrackets--;

          if (line.includes('computed(') || line.includes('computed (')) {
            computedInsideConstructor = true;
          }

          if (constructorBrackets === 0 && line.includes('}')) {
            insideConstructor = false;
          }
        }
      }

      expect(computedInsideConstructor).withContext(
        '¡Alerta de Arquitectura! No debes declarar señales computadas (computed(...)) dentro de un bloque effect(). Las computadas se definen de forma declarativa como propiedades de la clase, no dentro de side effects.'
      ).toBe(false);
    });
  });
});
