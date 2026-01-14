import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import CoachShowcase from "@/components/landing/CoachShowcase";
import SessionTypes from "@/components/landing/SessionTypes";
import HowItWorks from "@/components/landing/HowItWorks";
import Reviews from "@/components/landing/Reviews";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <CoachShowcase />
      <SessionTypes />
      <HowItWorks />
      <Reviews />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
