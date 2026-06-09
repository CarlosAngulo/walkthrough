import { Injectable, signal, computed } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // ==========================================
  // CHALLENGE 1: Private Reactive State with Signals
  // ==========================================
  // TODO: Replace this traditional property with a private Writable Signal:
  // - _items = signal<CartItem[]>([]);
  // Make sure to use the underscore convention to indicate that it is private to the class.
  private _itemsList: CartItem[] = [];

  // ==========================================
  // CHALLENGE 2: Secure Read-Only Exposure
  // ==========================================
  // TODO: A key principle of reactive architecture is that state should not be
  // mutated directly by external components. Expose the state using a read-only Signal:
  // - items = this._items.asReadonly();
  // When you do so, you can remove this traditional getter!
  get items(): CartItem[] {
    return this._itemsList;
  }

  // ==========================================
  // CHALLENGE 3: Derived State with Computed Signals
  // ==========================================
  // TODO: Transform totalCount and totalPrice into reactive Computed Signals dependent on items().
  // - totalCount: Sum of the quantity property of each cart item.
  // - totalPrice: Sum of quantity multiplied by the product price.
  // Hints:
  // totalCount = computed(() => this.items().reduce((acc, item) => acc + item.quantity, 0));
  // totalPrice = computed(() => this.items().reduce((acc, item) => acc + (item.product.price * item.quantity), 0));
  totalCount = 0;
  totalPrice = 0;

  // ==========================================
  // CHALLENGE 4: Immutable State Mutation
  // ==========================================
  
  addToCart(product: Product) {
    // Currently works by imperatively mutating the original array:
    const existing = this._itemsList.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this._itemsList.push({ product, quantity: 1 });
    }
    this.recalculateTotals();

    // TODO with Signals: When '_items' is a signal, update it immutably using .update().
    // Avoid destructive methods like .push() and create a new state array:
    //
    // this._items.update(currentItems => {
    //   const existingIndex = currentItems.findIndex(item => item.product.id === product.id);
    //   if (existingIndex > -1) {
    //     return currentItems.map((item, idx) => 
    //       idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
    //     );
    //   }
    //   return [...currentItems, { product, quantity: 1 }];
    // });
    // And completely remove the call to recalculateTotals(). Computed properties will do the job!
  }

  removeFromCart(productId: string) {
    // Currently works by imperatively mutating and recalculating:
    const existingIndex = this._itemsList.findIndex(item => item.product.id === productId);
    if (existingIndex > -1) {
      const existing = this._itemsList[existingIndex];
      if (existing.quantity > 1) {
        existing.quantity -= 1;
      } else {
        this._itemsList.splice(existingIndex, 1);
      }
    }
    this.recalculateTotals();

    // TODO with Signals: When '_items' is a signal, update it immutably using .update():
    //
    // this._items.update(currentItems => {
    //   return currentItems.map(item => {
    //     if (item.product.id === productId) {
    //       return { ...item, quantity: item.quantity - 1 };
    //     }
    //     return item;
    //   }).filter(item => item.quantity > 0);
    // });
    // And remove recalculateTotals().
  }

  clearCart() {
    // Traditional imperative clearing:
    this._itemsList = [];
    this.recalculateTotals();

    // TODO with Signals: Simply clear the value by assigning an empty array:
    // this._items.set([]);
  }

  // Imperative utility method (TO BE REMOVED when refactoring to computed properties)
  private recalculateTotals() {
    this.totalCount = this._itemsList.reduce((acc, item) => acc + item.quantity, 0);
    this.totalPrice = this._itemsList.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }
}