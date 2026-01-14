import { Search, Calendar, CreditCard, Zap } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Find Your Coach",
    description: "Browse our roster of expert coaches. Filter by specialty, location, price, and availability to find your perfect match.",
  },
  {
    icon: Calendar,
    step: "02",
    title: "Book a Session",
    description: "Choose your preferred time slot from real-time availability. Pick 1-on-1 training, group sessions, or packages.",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Secure Payment",
    description: "Pay securely with card, Apple Pay, or Google Pay. Your session is confirmed instantly with calendar sync.",
  },
  {
    icon: Zap,
    step: "04",
    title: "Train & Improve",
    description: "Show up ready to work. Get personalized drills, video analysis, and homework to accelerate your progress.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-primary">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-cream mt-2 mb-4">
            HOW IT WORKS
          </h2>
          <p className="text-cream/70 text-lg">
            From finding your coach to stepping on the field, 
            we make the entire process seamless.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-cream/20">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent" />
                </div>
              )}

              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-cream/10 border border-cream/20 mb-6 group-hover:bg-accent/20 group-hover:border-accent/40 transition-colors duration-300">
                  <step.icon className="w-10 h-10 text-cream group-hover:text-accent transition-colors" />
                </div>

                {/* Step Number */}
                <span className="block font-display text-accent text-sm mb-2">
                  STEP {step.step}
                </span>

                {/* Title */}
                <h3 className="font-display text-2xl text-cream mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-cream/60 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
