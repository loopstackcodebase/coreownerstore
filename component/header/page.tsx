"use client";
import React, { useState, useEffect } from "react";
import { Menu, X, Home, ShoppingCart, Info, Phone } from "lucide-react";
import { useParams } from "next/navigation";

interface StoreDetails {
  storeName: string;
  storeLogo: string;
}

const Header = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [storeDetails, setStoreDetails] = useState<StoreDetails>({
    storeName: "Ecomz",
    storeLogo: "/img/loops2.png",
  });
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams();
  const userid = params?.userid as string;

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      if (!userid) {
        setIsLoading(false);
        return;
      }

      try {
        // Check localStorage first
        const cachedData = localStorage.getItem(`store_details_${userid}`);

        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setStoreDetails(parsed);
          setIsLoading(false);
          return;
        }

        // If not in cache, fetch from API
        const response = await fetch(
          `/api/user/store/fetchStoreDetails/${userid}`
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            const newStoreDetails = {
              storeName: result.data.storeName,
              storeLogo: result.data.storeLogo || "/img/loops2.png",
            };

            setStoreDetails(newStoreDetails);

            // Cache in localStorage
            localStorage.setItem(
              `store_details_${userid}`,
              JSON.stringify(newStoreDetails)
            );
          }
        } else {
          console.error("Failed to fetch store details");
        }
      } catch (error) {
        console.error("Error fetching store details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreDetails();
  }, [userid]);

  const navItems = [
    { label: "Cart", href: `/${userid}/cart`, icon: ShoppingCart },
    { label: "About", href: `/${userid}/about`, icon: Info },
    { label: "Contact", href: `/${userid}/contact`, icon: Phone },
  ];

  // Function to handle category selection
  const handleCategoryClick = (category: any) => {
    // Dispatch custom event that ProductList can listen to
    window.dispatchEvent(
      new CustomEvent("categoryChange", { detail: category })
    );
    setIsMobileMenuOpen(false); // Close mobile menu
  };

  if (isLoading) {
    return (
      <header className="w-full z-50 sticky top-0 bg-gradient-to-r from-green-400/95 to-green-600/95 backdrop-blur-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-full animate-pulse shadow-lg"></div>
              <div className="w-32 h-8 bg-green-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-20 h-6 bg-green-200 rounded-full animate-pulse"
                ></div>
              ))}
            </div>
            <div className="md:hidden">
              <div className="w-10 h-10 bg-green-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`w-full z-50 sticky top-0 transition-all duration-500 ${
        scrollY > 50
          ? "bg-gradient-to-r from-green-400/95 to-green-600/95 backdrop-blur-xl shadow-lg border-b border-green-100/20"
          : "bg-gradient-to-r from-green-400/90 to-green-600/90 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Enhanced Logo Section */}
          <a 
            href={`/${userid}`}
            className="flex items-center space-x-4 group cursor-pointer"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-green-200/30 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
              <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-lg ring-2 ring-white/50 group-hover:ring-white/70 transition-all duration-300 bg-gradient-to-br from-white to-green-50">
                <img
                  src={storeDetails.storeLogo}
                  alt="Store Logo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/img/loops2.png";
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                {storeDetails.storeName}
              </span>
              <span className="text-xs text-green-100 font-medium tracking-wider uppercase">
                Product Showcase
              </span>
            </div>
          </a>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex items-center space-x-2 text-white hover:text-green-100 transition-all duration-300 font-medium px-4 py-2 rounded-full hover:bg-white/10 relative overflow-hidden"
                >
                  <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-green-200/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                </a>
              );
            })}
          </nav>

          {/* Enhanced Mobile Hamburger Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 shadow-sm hover:shadow-md border border-white/20"
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="w-5 h-5 text-white transition-transform duration-300" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl border-t border-green-100/50 z-40">
          <div className="py-4">
            <a
              href={`/${userid}`}
              className="flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 text-sm font-medium transition-all duration-300 border-b border-gray-50/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-sm">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span>Home</span>
            </a>

            <div className="mt-4 space-y-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const gradients = [
                  "from-green-400 to-green-500",
                  "from-green-500 to-green-600",
                  "from-green-600 to-green-700",
                ];
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 text-sm font-medium transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradients[index]} flex items-center justify-center shadow-sm`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Enhanced Categories Section */}
            <div className="px-6 py-4 mt-4 border-t border-gray-100/50">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600"></div>
                Categories
              </h3>
              <div className="space-y-2 ml-4">
                {[
                  {
                    name: "All Products",
                    key: "all",
                    gradient: "from-green-400 to-green-500",
                  },
                  {
                    name: "Special Collection",
                    key: "special",
                    gradient: "from-green-500 to-green-600",
                  },
                  {
                    name: "Limited Edition",
                    key: "limited",
                    gradient: "from-green-600 to-green-700",
                  },
                  {
                    name: "Popular Items",
                    key: "popular",
                    gradient: "from-green-700 to-green-800",
                  },
                ].map((category) => (
                  <div
                    key={category.key}
                    onClick={() => handleCategoryClick(category.key)}
                    className="group flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 text-sm rounded-xl cursor-pointer transition-all duration-300 hover:shadow-sm"
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-gradient-to-r ${category.gradient} shadow-sm group-hover:scale-110 transition-transform duration-300`}
                    ></div>
                    <span className="font-medium group-hover:text-green-800 transition-colors duration-300">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
