import React, { useState } from 'react';
import { Player, SessionRecord } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Search, User, X, Calendar, CheckCircle2 } from 'lucide-react';

interface PlayerFineSearchProps {
  players: Player[];
  history: SessionRecord[];
}

export const PlayerFineSearch: React.FC<PlayerFineSearchProps> = ({ players, history }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Visible players for search
  const visiblePlayers = players.filter(p => !p.isHidden);

  // Filtered list based on search term
  const matchingPlayers = visiblePlayers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  // Gather all match transactions for the selected player
  const playerGames = history.filter(session => {
    return session.transactions?.some(t => t.playerId === selectedPlayerId);
  }).map(session => {
    const transaction = session.transactions.find(t => t.playerId === selectedPlayerId);
    return {
      sessionId: session.id,
      timestamp: session.timestamp,
      opponent: session.opponent,
      type: session.type,
      theme: session.theme,
      transaction: transaction!
    };
  });

  return (
    <div className="border border-slate-200 bg-white rounded-xs overflow-hidden shadow-xs">
      
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
              Personal Statement Search
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select or type your name to see your itemized fines for each game
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-xs border border-slate-200">
            Statement
          </span>
        </div>
      </div>

      <div className="p-3.5 space-y-3.5">
        
        {/* Search Input / Quick Selector */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Search or select your name..."
              className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xs text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 outline-none transition-all font-medium"
            />
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPlayerId('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto no-scrollbar pt-0.5">
            {matchingPlayers.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPlayerId(p.id);
                  setSearchTerm(p.name);
                }}
                className={`px-2 py-1 text-xs rounded-xs border font-mono transition-colors ${
                  selectedPlayerId === p.id 
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Player Statement */}
        {selectedPlayer ? (
          <div className="space-y-3 animate-in fade-in duration-150 pt-2 border-t border-slate-100">
            
            {/* Player Statement Summary Box */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-slate-900 text-sm">{selectedPlayer.name}</span>
                  {selectedPlayer.isU18 && (
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-xs font-semibold">
                      U18 Concession
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {playerGames.length} {playerGames.length === 1 ? 'fixture logged' : 'fixtures logged'}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Balance</span>
                <span className={`text-xl font-mono font-bold tabular-nums ${selectedPlayer.totalOwed > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                  {formatCurrency(selectedPlayer.totalOwed)}
                </span>
              </div>
            </div>

            {/* Games Breakdown */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Match by Match Fines Breakdown
              </div>

              {playerGames.length > 0 ? (
                <div className="border border-slate-200 rounded-xs overflow-hidden divide-y divide-slate-100">
                  {playerGames.map(({ sessionId, timestamp, opponent, type, theme, transaction }) => {
                    const isPayment = type === 'PAYMENT';

                    if (isPayment) {
                      return (
                        <div key={sessionId} className="p-3 bg-emerald-50/50 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-emerald-950">Payment Settled</span>
                              <span className="text-[10px] font-mono text-emerald-700 block">{formatDate(timestamp)}</span>
                            </div>
                          </div>
                          <span className="font-mono text-emerald-700 font-bold">Settled £0.00</span>
                        </div>
                      );
                    }

                    const tags = transaction.tags || [];

                    return (
                      <div key={sessionId} className="p-3 bg-white space-y-1.5 text-xs">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-bold text-slate-900">{formatDate(timestamp)}</span>
                              <span className="text-slate-400 font-mono text-[11px]">vs</span>
                              <span className="font-semibold text-slate-800">{opponent}</span>
                            </div>
                            {theme && (
                              <span className="text-[10px] text-amber-800 font-mono block mt-0.5">
                                Theme: {theme}
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              +{formatCurrency(transaction.amount)}
                            </span>
                            {transaction.isPaidOff && (
                              <span className="text-[10px] text-emerald-700 font-mono block font-semibold">
                                Settled at pub
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Itemized badges for this match */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {transaction.generalFines !== undefined && transaction.generalFines > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-700 border border-slate-200">
                              {transaction.generalFines}x 25p general fine
                            </span>
                          )}
                          {transaction.greenCards !== undefined && transaction.greenCards > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                              {transaction.greenCards}x Green (£2)
                            </span>
                          )}
                          {transaction.yellowCards !== undefined && transaction.yellowCards > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-yellow-50 text-yellow-800 border border-yellow-200 font-semibold">
                              {transaction.yellowCards}x Yellow (£5)
                            </span>
                          )}
                          {transaction.redCards !== undefined && transaction.redCards > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-red-50 text-red-700 border border-red-200 font-semibold">
                              Red Card (£20)
                            </span>
                          )}
                          {transaction.isDotd && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                              DOD (+50p)
                            </span>
                          )}
                          {transaction.isMotm && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                              MOM (-50p)
                            </span>
                          )}
                          {transaction.isU18 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                              U18 ½ price applied
                            </span>
                          )}
                          {tags.includes('ITEM') && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-red-50 text-red-700 border border-red-200">
                              Item missing (+£1)
                            </span>
                          )}
                          {transaction.amount === 0 && !transaction.isPaidOff && (
                            <span className="text-[10px] text-slate-400 italic">No fines this game</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xs font-mono">
                  No match sessions logged for {selectedPlayer.name} yet.
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="p-4 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xs bg-slate-50/50 font-mono">
            Type or click your name above to see your exact fines per match.
          </div>
        )}

      </div>
    </div>
  );
};
