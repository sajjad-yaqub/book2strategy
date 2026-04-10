import { motion } from 'framer-motion';
import type { StrategyCard } from '@/types/strategy';
import { Zap, Target, Shield, Brain, TrendingUp, Rocket, DollarSign, AlertTriangle, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface StrategyCardFaceProps {
  card: StrategyCard;
}

const insightFields = [
  { key: 'stimuli' as const, label: 'Trigger', icon: Target, desc: 'The artifact' },
  { key: 'novelty' as const, label: 'Hook', icon: Zap, desc: 'The hook' },
  { key: 'evolutionary_filters' as const, label: 'Deep Driver', icon: Shield, desc: 'Safety / Status' },
  { key: 'pre_existing_substrate' as const, label: 'Mental Model', icon: Brain, desc: 'Mental model' },
  { key: 'outcome' as const, label: 'Outcome', icon: TrendingUp, desc: 'Psych / Biz result' },
  { key: 'action' as const, label: 'Action', icon: Rocket, desc: 'High-leverage move' },
];

export function StrategyCardFace({ card }: StrategyCardFaceProps) {
  const handleShareToSlack = () => {
    const text = `🎯 *${card.headline}*\n\n${card.story}\n\n💰 ${card.pl_impact}\n⚡ ${card.urgent_action}`;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard — paste into Slack');
  };

  return (
    <div className="glass-card rounded-2xl p-6 select-none">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground leading-snug mb-2">
          {card.headline}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {card.story}
        </p>
      </div>

      {/* Insight Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {insightFields.map((field, i) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="snepoa-cell"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <field.icon className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                {field.label}
              </span>
            </div>
            <p className="text-xs text-secondary-foreground leading-relaxed line-clamp-3">
              {card.snepoa[field.key]}
            </p>
          </motion.div>
        ))}
      </div>

      {/* P&L Impact */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/8 border border-primary/15 mb-3">
        <DollarSign className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">P&L Impact</span>
          <p className="text-sm text-foreground font-medium">{card.pl_impact}</p>
        </div>
      </div>

      {/* Urgent Action */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/8 border border-destructive/15 mb-3">
        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
        <div>
          <span className="text-[10px] font-semibold text-destructive uppercase tracking-wider">Urgent Action</span>
          <p className="text-sm text-foreground">{card.urgent_action}</p>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShareToSlack}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-secondary/60 border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share to Slack
      </button>
    </div>
  );
}
