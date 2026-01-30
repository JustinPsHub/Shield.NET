import React, { useState } from 'react';
import { Terminal, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';

const Hero: React.FC<{ onCtaClick: () => void }> = ({ onCtaClick }) => {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('dotnet add package Shield.NET');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnnouncementClick = () => {
    window.open('https://devblogs.microsoft.com/dotnet/', '_blank');
  };

  return (
    <div className="relative isolate pt-14">
      {/* Background Effects */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-300 to-brand-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <button onClick={handleAnnouncementClick} className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-400 ring-1 ring-white/10 hover:ring-white/20 transition-all cursor-pointer">
                Announcing Shield.NET 1.0 for .NET 10 <span className="font-semibold text-brand-400"><span className="absolute inset-0" aria-hidden="true" />Read the announcement <span aria-hidden="true">&rarr;</span></span>
              </button>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">Trust Layer</span> for Enterprise AI
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
              The first Commercial Open-Source guardrails platform native to .NET. 
              Secure your agentic workflows, detect hallucinations, and automate EU AI Act compliance 
              without your data leaving the premises.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={onCtaClick}
                className="rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all flex items-center gap-2"
              >
                Launch Compliance Dashboard <ArrowRight className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-dark-surface border border-white/10">
                <Terminal className="w-4 h-4 text-gray-400" />
                <code className="text-sm text-gray-200 font-mono">dotnet add package Shield.NET</code>
                <button onClick={copyCommand} className="ml-2 text-gray-500 hover:text-white transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Code Window Visualization */}
          <div className="mt-16 flow-root sm:mt-24">
            <div className="m-auto max-w-3xl rounded-xl bg-gray-900/80 ring-1 ring-inset ring-white/10 lg:rounded-2xl backdrop-blur shadow-2xl shadow-brand-900/20">
              <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3 bg-white/5 rounded-t-xl">
                 <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500 opacity-50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 opacity-50"></div>
                 </div>
                 <span className="ml-4 text-xs text-gray-400 font-mono">Program.cs</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm leading-6 font-mono text-gray-300">
                  <code>
                    <span className="text-pink-400">using</span> Shield.NET;<br/>
                    <span className="text-pink-400">using</span> Microsoft.Extensions.AI;<br/>
                    <br/>
                    <span className="text-blue-400">var</span> builder = <span className="text-pink-400">new</span> <span className="text-yellow-300">ChatClientBuilder</span>(innerClient)<br/>
                    &nbsp;&nbsp;.<span className="text-brand-400 font-bold">UseShield</span>(config =&gt; {'{'}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;config.BlockPromptInjection = <span className="text-blue-400">true</span>;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;config.RedactPII = <span className="text-blue-400">true</span>;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;config.DetectHallucinations = <span className="text-blue-400">true</span>;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;config.ComplianceLog.Destination = <span className="text-green-300">LogDestination</span>.Splunk;<br/>
                    &nbsp;&nbsp;{'}'})<br/>
                    &nbsp;&nbsp;.<span className="text-yellow-300">Build</span>();
                  </code>
                </pre>
              </div>
            </div>
          </div>
          
           {/* Trust Badges */}
           <div className="mt-20 text-center">
              <p className="text-sm font-semibold text-gray-500 mb-6">TRUSTED BY ENGINEERING TEAMS AT</p>
              <div className="flex justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                 {/* Mock Logos - simple text representations for now */}
                 <span className="text-xl font-bold text-gray-300 flex items-center gap-2"><ShieldCheck className="w-6 h-6"/> FinCorp</span>
                 <span className="text-xl font-bold text-gray-300 flex items-center gap-2"><ShieldCheck className="w-6 h-6"/> HealthSys</span>
                 <span className="text-xl font-bold text-gray-300 flex items-center gap-2"><ShieldCheck className="w-6 h-6"/> GovTech</span>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;