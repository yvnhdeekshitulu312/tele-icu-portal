import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare var bootstrap: any;

export interface CartItem {
  type: 'sickleave' | 'discharge' | 'medical';
  typeName: string;
  data: any;
  addedAt: Date;
}

export interface CartData {
  patientSSN: string;
  patientName: string;
  patientInfo: any;
  items: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<CartData | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor() {}

  getCurrentCart(): CartData | null {
    return this.cartSubject.value;
  }

  addToCart(item: CartItem, patientInfo: any): boolean {
    const currentCart = this.cartSubject.value;
    
    if (!currentCart) {
      // First item in cart
      this.cartSubject.next({
        patientSSN: patientInfo.SSN,
        patientName: patientInfo.PatientName,
        patientInfo: patientInfo,
        items: [item]
      });
      return true;
    }

    if (currentCart.patientSSN === patientInfo.SSN) {
      // Same patient - check if same type already exists
      const existingIndex = currentCart.items.findIndex(i => i.type === item.type);
      
      if (existingIndex !== -1) {
        // Replace existing item of same type
        currentCart.items[existingIndex] = item;
      } else {
        // Add new type
        currentCart.items.push(item);
      }
      
      this.cartSubject.next({ ...currentCart });
      return true;
    }

    // Different patient - return false to trigger confirmation
    return false;
  }

  replaceCart(item: CartItem, patientInfo: any): void {
    this.cartSubject.next({
      patientSSN: patientInfo.SSN,
      patientName: patientInfo.PatientName,
      patientInfo: patientInfo,
      items: [item]
    });
  }

  removeItem(type: string): void {
    const currentCart = this.cartSubject.value;
    if (!currentCart) return;

    currentCart.items = currentCart.items.filter(item => item.type !== type);
    
    if (currentCart.items.length === 0) {
      this.clearCart();
    } else {
      this.cartSubject.next({ ...currentCart });
    }
  }

  clearCart(): void {
    this.cartSubject.next(null);
  }

  getCartCount(): number {
    const currentCart = this.cartSubject.value;
    return currentCart ? currentCart.items.length : 0;
  }
}