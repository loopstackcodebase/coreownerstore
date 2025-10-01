// "use client";

// import React, { useEffect, useState } from "react";
// import { ArrowRight, Search, Loader2 } from "lucide-react";
// import { useParams } from "next/navigation";

// interface Product {
//   _id: string;
//   name: string;
//   description: string;
//   actualPrice: number;
//   offerPrice?: number;
//   images: string[];
//   category: string;
//   totalViews: number;
//   totalBuys: number;
//   inStock: boolean;
//   keyFeatures: string[];
//   createdAt: string;
//   updatedAt: string;
// }

// interface ApiResponse {
//   success: boolean;
//   message: string;
//   data: {
//     products: Product[];
//     store: {
//       id: string;
//       displayName: string;
//       description: string;
//     };
//     user: {
//       username: string;
//     };
//     pagination: {
//       currentPage: number;
//       totalPages: number;
//       totalProducts: number;
//       hasNextPage: boolean;
//       hasPrevPage: boolean;
//       limit: number;
//     };
//     filters: {
//       categories: string[];
//       appliedFilters: {
//         category: string | null;
//         search: string | null;
//       };
//     };
//   };
// }

// const ProductList: React.FC = () => {
//   const params = useParams();
//   const userid = params.userid as string;

//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [storeInfo, setStoreInfo] = useState<any>(null);
//   const [pagination, setPagination] = useState<any>(null);
//   const [availableCategories, setAvailableCategories] = useState<string[]>([]);

//   const productsPerPage = 10;

//   // Special category filters (virtual categories)
//   const specialCategoryFilters = [
//     {
//       id: "special",
//       name: "Special Offers",
//       image:
//         "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop",
//       description: "Products with special pricing",
//     },
//     {
//       id: "limited",
//       name: "Limited Stock",
//       image:
//         "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
//       description: "Low stock items",
//     },
//     {
//       id: "popular",
//       name: "Popular",
//       image:
//         "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
//       description: "Most popular items",
//     },
//   ];

//   const fetchProducts = async (
//     page: number = 1,
//     search: string = "",
//     category: string = "all"
//   ) => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Build simplified search params
//       const searchParams = new URLSearchParams({
//         page: page.toString(),
//         limit: productsPerPage.toString(),
//       });

//       if (search) {
//         searchParams.append("search", search);
//       }

//       // Only add category if it's not "all"
//       if (category && category !== "all") {
//         searchParams.append("category", category);
//       }

//       const response = await fetch(
//         `/api/user/products/fetchProducts/${userid}?${searchParams.toString()}`
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch products");
//       }

//       const data: ApiResponse = await response.json();

//       if (!data.success) {
//         throw new Error(data.message || "Failed to fetch products");
//       }

