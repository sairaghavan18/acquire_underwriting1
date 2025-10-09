import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { removeBackground, loadImage } from "@/lib/bgRemoval";
export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [{
    label: "Features",
    href: "/features"
  }, {
    label: "Pricing", 
    href: "/pricing"
  }, {
    label: "Client Access",
    href: "/auth"
  }];
  const [logoSrc, setLogoSrc] = useState("/lovable-uploads/32801df0-3105-4879-afde-7c180138cc4a.png");
  
  useEffect(() => {
    let objectUrl: string | null = null;
    const run = async () => {
      try {
        const res = await fetch("/lovable-uploads/32801df0-3105-4879-afde-7c180138cc4a.png");
        const blob = await res.blob();
        const img = await loadImage(blob);
        const outBlob = await removeBackground(img);
        objectUrl = URL.createObjectURL(outBlob);
        setLogoSrc(objectUrl);
      } catch (err) {
        console.error("Background removal failed", err);
      }
    };
    run();
    
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);
  return <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-border/50 shadow-soft z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img 
                src={logoSrc} 
                alt="Acquire logo" 
                className="h-8 w-auto select-none bg-transparent"
                loading="lazy" 
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => item.href.startsWith('#') ? (
              <a key={item.label} href={item.href} className="text-foreground hover:text-accent transition-colors">
                {item.label}
              </a>
            ) : (
              <Link key={item.label} to={item.href} className="text-foreground hover:text-accent transition-colors">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="default" asChild>
              <Link to="/auth">Request Demo</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navItems.map(item => item.href.startsWith('#') ? (
                <a key={item.label} href={item.href} className="text-foreground hover:text-accent transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} to={item.href} className="text-foreground hover:text-accent transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="default" className="justify-start" asChild>
                  <Link to="/auth">Request Demo</Link>
                </Button>
              </div>
            </div>
          </div>}
      </div>
    </nav>;
}