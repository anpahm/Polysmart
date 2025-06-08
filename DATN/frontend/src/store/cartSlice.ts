"use client";

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  price: number;
  image: string;
  colors: string[];
  selectedColor: number;
  colorName?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: typeof window !== 'undefined' && localStorage.getItem('cart')
    ? JSON.parse(localStorage.getItem('cart') as string)
    : [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const idx = state.items.findIndex(
        item => item.productId === action.payload.productId && item.variantId === action.payload.variantId
      );
      if (idx > -1) {
        state.items[idx].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action: PayloadAction<{productId: string, variantId: string}>) => {
      state.items = state.items.filter(item => !(item.productId === action.payload.productId && item.variantId === action.payload.variantId));
      if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(state.items));
    },
    changeQuantity: (state, action: PayloadAction<{productId: string, variantId: string, delta: number}>) => {
      const idx = state.items.findIndex(item => item.productId === action.payload.productId && item.variantId === action.payload.variantId);
      if (idx > -1) {
        state.items[idx].quantity = Math.max(1, state.items[idx].quantity + action.payload.delta);
        if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(state.items));
    }
  }
});

export const { addToCart, removeFromCart, changeQuantity, setCart } = cartSlice.actions;
export default cartSlice.reducer; 