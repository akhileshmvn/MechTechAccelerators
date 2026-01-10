import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/40 bg-card/70 p-8 backdrop-blur-xl shadow-2xl",
        "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-foreground/5 before:to-transparent before:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function WizardHeader({ step, title, subtitle, showStep = true }: { step: number; title: string; subtitle: string; showStep?: boolean }) {
  return (
    <div className="mb-8 text-center">
      {showStep && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-2 text-xs font-bold tracking-[0.2em] text-primary/80 uppercase"
        >
          Step {step} of 3
        </motion.div>
      )}
      <motion.h1 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-2 text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
      >
        {title}
      </motion.h1>
      <motion.p 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-muted-foreground"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
