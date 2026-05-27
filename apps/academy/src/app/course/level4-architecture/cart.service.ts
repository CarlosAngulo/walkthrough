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
  // RETO 1: Estado Privado Reactivo con Signals
  // ==========================================
  // TODO: Reemplaza esta propiedad tradicional por una Writable Signal privada:
  // - _items = signal<CartItem[]>([]);
  // Asegúrate de usar la convención de guión bajo para indicar que es privada de la clase.
  private _itemsList: CartItem[] = [];

  // ==========================================
  // RETO 2: Exposición Segura de Solo Lectura
  // ==========================================
  // TODO: Un principio clave de arquitectura reactiva es que el estado no debe poder ser
  // mutado directamente por componentes externos. Expon el estado usando un Signal de solo lectura:
  // - items = this._items.asReadonly();
  // Cuando lo hagas, ¡puedes eliminar este getter tradicional!
  get items(): CartItem[] {
    return this._itemsList;
  }

  // ==========================================
  // RETO 3: Estado Derivado con Computed Signals
  // ==========================================
  // TODO: Transforma totalCount y totalPrice en Computed Signals reactivos dependientes de items().
  // - totalCount: Suma de la propiedad quantity de cada item del carrito.
  // - totalPrice: Suma de la cantidad multiplicada por el precio del producto.
  // Pistas:
  // totalCount = computed(() => this.items().reduce((acc, item) => acc + item.quantity, 0));
  // totalPrice = computed(() => this.items().reduce((acc, item) => acc + (item.product.price * item.quantity), 0));
  totalCount = 0;
  totalPrice = 0;

  // ==========================================
  // RETO 4: Mutación Inmutable de Estado
  // ==========================================
  
  addToCart(product: Product) {
    // Actualmente funciona mutando imperativamente el array original:
    const existing = this._itemsList.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this._itemsList.push({ product, quantity: 1 });
    }
    this.recalculateTotals();

    // TODO con Signals: Cuando '_items' sea una señal, actualízala inmutablemente usando .update().
    // Evita métodos destructivos como .push() y crea un nuevo array de estado:
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
    // Y elimina por completo la llamada a recalculateTotals(). ¡Las computadas harán el trabajo!
  }

  removeFromCart(productId: string) {
    // Actualmente funciona mutando imperativamente y recalculando:
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

    // TODO con Signals: Cuando '_items' sea una señal, actualízala inmutablemente usando .update():
    //
    // this._items.update(currentItems => {
    //   return currentItems.map(item => {
    //     if (item.product.id === productId) {
    //       return { ...item, quantity: item.quantity - 1 };
    //     }
    //     return item;
    //   }).filter(item => item.quantity > 0);
    // });
    // Y elimina recalculateTotals().
  }

  clearCart() {
    // Limpieza imperativa tradicional:
    this._itemsList = [];
    this.recalculateTotals();

    // TODO con Signals: Simplemente limpia el valor asignándole un array vacío:
    // this._items.set([]);
  }

  // Método utilitario imperativo (A ELIMINAR al refactorizar a computadas)
  private recalculateTotals() {
    this.totalCount = this._itemsList.reduce((acc, item) => acc + item.quantity, 0);
    this.totalPrice = this._itemsList.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }
}