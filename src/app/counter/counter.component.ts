import { Component, signal, computed, input } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <div class="counter-container">
      <div class="card">
        <h1 class="title">Angular Signals Academy 🚀</h1>
        <p class="subtitle">Aprende la reactividad moderna de Angular con Test-Driven Learning</p>
        
        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-label">Writable Signal (counter)</span>
            <span class="stat-value highlight">{{ counter() }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Computed Signal (doubleCounter)</span>
            <span class="stat-value secondary">{{ doubleCounter() }}</span>
          </div>
        </div>

        <div class="input-info">
          <span class="badge">Signal Input (step)</span>
          <p>Valor de incremento activo: <strong>{{ step() }}</strong></p>
        </div>

        <div class="button-group">
          <button class="btn btn-primary" (click)="increment()">Incrementar (+{{ step() }})</button>
          <button class="btn btn-outline" (click)="decrement()">Decrementar (-{{ step() }})</button>
        </div>
      </div>
    </div>
  `,
  host: {
    class: 'block-app-counter'
  }
})
export class CounterComponent {
  // ==========================================
  // RETO 1: Writable Signals
  // ==========================================
  // TODO: Inicializa un writable signal con el valor de 0.
  // Debe llamarse 'counter'.
  // Pista: Usa signal<number>(0) de @angular/core
  counter = null as any;

  // ==========================================
  // RETO 2: Signal Inputs (Transformación)
  // ==========================================
  // TODO: Crea un Signal Input llamado 'step' con valor por defecto de 1.
  // Actualmente está declarado como un mock para que no rompa la compilación inicial.
  // Reemplázalo usando la función input<number>(1) de Angular.
  // Pista: Recuerda importar 'input' desde '@angular/core'
  step = null as any;

  // ==========================================
  // RETO 3: Computed Signals
  // ==========================================
  // TODO: Crea un computed signal que multiplique el valor de la señal 'counter' por 2.
  // Debe llamarse 'doubleCounter'.
  // Pista: Usa la función computed() y lee el valor de counter() dentro de la expresión.
  doubleCounter = null as any;

  constructor() {
    // Mocks temporales para evitar errores de ejecución antes de resolver los retos.
    // Debes eliminar estas asignaciones del constructor o dejarlas; sin embargo,
    // una vez que definas las propiedades arriba como señales reales,
    // puedes eliminar este constructor por completo.
    this.counter = () => 0;
    this.step = () => 1;
    this.doubleCounter = () => 0;
  }

  // ==========================================
  // RETO 4: Mutación del Estado
  // ==========================================
  increment() {
    // TODO: Incrementa el valor de la señal 'counter' sumándole el valor de la señal input 'step()'.
    // Pista: Recuerda actualizar señales usando el método '.update()'
    // Ejemplo: this.mySignal.update(val => val + 1)
  }

  decrement() {
    // TODO (Opcional): Decrementa el valor del 'counter' restándole 'step()'.
  }
}
