import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-12 md:p-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 border-4 border-cream rounded-full" />
            <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-cream rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-4 border-cream rounded-full" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Ready to Start?
            </span>
            <h2 className="font-display text-4xl md:text-6xl text-cream mb-6">
              YOUR NEXT LEVEL
              <br />
              <span className="text-accent">STARTS TODAY</span>
            </h2>
            <p className="text-cream/70 text-lg mb-10 max-w-xl mx-auto">
              Join hundreds of athletes who have transformed their game with personalized coaching. 
              Book your first session and see the difference.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl">
                <Calendar className="w-5 h-5" />
                Book Your First Session
              </Button>
              <Button variant="hero-outline" size="xl">
                Explore Coaches
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-cream/20">
              <div className="text-center">
                <p className="font-display text-2xl text-cream">100%</p>
                <p className="text-cream/60 text-sm">Satisfaction Guaranteed</p>
              </div>
              <div className="w-px h-10 bg-cream/20" />
              <div className="text-center">
                <p className="font-display text-2xl text-cream">24hr</p>
                <p className="text-cream/60 text-sm">Cancellation Policy</p>
              </div>
              <div className="w-px h-10 bg-cream/20" />
              <div className="text-center">
                <p className="font-display text-2xl text-cream">Secure</p>
                <p className="text-cream/60 text-sm">Payment Processing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