//       setProducts(data.data.products);
//       setStoreInfo(data.data.store);
//       setPagination(data.data.pagination);
//       setAvailableCategories(data.data.filters.categories);
//     } catch (err: any) {
//       setError(err.message);
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (userid) {
//       fetchProducts(currentPage, searchQuery, selectedCategory);
//     }
//   }, [userid, currentPage, searchQuery, selectedCategory]);

//   useEffect(() => {
//     const handleCategoryChange = (event: any) => {
//       setSelectedCategory(event.detail);
//       setCurrentPage(1);
//     };

//     window.addEventListener("categoryChange", handleCategoryChange);
//     return () => {
//       window.removeEventListener("categoryChange", handleCategoryChange);
//     };
//   }, []);

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setSearchQuery(value);
//     setCurrentPage(1);

//     // Debounce search to avoid too many API calls
//     const timeoutId = setTimeout(() => {
//       fetchProducts(1, value, selectedCategory);
//     }, 500);

//     return () => clearTimeout(timeoutId);
//   };

//   const handleCategorySelect = (categoryId: string) => {
//     setSelectedCategory(categoryId);
//     setCurrentPage(1);
//   };

//   const truncateProductName = (name: string) => {
//     if (name.length <= 19) return name;
//     return name.substring(0, 19).trim() + "...";
//   };

//   const truncateDescription = (description: string) => {
//     if (description.length <= 39) return description;
//     return description.substring(0, 39).trim() + "...";
//   };

//   const formatPrice = (price: number) => {
//     const priceStr = price.toString();
//     if (priceStr.length > 6) {
//       return priceStr.substring(0, 6) + "...";
//     }
//     return `₹${price}`;
//   };

//   const getCategoryDisplayName = (categoryId: string) => {
//     switch (categoryId) {
//       case "all":
//         return "All Products";
//       case "special":
//         return "Special Offers";
//       case "limited":
//         return "Limited Stock";
//       case "popular":
//         return "Popular Products";
//       default:
//         return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
//     }
//   };

//   const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
//     <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer h-80 bg-white">
//       <div className="relative h-full overflow-hidden">
//         <img
//           src={
//             product.images[0] ||
//             "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
//           }
//           alt={product.name}
//           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//         />

//         {/* Overlay gradients */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

//         {/* Special offer badge */}
//         {product.offerPrice && product.offerPrice > 0 && (
//           <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
//             OFFER
//           </div>
//         )}

//         {/* Low stock badge */}
//         {!product.inStock && (
//           <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold">
//             OUT OF STOCK
//           </div>
//         )}

//         {/* Product info */}
//         <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
//           <div className="flex items-center gap-2 mb-2">
//             <span className="text-xs text-gray-300 px-2 py-1 bg-white/20 rounded-full">
//               {product.category}
//             </span>
//           </div>

//           <h3 className="font-bold text-xl mb-1 leading-tight whitespace-nowrap overflow-hidden">
//             <span className="block" title={product.name}>
//               {truncateProductName(product.name)}
//             </span>
//           </h3>

//           <div className="mb-3">
//             <p
//               className="text-gray-200 text-sm leading-relaxed whitespace-nowrap overflow-hidden"
//               title={product.description}
//             >
//               {truncateDescription(product.description)}
//             </p>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               {product.offerPrice && product.offerPrice > 0 ? (
//                 <>
//                   <span
//                     className="text-2xl font-bold text-green-400"
//                     title={`₹${product.offerPrice}`}
//                   >
//                     {formatPrice(product.offerPrice)}
//                   </span>
//                   <span
//                     className="text-sm text-gray-300 line-through font-medium"
//                     title={`₹${product.actualPrice}`}
//                   >
//                     {formatPrice(product.actualPrice)}
//                   </span>
//                 </>
//               ) : (
//                 <span
//                   className="text-2xl font-bold text-white"
//                   title={`₹${product.actualPrice}`}
//                 >
//                   {formatPrice(product.actualPrice)}
//                 </span>
//               )}
//             </div>
//             <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 group-hover:bg-white/30 transition-all duration-200">
//               <ArrowRight className="w-5 h-5 text-white" />
//             </div>
//           </div>

//           {/* Views and buys stats */}
//           <div className="flex items-center gap-4 mt-2 text-xs text-gray-300">
//             <span>{product.totalViews} views</span>
//             <span>{product.totalBuys} sold</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const Pagination: React.FC = () => {
//     if (!pagination || pagination.totalPages <= 1) return null;

//     return (
//       <div className="flex justify-center items-center mt-12 gap-2">
//         <button
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={!pagination.hasPrevPage}
//           className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
//             !pagination.hasPrevPage
//               ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//               : "bg-white text-gray-700 shadow-md hover:shadow-lg hover:bg-gray-50"
//           }`}
//         >
//           Previous
//         </button>

//         <div className="flex gap-2">
//           {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
//             (page) => (
//               <button
//                 key={page}
//                 onClick={() => handlePageChange(page)}
//                 className={`w-12 h-12 text-sm font-semibold rounded-xl transition-all duration-200 ${
//                   currentPage === page
//                     ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
//                     : "bg-white text-gray-700 shadow-md hover:shadow-lg hover:bg-gray-50"
//                 }`}
//               >
//                 {page}
//               </button>
//             )
//           )}
//         </div>

//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={!pagination.hasNextPage}
//           className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
//             !pagination.hasNextPage
//               ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//               : "bg-white text-gray-700 shadow-md hover:shadow-lg hover:bg-gray-50"
//           }`}
//         >
//           Next
//         </button>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
//           <p className="text-gray-600">Loading products...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
//         <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
//           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Search className="w-8 h-8 text-red-500" />
//           </div>
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
//           <p className="text-red-500 mb-4">{error}</p>
//           <button
//             onClick={() =>
//               fetchProducts(currentPage, searchQuery, selectedCategory)
//             }
//             className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
//       <div className="flex h-screen">
//         {/* Desktop Sidebar */}
//         <div className="hidden lg:block w-80 bg-white shadow-lg min-h-screen sticky top-0">
//           <div className="p-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">
//               {storeInfo?.displayName || "Store"}
//             </h2>
//             {storeInfo?.description && (
//               <p className="text-gray-600 text-sm mb-6">
//                 {storeInfo.description}
//               </p>
//             )}

//             <h3 className="text-lg font-semibold text-gray-800 mb-4">
//               Categories
//             </h3>

//             {/* All Products Card */}
//             <div
//               onClick={() => handleCategorySelect("all")}
//               className={`mb-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
//                 selectedCategory === "all"
//                   ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
//                   : "bg-gray-50 hover:bg-gray-100 text-gray-700"
//               }`}
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                   <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded"></div>
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-lg">All Products</h4>
//                   <p
//                     className={`text-sm ${
//                       selectedCategory === "all"
//                         ? "text-green-100"
//                         : "text-gray-500"
//                     }`}
//                   >
//                     View all items
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Special Virtual Category Cards */}
//             {specialCategoryFilters.map((category) => (
//               <div
//                 key={category.id}
//                 onClick={() => handleCategorySelect(category.id)}
//                 className={`mb-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
//                   selectedCategory === category.id
//                     ? "bg-gradient-to-r  from-green-500 to-emerald-600 text-white shadow-lg"
//                     : "bg-gray-50 hover:bg-gray-100 text-gray-700"
//                 }`}
//               >
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={category.image}
//                     alt={category.name}
//                     className="w-12 h-12 object-cover rounded-lg"
//                   />
//                   <div>
//                     <h4 className="font-semibold text-lg">{category.name}</h4>
//                     <p
//                       className={`text-sm ${
//                         selectedCategory === category.id
//                           ? "text-purple-100"
//                           : "text-gray-500"
//                       }`}
//                     >
//                       {category.description}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 overflow-y-auto">
//           <div className="px-4 lg:px-8 py-8">
//             <div className="max-w-7xl mx-auto">
//               {/* Search Bar */}
//               <div className="mb-8">
//                 <div className="relative max-w-md">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Search className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={handleSearch}
//                     placeholder="Search products..."
//                     className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 shadow-sm"
//                   />
//                 </div>
//               </div>

