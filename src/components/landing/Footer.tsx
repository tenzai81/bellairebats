import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    platform: [
      { name: "Find Coaches", href: "#" },
      { name: "Book Sessions", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "For Coaches", href: "#" },
    ],
    company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Press", href: "#" },
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Contact Us", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Facebook, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  return (
    <footer className="bg-night text-cream">
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <span className="font-display text-xl text-accent-foreground">D</span>
              </div>
              <span className="font-display text-2xl tracking-wide">
                DIAMOND<span className="text-accent">PRO</span>
              </span>
            </a>
            <p className="text-cream/60 mb-6 max-w-sm">
              The premier platform connecting athletes with elite baseball coaches. 
              Elevate your game with personalized training.
            </p>
            <div className="space-y-3 text-sm text-cream/60">
              <a href="mailto:hello@diamondpro.com" className="flex items-center gap-3 hover:text-cream transition-colors">
                <Mail className="w-4 h-4" />
                hello@diamondpro.com
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-3 hover:text-cream transition-colors">
                <Phone className="w-4 h-4" />
                (123) 456-7890
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                Los Angeles, California
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-display text-lg mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-cream/60 hover:text-cream transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-cream/60 hover:text-cream transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-display text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-cream/60 hover:text-cream transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 mt-12 border-t border-cream/10">
          <p className="text-cream/40 text-sm">
            © 2024 DiamondPro. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-accent transition-colors group"
              >
                <social.icon className="w-5 h-5 text-cream/60 group-hover:text-accent-foreground transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
