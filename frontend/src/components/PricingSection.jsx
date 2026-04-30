import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Sparkles, Globe, Terminal, ShieldCheck, HeartPulse } from 'lucide-react';
import gsap from 'gsap';
import api from '../lib/api';

const tiers = [
  {
    id: 'FREE',
    name: 'Basic',
    target: 'Personal use',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { name: '1 Active Workflow', included: true },
      { name: 'Standard Execution Speed', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'Community Support', included: true },
      { name: 'Google App Integration', included: false },
      { name: 'Premium AI Reasoning', included: false },
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'PRO',
    name: 'Pro',
    target: 'Power Users',
    monthlyPrice: 99,
    yearlyPrice: 891, // 25% off approx (99 * 12 * 0.75)
    features: [
      { name: 'Includes Basic Features', included: true },
      { name: 'All Google Apps Integration', included: true },
      { name: '50k Tasks/mo', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Advanced Logic Nodes', included: true },
      { name: 'Elite AI Reasoning', included: false },
    ],
    cta: 'Start 14-Day Trial',
    trial: true,
    popular: true,
  },
  {
    id: 'ELITE',
    name: 'Elite',
    target: 'Enterprise',
    monthlyPrice: 199,
    yearlyPrice: 1791,
    features: [
      { name: 'Includes All Features', included: true },
      { name: 'Notion, Slack, WhatsApp', included: true },
      { name: 'Unlimited Workflows', included: true },
      { name: 'Agentic AI Reasoning (Llama 3)', included: true },
      { name: 'Real-time Metrics', included: true },
      { name: 'Custom Webhooks', included: true },
    ],
    cta: 'Start 14-Day Trial',
    trial: true,
    popular: false,
  },
];

const PricingCard = ({ tier, isYearly, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = React.useRef(null);

  const handleMouseMove = (e) => {
    if (!tier.popular) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!tier.popular) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (tier.id === 'FREE') return;

    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // Amount is 1 Rupee for trial verification as per request
      const amount = tier.trial ? 1 : (isYearly ? tier.yearlyPrice : tier.monthlyPrice);
      const { data: order } = await api.post('/v1/payment/order', {
        amount,
        planId: tier.id
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_API_KEY || 'rzp_test_SjgALiWCDFMzmo',
        amount: order.amount,
        currency: order.currency,
        name: 'ORvexia',
        description: tier.trial ? `Start your 14-day ${tier.name} journey for just ₹1` : `Subscribe to ${tier.name} Plan`,
        image: '/favicon.svg',
        order_id: order.id,
        handler: async (response) => {
          try {
            const { data: verifyData } = await api.post('/v1/payment/verify', {
              ...response,
              planId: tier.id
            });
            if (verifyData.success) {
              alert('Payment Successful! Welcome to ORvexia ' + tier.name);
              window.location.href = '/home';
            }
          } catch (err) {
            alert('Verification Failed: ' + err.message);
          }
        },
        prefill: {
          name: 'Niloy Mallik',
          email: 'niloymallik00001@gmail.com',
        },
        theme: {
          color: '#FF5F1F',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Payment Initiation Failed:', error);
      alert('Could not initiate payment. Please login first.');
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`
        relative p-8 rounded-2xl flex flex-col gap-8 transition-all duration-500
        ${tier.popular 
          ? 'bg-surface-2 border-accent/40 shadow-[0_0_40px_rgba(255,95,31,0.1)] scale-105 z-10' 
          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
        }
        border backdrop-blur-xl
      `}
    >
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      <div>
        <h3 className="text-2xl font-black tracking-tighter text-white uppercase">{tier.name}</h3>
        <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em] mt-2">{tier.target}</p>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">₹{isYearly ? tier.yearlyPrice : tier.monthlyPrice}</span>
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">/ {isYearly ? 'yr' : 'mo'}</span>
        </div>
        {isYearly && tier.monthlyPrice > 0 && (
          <span className="text-[10px] font-bold text-accent-success uppercase tracking-widest">Save 25% with yearly billing</span>
        )}
      </div>

      <div className="space-y-4 flex-1">
        {tier.features.map((feature, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${feature.included ? 'bg-accent/20 text-accent' : 'bg-white/5 text-white/10'}`}>
              <Check className="w-2.5 h-2.5" strokeWidth={4} />
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-tight ${feature.included ? 'text-white/80' : 'text-white/20 line-through'}`}>
              {feature.name}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={handlePayment}
        className={`
          w-full py-4 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300
          ${tier.popular 
            ? 'bg-accent text-white hover:bg-accent-dim shadow-glow-accent' 
            : 'bg-white/5 text-white border border-white/10 hover:border-accent/40 hover:bg-accent/5'
          }
        `}
      >
        {tier.cta}
      </button>

      {/* Decorative background elements */}
      {tier.popular && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 blur-[60px] rounded-full" />
        </div>
      )}
    </motion.div>
  );
};

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const toggleRef = React.useRef(null);

  useEffect(() => {
    gsap.to(toggleRef.current, {
      x: isYearly ? '100%' : '0%',
      duration: 0.4,
      ease: 'power2.inOut',
    });
  }, [isYearly]);

  return (
    <section id="pricing" className="py-40 px-8 relative bg-obsidian overflow-hidden border-t border-white/[0.03]">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full surface-dot-grid opacity-[0.05] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full bg-accent/[0.02] blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto flex flex-col items-center gap-20">
        
        {/* Header */}
        <div className="text-center space-y-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full"
          >
            <Zap className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Pricing Architecture</span>
          </motion.div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none">
            CHOOSE YOUR <span className="text-accent italic">TIER.</span>
          </h2>
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest max-w-xl mx-auto">
            Scale from basic personal automation to global enterprise infrastructure. 
            Flexible billing, industrial reliability.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <span className={`text-[10px] font-black tracking-widest transition-colors ${!isYearly ? 'text-white' : 'text-white/20'}`}>MONTHLY</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-16 h-8 bg-surface-2 border border-white/10 rounded-full p-1 cursor-pointer"
            >
              <div 
                ref={toggleRef}
                className="w-1/2 h-full bg-accent rounded-full shadow-lg"
              />
            </button>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black tracking-widest transition-colors ${isYearly ? 'text-white' : 'text-white/20'}`}>YEARLY</span>
              <AnimatePresence>
                {isYearly && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="px-3 py-1 bg-accent-success/10 border border-accent-success/20 text-accent-success text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse shadow-[0_0_15px_rgba(141,205,255,0.2)]"
                  >
                    Save 25%
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {tiers.map((tier, idx) => (
            <PricingCard key={tier.id} tier={tier} isYearly={isYearly} index={idx} />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-12 pt-12 border-t border-white/[0.05] w-full">
           <div className="flex items-center gap-3 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">SSL SECURED</span>
           </div>
           <div className="flex items-center gap-3 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <Terminal className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">PCI COMPLIANT</span>
           </div>
           <div className="flex items-center gap-3 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <HeartPulse className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">RAZORPAY VERIFIED</span>
           </div>
        </div>

      </div>
    </section>
  );
};

export default PricingSection;
