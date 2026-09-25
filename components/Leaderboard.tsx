import React, { useState } from 'react';
import { Player, SessionRecord } from '../types';
import { formatCurrency } from '../utils';
import { BANKING_DETAILS } from '../constants';
import { HistoryList } from './HistoryList';
import { Rulebook } from './Rulebook';
import { PlayerFineSearch } from './PlayerFineSearch';
import { 
  CreditCard, ChevronDown, ChevronUp, Copy, Check, 
  BookOpen, X, AlertCircle, MessageCircle, ArrowUpRight
} from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
  history: SessionRecord[];
}

const CopyButton = ({ text, light = false }: { text: string; light?: boolean }) => {
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
      className={`p-1 rounded-xs transition-colors ${
        light 
          ? 'hover:bg-white/20 text-white/80 hover:text-white' 
          : 'hover:bg-slate-100 text-slate-400 hover:text-slate-800'
      }`}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className={`w-3.5 h-3.5 ${light ? 'text-amber-200' : 'text-emerald-600'}`} />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
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
  const activeDebtorsCount = sortedPlayers.filter(p => p.totalOwed > 0).length;

  const whatsAppPaymentLink = (() => {
    const message = encodeURIComponent(
      `Hi Mick, just transferred my Duchy HC fines to the account (ref: DHC). Cheers!`
    );
    return `https://wa.me/?text=${message}`;
  })();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ------------------------------------------------ */}
      {/* CLEAN ORANGE BANKING APP HERO CARD               */}
      {/* ------------------------------------------------ */}
      <div className="rounded-xs bg-[#ff5500] text-white shadow-md p-5 sm:p-6 space-y-4">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-100">
            Duchy HC Treasury
          </span>

          <button
            onClick={() => setShowRulesModal(true)}
            className="px-2.5 py-1 text-xs font-mono font-medium text-white hover:bg-black/20 bg-black/10 rounded-xs border border-white/20 flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rules</span>
          </button>
        </div>

        {/* Money Display */}
        <div>
          <div className="text-xs font-medium text-orange-100 uppercase tracking-wider">
            Total Outstanding Fines
          </div>
          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white mt-1 tabular-nums">
            {formatCurrency(totalDebt)}
          </div>
          <div className="text-xs text-orange-100/90 mt-1 font-mono">
            {activeDebtorsCount} {activeDebtorsCount === 1 ? 'player has' : 'players have'} outstanding fines
          </div>
        </div>

        {/* Pay Fines Button */}
        <div>
          <button
            onClick={() => setShowPayment(!showPayment)}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xs flex items-center justify-between transition-colors shadow-sm"
          >
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-400" />
              <span>Pay Fines</span>
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-300">
              <span>{showPayment ? 'Hide Bank Details' : 'View Bank Details'}</span>
              {showPayment ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>
        </div>

        {/* Bank details completely hidden behind Pay */}
        {showPayment && (
          <div className="pt-3 border-t border-orange-400/30 space-y-2.5 font-mono text-xs">
            <div className="bg-black/20 p-2.5 rounded-xs border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-orange-200/80 text-[10px] block uppercase">Payee Name</span>
                <span className="font-bold text-white text-sm">{BANKING_DETAILS.accountName}</span>
              </div>
              <CopyButton text={BANKING_DETAILS.accountName} light />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 p-2.5 rounded-xs border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-orange-200/80 text-[10px] block uppercase">Sort Code</span>
                  <span className="font-bold text-white tracking-wider">{BANKING_DETAILS.sortCode}</span>
                </div>
                <CopyButton text={BANKING_DETAILS.sortCode} light />
              </div>

              <div className="bg-black/20 p-2.5 rounded-xs border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-orange-200/80 text-[10px] block uppercase">Account No.</span>
                  <span className="font-bold text-white tracking-wider">{BANKING_DETAILS.accountNumber}</span>
                </div>
                <CopyButton text={BANKING_DETAILS.accountNumber} light />
              </div>
            </div>

            <div className="bg-black/20 p-2.5 rounded-xs border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-orange-200/80 text-[10px] block uppercase">Reference</span>
                <span className="font-bold text-white tracking-wider">{BANKING_DETAILS.reference}</span>
              </div>
              <CopyButton text={BANKING_DETAILS.reference} light />
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <div className="text-[11px] text-orange-100 flex items-center gap-1.5 font-sans">
                <AlertCircle className="w-3.5 h-3.5 text-orange-200 flex-shrink-0" />
                <span>Reference <strong className="text-white font-mono">DHC</strong> and message Mick when sent.</span>
              </div>

              <a
                href={whatsAppPaymentLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-mono font-bold rounded-xs text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Message Mick on WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

      </div>

      {/* ------------------------------------------------ */}
      {/* SQUAD LEDGER TABLE (SHARP EDGES, NO PAY BUTTONS) */}
      {/* ------------------------------------------------ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-slate-500 text-xs font-mono font-bold uppercase tracking-wider">
            Active Accounts
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {sortedPlayers.length} Members
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xs overflow-hidden shadow-xs divide-y divide-slate-100">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className="p-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 text-center font-mono text-xs font-semibold text-slate-400">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {player.name}
                    </span>
                    {player.isU18 && (
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded-xs border border-amber-200 font-medium">
                        U18
                      </span>
                    )}
                    {player.totalOwed >= 10 && (
                      <span className="text-[10px] font-mono text-red-700 bg-red-50 px-1.5 py-0.2 rounded-xs border border-red-200 font-medium">
                        Arrears
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Just the outstanding balance - NO pay button next to each person */}
              <div className="flex items-center">
                <span className={`font-mono font-bold text-base tabular-nums ${
                  player.totalOwed > 0 ? 'text-red-600' : 'text-emerald-700'
                }`}>
                  {formatCurrency(player.totalOwed)}
                </span>
              </div>
            </div>
          ))}

          {sortedPlayers.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm font-mono">
              No registered players found.
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* PLAYER STATEMENT SEARCH (SEARCH NAME & SEE FINES) */}
      {/* ------------------------------------------------ */}
      <PlayerFineSearch players={players} history={history} />

      {/* Match History Ledger */}
      <HistoryList history={history} />

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-50 rounded-xs max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl p-4 sm:p-6 relative no-scrollbar border border-slate-300">
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-900 bg-white rounded-xs border border-slate-200 transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>
            <Rulebook />
          </div>
        </div>
      )}

    </div>
  );
};
