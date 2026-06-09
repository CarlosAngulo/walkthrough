import '../../../test-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { CartService, Product } from './cart.service';
import { isSignal } from '@angular/core';

// Import our custom Vitest matchers to extend expect
import '@learning-engine/test-integration';

describe('Level 4: Reactive Architecture 🏗️ - ProductListComponent & CartService', () => {
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

  describe('Architectural Structure - AST Semantic Analysis 🧬', () => {
    it('should comply with all reactive design rules and avoid anti-patterns in the Service', () => {
      const servicePath = 'src/app/course/level4-architecture/cart.service.ts';
      expect(servicePath).toSatisfyRules([
        'L4_SERVICE_PRIVATE_ITEMS',
        'L4_SERVICE_READONLY_ITEMS'
      ]);
    });

    it('should comply with all reactive design rules and avoid anti-patterns in the Component', () => {
      const componentPath = 'src/app/course/level4-architecture/product-list.component.ts';
      expect(componentPath).toSatisfyRules([
        'L4_PRODUCT_LIST_OUTPUT',
        'L4_PRODUCT_LIST_INJECTION'
      ]);
    });
  });

  describe('CHALLENGE 1 & 2: CartService - Private and Read-Only State', () => {
    it('should declare "_items" as a private mutable signal and expose "items" as read-only', () => {
      const serviceKeys = Object.keys(cartService) as string[];
      const itemsProp = cartService.items;
      
      expect(itemsProp).toBeDefined();
      expect(isSignal(itemsProp)).withContext(
        'The "items" property must be exposed as an Angular Signal.'
      ).toBe(true);

      // Verify that "items" is read-only (should not have set or update methods)
      expect((itemsProp as any).set).withContext(
        'Security Alert! The exposed "items" state must be read-only using .asReadonly() to avoid external mutations.'
      ).toBeUndefined();
    });
  });

  describe('CHALLENGE 3: CartService - Computed Signals for Totales', () => {
    it('should declare "totalCount" and "totalPrice" as reactive Computed Signals', () => {
      expect(cartService.totalCount).toBeDefined();
      expect(cartService.totalPrice).toBeDefined();

      expect(isSignal(cartService.totalCount)).withContext(
        'The "totalCount" property must be a Computed Signal.'
      ).toBe(true);

      expect(isSignal(cartService.totalPrice)).withContext(
        'The "totalPrice" property must be a Computed Signal.'
      ).toBe(true);
    });
  });

  describe('CHALLENGE 4: CartService - Immutable Mutations', () => {
    const prod1: Product = { id: 'p1', name: 'Curso Angular Signals', price: 50 };
    const prod2: Product = { id: 'p2', name: 'Curso RxJS', price: 60 };

    it('should add products immutably to the cart and recalculate totals', () => {
      if (isSignal(cartService.items)) {
        cartService.addToCart(prod1);
        fixture.detectChanges();

        expect((cartService.items as any)().length).toBe(1);
        expect((cartService.items as any)()[0].product.id).toBe('p1');
        expect((cartService.items as any)()[0].quantity).toBe(1);

        // Increase quantity of the same product
        cartService.addToCart(prod1);
        expect((cartService.items as any)()[0].quantity).toBe(2);

        // Reactive totals
        expect((cartService.totalCount as any)()).toBe(2);
        expect((cartService.totalPrice as any)()).toBe(100);
      } else {
        expect.fail('Cannot test addToCart because "items" is not a signal yet.');
      }
    });

    it('should remove products immutably from the cart by decrementing quantity or deleting', () => {
      if (isSignal(cartService.items)) {
        cartService.addToCart(prod1);
        cartService.addToCart(prod2);
        cartService.addToCart(prod2); // 1 prod1, 2 prod2

        cartService.removeFromCart('p2');
        expect((cartService.items as any)().find((item: any) => item.product.id === 'p2')?.quantity).toBe(1);

        cartService.removeFromCart('p2'); // Should be completely removed
        expect((cartService.items as any)().find((item: any) => item.product.id === 'p2')).toBeUndefined();
        expect((cartService.totalCount as any)()).toBe(1);
        expect((cartService.totalPrice as any)()).toBe(50);
      } else {
        expect.fail('Cannot test removeFromCart because "items" is not a signal.');
      }
    });

    it('should completely empty the cart when calling clearCart()', () => {
      if (isSignal(cartService.items)) {
        cartService.addToCart(prod1);
        cartService.clearCart();

        expect((cartService.items as any)().length).toBe(0);
        expect((cartService.totalCount as any)()).toBe(0);
        expect((cartService.totalPrice as any)()).toBe(0);
      } else {
        expect.fail('Cannot test clearCart without signals.');
      }
    });
  });

  describe('CHALLENGE 5: ProductListComponent - output() Signal API', () => {
    it('should declare "productAdded" as a reactive Angular Output and emit on additions', () => {
      expect(component.productAdded).toBeDefined();
      
      const isOutputSignal = typeof (component.productAdded as any).subscribe === 'function' || typeof (component.productAdded as any).emit === 'function';
      expect(isOutputSignal).withContext(
        'The "productAdded" property must be declared using the modern "output<Product>()" function.'
      ).toBe(true);

      const spy = vi.fn();
      (component.productAdded as any).subscribe(spy);

      const testProd: Product = { id: 'p3', name: 'Libro Arquitectura', price: 30 };
      component.addToCart(testProd);

      expect(spy).toHaveBeenCalledWith(testProd);
    });
  });
});