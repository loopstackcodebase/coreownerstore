"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  AlertCircle,
  MessageCircle,
  Loader,
} from "lucide-react";
import { 
  getCartItems, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart,
  getCartItemCount 
} from "@/utils/cartHelpers";

interface CartProduct {
  _id: string;
  name: string;
  offerPrice: number;
  actualPrice: number;
  images: string[];
  category: string;
  availableLocation: string;
  inStock: boolean;
  totalQuantity: number; // Added this line
  store: {
    id: string;
    displayName: string;
    contactNumber?: string;
  };
  quantity: number; // This comes from localStorage
}

const MyCart = () => {
  const params = useParams();
  const router = useRouter();
  const { userid: username } = params;
  
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null); // Track which item is being updated

  // Fetch cart products on component mount
  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const cartItems = getCartItems();
        
        if (cartItems.length === 0) {
          setCartProducts([]);
          setLoading(false);
          return;
        }
        
        // Extract product IDs from cart
        const productIds = cartItems.map(item => item.productId);
        
        // Fetch product details from API
        const response = await fetch('/api/user/fetchCartProducts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productIds }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch cart products');
        }
        
        const data = await response.json();

        console.log('API Responseaaaaaa:', data);
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch cart products');
        }
        
        // Merge cart quantities with product data
        const productsWithQuantity = data.data.products.map((product: any) => {
          const cartItem = cartItems.find(item => item.productId === product._id);
          return {
            ...product,
            images: product.image ? [product.image] : [], // Convert single image to array
            quantity: cartItem?.quantity || 1
          };
        });
        
        setCartProducts(productsWithQuantity);
      } catch (error: any) {
        console.error('Error fetching cart products:', error);
        setError(error.message || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCartProducts();
  }, []);

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(productId);
    const result = updateCartItemQuantity(productId, newQuantity);
    
    if (result.success) {
      setCartProducts(products =>
        products.map(product =>
          product._id === productId ? { ...product, quantity: newQuantity } : product
        )
      );
    }
    
    setUpdating(null);
  };

  const removeItem = (productId: string) => {
    setUpdating(productId);
    const result = removeFromCart(productId);
    
    if (result.success) {
      setCartProducts(products => products.filter(product => product._id !== productId));
    }
    
    setUpdating(null);
  };

  const handleClearCart = () => {
    clearCart();
    setCartProducts([]);
  };

  const subtotal = cartProducts.reduce(
    (sum, product) => sum + product.offerPrice * product.quantity,
    0
  );
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const handleBuyNow = () => {
    if (cartProducts.length === 0) {
      console.warn("Attempted to buy now with an empty cart.");
      return;
    }
    const productList = cartProducts
      .map(
        (product) =>
          `${product.name} (Qty: ${product.quantity}) - ₹${(
            product.offerPrice * product.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    const message = `Hi! I'm interested in purchasing these items from your store:\n\n${productList}\n\nTotal: ₹${total.toFixed(
      2
    )}\n\nCan we proceed with the order?`;

    // Use the first store's contact number or a default
    const contactNumber = cartProducts[0]?.store?.contactNumber || "1234567890";
    const whatsappUrl = `https://wa.me/${contactNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Cart</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            <span>Back to Products</span>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
            <span>Home</span>
            <span>/</span>
            <span>Cart</span>
            <span>/</span>
            <span className="text-gray-800 font-medium">Your cart</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {cartProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={80} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500">Add some products to get started!</p>
            <button
              onClick={() => router.push(`/${username}`)}
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Cart Items
              </h2>

              {cartProducts.map((product) => (
                <div
                  key={product._id}
                  className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    updating === product._id ? 'opacity-50' : ''
                  }`}
                  onClick={() => router.push(`/${username}/view/${product._id}`)}
                >
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={product.images[0] || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-1">
                        {product.category}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Store: {product.store.displayName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xl font-bold text-green-600">
                          ₹{product.offerPrice.toFixed(2)}
                        </p>
                        {product.actualPrice > product.offerPrice && (
                          <p className="text-sm text-gray-400 line-through">
                            ₹{product.actualPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                     
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end space-y-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            updateQuantity(product._id, product.quantity - 1)
                          }
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                          disabled={product.quantity <= 1 || updating === product._id}
                        >
                          <Minus
                            size={16}
                            className={
                              product.quantity <= 1
                                ? "text-gray-400"
                                : "text-gray-600"
                            }
                          />
                        </button>

                        <div className="flex flex-col items-center">
                          <span className="w-16 text-center font-semibold text-lg">
                            {updating === product._id ? (
                              <Loader size={16} className="animate-spin mx-auto" />
                            ) : (
                              product.quantity
                            )}
                          </span>
                          <span className="text-xs text-gray-500">Quantity</span>
                        </div>

                        <button
                          onClick={() =>
                            updateQuantity(product._id, product.quantity + 1)
                          }
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                          disabled={updating === product._id || (!!product.totalQuantity && product.quantity >= product.totalQuantity)}
                        >
                          <Plus 
                            size={16} 
                            className={
                              product.totalQuantity && product.quantity >= product.totalQuantity
                                ? "text-gray-400"
                                : "text-gray-600"
                            }
                          />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">
                          ₹{(product.offerPrice * product.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{product.offerPrice.toFixed(2)} × {product.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(product._id);
                      }}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                      disabled={updating === product._id}
                    >
                      {updating === product._id ? (
                        <Loader size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 sticky top-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartProducts.length} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>

               

                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Clear Cart Button */}
                {cartProducts.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="w-full mb-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Clear Cart</span>
                  </button>
                )}

                {/* WhatsApp Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">
                        Quick Purchase Notice
                      </p>
                      <p className="text-yellow-700">
                        Clicking "Buy Now" will redirect you to WhatsApp where
                        you can connect directly with us regarding your
                        interested products in the cart.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <MessageCircle size={20} />
                  <span>Buy Now via WhatsApp</span>
                </button>

                {/* Additional Info */}
                <div className="mt-6 text-sm text-gray-600 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Secure checkout process</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Direct communication via WhatsApp</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Quick order processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Continue Shopping */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-18">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Need more items?
          </h3>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Explore our wide range of products and find what you're looking for.
          </p>
          <button 
            onClick={() => router.push(`/${username}`)}
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      
    </div>
  );
};

export default MyCart;
