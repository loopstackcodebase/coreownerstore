// Cart Helper Functions for localStorage management
// Maximum 10 items allowed in cart

export interface CartItem {
  productId: string;
  storeId: string;
  quantity: number;
}

const CART_STORAGE_KEY = 'loopstack_cart';
const MAX_CART_ITEMS = 10;

/**
 * Get all cart items from localStorage
 */
export const getCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
};

/**
 * Save cart items to localStorage
 */
const saveCartItems = (items: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

/**
 * Add item to cart or update quantity if item already exists
 * Returns success status and message
 */
export const addToCart = (productId: string, storeId: string, quantity: number = 1): { success: boolean; message: string } => {
  const cartItems = getCartItems();
  
  // Check if item already exists in cart
  const existingItemIndex = cartItems.findIndex(item => item.productId === productId);
  
  if (existingItemIndex !== -1) {
    // Update existing item quantity
    const newQuantity = cartItems[existingItemIndex].quantity + quantity;
    cartItems[existingItemIndex].quantity = newQuantity;
    saveCartItems(cartItems);
    return { success: true, message: 'Item quantity updated in cart' };
  }
  
  // Check if cart is full
  if (cartItems.length >= MAX_CART_ITEMS) {
    return { success: false, message: `Cart is full! Maximum ${MAX_CART_ITEMS} items allowed.` };
  }
  
  // Add new item to cart
  const newItem: CartItem = {
    productId,
    storeId,
    quantity
  };
  
  cartItems.push(newItem);
  saveCartItems(cartItems);
  
  return { success: true, message: 'Item added to cart successfully' };
};

/**
 * Update quantity of a specific item in cart
 */
export const updateCartItemQuantity = (productId: string, quantity: number): { success: boolean; message: string } => {
  if (quantity < 1) {
    return { success: false, message: 'Quantity must be at least 1' };
  }
  
  const cartItems = getCartItems();
  const itemIndex = cartItems.findIndex(item => item.productId === productId);
  
  if (itemIndex === -1) {
    return { success: false, message: 'Item not found in cart' };
  }
  
  cartItems[itemIndex].quantity = quantity;
  saveCartItems(cartItems);
  
  return { success: true, message: 'Item quantity updated' };
};

/**
 * Remove item from cart
 */
export const removeFromCart = (productId: string): { success: boolean; message: string } => {
  const cartItems = getCartItems();
  const filteredItems = cartItems.filter(item => item.productId !== productId);
  
  if (filteredItems.length === cartItems.length) {
    return { success: false, message: 'Item not found in cart' };
  }
  
  saveCartItems(filteredItems);
  return { success: true, message: 'Item removed from cart' };
};

/**
 * Clear all items from cart
 */
export const clearCart = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
};

/**
 * Get total number of items in cart
 */
export const getCartItemCount = (): number => {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Check if a product is already in cart
 */
export const isProductInCart = (productId: string): boolean => {
  const cartItems = getCartItems();
  return cartItems.some(item => item.productId === productId);
};

/**
 * Get quantity of a specific product in cart
 */
export const getProductQuantityInCart = (productId: string): number => {
  const cartItems = getCartItems();
  const item = cartItems.find(item => item.productId === productId);
  return item ? item.quantity : 0;
};

/**
 * Get all product IDs from cart (useful for API calls)
 */
export const getCartProductIds = (): string[] => {
  const cartItems = getCartItems();
  return cartItems.map(item => item.productId);
};

/**
 * Check if cart is full
 */
export const isCartFull = (): boolean => {
  return getCartItems().length >= MAX_CART_ITEMS;
};