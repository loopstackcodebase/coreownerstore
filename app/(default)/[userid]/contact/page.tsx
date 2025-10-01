"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Users,
  Headphones,
  Loader2,
  CheckCircle,
  Send,
  ExternalLink,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const ContactUs = () => {

  const params = useParams();
  const { userid: username } = params;


  const [storeData, setStoreData]: any = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "General Question",
    message: "",
  });

  useEffect(() => {
    const fetchStoreContact = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/user/contact/fetchStoreContact/${username}`
        );
        const data = await response.json();

        if (data.success) {
          setStoreData(data.data);
        } else {
          setError(data.error || "Failed to fetch store contact information");
        }
      } catch (err) {
        console.error("Error fetching store contact:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchStoreContact();
    }
  }, [username]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const sendMessageToWhatsApp = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.message
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const whatsAppNumber = storeData?.contact?.whatsAppSupport;
    if (!whatsAppNumber) {
      alert("WhatsApp contact not available");
      return;
    }

    const message = `
*New Contact Message from ${storeData.store.displayName} Website*

👤 *Name:* ${formData.firstName} ${formData.lastName}
📧 *Email:* ${formData.email}
📞 *Phone:* ${formData.phone || "Not provided"}
📝 *Subject:* ${formData.subject}

💬 *Message:*
${formData.message}

---
Sent via Contact Form
    `.trim();

    const whatsAppUrl = `https://wa.me/91${whatsAppNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsAppUrl, "_blank");

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "General Question",
      message: "",
    });

    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    sendMessageToWhatsApp();
  };

  const getStoreStatus = () => {
    if (!storeData?.storeStatus) return null;

    const { current } = storeData.storeStatus;
    return {
      text: current.status,
      message: current.message,
      isOpen: current.isOpen,
    };
  };

  const openWhatsAppChat = () => {
    const whatsAppNumber = storeData?.contact?.whatsAppSupport;
    if (whatsAppNumber) {
      const message = `Hi! I'm interested in your products. Can you help me?`;
      const whatsAppUrl = `https://wa.me/91${whatsAppNumber}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsAppUrl, "_blank");
    }
  };

  const openEmailClient = () => {
    const email = storeData?.contact?.emailSupport;
    if (email) {
      const subject = `Inquiry from ${storeData.store.displayName} Website`;
      window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-green-500 mb-4" size={48} />
          <p className="text-gray-600">Loading contact information...</p>
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
          <p className="text-gray-600">No contact information available</p>
        </div>
      </div>
    );
  }

  const { store, contact, businessHours, quickHelp } = storeData;
  const storeStatus = getStoreStatus();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4">
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
            <span>Contact</span>
            <span>/</span>
            <span className="text-gray-800 font-medium">
              {storeData.store.displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Get in Touch Section - Top */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Get in Touch
              </h2>
              <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {contact.getInTouchContent}
              </p>
            </div>

            {/* Store Status */}
            {storeStatus && (
              <div
                className={`p-3 rounded-lg border-l-4 mb-4 ${
                  storeStatus.isOpen
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      storeStatus.isOpen ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="font-semibold text-gray-800">
                    {storeStatus.text}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {storeStatus.message}
                </p>
              </div>
            )}

            {/* Contact Methods */}
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              {contact.whatsAppSupport && (
                <button
                  onClick={openWhatsAppChat}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 p-1.5 rounded-lg">
                        <MessageCircle size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-sm">
                          WhatsApp Support
                        </h3>
                        <p className="text-green-100 text-xs">
                          +91 {contact.whatsAppSupport}
                        </p>
                      </div>
                    </div>
                    <ExternalLink
                      className="group-hover:translate-x-1 transition-transform"
                      size={16}
                    />
                  </div>
                </button>
              )}

              {contact.emailSupport && (
                <button
                  onClick={openEmailClient}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-3 rounded-xl transition-all duration-200 border border-gray-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-1.5 rounded-lg">
                        <Mail className="text-green-600" size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-sm">Email Support</h3>
                        <p className="text-gray-600 text-xs">
                          {contact.emailSupport}
                        </p>
                      </div>
                    </div>
                    <ExternalLink
                      className="group-hover:translate-x-1 transition-transform text-gray-500"
                      size={16}
                    />
                  </div>
                </button>
              )}
            </div>

            {/* Business Hours and Quick Help */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Business Hours */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Clock className="text-green-600" size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Business Hours
                  </h3>
                </div>

                <div className="space-y-1.5">
                  {businessHours.map((day: any) => (
                    <div
                      key={day._id}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-200 ${
                        day.isOpen
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            day.isOpen ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="font-medium text-gray-800 text-sm">
                          {day.day}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          day.isOpen
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {day.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Help */}
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-blue-100 p-1.5 rounded-lg">
                    <Headphones className="text-blue-600" size={16} />
                  </div>
                  <h3 className="font-bold text-gray-800 text-base">
                    Quick Help
                  </h3>
                </div>
                <div className="space-y-1.5">
                  {quickHelp.liveChatSupport && (
                    <div className="flex items-center space-x-2 p-1.5 bg-green-50 rounded-lg">
                      <MessageCircle className="text-green-600" size={14} />
                      <span className="font-medium text-gray-800 text-xs">
                        Live Chat Support
                      </span>
                    </div>
                  )}
                  {quickHelp.technicalSupport && (
                    <div className="flex items-center space-x-2 p-1.5 bg-blue-50 rounded-lg">
                      <Headphones className="text-blue-600" size={14} />
                      <span className="font-medium text-gray-800 text-xs">
                        Technical Support
                      </span>
                    </div>
                  )}
                  {quickHelp.accountHelp && (
                    <div className="flex items-center space-x-2 p-1.5 bg-purple-50 rounded-lg">
                      <Users className="text-purple-600" size={14} />
                      <span className="font-medium text-gray-800 text-xs">
                        Account Help
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Send Message Form - Bottom */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg">
              <Send className="text-green-600" size={24} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Send Message to WhatsApp
            </h2>
          </div>

          {formSubmitted && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-green-700 font-semibold">
                  Message sent to WhatsApp!
                </span>
              </div>
              <p className="text-green-600 text-sm mt-1">
                Your message has been opened in WhatsApp.
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="+91 9947158642"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                required
              >
                <option value="General Question">General Question</option>
                <option value="Order Inquiry">Order Inquiry</option>
                <option value="Product Support">Product Support</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Feedback">Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                placeholder="Tell us how we can help you..."
                required
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={formSubmitting}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <MessageCircle size={20} />
              <span>Send to WhatsApp</span>
              <ExternalLink size={16} />
            </button>

            <p className="text-sm text-gray-500 text-center">
              This will open WhatsApp with your formatted message ready to send
            </p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            We're Here to Help
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your satisfaction is our priority. Whether you have questions about
            our products, need assistance with your order, or want to share
            feedback, we're always ready to assist you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
