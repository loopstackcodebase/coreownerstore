"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Shield,
  Truck,
  Users,
  Award,
  Globe,
  Leaf,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";


const AboutUs = () => {
  const params = useParams();
  const { userid: username } = params;

  const [storeData, setStoreData]: any = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStoreAboutUs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/user/aboutus/fetchStoreAboutus/${username}`
        );
        const data = await response.json();

        if (data.success) {
          setStoreData(data.data);
        } else {
          setError(data.error || "Failed to fetch store information");
        }
      } catch (err) {
        console.error("Error fetching store about us:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchStoreAboutUs();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-green-500 mb-4" size={48} />
          <p className="text-gray-600">Loading store information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-6 rounded-lg">
            <p className="text-red-600 font-semibold">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No store information available</p>
        </div>
      </div>
    );
  }

  const { store, aboutUs } = storeData;

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
            <span>About</span>
            <span>/</span>
            <span className="text-gray-800 font-medium">
              {storeData.store.displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {aboutUs.ourStory}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 p-3 rounded-full mr-4">
                <Heart className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">
                Our Mission
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{aboutUs.mission}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 p-3 rounded-full mr-4">
                <Globe className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">
                Our Vision
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{aboutUs.vision}</p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Trust</h3>
              <p className="text-gray-600 text-sm">{aboutUs.values.trust}</p>
            </div>

            <div className="text-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Excellence</h3>
              <p className="text-gray-600 text-sm">
                {aboutUs.values.excellence}
              </p>
            </div>

            <div className="text-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Leaf className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Sustainability
              </h3>
              <p className="text-gray-600 text-sm">
                {aboutUs.values.sustainability}
              </p>
            </div>

            <div className="text-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Community</h3>
              <p className="text-gray-600 text-sm">
                {aboutUs.values.community}
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-8 rounded-lg mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-sm flex items-center justify-center">
                <Shield className="text-green-500" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Secure Shopping
              </h3>
              <p className="text-gray-600">
                {aboutUs.whyChooseUs.secureShopping}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-sm flex items-center justify-center">
                <Truck className="text-green-500" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                {aboutUs.whyChooseUs.fastDelivery}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-sm flex items-center justify-center">
                <Heart className="text-green-500" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Customer First
              </h3>
              <p className="text-gray-600">
                {aboutUs.whyChooseUs.customerFirst}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {aboutUs.statistics.happyCustomers}
            </div>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {aboutUs.statistics.products}
            </div>
            <p className="text-gray-600">Products</p>
          </div>
          <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {aboutUs.statistics.countriesServed}
            </div>
            <p className="text-gray-600">Countries Served</p>
          </div>
          <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {aboutUs.statistics.uptime}
            </div>
            <p className="text-gray-600">Uptime</p>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Team</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {aboutUs.ourTeam}
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h3>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their
            shopping needs. Discover our wide range of products and experience
            the difference.
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg">
            Explore Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
