"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Minus,
  Star,
  Heart,
  Share2,
  MessageCircle,
  AlertCircle,
  Shield,
  Truck,
  RotateCcw,
  MapPin,
  Eye,
  ShoppingCart,
  Loader,
} from "lucide-react";
import { addToCart, isProductInCart, getProductQuantityInCart } from "@/utils/cartHelpers";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  actualPrice: number;
  offerPrice: number;
  totalQuantity: number;
  availableLocation: string;
  inStock: boolean;
  keyFeatures: string[];
  totalViews: number;
  totalBuys: number;
  createdAt: string;
  discountPercentage: number;
}

interface Store {
  id: string;
  displayName: string;
  description: string;
  contactNumber?: string;
}

interface User {
  username: string;
}

interface RelatedProduct {
  _id: string;
  name: string;
  images: string[];
  actualPrice: number;
  offerPrice: number;
  availableLocation: string;
  category: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    product: Product;
    store: Store;
    user: User;
    relatedProducts: RelatedProduct[];
    moreFromStore: RelatedProduct[];
    metadata: {
      viewsIncremented: boolean;
      relatedCount: number;
      moreFromStoreCount: number;
    };
  };
}

// OPTIMIZATION: Skeleton components for better loading experience
const ProductImageSkeleton = () => (
  <div className="space-y-4">
    <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
    <div className="grid grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-gray-200 rounded-lg animate-pulse"
        ></div>
      ))}
    </div>
  </div>
);

const ProductDetailsSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
      <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
      </div>
    </div>
  </div>
);

