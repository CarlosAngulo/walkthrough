import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LearningComponent } from '../../engine/learning.component';
import { learningStateStore } from '@learning-engine/learning-state';
import { CartService, Product } from './cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-list.component.html',
  host: {
    class: 'block-product-list'
  }
})
export class ProductListComponent extends LearningComponent {
  protected override level = 'nivel-4';

  // ==========================================
  // Desbloqueo del Logro - Motor de Aprendizaje
  // ==========================================
  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L4_ARCHITECTURE',
      'Reactive Architect 🏗️',
      'Desacoplaste por completo el catálogo del estado global de forma segura y reactiva.',
      '🏗️'
    );
    learningStateStore.completeLevel('nivel-4');
  }

  // Catálogo de Productos
  products: Product[] = [
    { id: 'p1', name: 'Curso Angular Signals ⚡', price: 49.99 },
    { id: 'p2', name: 'Curso RxJS Bound 🔄', price: 59.99 },
    { id: 'p3', name: 'Arquitectura Limpia 🏗️', price: 29.99 }
  ];

  // ==========================================
  // RETO 5: Señales de Salida con output()
  // ==========================================
  // TODO: Refactora este emisor tradicional para utilizar la nueva función output() de Angular:
  // - productAdded = output<Product>();
  // Recuerda importar 'output' desde '@angular/core' (y puedes borrar EventEmitter y Output).
  @Output() productAdded = new EventEmitter<Product>();

  // ==========================================
  // RETO 6: Inyección de Dependencias Moderna
  // ==========================================
  // TODO: Reemplaza esta inyección de constructor tradicional por la inyección declarativa inject():
  // - cartService = inject(CartService);
  // Cuando lo hagas, ¡puedes borrar el constructor completamente!
  cartService: CartService;

  constructor(cartService: CartService) {
    super();
    this.cartService = cartService;
  }

  // Delegación del evento al Servicio
  addToCart(product: Product) {
    this.cartService.addToCart(product);
    
    // Emitir el evento de notificación
    this.productAdded.emit(product);
  }

  removeFromCart(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  clearCart() {
    this.cartService.clearCart();
  }
}
