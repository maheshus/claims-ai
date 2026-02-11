import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Send, AlertCircle, Activity, Search, FileText, 
  User, Calendar, ExternalLink, 
  ChevronRight, ChevronLeft, ChevronDown, Home, X, CheckCircle,
  Building, Hash, Stethoscope, Code, Database, Server, Clock, Zap,
  FileCode, ShieldAlert, Brain
} from 'lucide-react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import ReactJson from 'react-json-view';

// ==========================================
// TYPES
// ==========================================
export interface Adjustment {
  category_label: string;
  category_code: string;
  financial_responsibility?: string;
  reason_code?: string;
  reason_type?: string;
  description?: string;
  action_needed?: string;
  amount: number;
  currency: string;
}

export interface Diagnosis {
  code: string;
  description: string;
  type: string;
}

export interface LineItem {
  service: string;
  adjudications: Adjustment[];
}

export interface ClaimSummary {
  claim_id: string;
  fhir_id: string;
  patient_name: string;
  claim_status: string;
  processing_status: string;
  payment_date: string;
  billed_amount: number;
  paid_amount: number;
  patient_responsibility: number;
  contractual_writeoff: number;
  primary_diagnosis: string;
  diagnoses: Diagnosis[];
  adjustments: Adjustment[];
  line_items: LineItem[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const API_URL = "http://localhost:8000"; 

// ==========================================
// SUB-COMPONENTS
// ==========================================

// 1. Status Indicator
const StatusIndicator = ({ active }: { active: boolean }) => (
  <div className="relative flex items-center justify-center w-2.5 h-2.5">
    {active ? (
      <>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
      </>
    ) : (
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 opacity-50"></span>
    )}
  </div>
);

// 2. Reasoning Parser & Accordion (Handles Multiple Blocks)
const parseReasoning = (content: string) => {
  // Regex with 'g' flag to find ALL <think> blocks
  const regex = /<think>([\s\S]*?)<\/think>/g;
  const matches = [...content.matchAll(regex)];

  if (matches.length === 0) {
    return { thought: null, answer: content };
  }

  // Combine all thoughts into one block
  const thought = matches.map(m => m[1].trim()).join("\n\n---\n\n");
  
  // Remove all thoughts from the answer
  const answer = content.replace(regex, "").trim();

  return { thought, answer };
};

const ReasoningAccordion = ({ thought }: { thought: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!thought) return null;

  return (
    <div className="mb-3 border border-white/10 bg-black/20 rounded-lg overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors uppercase tracking-wider"
      >
        <Brain className="w-3 h-3" />
        <span>AI Thought Process</span>
        {isOpen ? <ChevronDown className="w-3 h-3 ml-auto"/> : <ChevronRight className="w-3 h-3 ml-auto"/>}
      </button>
      
      {isOpen && (
        <div className="p-3 text-xs text-zinc-500 border-t border-white/10 bg-black/40 font-mono leading-relaxed whitespace-pre-wrap animate-in slide-in-from-top-1">
          {thought}
        </div>
      )}
    </div>
  );
};

// 3. Form View
const ClaimFormView = ({ data }: { data: any }) => {
  const FormBox = ({ label, value, icon: Icon, className }: any) => (
    <div className={clsx("border border-white/10 bg-[#1c1c1e] p-3 rounded-lg", className)}>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </p>
      <p className="text-sm font-medium text-zinc-200 truncate" title={String(value)}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center px-2 border-b border-white/5 pb-2">
        <h2 className="text-zinc-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-4 h-4"/> Institutional Claim Record
        </h2>
        <span className="text-xs font-mono text-zinc-600">CN: {data.id}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <FormBox label="Statement From" value={data.billablePeriod?.start} icon={Calendar} />
        <FormBox label="Statement To" value={data.billablePeriod?.end} icon={Calendar} />
        <FormBox label="Type" value={data.type?.coding?.[0]?.display || "Institutional"} icon={Building} />
        <FormBox label="Disposition" value={data.disposition} className={data.disposition === 'Denied' ? 'border-red-500/30 bg-red-500/10' : ''} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="col-span-1 border border-white/10 bg-[#1c1c1e] p-4 rounded-lg">
           <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Patient</p>
           <p className="text-lg font-medium text-white">{data.patient?.display}</p>
           <p className="text-xs text-zinc-500 mt-1 truncate">Ref: {data.patient?.reference}</p>
        </div>
        <div className="col-span-1 border border-white/10 bg-[#1c1c1e] p-4 rounded-lg">
           <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Payor / Insurer</p>
           <p className="text-lg font-medium text-white">{data.insurer?.display}</p>
           <p className="text-xs text-zinc-500 mt-1 truncate">ID: {data.insurer?.identifier?.value}</p>
        </div>
        <div className="col-span-1 border border-white/10 bg-[#1c1c1e] p-4 rounded-lg">
           <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Billing Provider</p>
           <p className="text-lg font-medium text-white">{data.provider?.display}</p>
           <p className="text-xs text-zinc-500 mt-1 truncate">NPI: {data.provider?.identifier?.value}</p>
        </div>
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden bg-[#1c1c1e]">
        <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center gap-2">
           <Stethoscope className="w-4 h-4 text-zinc-400" />
           <span className="text-xs font-bold text-zinc-400 uppercase">Diagnosis Codes</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
           {data.diagnosis?.map((d: any, i: number) => (
             <div key={i} className="p-3 border-b border-white/10 last:border-b-0">
                <div className="flex justify-between">
                   <span className="font-mono text-blue-400 font-bold">{d.diagnosisCodeableConcept?.coding?.[0]?.code}</span>
                   <span className="text-xs text-zinc-500 bg-zinc-900 px-2 rounded">{d.type?.[0]?.coding?.[0]?.code || "Principal"}</span>
                </div>
                <p className="text-sm text-zinc-300 mt-1">{d.diagnosisCodeableConcept?.coding?.[0]?.display}</p>
             </div>
           ))}
        </div>
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden overflow-x-auto bg-[#1c1c1e]">
         <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center gap-2 min-w-[600px]">
           <Hash className="w-4 h-4 text-zinc-400" />
           <span className="text-xs font-bold text-zinc-400 uppercase">Service Lines</span>
        </div>
        <table className="w-full text-sm text-left min-w-[600px]">
           <thead className="bg-black/20 text-zinc-500 font-medium">
              <tr>
                 <th className="px-4 py-2">#</th>
                 <th className="px-4 py-2">Service / Rev Code</th>
                 <th className="px-4 py-2">Date</th>
                 <th className="px-4 py-2 text-right">Qty</th>
                 <th className="px-4 py-2 text-right">Net Amount</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
              {data.item?.map((item: any, i: number) => (
                 <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-zinc-500">{item.sequence}</td>
                    <td className="px-4 py-3">
                       <p className="text-zinc-200">{item.productOrService?.coding?.[0]?.display || "Unknown"}</p>
                       <p className="text-xs text-zinc-500 font-mono">{item.productOrService?.coding?.[0]?.code}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{item.servicedPeriod?.start || "-"}</td>
                    <td className="px-4 py-3 text-right font-mono">{item.quantity?.value || 1}</td>
                    <td className="px-4 py-3 text-right font-mono text-white">${item.net?.value}</td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================

function App() {
  const [currentId, setCurrentId] = useState(""); 
  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState<'summary' | 'form' | 'json'>('summary');
  
  const [claim, setClaim] = useState<ClaimSummary | null>(null);
  const [rawJson, setRawJson] = useState<any>(null);
  const [availableClaims, setAvailableClaims] = useState<string[]>([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  
  const [error, setError] = useState("");
  const [systemStatus, setSystemStatus] = useState({ db: false, api: false, latency: 0 });

  const searchRef = useRef<HTMLDivElement>(null);

  // Constants for Marquee
  const WARNING_MSGS = [
    "DEMO ENVIRONMENT",
    "NO PHI DISCLOSED",
    "EDUCATIONAL USE ONLY",
    "NOT FOR CLINICAL DECISIONS",
    "AI GENERATED CONTENT",
    "MOCK DATA",
    "DO NOT ENTER REAL PATIENT DATA"
  ];

  useEffect(() => {
    axios.get(`${API_URL}/claims`)
      .then(res => setAvailableClaims(res.data.available_claims || []))
      .catch(console.error);

    const checkHealth = async () => {
      const start = Date.now();
      try {
        const res = await axios.get(`${API_URL}/health`);
        const latency = Date.now() - start;
        setSystemStatus({ 
          db: res.data.db_status === "connected", 
          api: true, 
          latency 
        });
      } catch (e) {
        setSystemStatus({ db: false, api: false, latency: 0 });
      }
    };
    checkHealth();
    
    const handleClickOutside = (event: any) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchClaimData = async (id: string) => {
    if (!id) return;
    setError("");
    setClaim(null);
    setRawJson(null);
    setChatHistory([]); 
    setShowSuggestions(false);

    try {
      const [summaryRes, rawRes] = await Promise.all([
        axios.get(`${API_URL}/claims/${id}/summary?include_pii=true`),
        axios.get(`${API_URL}/claims/${id}/raw`)
      ]);

      setClaim(summaryRes.data);
      setRawJson(rawRes.data);
      setCurrentId(id);
      setSearchInput(id);
    } catch (err) {
      console.error(err);
      setError(`Claim #${id} not found.`);
      setClaim(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchClaimData(searchInput.trim());
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatHistory(prev => [...prev, { role: 'assistant', content: "" }]);
    
    const currentQuery = chatInput;
    setChatInput("");
    setChatLoading(true);

    try {
      const contextPrompt = `[Context: User is viewing Claim ID ${currentId}] ${currentQuery}`;
      
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: contextPrompt,
          thread_id: "session-" + currentId
        })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        botResponse += chunk;
        setChatHistory(prev => {
          const newHistory = [...prev];
          const lastMsg = newHistory[newHistory.length - 1];
          if (lastMsg.role === 'assistant') {
            lastMsg.content = botResponse;
          }
          return newHistory;
        });
      }

    } catch (err: any) {
      console.error("Streaming Error:", err);
      setChatHistory(prev => {
        const newHistory = [...prev];
        const lastMsg = newHistory[newHistory.length - 1];
        if (lastMsg.role === 'assistant') {
           lastMsg.content = "Sorry, connection to the agent was lost.";
        }
        return newHistory;
      });
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden selection:bg-blue-500/30 relative">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
         <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] rounded-full bg-cyan-900/10 blur-[120px]" />
      </div>

      <div className="h-6 bg-yellow-500/10 border-b border-yellow-500/20 overflow-hidden flex items-center z-50">
         <div className="animate-scroll flex items-center gap-12 text-[9px] font-bold tracking-[0.2em] text-yellow-500 uppercase opacity-80 hover:opacity-100 transition-opacity">
            {[...WARNING_MSGS, ...WARNING_MSGS].map((msg, i) => (
               <span key={i} className="flex items-center gap-2 whitespace-nowrap">
                  <ShieldAlert className="w-2.5 h-2.5"/> {msg}
               </span>
            ))}
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden z-10">
        
        {/* 1. SIDEBAR */}
        <div className="w-64 bg-[#121212]/50 backdrop-blur-xl border-r border-white/5 flex flex-col flex-shrink-0 hidden md:flex">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white font-display">ClaimsAI</span>
            </div>

            <nav className="space-y-2">
              <button 
                onClick={() => { setClaim(null); setSearchInput(""); setCurrentId(""); }}
                className={clsx("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200", 
                  !claim ? "bg-white/10 text-white shadow-inner border border-white/5" : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Home className="w-4 h-4" /> Home
              </button>
              <a 
                href="https://fhir.epic.com/Specifications?api=1073" 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all group"
              >
                <img 
                  src="https://media.epic.com/epicdotcom/site/images/header/site-logo.png" 
                  alt="Epic" 
                  className="w-5 h-5 object-contain opacity-70 filter grayscale group-hover:filter-none group-hover:opacity-100 transition-all duration-300" 
                />
                Epic Specs
              </a>
              <a 
                href="http://localhost:8000/docs" 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <FileCode className="w-4 h-4 text-green-500/80" /> 
                API Docs
              </a>
            </nav>
          </div>

          <div className="mt-auto p-6 space-y-6">
             <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 backdrop-blur-md">
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                   <Zap className="w-3 h-3 text-yellow-500" /> System Status
                </p>
                <div className="space-y-2">
                   <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-2 text-zinc-400"><Server className="w-3 h-3"/> FastAPI</span>
                      <StatusIndicator active={systemStatus.api} />
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-2 text-zinc-400"><Database className="w-3 h-3"/> PostgreSQL</span>
                      <StatusIndicator active={systemStatus.db} />
                   </div>
                   <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5 mt-2">
                      <span className="flex items-center gap-2 text-zinc-500"><Clock className="w-3 h-3"/> Latency</span>
                      <span className="font-mono text-zinc-300">{systemStatus.latency}ms</span>
                   </div>
                </div>
             </div>

             <div className="relative group cursor-pointer">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center justify-between p-3 bg-black rounded-lg border border-white/10 leading-none">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Developed By</span>
                    <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white bg-[length:200%_auto] animate-shine">
                      Mahesh U S
                    </span>
                  </div>
                  <div className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">👨‍💻</div>
                </div>
             </div>
          </div>
        </div>

        {/* 2. CENTER PANEL */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-10 bg-black/40 backdrop-blur-xl">
             <div className="relative w-96 group" ref={searchRef}>
               <form onSubmit={handleSearch}>
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                  <input 
                    className="w-full bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-zinc-600 transition-all shadow-inner hover:bg-white/10"
                    placeholder="Search Claim ID..."
                    value={searchInput}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
                  />
               </form>
               {showSuggestions && availableClaims.length > 0 && (
                  <div className="absolute top-full mt-2 left-0 w-full bg-[#18181b]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                     <p className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase bg-white/5">Recent Claims</p>
                     {availableClaims.filter(id => id.includes(searchInput)).map(id => (
                        <button 
                          key={id} 
                          onClick={() => fetchClaimData(id)}
                          className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center justify-between group transition-colors"
                        >
                          {id}
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                        </button>
                     ))}
                  </div>
               )}
             </div>
             <div className="flex items-center gap-2">
               {!isChatOpen && <span className="text-xs text-zinc-500 hidden md:block">Open Assistant</span>}
               <button onClick={() => setIsChatOpen(!isChatOpen)} className={clsx("p-2 rounded-full hover:bg-white/10 transition-colors", isChatOpen ? "text-blue-400 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "text-zinc-400")}>
                 {isChatOpen ? <ChevronRight className="w-5 h-5"/> : <ChevronLeft className="w-5 h-5"/>}
               </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
             {!claim ? (
               <div className="max-w-4xl mx-auto mt-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl mb-8 flex items-center justify-center shadow-2xl shadow-blue-900/40 mx-auto">
                     <Activity className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold mb-4 py-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 font-display tracking-tight leading-tight">
                    Healthcare Claims Intelligence
                  </h1>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium tracking-wide mb-6">
                     <CheckCircle className="w-3 h-3" />
                     EPIC on FHIR • ExplanationOfBenefit (R4) • Industry Standard
                  </div>
                  <p className="text-zinc-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
                    Real-time EPIC FHIR adjudication analysis powered by a deterministic Logic Engine and Generative AI.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                     <button onClick={() => fetchClaimData("2500998765")} className="group bg-zinc-900/40 hover:bg-zinc-900/80 p-6 rounded-2xl text-left transition-all border border-white/5 hover:border-white/20 hover:shadow-lg hover:shadow-red-900/10 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                           <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">DENIED</span>
                           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                           </div>
                        </div>
                        <p className="font-bold text-xl text-white mb-1 font-mono tracking-tight">#2500998765</p>
                        <p className="text-zinc-500 text-sm">Contractual Obligation • Code 96</p>
                     </button>
                     <button onClick={() => fetchClaimData("1000003786")} className="group bg-zinc-900/40 hover:bg-zinc-900/80 p-6 rounded-2xl text-left transition-all border border-white/5 hover:border-white/20 hover:shadow-lg hover:shadow-yellow-900/10 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                           <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]">PARTIAL</span>
                           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                           </div>
                        </div>
                        <p className="font-bold text-xl text-white mb-1 font-mono tracking-tight">#1000003786</p>
                        <p className="text-zinc-500 text-sm">Patient Responsibility • Code 3</p>
                     </button>
                  </div>
                  {error && <div className="mt-10 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 mx-auto w-fit animate-pulse"><AlertCircle className="w-5 h-5"/> {error}</div>}
               </div>
             ) : (
               <div className="max-w-6xl mx-auto pb-20">
                  {/* HERO HEADER */}
                  <div className="glass-panel p-6 md:p-8 rounded-2xl mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6 shadow-2xl relative overflow-hidden">
                     <div className="flex items-end gap-6 min-w-0">
                        <div className="hidden md:flex w-24 h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl shadow-inner border border-white/5 items-center justify-center shrink-0 group hover:shadow-red-500/20 transition-all duration-500">
                           <img src="https://media.epic.com/epicdotcom/site/images/header/site-logo.png" alt="Epic" className="w-12 h-12 object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"/>
                        </div>
                        <div className="min-w-0 flex-1">
                           <div className="flex items-center gap-3 mb-2">
                             <span className={clsx("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border", 
                                 claim.processing_status === 'complete' ? "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]")}>
                                 {claim.processing_status}
                             </span>
                             <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Institutional Claim</span>
                           </div>
                           <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-2 tracking-tight break-all leading-tight">#{claim.claim_id}</h1>
                           <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 font-medium">
                              <span className="flex items-center gap-2 text-white"><User className="w-4 h-4 text-blue-400" /> {claim.patient_name}</span>
                              <span className="hidden sm:inline text-zinc-700">|</span>
                              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> {claim.payment_date}</span>
                           </div>
                        </div>
                     </div>
                     <div className="bg-black/40 p-1 rounded-lg border border-white/5 flex gap-1 backdrop-blur-md shrink-0 self-start xl:self-end overflow-x-auto max-w-full">
                         <button onClick={() => setActiveTab('summary')} className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'summary' ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10" : "text-zinc-500 hover:text-white")}>
                           <Activity className="w-4 h-4" /> Smart View
                         </button>
                         <button onClick={() => setActiveTab('form')} className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'form' ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10" : "text-zinc-500 hover:text-white")}>
                             <FileText className="w-4 h-4"/> Form Record
                         </button>
                         <button onClick={() => setActiveTab('json')} className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap", activeTab === 'json' ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10" : "text-zinc-500 hover:text-white")}>
                             <Code className="w-4 h-4"/> Dev JSON
                         </button>
                     </div>
                  </div>

                  {activeTab === 'summary' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 overflow-hidden shadow-lg">
                           <div className="bg-[#0c0c0e]/80 backdrop-blur-xl rounded-2xl p-8 relative">
                              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                 <div>
                                     <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2"><CheckCircle className="w-3 h-3"/> Analysis Result</p>
                                     <h3 className="text-2xl font-bold text-white tracking-tight">
                                         {claim.claim_status.includes("Denied") ? `Claim Denied: ${claim.adjustments[0]?.description || 'See details'}` : "Claim Processed Successfully"}
                                     </h3>
                                     <p className="text-zinc-400 mt-2">Primary Diagnosis: <span className="text-zinc-200 font-medium">{claim.primary_diagnosis}</span></p>
                                 </div>
                                 <div className="text-left md:text-right">
                                     <p className="text-xs text-zinc-500 uppercase font-bold">Net Payable</p>
                                     <p className="text-4xl font-mono font-bold text-white tracking-tighter">${claim.paid_amount}</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="glass-card p-6 rounded-xl bg-zinc-900/40 border border-white/5">
                              <p className="text-zinc-500 text-xs font-bold uppercase mb-2">Billed Amount</p>
                              <p className="text-2xl font-mono text-white tracking-tight">${claim.billed_amount}</p>
                           </div>
                           <div className="glass-card p-6 rounded-xl bg-zinc-900/40 border border-white/5">
                              <p className="text-zinc-500 text-xs font-bold uppercase mb-2">Patient Responsibility</p>
                              <p className="text-2xl font-mono text-white tracking-tight">${claim.patient_responsibility}</p>
                           </div>
                           <div className="glass-card p-6 rounded-xl border-red-500/20 bg-red-500/5">
                              <p className="text-red-400/70 text-xs font-bold uppercase mb-2">Contractual Write-Off</p>
                              <p className="text-2xl font-mono text-red-400 tracking-tight">${claim.contractual_writeoff}</p>
                           </div>
                        </div>
                        <div className="glass-panel rounded-xl overflow-hidden shadow-lg bg-white/5">
                           <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                              <h3 className="font-bold text-zinc-200 text-sm">Adjudication Logic</h3>
                           </div>
                           <div className="divide-y divide-white/5">
                              {claim.adjustments.map((adj, i) => (
                                 <div key={i} className="p-6 hover:bg-white/5 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                       <div>
                                          <div className="flex items-center gap-2">
                                              <span className="text-white font-bold text-sm">{adj.category_label}</span>
                                              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono border border-white/10">{adj.category_code}</span>
                                          </div>
                                          <p className="text-zinc-500 text-xs uppercase mt-1 tracking-wide">{adj.financial_responsibility || 'Unknown'} Responsibility</p>
                                       </div>
                                       <span className="text-white font-mono font-bold">${adj.amount}</span>
                                    </div>
                                    {adj.reason_code && (
                                       <div className="mt-3 bg-black/40 p-4 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
                                          <div className="flex gap-3 items-start">
                                              <p className="text-sm text-zinc-400 leading-relaxed">
                                                  <span className="text-zinc-500 font-mono font-bold mr-2">Code {adj.reason_code}</span> 
                                                  {adj.description}
                                              </p>
                                          </div>
                                          <div className="mt-3 flex items-start gap-2 text-xs font-medium text-blue-300 bg-blue-500/10 w-full p-2 rounded border border-blue-500/20">
                                              <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                              <span>Action: {adj.action_needed}</span>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  {activeTab === 'form' && (
                     <div className="glass-panel p-8 rounded-xl bg-white/5 min-h-[600px] animate-in fade-in slide-in-from-bottom-2">
                        {rawJson ? <ClaimFormView data={rawJson} /> : <p className="text-zinc-500">Loading...</p>}
                     </div>
                  )}

                  {activeTab === 'json' && (
                     <div className="bg-[#0d0d0d] p-6 rounded-xl border border-white/10 shadow-inner animate-in fade-in slide-in-from-bottom-2">
                        <ReactJson 
                          src={rawJson} 
                          theme="ocean" 
                          collapsed={2} 
                          displayDataTypes={false}
                          style={{ backgroundColor: 'transparent', fontSize: '13px', fontFamily: 'monospace' }}
                        />
                     </div>
                  )}
               </div>
             )}
          </div>
        </div>

        {/* 3. RIGHT PANEL: Chat */}
        {isChatOpen && (
          <div className="w-[400px] bg-black/80 backdrop-blur-xl border-l border-white/10 flex flex-col flex-shrink-0 z-30 shadow-2xl">
             <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2">
                    {/* UPDATED: Dot first, then Title */}
                    <StatusIndicator active={true} />
                    <span className="font-bold text-zinc-200 text-sm tracking-wide">AI Claims Assistant</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X className="w-4 h-4"/></button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-transparent scrollbar-thin">
                {chatHistory.map((msg, i) => {
                   const { thought, answer } = parseReasoning(msg.content);
                   return (
                     <div key={i} className={clsx(
                        "p-4 rounded-2xl text-sm leading-relaxed shadow-sm animation-fade-in",
                        msg.role === 'user' 
                            ? "bg-blue-600 text-white ml-auto max-w-[85%] rounded-br-sm shadow-blue-900/20 shadow-lg" 
                            : "bg-zinc-800/80 border border-white/5 text-zinc-200 mr-auto max-w-[90%] rounded-bl-sm"
                     )}>
                        {/* REASONING ACCORDION (Hidden for User messages) */}
                        {msg.role === 'assistant' && thought && (
                          <ReasoningAccordion thought={thought} />
                        )}
                        
                        <div className="prose prose-sm prose-invert max-w-none break-words">
                          <ReactMarkdown 
                            components={{
                              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                              strong: ({node, ...props}) => <span className="font-bold text-white" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                              li: ({node, ...props}) => <li className="text-zinc-300" {...props} />,
                              a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />
                            }}
                          >
                            {answer || ""}
                          </ReactMarkdown>
                        </div>
                     </div>
                   );
                })}
                {chatLoading && (
                    <div className="flex items-center gap-2 text-zinc-500 text-xs ml-4">
                        <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                )}
             </div>
             
             {/* FOOTER */}
             <div className="bg-black/40 backdrop-blur-md border-t border-white/10">
                <div className="p-4">
                   <div className="relative">
                      <input 
                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-600 shadow-inner"
                        placeholder={claim ? "Ask a question..." : "Select a claim first..."}
                        value={chatInput}
                        disabled={!claim}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <button onClick={sendMessage} disabled={chatLoading || !claim} className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50 disabled:bg-zinc-700 transition-colors shadow-lg shadow-blue-600/20">
                         <Send className="w-4 h-4" />
                      </button>
                   </div>
                </div>
                
                {/* ATTRIBUTION FOOTER */}
                <div className="pb-4 text-center">
                   <div className="flex items-center justify-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Powered by</span>
                      <img src="https://cloud.cerebras.ai/images/logo/cerebras-logo-black.svg" alt="Cerebras" className="h-6 brightness-0 invert" />
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;