const ProductView = () => {
  const params = useParams();
  const router = useRouter();
  const { userid: username, id: productId } = params;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productData, setProductData] = useState<ApiResponse["data"] | null>(
    null
  );
  const [isInCart, setIsInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!username || !productId) return;

      try {
        setLoading(true);
        setError(null);

        // OPTIMIZATION: Use AbortController for request cancellation
        const abortController = new AbortController();

        // OPTIMIZATION: Start the fetch immediately with minimal headers
        const response = await fetch(
          `/api/user/products/viewProducts/${username}/${productId}`,
          {
            method: "GET",
            headers: {
              "increment-views": "true",
              // OPTIMIZATION: Add cache control
              "Cache-Control": "no-cache",
            },
            signal: abortController.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (!data.success) {
          setError(data.message || "Failed to fetch product");
          return;
        }

        setProductData(data.data);

        // Check if product is in cart
        if (typeof productId === 'string') {
          setIsInCart(isProductInCart(productId));
          setCartQuantity(getProductQuantityInCart(productId));
        }

        // OPTIMIZATION: Preload first image
        if (data.data.product.images?.[0]) {
          const img = new Image();
          img.src = data.data.product.images[0];
        }

        return () => abortController.abort();
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError("An error occurred while fetching the product");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [username, productId]);

  // Check cart status when product data changes
  useEffect(() => {
    if (productData?.product) {
      const inCart = isProductInCart(productData.product._id);
      const quantity = getProductQuantityInCart(productData.product._id);
      setIsInCart(inCart);
      setCartQuantity(quantity);
    }
  }, [productData]);

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (productData && newQuantity > productData.product.totalQuantity) return;
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!productData?.product || !productData?.store) return;
    
    setAddingToCart(true);
    try {
      const result = addToCart(productData.product._id, productData.store.id, quantity);
      
      if (result.success) {
        setIsInCart(true);
        setCartQuantity(getProductQuantityInCart(productData.product._id));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!productData) return;

    const { product, store } = productData;
    const unitPrice = product.offerPrice || product.actualPrice;
    const totalPrice = unitPrice * quantity;
    const savings = product.offerPrice
      ? (product.actualPrice - product.offerPrice) * quantity
      : 0;
    const currentUrl = window.location.href;

    const message = `Dear ${store.displayName},

I am interested in purchasing this product. Please confirm product availability and advise on the ordering process. Looking forward to your response.

PRODUCT DETAILS:
Product Name: ${product.name}

PRICING INFORMATION:
${
  product.offerPrice
    ? `Actual Price (per unit): Rs.${product.actualPrice.toFixed(
        2
      )}\nOffer Price (per unit): Rs.${product.offerPrice.toFixed(2)}`
    : `Price (per unit): Rs.${product.actualPrice.toFixed(2)}`
}
Quantity: ${quantity}
--------------------------------
Total Amount: Rs.${totalPrice.toFixed(2)}${
      savings > 0 ? `\nTotal Savings: Rs.${savings.toFixed(2)}` : ""
    }

Product Link: ${currentUrl}

Thank you`;

    const phoneNumber = store.contactNumber || "1234567890";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productData?.product.name,
          text: productData?.product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header Skeleton - FIXED */}
        <div className="bg-gray-50 border-b border-gray-200 py-4">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center space-x-2 mb-4">
              <ArrowLeft size={20} className="text-gray-400" />
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <ProductImageSkeleton />
            <ProductDetailsSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "This product could not be found."}
          </p>
          <button
            onClick={handleGoBack}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { product, store, user, relatedProducts, moreFromStore } = productData;

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
            <span>Products</span>
            <span>/</span>
            <span className="text-gray-800 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="eager" // OPTIMIZATION: Load first image immediately
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/500/500";
                }}
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-green-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy" // OPTIMIZATION: Lazy load thumbnails
                      onError={(e) => {
                        e.currentTarget.src = "/api/placeholder/100/100";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-500">
                  {store.displayName}
                </span>
                {product.inStock ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    In Stock ({product.totalQuantity} available)
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Stats */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Eye size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {product.totalViews} views
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <ShoppingCart size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {product.totalBuys} sold
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {product.availableLocation}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-green-600">
                  ₹{product.offerPrice.toFixed(2)}
                </span>
                {product.actualPrice > product.offerPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.actualPrice.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                      {product.discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Key Features */}
              {product.keyFeatures && product.keyFeatures.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {product.keyFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity Selector */}
              {product.inStock && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Quantity
                  </h3>
                  <div className="flex items-center space-x-4 text-black">
                    <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-2">
                      <button
                        onClick={() => updateQuantity(quantity - 1)}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus
                          size={16}
                          className={
                            quantity <= 1 ? "text-gray-400" : "text-gray-600"
                          }
                        />
                      </button>

                      <span className="w-12 text-center font-semibold text-lg">
                        {quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(quantity + 1)}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        disabled={quantity >= product.totalQuantity}
                      >
                        <Plus
                          size={16}
                          className={
                            quantity >= product.totalQuantity
                              ? "text-gray-400"
                              : "text-gray-600"
                          }
                        />
                      </button>
                    </div>
                    <span className="text-gray-600">
                      Total:{" "}
                      <span className="font-semibold text-gray-800">
                        ₹{(product.offerPrice * quantity).toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>
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
                      Clicking "Buy Now" will redirect you to WhatsApp where you
                      can connect directly with the seller regarding this
                      product.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 mb-6">
                {/* Quantity Selector and Add to Cart */}
                <div className="flex flex-col space-y-4">
                  

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      if (isInCart) {
                        router.push(`/${username}/cart`);
                      } else {
                        handleAddToCart();
                      }
                    }}
                    disabled={!product.inStock || addingToCart}
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                      product.inStock && !addingToCart
                        ? isInCart
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {addingToCart ? (
                      <Loader size={20} className="animate-spin" />
                    ) : isInCart ? (
                      <ShoppingCart size={20} />
                    ) : (
                      <ShoppingCart size={20} />
                    )}
                    <span>
                      {addingToCart 
                        ? "Adding..." 
                        : isInCart 
                          ? "View Cart" 
                          : "Add to Cart"
                      }
                    </span>
                  </button>

               
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                    product.inStock
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <MessageCircle size={20} />
                  <span>
                    {product.inStock ? "Buy Now via WhatsApp" : "Out of Stock"}
                  </span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Shield className="text-green-600 mx-auto mb-2" size={24} />
                  <p className="text-sm font-medium text-gray-800">
                    Quality Assured
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <MessageCircle
                    className="text-green-600 mx-auto mb-2"
                    size={24}
                  />
                  <p className="text-sm font-medium text-gray-800">
                    Direct Contact
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Heart className="text-green-600 mx-auto mb-2" size={24} />
                  <p className="text-sm font-medium text-gray-800">
                    Customer Care
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OPTIMIZATION: Lazy load related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              Similar Products
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow group cursor-pointer"
                  onClick={() =>
                    router.push(`/${username}/view/${relatedProduct._id}`)
                  }
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy" // OPTIMIZATION: Lazy load related product images
                      onError={(e) => {
                        e.currentTarget.src = "/api/placeholder/300/300";
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                      {relatedProduct.name}
                    </h3>

                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <MapPin size={12} />
                      <span>{relatedProduct.availableLocation}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-600">
                        ₹{relatedProduct.offerPrice}
                      </span>
                      {relatedProduct.actualPrice >
                        relatedProduct.offerPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{relatedProduct.actualPrice}
                        </span>
                      )}
                    </div>

                    <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* More from Store */}
        {moreFromStore.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              More from {store.displayName}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreFromStore.slice(0, 6).map((storeProduct) => (
                <div
                  key={storeProduct._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow group cursor-pointer"
                  onClick={() =>
                    router.push(`/${username}/view/${storeProduct._id}`)
                  }
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img
                      src={storeProduct.images[0]}
                      alt={storeProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy" // OPTIMIZATION: Lazy load store product images
                      onError={(e) => {
                        e.currentTarget.src = "/api/placeholder/300/300";
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                      {storeProduct.name}
                    </h3>

                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {storeProduct.category}
                      </span>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <MapPin size={12} />
                        <span>{storeProduct.availableLocation}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-600">
                        ₹{storeProduct.offerPrice}
                      </span>
                      {storeProduct.actualPrice > storeProduct.offerPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{storeProduct.actualPrice}
                        </span>
                      )}
                    </div>

                    <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Explore More Products from {store.displayName}
          </h3>
          <p className="text-gray-600 mb-6">
            Discover more amazing products carefully selected for you.
          </p>
          <button
            onClick={() => router.push(`/${username}`)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200"
          >
            Browse All Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
