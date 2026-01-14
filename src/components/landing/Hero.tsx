import { Button } from "@/components/ui/button";
import { Calendar, Star, Users } from "lucide-react";
import heroImage from "@/assets/hero-baseball.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Baseball coaching session at sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream/10 backdrop-blur-sm border border-cream/20 mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-accent" fill="currentColor" />
            <span className="text-cream text-sm font-medium">
              Trusted by 500+ athletes
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-gradient-hero leading-none mb-6 animate-fade-up">
            ELEVATE YOUR
            <br />
            <span className="text-accent">GAME</span>
          </h1>

          {/* Subheading */}
          <p className="text-cream/90 text-lg md:text-xl max-w-xl mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Book personalized training sessions with elite baseball coaches. 
            From batting to pitching, take your skills to the next level.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl">
              <Calendar className="w-5 h-5" />
              Book a Session
            </Button>
            <Button variant="hero-outline" size="xl">
              <Users className="w-5 h-5" />
              Browse Coaches
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div>
              <p className="font-display text-4xl md:text-5xl text-cream mb-1">50+</p>
              <p className="text-cream/70 text-sm">Elite Coaches</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl text-cream mb-1">10K+</p>
              <p className="text-cream/70 text-sm">Sessions Booked</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl text-cream mb-1">4.9</p>
              <p className="text-cream/70 text-sm">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
