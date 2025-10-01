"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ExternalLink,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Globe,
  Heart,
  Facebook,
  Linkedin,
  Loader2,
  AlertCircle,
} from "lucide-react";

// TypeScript interfaces
interface SocialLink {
  id: number;
  title: string;
  url: string;
  domain: string;
  originalUrl: string;
  icon: string;
  color: string;
}

interface Store {
  id: string;
  displayName: string;
  description: string;
  email: string;
  logo: string;
}

interface User {
  id: string;
  username: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    store: Store;
    user: User;
    socialLinks: SocialLink[];
  };
}

const LinkShowcasePage = () => {
  const params = useParams();
  const userid = params.userid as string;
  
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [profileData, setProfileData] = useState<{
    name: string;
    bio: string;
    avatar: string;
    links: SocialLink[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Globe: <Globe className="w-5 h-5" />,
      Instagram: <Instagram className="w-5 h-5" />,
      Twitter: <Twitter className="w-5 h-5" />,
      Youtube: <Youtube className="w-5 h-5" />,
      Mail: <Mail className="w-5 h-5" />,
      Heart: <Heart className="w-5 h-5" />,
      Facebook: <Facebook className="w-5 h-5" />,
      Linkedin: <Linkedin className="w-5 h-5" />,
    };
    return iconMap[iconName] || <Globe className="w-5 h-5" />;
  };

  // Fetch data from API
  useEffect(() => {
    const fetchSocialLinks = async () => {
      if (!userid) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/user/social/fetchOwnerSocialLinks/${userid}`);
        const data: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch social links");
        }

        if (data.success) {
          setProfileData({
            name: data.data.store.displayName || data.data.user.username || "Store Owner",
            bio: data.data.store.description || "Welcome to my store",
            avatar: data.data.store.logo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            links: data.data.socialLinks,
          });
        } else {
          throw new Error(data.message || "Failed to load data");
        }
      } catch (err: any) {
        console.error("Error fetching social links:", err);
        setError(err.message || "Failed to load social links");
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLinks();
  }, [userid]);

  const handleLinkClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading social links...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!profileData || profileData.links.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No Social Links Found</h1>
          <p className="text-gray-600">This store owner hasn't added any social links yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute top-40 right-16 w-16 h-16 bg-emerald-300 rounded-full opacity-25 animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-20 w-12 h-12 bg-teal-200 rounded-full opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-8 w-24 h-24 bg-green-100 rounded-full opacity-20 animate-bounce"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Profile Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative inline-block mb-4">
            <img
              src={profileData.avatar}
              alt={profileData.name}
              className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";
              }}
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2 animate-slide-up">
            {profileData.name}
          </h1>
          <p
            className="text-gray-600 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            {profileData.bio}
          </p>
        </div>

        {/* Links Section */}
        <div className="space-y-4">
          {profileData.links.map((link, index) => (
            <div
              key={link.id}
              className="animate-slide-up"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <button
                onClick={() => handleLinkClick(link.url)}
                onMouseEnter={() => setHoveredLink(link.id)}
                onMouseLeave={() => setHoveredLink(null)}
                className={`
                  w-full p-4 rounded-2xl transition-all duration-300 transform
                  bg-white hover:scale-105 active:scale-95
                  shadow-md hover:shadow-xl
                  border border-gray-100 hover:border-transparent
                  relative overflow-hidden group
                `}
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`
                  absolute inset-0 bg-gradient-to-r ${link.color} opacity-0 
                  group-hover:opacity-10 transition-opacity duration-300
                `}
                ></div>

                {/* Content */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`
                      p-2 rounded-xl bg-gradient-to-r ${link.color} text-white
                      transition-transform duration-300
                      ${hoveredLink === link.id ? "rotate-12 scale-110" : ""}
                    `}
                    >
                      {getIconComponent(link.icon)}
                    </div>
                    <span className="font-semibold text-gray-800 text-left">
                      {link.title}
                    </span>
                  </div>
                  <ExternalLink
                    className={`
                      w-5 h-5 text-gray-400 transition-all duration-300
                      ${
                        hoveredLink === link.id
                          ? "text-gray-600 translate-x-1"
                          : ""
                      }
                    `}
                  />
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="text-center mt-12 animate-fade-in"
          style={{ animationDelay: "1s" }}
        >
          <p className="text-gray-500 text-sm">
            Official store owner @loopstack
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default LinkShowcasePage;