//               {/* Category Title and Stats */}
//               <div className="mb-8">
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                   {getCategoryDisplayName(selectedCategory)}
//                 </h1>
//                 <p className="text-gray-600">
//                   Showing {products.length} products
//                   {pagination &&
//                     ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
//                 </p>
//               </div>

//               {/* No Results Message */}
//               {products.length === 0 && (
//                 <div className="text-center py-20">
//                   <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
//                     <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                       <Search className="w-8 h-8 text-green-500" />
//                     </div>
//                     <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                       No products found
//                     </h3>
//                     <p className="text-gray-500 mb-6">
//                       {searchQuery
//                         ? `No results for "${searchQuery}"`
//                         : selectedCategory === "special"
//                         ? "No products with special offers found"
//                         : selectedCategory === "limited"
//                         ? "No limited stock items found"
//                         : selectedCategory === "popular"
//                         ? "No popular products found"
//                         : `No products available in ${selectedCategory}`}
//                     </p>
//                     {searchQuery && (
//                       <button
//                         onClick={() => setSearchQuery("")}
//                         className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
//                       >
//                         Clear Search
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Products Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
//                 {products.map((product) => (
//                   <ProductCard key={product._id} product={product} />
//                 ))}
//               </div>

//               {/* Pagination */}
//               <Pagination />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductList;

"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Search, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  description: string;
  actualPrice: number;
  offerPrice?: number;
  images: string[];
  category: string;
  totalViews: number;
  totalBuys: number;
  inStock: boolean;
  keyFeatures: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    store: {
      id: string;
      displayName: string;
      description: string;
    };
    user: {
      username: string;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
    filters: {
      categories: string[];
      appliedFilters: {
        category: string | null;
        search: string | null;
      };
    };
  };
}

