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
  // Achievement Unlocking - Learning Engine
  // ==========================================
  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L4_ARCHITECTURE',
      'Reactive Architect 🏗️',
      'You completely decoupled the catalog from the global state securely and reactively.',
      '🏗️'
    );
    learningStateStore.completeLevel('nivel-4');
  }

  // Product Catalog
  products: Product[] = [
    { id: 'p1', name: 'Curso Angular Signals ⚡', price: 49.99 },
    { id: 'p2', name: 'Curso RxJS Bound 🔄', price: 59.99 },
    { id: 'p3', name: 'Arquitectura Limpia 🏗️', price: 29.99 }
  ];

  // ==========================================
  // CHALLENGE 5: Output Signals with output()
  // ==========================================
  // TODO: Refactor this traditional emitter to use Angular's new output() function:
  // - productAdded = output<Product>();
  // Remember to import 'output' from '@angular/core' (and you can delete EventEmitter and Output).
  @Output() productAdded = new EventEmitter<Product>();

  // ==========================================
  // CHALLENGE 6: Modern Dependency Injection
  // ==========================================
  // TODO: Replace this traditional constructor injection with declarative inject() injection:
  // - cartService = inject(CartService);
  // When you do so, you can delete the constructor completely!
  cartService: CartService;

  constructor(cartService: CartService) {
    super();
    this.cartService = cartService;
  }

  // Delegating event to the Service
  addToCart(product: Product) {
    this.cartService.addToCart(product);
    
    // Emit notification event
    this.productAdded.emit(product);
  }

  removeFromCart(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  clearCart() {
    this.cartService.clearCart();
  }
}