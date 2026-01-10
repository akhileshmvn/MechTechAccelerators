import { GlassCard } from "@/components/ui/glass-card";
import { Users, FileCode, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Landing() {
  const [, setLocation] = useLocation();

  const cards = [
    {
      title: "Patient Data Generator",
      description: "Generate structured, randomized patient datasets for QA automation and testing.",
      icon: Users,
      route: "/patient-generator",
      color: "from-emerald-500 to-green-600",
      iconColor: "text-emerald-400",
      bgGlow: "bg-emerald-500/20"
    },
    {
      title: "Boilerplate Generator",
      description: "Create standardized boilerplate code structures for test scenarios instantly.",
      icon: FileCode,
      route: "/boilerplate",
      color: "from-cyan-500 to-blue-600",
      iconColor: "text-cyan-400",
      bgGlow: "bg-blue-500/20"
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
          >
            MechTech Accelerators
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Developer productivity tools for QA automation and test data management.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 px-4">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              onClick={() => setLocation(card.route)}
              className="group cursor-pointer"
            >
              <GlassCard className="h-full hover:border-white/20 transition-all duration-300 hover:scale-[1.02] group-hover:shadow-2xl relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-64 h-64 ${card.bgGlow} rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors`}>
                    <card.icon className={`w-8 h-8 ${card.iconColor}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 landing-card-title">{card.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                    {card.description}
                  </p>

                  <div className={`flex items-center text-sm font-semibold uppercase tracking-wider ${card.iconColor}`}>
                    Launch Tool <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
