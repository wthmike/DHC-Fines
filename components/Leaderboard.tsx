import React, { useState } from 'react';
import { Player, SessionRecord } from '../types';
import { formatCurrency } from '../utils';
import { BANKING_DETAILS } from '../constants';
import { HistoryList } from './HistoryList';
import { Rulebook } from './Rulebook';
import { 
  Wallet, TrendingUp, AlertCircle, CreditCard, 
  ChevronDown, ChevronUp, Copy, Check, BookOpen, X
} from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
  history: SessionRecord[];
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="p-1 hover:bg-white/20 rounded-md transition-colors text-orange-100 hover:text-white"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ players, history }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Filter out players hidden by the admin
  const visiblePlayers = players.filter(p => !p.isHidden);
  const sortedPlayers = [...visiblePlayers].sort((a, b) => b.totalOwed - a.totalOwed);
  const totalDebt = sortedPlayers.reduce((sum, p) => sum + p.totalOwed, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ------------------------------------------------ */}
      {/* TOTAL POT / DUCHY BANK CARD                      */}
      {/* ------------------------------------------------ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 rounded-3xl shadow-xl shadow-orange-500/15 text-white border border-white/20">
        
        {/* Soft background lighting */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-36 h-36 bg-black/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10 p-6 sm:p-7">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2 text-orange-100 text-xs font-bold uppercase tracking-widest font-sans">
              <Wallet className="w-4 h-4" />
              <span>Team Pot</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRulesModal(true)}
                className="bg-black/15 hover:bg-black/25 backdrop-blur-md rounded-full px-2.5 py-1 text-xs font-semibold text-white/90 border border-white/20 flex items-center gap-1 transition-colors"
                title="View Rules"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Rules</span>
              </button>
              <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold text-white tracking-wide border border-white/20">
                DUCHY M1
              </div>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="text-5xl sm:text-6xl font-sans font-extrabold tracking-tight text-white tabular-nums">
              {formatCurrency(totalDebt)}
            </div>
            <div className="text-orange-100 text-sm flex items-center gap-1.5 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Outstanding balance</span>
            </div>
          </div>
        </div>

        {/* Payment Details Collapsible Drawer */}
        <div className={`bg-black/15 backdrop-blur-sm border-t border-white/15 transition-all duration-200 ${showPayment ? 'bg-black/25' : 'hover:bg-black/20'}`}>
          <button 
            onClick={() => setShowPayment(!showPayment)}
            className="w-full px-6 py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-orange-100 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Make a Payment (Bank Transfer)
            </span>
            {showPayment ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPayment && (
            <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="grid grid-cols-2 gap-3 text-sm font-mono text-white">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] text-orange-100/70 uppercase">Account Name</div>
                  <div className="font-bold text-white mt-0.5 truncate">{BANKING_DETAILS.accountName}</div>
                </div>

                <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-orange-100/70 uppercase">Sort Code</div>
                    <div className="font-bold text-white mt-0.5 tracking-wider">{BANKING_DETAILS.sortCode}</div>
                  </div>
                  <CopyButton text={BANKING_DETAILS.sortCode} />
                </div>

                <div className="col-span-2 bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-orange-100/70 uppercase">Account Number</div>
                    <div className="font-bold text-white text-base tracking-wider mt-0.5">{BANKING_DETAILS.accountNumber}</div>
                  </div>
                  <CopyButton text={BANKING_DETAILS.accountNumber} />
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-3 text-xs leading-relaxed text-orange-50 border border-white/10 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-orange-200 mt-0.5" />
                <span>
                  Please use <strong className="text-white font-mono bg-white/20 px-1 py-0.5 rounded">DHC</strong> in the payment reference and message Mick once paid.
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ------------------------------------------------ */}
      {/* ACTIVE DEBTS LIST                                */}
      {/* ------------------------------------------------ */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-slate-500 text-xs font-bold uppercase tracking-wider font-sans">
            Active Debts
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {sortedPlayers.length} Players
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <span className={`
                  w-8 h-8 flex items-center justify-center rounded-xl font-bold text-xs font-mono
                  ${index === 0 && player.totalOwed > 0 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : index === 1 && player.totalOwed > 0 
                      ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                      : index === 2 && player.totalOwed > 0 
                        ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                        : 'text-slate-400 bg-slate-50 border border-slate-100'}
                `}>
                  {index + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 block text-base group-hover:text-amber-700 transition-colors">
                      {player.name}
                    </span>
                    {player.isU18 && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200 font-mono">
                        U18 (½ Price)
                      </span>
                    )}
                    {player.totalOwed >= 10 && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.2 rounded-full border border-red-200 font-mono">
                        <AlertCircle className="w-3 h-3" /> HIGH
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <span className={`font-mono font-bold text-lg tracking-tight tabular-nums ${
                player.totalOwed > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {formatCurrency(player.totalOwed)}
              </span>
            </div>
          ))}

          {sortedPlayers.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              No players found. Add players in Settings.
            </div>
          )}
        </div>
      </div>

      {/* Match History */}
      <HistoryList history={history} />

      {/* ------------------------------------------------ */}
      {/* RULES MODAL                                      */}
      {/* ------------------------------------------------ */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-50 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-4 sm:p-6 relative no-scrollbar">
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full border border-slate-200 shadow-sm transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
            <Rulebook />
          </div>
        </div>
      )}

    </div>
  );
};
