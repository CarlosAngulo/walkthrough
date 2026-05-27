import '../../../test-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { CartService, Product } from './cart.service';
import { isSignal } from '@angular/core';

// Import our custom Vitest matchers to extend expect
import '@learning-engine/test-integration';

describe('Nivel 4: Reactive Architecture 🏗️ - ProductListComponent & CartService', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let cartService: CartService;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [CartService]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    cartService.clearCart();
    fixture.detectChanges();
  });

  describe('Estructura Arquitectónica - Análisis Semántico AST 🧬', () => {
    it('debería cumplir con todas las reglas de diseño reactivo y evitar anti-patrones en el Servicio', () => {
      const servicePath = 'src/app/course/level4-architecture/cart.service.ts';
      expect(servicePath).toSatisfyRules([
        'L4_SERVICE_PRIVATE_ITEMS',
        'L4_SERVICE_READONLY_ITEMS'
      ]);
    });

    it('debería cumplir con todas las reglas de diseño reactivo y evitar anti-patrones en el Componente', () => {
      const componentPath = 'src/app/course/level4-architecture/product-list.component.ts';
      expect(componentPath).toSatisfyRules([
        'L4_PRODUCT_LIST_OUTPUT',
        'L4_PRODUCT_LIST_INJECTION'
      ]);
    });
  });

  describe('RETO 1 y 2: CartService - Estado Privado y Solo Lectura', () => {
    it('debería declarar "_items" como señal mutable privada y exponer "items" de solo lectura', () => {
      const serviceKeys = Object.keys(cartService) as string[];
      // Buscar la propiedad privada (en runtime Angular transpila private properties, pero podemos inspeccionar getters/signals)
      const itemsProp = cartService.items;
      
      expect(itemsProp).toBeDefined();
      expect(isSignal(itemsProp)).withContext(
        'La propiedad "items" debe ser expuesta como un Signal de Angular.'
      ).toBe(true);

      // Verificar que "items" es de solo lectura (no debe tener el método set o update)
      expect((itemsProp as any).set).withContext(
        '¡Alerta de Seguridad! El estado expuesto "items" debe ser de solo lectura usando .asReadonly() para evitar mutaciones externas.'
      ).toBeUndefined();
    });
  });

  describe('RETO 3: CartService - Computed Signals para Totales', () => {
    it('debería declarar "totalCount" y "totalPrice" como Computed Signals reactivos', () => {
      expect(cartService.totalCount).toBeDefined();
      expect(cartService.totalPrice).toBeDefined();

      expect(isSignal(cartService.totalCount)).withContext(
        'La propiedad "totalCount" debe ser un Computed Signal.'
      ).toBe(true);

      expect(isSignal(cartService.totalPrice)).withContext(
        'La propiedad "totalPrice" debe ser un Computed Signal.'
      ).toBe(true);
    });
  });

  describe('RETO 4: CartService - Mutaciones Inmutables', () => {
    const prod1: Product = { id: 'p1', name: 'Curso Angular Signals', price: 50 };
    const prod2: Product = { id: 'p2', name: 'Curso RxJS', price: 60 };

    it('debería agregar productos inmutablemente al carrito y recalcular totales', () => {
      if (isSignal(cartService.items)) {
        cartService.addToCart(prod1);
        fixture.detectChanges();

        expect((cartService.items as any)().length).toBe(1);
        expect((cartService.items as any)()[0].product.id).toBe('p1');
        expect((cartService.items as any)()[0].quantity).toBe(1);

        // Incrementar cantidad del mismo producto
        cartService.addToCart(prod1);
        expect((cartService.items as any)()[0].quantity).toBe(2);

        // Totales reactivos
        expect((cartService.totalCount as any)()).toBe(2);
        expect((cartService.totalPrice as any)()).toBe(100);
      } else {
        expect.fail('No se puede probar addToCart porque "items" no es una señal aún.');
      }
    });

    it('debería remover productos inmutablemente del carrito decrementando cantidad o eliminando', () => {
      if (isSignal(cartService.items)) {
        cartService.addToCart(prod1);
        cartService.addToCart(prod2);
        cartService.addToCart(prod2); // 1 prod1, 2 prod2

        cartService.removeFromCart('p2');
        expect((cartService.items as any)().find((item: any) => item.product.id === 'p2')?.quantity).toBe(1);

        cartService.removeFromCart('p2'); // Debería eliminarse del todo
        expect((cartService.items as any)().find((item: any) => item.product.id === 'p2')).toBeUndefined();
        expect((cartService.totalCount as any)()).toBe(1);
        expect((cartService.totalPrice as any)()).toBe(50);
      } else {
        expect.fail('No se puede probar removeFromCart porque "items" no es una señal.');
      }
    });

    it('debería vaciar por completo el carrito al llamar a clearCart()', () => {
      if (isSignal(cartService.items)) {
        cartService.addToCart(prod1);
        cartService.clearCart();

        expect((cartService.items as any)().length).toBe(0);
        expect((cartService.totalCount as any)()).toBe(0);
        expect((cartService.totalPrice as any)()).toBe(0);
      } else {
        expect.fail('No se puede probar clearCart sin señales.');
      }
    });
  });

  describe('RETO 5: ProductListComponent - output() Signal API', () => {
    it('debería declarar "productAdded" como un Angular Output reactivo y emitir en agregaciones', () => {
      expect(component.productAdded).toBeDefined();
      
      // En Angular 17.3+, output() es una función/emisor de tipo OutputEmitterRef
      const isOutputSignal = typeof (component.productAdded as any).subscribe === 'function' || typeof (component.productAdded as any).emit === 'function';
      expect(isOutputSignal).withContext(
        'La propiedad "productAdded" debe ser declarada usando la función moderna "output<Product>()".'
      ).toBe(true);

      const spy = vi.fn();
      (component.productAdded as any).subscribe(spy);

      const testProd: Product = { id: 'p3', name: 'Libro Arquitectura', price: 30 };
      component.addToCart(testProd);

      expect(spy).toHaveBeenCalledWith(testProd);
    });
  });
});