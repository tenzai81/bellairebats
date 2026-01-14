import { Button } from "@/components/ui/button";
import { Star, MapPin, Award, ArrowRight } from "lucide-react";

const coaches = [
  {
    name: "Mike Rodriguez",
    specialty: "Hitting & Batting",
    rating: 4.9,
    reviews: 127,
    location: "Los Angeles, CA",
    experience: "Former MLB Player",
    price: "$95/hr",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Sarah Chen",
    specialty: "Pitching & Mechanics",
    rating: 5.0,
    reviews: 89,
    location: "San Diego, CA",
    experience: "D1 College Coach",
    price: "$85/hr",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "James Thompson",
    specialty: "Fielding & Defense",
    rating: 4.8,
    reviews: 156,
    location: "Phoenix, AZ",
    experience: "20+ Years Coaching",
    price: "$75/hr",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Marcus Williams",
    specialty: "Speed & Conditioning",
    rating: 4.9,
    reviews: 98,
    location: "Houston, TX",
    experience: "Sports Performance",
    price: "$80/hr",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  },
];

const CoachShowcase = () => {
  return (
    <section id="coaches" className="py-24 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">
              Expert Coaching
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-2">
              MEET OUR COACHES
            </h2>
            <p className="text-muted-foreground text-lg mt-3 max-w-xl">
              Learn from experienced professionals who have played and coached at the highest levels.
            </p>
          </div>
          <Button variant="outline" size="lg" className="self-start md:self-auto">
            View All Coaches
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Coach Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coaches.map((coach) => (
            <div
              key={coach.name}
              className="group bg-card rounded-xl overflow-hidden border border-border shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={coach.image}
                  alt={coach.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-1 text-cream">
                    <Star className="w-4 h-4 text-accent" fill="currentColor" />
                    <span className="font-semibold">{coach.rating}</span>
                    <span className="text-cream/70 text-sm">({coach.reviews})</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display text-xl text-foreground">{coach.name}</h3>
                <p className="text-accent font-medium text-sm mb-3">{coach.specialty}</p>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {coach.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    {coach.experience}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-bold text-foreground">{coach.price}</span>
                  <Button size="sm">
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoachShowcase;