const ProductList: React.FC = () => {
  const params = useParams();
  const userid = params.userid as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false); // New state for products-only loading
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const router = useRouter();

  const productsPerPage = 10;

  // Special category filters (virtual categories)
  const specialCategoryFilters = [
    {
      id: "special",
      name: "Special Offers",
      image:
        "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop",
      description: "Products with special pricing",
    },
    {
      id: "limited",
      name: "Limited Stock",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      description: "Low stock items",
    },
    {
      id: "popular",
      name: "Popular",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      description: "Most popular items",
    },
  ];

  const fetchProducts = async (
    page: number = 1,
    search: string = "",
    category: string = "all",
    isInitialLoad: boolean = false
  ) => {
    try {
      if (isInitialLoad) {
        setInitialLoading(true);
      } else {
        setProductsLoading(true);
      }
      setError(null);

      // Build simplified search params
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: productsPerPage.toString(),
      });

      if (search) {
        searchParams.append("search", search);
      }

      // Only add category if it's not "all"
      if (category && category !== "all") {
        searchParams.append("category", category);
      }

      const response = await fetch(
        `/api/user/products/fetchProducts/${userid}?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data.data.products);
      if (isInitialLoad) {
        setStoreInfo(data.data.store);
      }
      setPagination(data.data.pagination);
      setAvailableCategories(data.data.filters.categories);
    } catch (err: any) {
      setError(err.message);
      setProducts([]);
    } finally {
      if (isInitialLoad) {
        setInitialLoading(false);
      } else {
        setProductsLoading(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    if (userid) {
      fetchProducts(1, "", "all", true);
    }
  }, [userid]);

  // Fetch products when filters change (not initial load)
  useEffect(() => {
    if (userid && !initialLoading) {
      fetchProducts(currentPage, searchQuery, selectedCategory, false);
    }
  }, [currentPage, searchQuery, selectedCategory]);

  useEffect(() => {
    const handleCategoryChange = (event: any) => {
      event.preventDefault();
      event.stopPropagation();
      setSelectedCategory(event.detail);
      setCurrentPage(1);
    };

    window.addEventListener("categoryChange", handleCategoryChange);
    return () => {
      window.removeEventListener("categoryChange", handleCategoryChange);
    };
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top of products section instead of entire page
    const mainContent = document.querySelector(".products-section");
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategorySelect = (
    categoryId: string,
    event?: React.MouseEvent
  ) => {
    // Prevent default behavior and stop propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Only update if it's actually a different category
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId);
      setCurrentPage(1);
    }
  };

  const truncateProductName = (name: string) => {
    if (name.length <= 19) return name;
    return name.substring(0, 19).trim() + "...";
  };

  const truncateDescription = (description: string) => {
    if (description.length <= 39) return description;
    return description.substring(0, 39).trim() + "...";
  };

  const formatPrice = (price: number) => {
    const priceStr = price.toString();
    if (priceStr.length > 6) {
      return priceStr.substring(0, 6) + "...";
    }
    return `₹${price}`;
  };

  const getCategoryDisplayName = (categoryId: string) => {
    switch (categoryId) {
      case "all":
        return "All Products";
      case "special":
        return "Special Offers";
      case "limited":
        return "Limited Stock";
      case "popular":
        return "Popular Products";
      default:
        return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    }
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div
      onClick={() => router.push(`/${userid}/view/${product._id}`)}
      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer h-80 bg-white"
    >
      <div className="relative h-full overflow-hidden">
        <img
          src={
            product.images[0] ||
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
          }
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Special offer badge */}
        {product.offerPrice && product.offerPrice > 0 && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            OFFER
          </div>
        )}

        {/* Low stock badge */}
        {!product.inStock && (
          <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold">
            OUT OF STOCK
          </div>
        )}

        {/* Product info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-300 px-2 py-1 bg-white/20 rounded-full">
              {product.category}
            </span>
          </div>

          <h3 className="font-bold text-xl mb-1 leading-tight whitespace-nowrap overflow-hidden">
            <span className="block" title={product.name}>
              {truncateProductName(product.name)}
            </span>
          </h3>

          <div className="mb-3">
            <p
              className="text-gray-200 text-sm leading-relaxed whitespace-nowrap overflow-hidden"
              title={product.description}
            >
              {truncateDescription(product.description)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {product.offerPrice && product.offerPrice > 0 ? (
                <>
                  <span
                    className="text-2xl font-bold text-green-400"
                    title={`₹${product.offerPrice}`}
                  >
                    {formatPrice(product.offerPrice)}
                  </span>
                  <span
                    className="text-sm text-gray-300 line-through font-medium"
                    title={`₹${product.actualPrice}`}
                  >
                    {formatPrice(product.actualPrice)}
                  </span>
                </>
              ) : (
                <span
                  className="text-2xl font-bold text-white"
                  title={`₹${product.actualPrice}`}
                >
                  {formatPrice(product.actualPrice)}
                </span>
              )}
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 group-hover:bg-white/30 transition-all duration-200">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Views and buys stats */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-300">
            <span>{product.totalViews} views</span>
            <span>{product.totalBuys} sold</span>
          </div>
        </div>
      </div>
    </div>
  );

  const Pagination: React.FC = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center mt-12 gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pagination.hasPrevPage || productsLoading}
          className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
            !pagination.hasPrevPage || productsLoading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 shadow-md hover:shadow-lg hover:bg-gray-50"
          }`}
        >
          Previous
        </button>

        <div className="flex gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={productsLoading}
                className={`w-12 h-12 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  currentPage === page
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : productsLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 shadow-md hover:shadow-lg hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage || productsLoading}
          className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
            !pagination.hasNextPage || productsLoading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 shadow-md hover:shadow-lg hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  // Loading overlay component for products section
  const ProductsLoadingOverlay: React.FC = () => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600 font-medium">Loading products...</p>
      </div>
    </div>
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error && !storeInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchProducts(1, "", "all", true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="flex h-screen">
        {/* Desktop Sidebar - Fixed, no refresh */}
        <div className="hidden lg:block w-80 bg-white shadow-lg min-h-screen sticky top-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Categories
            </h3>

            {/* All Products Card */}
            <div
              onClick={(e) => handleCategorySelect("all", e)}
              className={`mb-4 p-4 rounded-xl cursor-pointer transition-all duration-200 select-none ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">All Products</h4>
                  <p
                    className={`text-sm ${
                      selectedCategory === "all"
                        ? "text-green-100"
                        : "text-gray-500"
                    }`}
                  >
                    View all items
                  </p>
                </div>
              </div>
            </div>

            {/* Special Virtual Category Cards */}
            {specialCategoryFilters.map((category) => (
              <div
                key={category.id}
                onClick={(e) => handleCategorySelect(category.id, e)}
                className={`mb-4 p-4 rounded-xl cursor-pointer transition-all duration-200 select-none ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-12 h-12 object-cover rounded-lg"
                    draggable={false}
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{category.name}</h4>
                    <p
                      className={`text-sm ${
                        selectedCategory === category.id
                          ? "text-green-100"
                          : "text-gray-500"
                      }`}
                    >
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search products..."
                    disabled={productsLoading}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Category Title and Stats */}
              <div className="mb-8 products-section">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {getCategoryDisplayName(selectedCategory)}
                </h1>
                <p className="text-gray-600">
                  {productsLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading products...
                    </span>
                  ) : (
                    <>
                      Showing {products.length} products
                      {pagination &&
                        ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
                    </>
                  )}
                </p>
              </div>

              {/* Products Section with Loading Overlay */}
              <div className="relative">
                {productsLoading && <ProductsLoadingOverlay />}

                {/* No Results Message */}
                {products.length === 0 && !productsLoading && (
                  <div className="text-center py-20">
                    <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No products found
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {error
                          ? error
                          : searchQuery
                          ? `No results for "${searchQuery}"`
                          : selectedCategory === "special"
                          ? "No products with special offers found"
                          : selectedCategory === "limited"
                          ? "No limited stock items found"
                          : selectedCategory === "popular"
                          ? "No popular products found"
                          : `No products available in ${selectedCategory}`}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Products Grid */}
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 transition-opacity duration-200 ${
                    productsLoading ? "opacity-50" : "opacity-100"
                  }`}
                >
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
