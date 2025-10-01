/**
 * WhatsApp Helper Utility
 * Handles WhatsApp redirects with custom messages
 */

const WHATSAPP_NUMBER = "+919947158642";

/**
 * Redirects to WhatsApp chat with a custom message
 * @param message - The message to send via WhatsApp
 */
export const redirectToWhatsApp = (message: string): void => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(
    "+",
    ""
  )}?text=${encodedMessage}`;

  // Open WhatsApp in a new tab/window
  window.open(whatsappUrl, "_blank");
};

/**
 * Pre-defined messages for different services
 */
export const WhatsAppMessages = {
  SUBSCRIPTION_STORE:
    "Hi! We are interested in the ₹99/yearly subscription store plan. What is the next process?",
  BASIC_PLAN:
    "Hi! We are interested in the Basic plan (₹499). Could you please provide more details about the next steps?",
  PRO_PLAN:
    "Hi! We are interested in the Pro plan (₹3,500). Could you please provide more details about the next steps?",
  ADVANCED_PLAN:
    "Hi! We are interested in the Advanced plan (₹4,500). Could you please provide more details about the next steps?",
  BUSINESS_INQUIRY:
    "Hi! I want to connect with you regarding business opportunities. Could we discuss further?",
  CUSTOM_QUOTE:
    "Hi! I'm interested in getting a custom quote for my project. Could you please help me with the details?",
};
