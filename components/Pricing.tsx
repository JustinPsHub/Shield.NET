import React from 'react';
import { Check } from 'lucide-react';
import { PricingTier } from '../types';

const tiers: PricingTier[] = [
  {
    name: 'Core',
    price: 'Free',
    description: 'For individuals and open-source projects.',
    features: [
      'Basic PII Regex Redaction',
      'Token Counting',
      'Prompt Blocklists',
      'Console Logging',
      'Community Support'
    ],
    cta: 'Download NuGet',
    highlight: false
  },
  {
    name: 'Standard',
    price: '$1,500',
    description: 'Per project / year. For SMEs building internal tools.',
    features: [
      'Local ONNX Intelligence Engine',
      'Context-Aware PII Detection',
      'Basic Hallucination Checks',
      'JSON Log Export',
      'Standard Email Support'
    ],
    cta: 'Start Trial',
    highlight: true
  },
  {
    name: 'Enterprise',
    price: '$10k+',
    description: 'For regulated industries and mission-critical apps.',
    features: [
      'Compliance Sidecar (EU AI Act)',
      'Splunk / Datadog Sink Connectors',
      'Advanced Jailbreak Detection',
      'SSO & RBAC Dashboard',
      'SLA & Priority Support'
    ],
    cta: 'Contact Sales',
    highlight: false
  }
];

interface PricingProps {
  onNavigate: (page: string) => void;
}

const Pricing: React.FC<PricingProps> = ({ onNavigate }) => {
  const handleCtaClick = (tier: PricingTier) => {
    if (tier.name === 'Core') {
      window.open('https://www.nuget.org/packages', '_blank');
    } else if (tier.name === 'Standard') {
      onNavigate('dashboard');
    } else if (tier.name === 'Enterprise') {
      window.location.href = 'mailto:enterprise@shield.net?subject=Enterprise%20Inquiry';
    }
  };

  return (
    <div id="pricing" className="bg-dark-bg py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-brand-400">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Predictable security, flat pricing
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            No per-token markup. No hidden cloud costs. You run the compute, we provide the safety.
          </p>
        </div>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.name}
              className={`flex flex-col justify-between rounded-3xl p-8 ring-1 xl:p-10 ${
                tier.highlight
                  ? 'bg-white/5 ring-brand-500 shadow-xl shadow-brand-500/10'
                  : 'ring-white/10 bg-gray-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 id={tier.name} className={`text-lg font-semibold leading-8 ${tier.highlight ? 'text-brand-400' : 'text-white'}`}>
                    {tier.name}
                  </h3>
                  {tier.highlight ? (
                    <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-semibold leading-5 text-brand-400">
                      Most Popular
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-300">{tier.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-white">{tier.price}</span>
                  {tier.price !== 'Free' && <span className="text-sm font-semibold leading-6 text-gray-300">/year</span>}
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-brand-400" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleCtaClick(tier)}
                aria-describedby={tier.name}
                className={`mt-8 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${
                  tier.highlight
                    ? 'bg-brand-600 text-white shadow-sm hover:bg-brand-500 focus-visible:outline-brand-600'
                    : 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;