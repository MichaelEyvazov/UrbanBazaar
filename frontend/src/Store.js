/**
 * Store Context:
 * Handles user info, cart, and theme persistence.
 * Each user has isolated storage keys to avoid data overlap.
 */
import React, { createContext, useReducer } from 'react';

const idOrEmail = (user) => (user?._id || user?.email || 'guest');

const cartItemsKeyFor = (user) => `cartItems_${idOrEmail(user)}`;
const shipAddrKeyFor  = (user) => `shippingAddress_${idOrEmail(user)}`;
const payMethodKeyFor = (user) => `paymentMethod_${idOrEmail(user)}`;
const themeKeyFor     = (user) => `theme_${idOrEmail(user)}`;

const parse = (v, fallback) => {
  try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};

const loadCartFor = (user) => ({
  cartItems: parse(localStorage.getItem(cartItemsKeyFor(user)), []),
  shippingAddress: parse(localStorage.getItem(shipAddrKeyFor(user)), {}),
  paymentMethod: parse(localStorage.getItem(payMethodKeyFor(user)), ''),
});

const saveCartFor = (user, cart) => {
  localStorage.setItem(cartItemsKeyFor(user), JSON.stringify(cart.cartItems || []));
  localStorage.setItem(shipAddrKeyFor(user), JSON.stringify(cart.shippingAddress || {}));
  localStorage.setItem(payMethodKeyFor(user), JSON.stringify(cart.paymentMethod || ''));
};

const loadThemeFor = (user) =>
  localStorage.getItem(themeKeyFor(user)) || 'light';

const saveThemeFor = (user, theme) =>
  localStorage.setItem(themeKeyFor(user), theme);

const initialUser = parse(localStorage.getItem('userInfo'), null);

export const initialState = {
  userInfo: initialUser,
  cart: loadCartFor(initialUser),
  theme: loadThemeFor(initialUser),
};

function reducer(state, action) {
  switch (action.type) {
    
    case 'USER_SIGNIN': {
      const user = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(user));
      return {
        ...state,
        userInfo: user,
        cart: loadCartFor(user),
        theme: loadThemeFor(user),
      };
    }
    case 'USER_SIGNOUT': {
      localStorage.removeItem('userInfo');
      return {
        ...state,
        userInfo: null,
        cart: loadCartFor(null),  
        theme: loadThemeFor(null), 
      };
    }

 
    case 'CART_ADD_ITEM': {
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find((x) => x._id === newItem._id);
      const cartItems = existItem
        ? state.cart.cartItems.map((x) => (x._id === existItem._id ? newItem : x))
        : [...state.cart.cartItems, newItem];

      const nextCart = { ...state.cart, cartItems };
      saveCartFor(state.userInfo, nextCart);
      return { ...state, cart: nextCart };
    }
    case 'CART_REMOVE_ITEM': {
      const cartItems = state.cart.cartItems.filter((x) => x._id !== action.payload._id);
      const nextCart = { ...state.cart, cartItems };
      saveCartFor(state.userInfo, nextCart);
      return { ...state, cart: nextCart };
    }
    case 'CART_CLEAR': {
      const nextCart = { ...state.cart, cartItems: [] };
      saveCartFor(state.userInfo, nextCart);
      return { ...state, cart: nextCart };
    }

    
    case 'SAVE_SHIPPING_ADDRESS': {
      const nextCart = { ...state.cart, shippingAddress: action.payload };
      saveCartFor(state.userInfo, nextCart);
      return { ...state, cart: nextCart };
    }
    case 'SAVE_PAYMENT_METHOD': {
      const nextCart = { ...state.cart, paymentMethod: action.payload };
      saveCartFor(state.userInfo, nextCart);
      return { ...state, cart: nextCart };
    }

    case 'THEME_SET': {
      const theme = action.payload || 'light';
      saveThemeFor(state.userInfo, theme);
      return { ...state, theme };
    }

    default:
      return state;
  }
}

export const Store = createContext();

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}