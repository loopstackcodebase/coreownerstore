"use client";
import FAQ from "@/component/landing/component/FAQ";
import Features from "@/component/landing/component/Features";
import Footer from "@/component/landing/component/Footer";
import FounderPOV from "@/component/landing/component/FounderPov";
import Header from "@/component/landing/component/Header";
import Hero from "@/component/landing/component/Hero";
import Pricing from "@/component/landing/component/Prices";
import ScrollingBanner from "@/component/landing/component/ScrollingBanner";
import ContactUs from "@/component/landing/component/ContactUs";
import React from "react";


const Page = () => {
  return (

      <div className="min-h-screen bg-white">
        <Header />
        <ScrollingBanner />
        <Hero />
        <Features />
        <Pricing />
        <FAQ />
        <FounderPOV />
        <ContactUs />
        <Footer />
      </div>

  );
};

export default Page;
