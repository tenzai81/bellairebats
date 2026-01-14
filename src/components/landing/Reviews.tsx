import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "David Martinez",
    role: "High School Varsity",
    rating: 5,
    text: "Coach Rodriguez helped me improve my batting average by .150 in just two months. The personalized drills and video analysis made all the difference.",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Jennifer Park",
    role: "Parent",
    rating: 5,
    text: "As a parent, I love how easy it is to book sessions and track my son's progress. The coaches are professional and the training content helps him practice at home.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Tyler Johnson",
    role: "College Commit",
    rating: 5,
    text: "The group sessions are incredible for building game-like pressure situations. I committed to my dream school thanks to the training I received here.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
];

const Reviews = () => {
  return (
    <section id="reviews" className="py-24 bg-secondary">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-2 mb-4">
            WHAT ATHLETES SAY
          </h2>
          <p className="text-muted-foreground text-lg">
            Don't just take our word for it. Here's what our community has to say about their experience.
          </p>
        </div>

        {/* Google Rating Banner */}
        <div className="flex items-center justify-center gap-6 mb-12 p-6 bg-card rounded-xl border border-border max-w-md mx-auto shadow-soft">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-accent" fill="currentColor" />
            ))}
          </div>
          <div className="text-center">
            <p className="font-display text-3xl text-foreground">4.9</p>
            <p className="text-sm text-muted-foreground">Based on 500+ Google Reviews</p>
          </div>
        </div>

        {/* Review Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="bg-card rounded-xl p-6 border border-border shadow-soft hover:shadow-card transition-shadow duration-300"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-accent/30 mb-4" />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent" fill="currentColor" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{review.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{review.name}</p>
                  <p className="text-sm text-muted-foreground">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-accent font-semibold hover:underline"
          >
            Read all reviews on Google
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
