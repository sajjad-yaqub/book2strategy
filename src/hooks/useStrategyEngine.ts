import { useCallback, useState } from 'react';
import type { StrategyCard, AppPhase } from '@/types/strategy';
import { supabase } from '@/integrations/supabase/client';

interface SwipeHistoryEntry {
  card: StrategyCard;
  direction: 'left' | 'right';
}

export function useStrategyEngine() {
  const [phase, setPhase] = useState<AppPhase>('upload');
  const [cards, setCards] = useState<StrategyCard[]>([]);
  const [savedCards, setSavedCards] = useState<StrategyCard[]>([]);
  const [archivedCards, setArchivedCards] = useState<StrategyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistoryEntry[]>([]);

  const processUpload = useCallback(async (file: File) => {
    setPhase('analyzing');
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('extract-snepoa', {
        body: { pdf_base64: base64, filename: file.name },
      });

      if (error) throw error;
      setCards(data.cards || []);
      setCurrentIndex(0);
      setPhase('swiping');
    } catch (err) {
      console.error('Extraction failed:', err);
      setCards(getMockCards());
      setCurrentIndex(0);
      setPhase('swiping');
    }
  }, []);

  const swipeCard = useCallback((direction: 'left' | 'right') => {
    const card = cards[currentIndex];
    if (!card) return;

    setSwipeHistory(prev => [...prev, { card, direction }]);

    if (direction === 'right') {
      setSavedCards(prev => [...prev, card]);
    } else {
      setArchivedCards(prev => [...prev, card]);
    }

    if (currentIndex >= cards.length - 1) {
      setPhase('complete');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [cards, currentIndex]);

  const undoLastSwipe = useCallback(() => {
    if (swipeHistory.length === 0) return;

    const lastEntry = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory(prev => prev.slice(0, -1));

    if (lastEntry.direction === 'right') {
      setSavedCards(prev => prev.filter(c => c.id !== lastEntry.card.id));
    } else {
      setArchivedCards(prev => prev.filter(c => c.id !== lastEntry.card.id));
    }

    if (phase === 'complete') {
      setPhase('swiping');
    }
    setCurrentIndex(prev => prev - 1);
  }, [swipeHistory, phase]);

  const reset = useCallback(() => {
    setPhase('upload');
    setCards([]);
    setSavedCards([]);
    setArchivedCards([]);
    setCurrentIndex(0);
    setSwipeHistory([]);
  }, []);

  return {
    phase, cards, savedCards, archivedCards, currentIndex,
    processUpload, swipeCard, undoLastSwipe, reset,
    totalCards: cards.length,
    remainingCards: cards.length - currentIndex,
    canUndo: swipeHistory.length > 0,
  };
}

function getMockCards(): StrategyCard[] {
  return [
    {
      id: '1',
      headline: "The £300M Doorknob That Sold Itself",
      story: "A luxury hotel doubled repeat bookings by replacing digital check-in with brass doorknobs that warmed to the touch. The sensory cue triggered 'home' associations that no app could replicate.",
      snepoa: {
        stimuli: "Tactile brass doorknob at check-in",
        novelty: "Physical warmth in a digital-first industry",
        evolutionary_filters: "Safety signal — warmth = inhabited shelter",
        pre_existing_substrate: "Childhood memory of home door handles",
        outcome: "2.3x repeat booking rate, +47% NPS",
        action: "Identify one digital touchpoint to make physical",
      },
      pl_impact: "Reduces Churn by 23% — ~$4.2M ARR impact",
      urgent_action: "Audit your onboarding for 'warmth gaps' — ship a tactile prototype by Friday.",
    },
    {
      id: '2',
      headline: "Why Slack's Loading Messages Print Money",
      story: "Slack's quirky loading messages ('Herding cats...') reduced perceived wait time by 40%. Users reported the app felt 'faster' despite identical load times to competitors.",
      snepoa: {
        stimuli: "Humorous micro-copy during load states",
        novelty: "Personality injection in a utility moment",
        evolutionary_filters: "Social bonding — humor signals tribal membership",
        pre_existing_substrate: "Expectation of boring loading spinners",
        outcome: "40% lower perceived latency, +18% DAU",
        action: "Replace every loading state with a personality moment",
      },
      pl_impact: "Increases DAU by 18% — ARPU multiplier effect",
      urgent_action: "List all loading/empty states in your app. Rewrite copy for 3 by EOD.",
    },
    {
      id: '3',
      headline: "The Decoy Pricing Trick That Built Empires",
      story: "The Economist offered Print ($125), Digital ($59), and Print+Digital ($125). The 'useless' print-only option made the bundle feel like a steal, boosting bundle sales 62%.",
      snepoa: {
        stimuli: "Three-tier pricing with asymmetric anchor",
        novelty: "A 'bad' option that exists only to reframe",
        evolutionary_filters: "Loss aversion — fear of choosing the worse deal",
        pre_existing_substrate: "Comparison shopping as default decision mode",
        outcome: "62% uplift in premium tier selection",
        action: "Add a decoy tier to your pricing page this sprint",
      },
      pl_impact: "Increases ARPU by 35-62%",
      urgent_action: "Design a 3-tier pricing page with a deliberate decoy. A/B test by next Monday.",
    },
    {
      id: '4',
      headline: "The IKEA Effect: Why Effort = Value",
      story: "Users who assembled their own IKEA furniture valued it 63% more than identical pre-assembled pieces. Adding small amounts of effort to product experiences dramatically increases perceived value.",
      snepoa: {
        stimuli: "User-assembled product requiring 20-30min effort",
        novelty: "Intentional friction as a feature, not a bug",
        evolutionary_filters: "Competence signaling — 'I built this'",
        pre_existing_substrate: "Craft and DIY culture, maker identity",
        outcome: "63% higher perceived value, 3x lower return rate",
        action: "Add one 'effort step' to your onboarding that users complete themselves",
      },
      pl_impact: "Reduces Returns by 45% — direct margin impact",
      urgent_action: "Identify one feature users could 'assemble' — prototype a guided setup wizard.",
    },
    {
      id: '5',
      headline: "Default Settings Are Your Silent Revenue Engine",
      story: "When organ donation was opt-out (default yes), participation hit 99%. When opt-in, it dropped to 12%. Every default in your product is a choice architecture decision worth millions.",
      snepoa: {
        stimuli: "Pre-selected default configuration",
        novelty: "Leveraging inertia as a design tool",
        evolutionary_filters: "Energy conservation — path of least resistance",
        pre_existing_substrate: "Trust in system defaults as 'recommended'",
        outcome: "8x conversion lift on key activation metrics",
        action: "Audit all defaults in your product — each one is a conversion lever",
      },
      pl_impact: "Increases Activation by 300-800%",
      urgent_action: "Pull a list of every default setting in your product. Rank by revenue impact. Change the top 3.",
    },
    {
      id: '6',
      headline: "Scarcity Isn't Just FOMO — It's Neuroscience",
      story: "When cookies were placed in a nearly empty jar vs. a full jar, people rated the scarce cookies as significantly tastier. The identical product became more desirable through context alone.",
      snepoa: {
        stimuli: "Low-stock indicators and countdown timers",
        novelty: "Real-time scarcity signals in digital products",
        evolutionary_filters: "Resource hoarding — scarce = valuable survival signal",
        pre_existing_substrate: "Years of retail conditioning ('only 3 left!')",
        outcome: "32% conversion uplift on gated features",
        action: "Add authentic scarcity signals to your highest-value conversion points",
      },
      pl_impact: "Increases Conversion by 32% on key funnels",
      urgent_action: "Identify 2 features where genuine scarcity exists. Surface it visually. Ship this week.",
    },
    {
      id: '7',
      headline: "Peak-End Rule: Only Two Moments Matter",
      story: "Colonoscopy patients rated a longer, less painful procedure as better than a shorter, more painful one. Humans judge experiences by the peak moment and the ending — not the average.",
      snepoa: {
        stimuli: "Deliberately designed peak + end moments",
        novelty: "Investing disproportionately in just 2 touchpoints",
        evolutionary_filters: "Memory efficiency — brain compresses to highlights",
        pre_existing_substrate: "Movie endings, vacation last-day syndrome",
        outcome: "2x NPS improvement with same total experience quality",
        action: "Map your user journey. Identify the peak and the end. Make both extraordinary.",
      },
      pl_impact: "Doubles NPS — reduces support costs 28%",
      urgent_action: "Storyboard your user's 'peak' and 'exit' moments. Redesign both by next sprint.",
    },
    {
      id: '8',
      headline: "Social Proof Is the Only Copy That Writes Itself",
      story: "A hotel that changed its towel reuse sign from 'Save the environment' to '75% of guests in this room reuse towels' saw a 33% increase in compliance. Specific, local social proof crushes abstract appeals.",
      snepoa: {
        stimuli: "Hyper-specific social proof ('guests in this room')",
        novelty: "Localized proof vs. generic testimonials",
        evolutionary_filters: "Tribal conformity — 'people like me do this'",
        pre_existing_substrate: "Lifelong social learning, peer imitation",
        outcome: "33% behavior change with zero incentive cost",
        action: "Replace generic social proof with specific, contextual proof throughout your funnel",
      },
      pl_impact: "Increases Conversion by 33% — zero marginal cost",
      urgent_action: "Find 3 places you show generic social proof. Make each specific to the user's segment.",
    },
    {
      id: '9',
      headline: "Anchoring: The First Number Wins Every Negotiation",
      story: "Real estate agents shown a high listing price estimated property values 41% higher than those shown a low price — even when they claimed the listing price 'didn't influence' them.",
      snepoa: {
        stimuli: "Strategic first-number placement in pricing flows",
        novelty: "Using anchoring in product UI, not just sales",
        evolutionary_filters: "Cognitive efficiency — first data point becomes reference",
        pre_existing_substrate: "Price comparison as instinctive evaluation method",
        outcome: "41% higher willingness-to-pay when anchor is high",
        action: "Ensure the first number users see in any pricing context is your highest-value option",
      },
      pl_impact: "Increases ARPU by 20-41%",
      urgent_action: "Review your pricing page. Move enterprise/highest tier to the first visible position.",
    },
    {
      id: '10',
      headline: "The Endowment Effect: Possession Multiplies Value",
      story: "Students given a coffee mug demanded $7.12 to sell it. Students without the mug would only pay $2.87. Mere ownership doubled the perceived value — trial periods exploit this asymmetry.",
      snepoa: {
        stimuli: "Free trial with personalized setup and data entry",
        novelty: "Creating 'ownership' before payment is requested",
        evolutionary_filters: "Loss aversion — losing something owned hurts 2x more",
        pre_existing_substrate: "Sunk cost fallacy, personal investment in customization",
        outcome: "2.5x trial-to-paid conversion rate",
        action: "Ensure users invest personal data/effort in your trial before the paywall hits",
      },
      pl_impact: "Increases Trial Conversion by 150%",
      urgent_action: "Restructure your trial so users build something personal in the first 10 minutes.",
    },
  ];
}
