import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Failed to load cart:', error);
    return [];
  }
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart:', error);
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCartFromStorage(),
    totalItems: 0,
    totalPrice: 0
  },
  reducers: {
    addToCart: (state, action) => {
      const { cropId, name, price, image, farmName, quantity } = action.payload;
      
      // Check if item already exists
      const existingItem = state.items.find(item => item.cropId === cropId);
      
      if (existingItem) {
        // Update quantity if item exists
        existingItem.quantity += quantity;
      } else {
        // Add new item
        state.items.push({
          id: Date.now().toString(),
          cropId,
          name,
          price,
          image,
          farmName,
          quantity
        });
      }
      
      // Update totals
      updateCartTotals(state);
      saveCartToStorage(state.items);
    },
    
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      updateCartTotals(state);
      saveCartToStorage(state.items);
    },
    
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        item.quantity = Math.max(1, quantity);
        updateCartTotals(state);
        saveCartToStorage(state.items);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      saveCartToStorage(state.items);
    }
  }
});

// Helper function to update cart totals
const updateCartTotals = (state) => {
  state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
