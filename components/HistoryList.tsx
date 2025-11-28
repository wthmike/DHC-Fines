import React, { useState } from 'react';
import { SessionRecord } from '../types';
import { formatDate, formatCurrency } from '../utils';
import { Calendar, ChevronDown, ChevronUp, Users, Trash2 } from 'lucide-react';

interface HistoryListProps {
  history: SessionRecord[];
  onDelete?: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderTags = (tags: string[]) => {
      if (!tags || tags.length === 0) return null;
      return (
          <div className="flex gap-1 flex-wrap mt-1">
              {tags.map((tag, i) => {
                  let badgeClass = "bg-slate-800 text-slate-400 border-slate-700";
                  let text = tag;
                  
                  if (tag === 'MOTM') { badgeClass = "bg-blue-500/10 text-blue-400 border-blue-500/20"; text = "MoM"; }
                  if (tag === 'DOTD') { badgeClass = "bg-pink-500/10 text-pink-400 border-pink-500/20"; text = "DoD"; }
                  if (tag === 'GRN') { badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"; text = "Grn"; }
                  if (tag === 'YLW') { badgeClass = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"; text = "Ylw"; }
                  if (tag === 'RED') { badgeClass = "bg-red-500/10 text-red-400 border-red-500/20"; text = "Red"; }
                  if (tag === 'ITEM') { badgeClass = "bg-red-500/10 text-red-400 border-red-500/20"; text = "Item Missing"; }

                  return (
                      <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeClass}`}>
                          {text}
                      </span>
                  );
              })}
          </div>
      );
  };

  if (history.length === 0) {
      return (
          <div className="text-center py-8 text-slate-500 text-sm italic">
              No match history available.
          </div>
      );
  }

  return (
    <div className={onDelete ? "" : "mt-8"}>
        {!onDelete && (
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-2 font-serif">
                <Calendar className="w-4 h-4" />
                Match History
            </h3>
        )}
        <div className="space-y-3">
        {history.map((session) => {
            const totalFines = session.transactions.reduce((acc, t) => acc + t.amount, 0);
            const isExpanded = expandedId === session.id;

            return (
                <div key={session.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
                    <button 
                        onClick={() => toggleExpand(session.id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors"
                    >
                        <div className="text-left">
                            <div className="font-bold text-slate-200 text-sm font-serif">
                                <span className="text-slate-500 font-normal font-sans italic pr-1">vs</span>{session.opponent}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 font-sans">
                                {formatDate(session.timestamp)}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="font-bold text-blue-400 text-sm font-mono">{formatCurrency(totalFines)}</div>
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                    </button>

                    {isExpanded && (
                        <div className="bg-slate-950/50 px-4 py-3 border-t border-slate-800">
                             <div className="text-[10px] font-bold text-slate-600 uppercase mb-2 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Player Fines
                             </div>
                             {session.transactions.length > 0 ? (
                                <ul className="space-y-3">
                                    {session.transactions.map((t, idx) => (
                                        <li key={`${session.id}-${t.playerId}-${idx}`} className="flex justify-between items-start text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-slate-300 font-medium text-xs">{t.playerName}</span>
                                                {renderTags(t.tags)}
                                            </div>
                                            <span className="font-mono text-xs font-medium text-red-400">+{formatCurrency(t.amount)}</span>
                                        </li>
                                    ))}
                                </ul>
                             ) : (
                                <div className="text-xs text-slate-600 italic">No fines issued.</div>
                             )}

                             {onDelete && (
                                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(session.id);
                                        }}
                                        className="text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg flex items-center gap-2 border border-red-500/20 transition-all"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete Session Record
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