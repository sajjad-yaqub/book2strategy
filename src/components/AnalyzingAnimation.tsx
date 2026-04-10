import { motion } from 'framer-motion';
import { Brain, Zap, LineChart, Scan } from 'lucide-react';

const steps = [
  { icon: Scan, label: 'Scanning document structure', delay: 0 },
  { icon: Brain, label: 'Extracting behavioral insights', delay: 1.2 },
  { icon: Zap, label: 'Mapping psychological dimensions', delay: 2.4 },
  { icon: LineChart, label: 'Calculating P&L leverage', delay: 3.6 },
];

export function AnalyzingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-8"
    >
      <div className="relative w-32 h-32">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-primary/20"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute inset-4 rounded-full bg-primary/30"
        />
        <div className="absolute inset-8 rounded-full bg-primary/50 flex items-center justify-center">
          <Brain className="w-8 h-8 text-primary-foreground" />
        </div>
        <motion.div
          className="absolute inset-x-0 h-0.5 bg-primary/60 rounded-full scan-line"
          style={{ top: '25%' }}
        />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Analyzing P&L Leverage...
        </h2>
        <p className="text-muted-foreground">
          Extracting high-conviction strategy signals
        </p>
      </div>

      <div className="w-full space-y-3">
        {steps.map((step) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.delay, duration: 0.5 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/40 border border-border/30"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: step.delay }}
            >
              <step.icon className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-sm text-muted-foreground">{step.label}</span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: step.delay + 0.5, duration: 1.5, ease: 'easeOut' }}
              className="ml-auto h-1 rounded-full bg-primary/30 max-w-[80px]"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: step.delay + 0.8, duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-primary"
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
