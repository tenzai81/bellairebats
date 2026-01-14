import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Package, Clock, Check } from "lucide-react";

const sessionTypes = [
  {
    icon: User,
    title: "1-on-1 Training",
    description: "Personalized coaching focused entirely on your development",
    features: [
      "30, 60, or 90 minute sessions",
      "Custom training plans",
      "Video analysis included",
      "Flexible scheduling",
    ],
    price: "From $75",
    popular: false,
  },
  {
    icon: Users,
    title: "Group Sessions",
    description: "Train alongside other athletes and build team chemistry",
    features: [
      "2-8 athletes per group",
      "Team camps & clinics",
      "Position-specific training",
      "Competition drills",
    ],
    price: "From $35",
    popular: true,
  },
  {
    icon: Package,
    title: "Training Packages",
    description: "Commit to your growth with discounted session bundles",
    features: [
      "5 or 10 session packs",
      "Save up to 20%",
      "Priority booking",
      "Progress tracking",
    ],
    price: "From $325",
    popular: false,
  },
];

const SessionTypes = () => {
  return (
    <section id="sessions" className="py-24 bg-secondary">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Training Options
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-2 mb-4">
            CHOOSE YOUR PATH
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether you prefer focused individual attention or the energy of group training, 
            we have the perfect option for your development.
          </p>
        </div>

        {/* Session Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {sessionTypes.map((session, index) => (
            <Card 
              key={session.title}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-2 ${
                session.popular 
                  ? "border-2 border-accent shadow-card" 
                  : "border border-border"
              }`}
            >
              {session.popular && (
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-1 text-xs font-semibold uppercase tracking-wider rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                  session.popular 
                    ? "bg-accent text-accent-foreground" 
                    : "bg-primary/10 text-primary"
                }`}>
                  <session.icon className="w-7 h-7" />
                </div>
                <CardTitle className="font-display text-2xl">{session.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {session.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {session.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-field shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-border">
                  <p className="text-2xl font-bold text-foreground mb-4">
                    {session.price}
                    <span className="text-sm font-normal text-muted-foreground"> /session</span>
                  </p>
                  <Button 
                    variant={session.popular ? "accent" : "outline"} 
                    className="w-full"
                    size="lg"
                  >
                    <Clock className="w-4 h-4" />
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SessionTypes;
