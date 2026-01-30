import React from 'react';
import { FeatureProps } from '../types';
import { Cpu, Scale, Lock, Eye, Zap, FileText } from 'lucide-react';

const featuresData: (FeatureProps & { icon: React.ElementType })[] = [
  {
    title: 'Deterministic PII Engine',
    description: 'Implements the "Source of Truth" parity. Uses strict regex patterns (RFC compliant) for Emails and IPs to match the C# Backend exactly.',
    icon: Cpu
  },
  {
    title: 'Compliance Sidecar',
    description: 'Generates ISO 27001-ready Audit Logs with immutable correlation IDs and SHA-256 prompt hashing for non-repudiation.',
    icon: Scale
  },
  {
    title: 'Zero-Trust Egress',
    description: 'The "Sarah Connor" Protocol ensures that detected entities are replaced with <EMAIL> and <IP> tags before leaving the trusted boundary.',
    icon: Lock
  },
  {
    title: 'Trap Scenario Verification',
    description: 'Built-in "Canary Token" testing capabilities allow instant verification of the middleware\'s integrity using standard test vectors.',
    icon: Eye
  },
  {
    title: 'Native .NET 9 Architecture',
    description: 'Designed around Microsoft.Extensions.AI and the DelegatingChatClient pattern for high-performance middleware chaining.',
    icon: Zap
  },
  {
    title: 'Audit Log Parity',
    description: 'Frontend simulation produces JSON artifacts that are structure-compatible with the backend C# AuditRecord class.',
    icon: FileText
  }
];

const Features: React.FC = () => {
  return (
    <div id="features" className="py-24 bg-dark-bg border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base text-brand-400 font-semibold tracking-wide uppercase">System Capabilities</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
            Governance & Compliance Features
          </p>
          <p className="mt-4 max-w-2xl text-lg text-gray-400 mx-auto">
            These active modules ensure that the Frontend Simulation accurately reflects the C# Source of Truth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature) => (
              <div key={feature.title} className="relative group bg-white/5 rounded-2xl p-8 hover:bg-white/10 transition-colors border border-white/10 hover:border-brand-500/30">
                <div className="absolute top-8 left-8">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-500/20 text-brand-400 group-hover:text-white group-hover:bg-brand-500 transition-all">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="mt-16">
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-400 leading-relaxed">
                    {feature.description}
                    </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
