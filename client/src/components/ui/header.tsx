import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, FileCode, Home } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
  const [location] = useLocation();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Patient Generator", href: "/patient-generator", icon: Users },
    { label: "Boilerplate", href: "/boilerplate", icon: FileCode },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MT</span>
              </div>
              <span className="text-xl font-bold text-white">MechTech Accelerators</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "default" : "ghost"}
                  className={`flex items-center space-x-2 ${
                    location === item.href
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          <div className="md:hidden">
            {/* Mobile menu button - can be expanded later */}
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <span className="sr-only">Menu</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}