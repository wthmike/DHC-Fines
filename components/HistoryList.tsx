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
            badgeClass = "bg-amber-100 text-amber-800 border-amber-200 font-bold";
            label = "U18 (½ Price)";
          } else if (tag.includes('FINE')) {
            badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
            label = tag.replace('xFINE', 'x 25p');
          } else if (tag === 'ITEM') {
            badgeClass = "bg-red-50 text-red-700 border-red-200";
            label = "Item Missing";
          }

          return (
            <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${badgeClass}`}>
              {label}
            </span>
          );
        })}

        {t.isPaidOff && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200 font-mono">
            Paid Off
          </span>
        )}
      </div>
    );
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm italic">
        No match history recorded yet.
      </div>
    );
  }

  return (
    <div className={onDelete ? "" : "mt-8"}>
      {!onDelete && (
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5 font-sans">
          <Calendar className="w-4 h-4 text-slate-400" />
          Match History
        </h3>
      )}

      <div className="space-y-2.5">
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
                className="bg-emerald-50/60 rounded-xl border border-emerald-200/80 p-3.5 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-emerald-950">
                      <span className="font-bold">{payer}</span> paid off their debt.
                    </div>
                    <div className="text-[11px] text-emerald-700 font-mono">
                      {formatDate(session.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider font-mono">
                    Settled
                  </span>
                  {onDelete && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(session.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
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
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <button 
                onClick={() => toggleExpand(session.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    <span className="text-slate-400 font-normal italic pr-1 font-sans">vs</span>
                    <span>{session.opponent}</span>
                    {session.theme && (
                      <span className="text-[10px] font-medium bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 ml-2">
                        Theme: {session.theme}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                    {formatDate(session.timestamp)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-slate-900">
                      +{formatCurrency(totalFines)}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Itemized Receipt */}
              {isExpanded && (
                <div className="bg-slate-50/70 px-4 py-3.5 border-t border-slate-100 space-y-2.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Player Fines Breakdown
                  </div>

                  {session.transactions.length > 0 ? (
                    <ul className="space-y-2 divide-y divide-slate-100">
                      {session.transactions.map((t, idx) => (
                        <li key={`${session.id}-${t.playerId}-${idx}`} className="pt-2 first:pt-0 flex justify-between items-start text-xs">
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
                        className="text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-red-200 hover:border-transparent transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
