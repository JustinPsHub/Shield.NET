import React, { useState } from 'react';
import { ShieldAlert, FileJson, Play, RefreshCw, Hash, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';
import { AuditLog } from '../types';

// The specific Trap Scenario text required for verification
const TRAP_SCENARIO_TEXT = 
  "User Sarah Connor (sarah.connor@sky.net) requested access from IP 192.168.1.45. Please authorize.";

const Dashboard: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [auditLog, setAuditLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRunTrap = async () => {
    // 1. Set the Trap Input
    setInput(TRAP_SCENARIO_TEXT);
    setLoading(true);
    setAuditLog(null); // Clear previous logs
    setOutput('');

    try {
      // 2. Execute the Simulation
      // Small delay to allow state to update input text before processing
      await new Promise(resolve => setTimeout(resolve, 100)); 
      
      const response = await sendMessageToGemini(TRAP_SCENARIO_TEXT);
      
      // 3. Update UI with Results
      setOutput(response.content);
      setAuditLog(response.auditRecord || null);
    } catch (error) {
      console.error("Simulation failed", error);
      setOutput("Error: Middleware simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
      if(!input) return;
      setLoading(true);
      setAuditLog(null);
      setOutput('');
      try {
          const response = await sendMessageToGemini(input);
          setOutput(response.content);
          setAuditLog(response.auditRecord || null);
      } catch (error) {
          console.error(error);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div id="dashboard" className="py-12 bg-gray-900 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="text-brand-400" /> Compliance Verification Lab
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    Frontend Simulation of C# Backend PII Detection (Source of Truth Parity)
                </p>
            </div>
            <div className="flex gap-3">
                 <button
                  onClick={handleRunTrap}
                  disabled={loading}
                  className={`
                    px-4 py-2 rounded-lg font-bold text-white text-sm transition-all flex items-center gap-2 shadow-lg shadow-red-900/20
                    ${loading ? 'bg-red-900/50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 border border-red-500/50'}
                  `}
                >
                   {loading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <AlertTriangle className="w-4 h-4" />}
                   Run "Sarah Connor" Trap
                </button>
            </div>
        </div>

        {/* Main Verification Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Panel 1: Raw Input */}
            <div className="glass-panel rounded-xl flex flex-col h-80 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Play className="w-3 h-3" /> 1. Raw User Input
                    </h3>
                    <span className="text-[10px] text-gray-500 font-mono">UNTRUSTED SOURCE</span>
                </div>
                <div className="p-0 flex-grow relative">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full h-full bg-transparent p-4 text-sm font-mono text-white resize-none focus:outline-none focus:bg-white/5 transition-colors"
                        placeholder="Enter text to test the Shield..."
                    />
                    <div className="absolute bottom-4 right-4">
                        <button 
                            onClick={handleAnalyze}
                            disabled={loading || !input}
                            className="bg-brand-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-brand-500 disabled:opacity-50"
                        >
                            Analyze
                        </button>
                    </div>
                </div>
            </div>

            {/* Panel 2: Middleware Output */}
            <div className={`rounded-xl flex flex-col h-80 overflow-hidden border ${output.includes('<') ? 'border-green-500/30 bg-green-900/10' : 'border-white/10 glass-panel'}`}>
                <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-2">
                        <Lock className="w-3 h-3" /> 2. Middleware Output (Mock LLM View)
                    </h3>
                    {output && output.includes('<') && (
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                         <CheckCircle className="w-3 h-3 mr-1" /> SHIELD ACTIVE
                       </span>
                    )}
                </div>
                <div className="p-4 flex-grow overflow-auto font-mono text-sm text-brand-200 whitespace-pre-wrap">
                    {output || <span className="text-gray-600 italic">Waiting for simulation...</span>}
                </div>
            </div>
        </div>

        {/* Panel 3: Audit Log (Forensic Evidence) */}
        <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
            <div className="px-4 py-3 bg-black/40 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                <FileJson className="w-3 h-3" /> 3. Audit Log Panel (JSON Evidence)
              </h3>
              {auditLog && (
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> CID: {auditLog.CorrelationId}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                      <Hash className="w-3 h-3" /> HASH: {auditLog.UserPromptHash.substring(0, 8)}...
                    </span>
                </div>
              )}
            </div>
            <div className="p-4 overflow-auto bg-black/50 h-64">
              {auditLog ? (
                <pre className="font-mono text-xs text-green-300 leading-relaxed">
                  {JSON.stringify(auditLog, null, 2)}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm italic gap-2">
                   <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <FileJson className="w-6 h-6 opacity-50" />
                   </div>
                   No audit record generated. Run the simulation to view logs.
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
