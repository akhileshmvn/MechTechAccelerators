import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function NumberStepper({ 
  value, 
  onChange, 
  min = 1, 
  max, 
  className 
}: NumberStepperProps) {
  
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (max === undefined || value < max) {
      onChange(value + 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || min;
    if (val >= min && (max === undefined || val <= max)) {
      onChange(val);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-10 w-10 shrink-0 rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:text-white disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <div className="relative flex-1 min-w-[60px]">
        <Input
          type="number"
          value={value}
          onChange={handleChange}
          className="h-10 text-center font-mono bg-black/20 border-white/10 focus-visible:ring-primary/50"
        />
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={max !== undefined && value >= max}
        className="h-10 w-10 shrink-0 rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:text-white disabled:opacity-30"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
