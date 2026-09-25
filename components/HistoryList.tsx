import React, { useState } from 'react';
import { SessionRecord, SessionTransaction } from '../types';
import { formatDate, formatCurrency } from '../utils';
import { 
  Calendar, ChevronDown, ChevronUp, Users, Trash2, CheckCircle2
} from 'lucide-react';

interface HistoryListProps {
  history: SessionRecord[];
  onDelete?: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderTagBadges = (t: SessionTransaction) => {
    const tags = t.tags || [];
    return (
      <div className="flex gap-1 flex-wrap mt-1">
        {tags.map((tag, i) => {
          let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
          let label = tag;

          if (tag === 'MOTM') {
            badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
            label = "MOM (-50p)";
          } else if (tag === 'DOTD') {
            badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
            label = "DOD (+50p)";
          } else if (tag.includes('GRN')) {
            badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
            label = "Green (£2)";
          } else if (tag.includes('YLW')) {
            badgeClass = "bg-yellow-50 text-yellow-800 border-yellow-200";
            label = "Yellow (£5)";
          } else if (tag === 'RED') {
            badgeClass = "bg-red-50 text-red-700 border-red-200";
            label = "Red (£20)";
          } else if (tag === 'U18') {
            badgeClass = "bg-amber-100 text-amber-900 border-amber-200 font-bold";
            label = "U18 (½ Price)";
          } else if (tag.includes('FINE')) {
            badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
            label = tag.replace('xFINE', 'x 25p');
          } else if (tag === 'ITEM') {
            badgeClass = "bg-red-50 text-red-700 border-red-200";
            label = "Item Missing (+£1)";
          }

          return (
            <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs border font-mono ${badgeClass}`}>
              {label}
            </span>
          );
        })}

        {t.isPaidOff && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs border bg-emerald-50 text-emerald-700 border-emerald-200 font-mono">
            Paid Off
          </span>
        )}
      </div>
    );
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs font-mono">
        No match records found.
      </div>
    );
  }

  return (
    <div className={onDelete ? "" : "mt-6"}>
      {!onDelete && (
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Match Ledger & Audit
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {history.length} Sessions
          </span>
        </div>
      )}

      <div className="space-y-2">
        {history.map((session) => {
          const isPayment = session.type === 'PAYMENT';
          const totalFines = session.transactions.reduce((acc, t) => acc + (t.isPaidOff ? 0 : t.amount), 0);
          const isExpanded = expandedId === session.id;

          // Payment Settlement Statement Item
          if (isPayment) {
            const payer = session.transactions[0]?.playerName || "Unknown Player";
            return (
              <div 
                key={session.id} 
                className="bg-emerald-50/50 rounded-xs border border-emerald-200 p-3 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-emerald-100 rounded-xs text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-950">
                      <span>{payer}</span> settled outstanding balance
                    </div>
                    <div className="text-[10px] text-emerald-700 font-mono">
                      {formatDate(session.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase font-mono">
                    Settled
                  </span>
                  {onDelete && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(session.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // Match Session Statement Item
          return (
            <div 
              key={session.id} 
              className="bg-white rounded-xs border border-slate-200 overflow-hidden shadow-xs"
            >
              <button 
                onClick={() => toggleExpand(session.id)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    <span className="text-slate-400 font-normal mr-1 font-mono">vs</span>
                    <span>{session.opponent}</span>
                    {session.theme && (
                      <span className="text-[10px] font-mono bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded-xs border border-amber-200 ml-2">
                        Theme: {session.theme}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {formatDate(session.timestamp)}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-slate-900">
                      +{formatCurrency(totalFines)}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Itemized Receipt */}
              {isExpanded && (
                <div className="bg-slate-50/70 px-3.5 py-3 border-t border-slate-100 space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Itemized Player Schedule
                  </div>

                  {session.transactions.length > 0 ? (
                    <ul className="space-y-1.5 divide-y divide-slate-100">
                      {session.transactions.map((t, idx) => (
                        <li key={`${session.id}-${t.playerId}-${idx}`} className="pt-1.5 first:pt-0 flex justify-between items-start text-xs">
                          <div>
                            <span className="font-semibold text-slate-800">{t.playerName}</span>
                            {renderTagBadges(t)}
                          </div>
                          <span className="font-mono font-bold text-red-600">
                            +{formatCurrency(t.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No fines issued in this match.</div>
                  )}

                  {onDelete && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(session.id);
                        }}
                        className="text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 px-2.5 py-1 rounded-xs flex items-center gap-1.5 border border-red-200 hover:border-transparent transition-all font-mono"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Session</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
