import React, { useState, useEffect } from 'react';
import { Player, SessionData, PlayerSessionState } from '../types';
import { formatCurrency, calculatePlayerFines } from '../utils';
import { DuchyCrest } from './DuchyCrest';
import { 
  Check, ArrowLeft, Gavel, CreditCard, RotateCcw, 
  Triangle, Square, Circle, PackageCheck, PackageX,
  Trophy, ThumbsDown, Plus, Minus, ArrowRight, ShieldAlert,
  Sparkles, CheckCircle2, Percent
} from 'lucide-react';

interface SessionWizardProps {
  allPlayers: Player[];
  onFinishSession: (sessionData: SessionData, opponentName: string, theme?: string) => void;
  onCancel: () => void;
}

export const SessionWizard: React.FC<SessionWizardProps> = ({ allPlayers, onFinishSession, onCancel }) => {
  const [step, setStep] = useState<'SELECT' | 'VOTING' | 'ACTIVE' | 'FINISHING'>('SELECT');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [sessionData, setSessionData] = useState<SessionData>({});
  const [opponentName, setOpponentName] = useState('');
  const [weekTheme, setWeekTheme] = useState('');

  // Voting State
  const [motmVotes, setMotmVotes] = useState<Record<string, number>>({});
  const [dotdVotes, setDotdVotes] = useState<Record<string, number>>({});

  // Initialize session data when squad changes
  useEffect(() => {
    const initialData: SessionData = {};
    selectedPlayerIds.forEach(id => {
      const player = allPlayers.find(p => p.id === id);
      const isDefaultU18 = player?.isU18 ?? false;

      initialData[id] = sessionData[id] || { 
        generalFines: 0,
        greenCards: 0,
        yellowCards: 0,
        redCards: 0,
        isDotd: false,
        isMotm: false,
        itemBrought: true,
        isU18: isDefaultU18,
        isPaidOff: false,
        addedAmount: 0,
        tags: []
      };
    });
    setSessionData(prev => ({ ...prev, ...initialData }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayerIds]);

  const updatePlayerSessionState = (id: string, updates: Partial<PlayerSessionState>) => {
    setSessionData(prev => {
      const current = prev[id] || {
        generalFines: 0,
        greenCards: 0,
        yellowCards: 0,
        redCards: 0,
        isDotd: false,
        isMotm: false,
        itemBrought: true,
        isU18: allPlayers.find(p => p.id === id)?.isU18 ?? false,
        isPaidOff: false,
        addedAmount: 0,
        tags: []
      };

      const merged: PlayerSessionState = {
        ...current,
        ...updates
      };

      const breakdown = calculatePlayerFines(merged);
      merged.addedAmount = breakdown.finalTotal;

      const tags: string[] = [];
      if (merged.isMotm) tags.push('MOTM');
      if (merged.isDotd) tags.push('DOTD');
      if (merged.greenCards > 0) tags.push(merged.greenCards > 1 ? `${merged.greenCards}xGRN` : 'GRN');
      if (merged.yellowCards > 0) tags.push(merged.yellowCards > 1 ? `${merged.yellowCards}xYLW` : 'YLW');
      if (merged.redCards > 0) tags.push('RED');
      if (!merged.itemBrought) tags.push('ITEM');
      if (merged.isU18) tags.push('U18');
      if (merged.generalFines > 0) tags.push(`${merged.generalFines}xFINE`);

      merged.tags = tags;

      return {
        ...prev,
        [id]: merged
      };
    });
  };

  const togglePlayerSelection = (id: string) => {
    const newSet = new Set(selectedPlayerIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPlayerIds(newSet);
  };

  const selectAllVisible = () => {
    setSelectedPlayerIds(new Set(allPlayers.filter(p => !p.isHidden).map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedPlayerIds(new Set());
  };

  const adjustGeneralFines = (id: string, delta: number) => {
    const current = sessionData[id]?.generalFines || 0;
    const nextCount = Math.max(0, current + delta);
    updatePlayerSessionState(id, { generalFines: nextCount });
  };

  const adjustCard = (id: string, card: 'green' | 'yellow' | 'red', delta: number) => {
    const current = sessionData[id];
    if (!current) return;
    if (card === 'green') {
      updatePlayerSessionState(id, { greenCards: Math.max(0, (current.greenCards || 0) + delta) });
    } else if (card === 'yellow') {
      updatePlayerSessionState(id, { yellowCards: Math.max(0, (current.yellowCards || 0) + delta) });
    } else if (card === 'red') {
      updatePlayerSessionState(id, { redCards: Math.max(0, (current.redCards || 0) + delta) });
    }
  };

  // The U18 toggle requested by user for the finishing screen
  const toggleU18 = (id: string) => {
    const current = sessionData[id];
    if (!current) return;
    updatePlayerSessionState(id, { isU18: !current.isU18 });
  };

  const toggleItemBrought = (id: string) => {
    const current = sessionData[id];
    if (!current) return;
    updatePlayerSessionState(id, { itemBrought: !current.itemBrought });
  };

  const togglePaidOff = (id: string) => {
    const current = sessionData[id];
    if (!current) return;
    updatePlayerSessionState(id, { isPaidOff: !current.isPaidOff });
  };

  // Voting logic
  const handleVoteChange = (type: 'MOTM' | 'DOTD', playerId: string, delta: number) => {
    const setVotes = type === 'MOTM' ? setMotmVotes : setDotdVotes;
    setVotes(prev => {
      const current = prev[playerId] || 0;
      const newVal = Math.max(0, current + delta);
      if (newVal === 0) {
        const { [playerId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [playerId]: newVal };
    });
  };

  const addNominee = (type: 'MOTM' | 'DOTD', playerId: string) => {
    if (!playerId) return;
    handleVoteChange(type, playerId, 1);
  };

  const finalizeVoting = () => {
    const getWinners = (votes: Record<string, number>) => {
      let max = 0;
      let winners: string[] = [];
      Object.entries(votes).forEach(([id, count]) => {
        if (!selectedPlayerIds.has(id)) return;
        if (count > max) {
          max = count;
          winners = [id];
        } else if (count === max && max > 0) {
          winners.push(id);
        }
      });
      return winners;
    };

    const motmWinners = getWinners(motmVotes);
    const dotdWinners = getWinners(dotdVotes);

    selectedPlayerIds.forEach(id => {
      const isMotmWinner = motmWinners.includes(id);
      const isDotdWinner = dotdWinners.includes(id);
      updatePlayerSessionState(id, {
        isMotm: isMotmWinner,
        isDotd: isDotdWinner
      });
    });

    setStep('ACTIVE');
  };

  const motmWinnerIds = Object.entries(sessionData)
    .filter(([_, d]) => d?.isMotm)
    .map(([id]) => id);
  const motmWinnerNames = motmWinnerIds
    .map(id => allPlayers.find(p => p.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  // Totals for finishing screen
  const totalSessionGross = Array.from(selectedPlayerIds).reduce((acc, id) => {
    const data = sessionData[id];
    if (!data) return acc;
    const b = calculatePlayerFines(data);
    return acc + b.grossTotal;
  }, 0);

  const totalU18Discounts = Array.from(selectedPlayerIds).reduce((acc, id) => {
    const data = sessionData[id];
    if (!data) return acc;
    const b = calculatePlayerFines(data);
    return acc + b.u18Discount;
  }, 0);

  const totalSessionNet = Array.from(selectedPlayerIds).reduce((acc, id) => {
    const data = sessionData[id];
    if (!data) return acc;
    if (data.isPaidOff) return acc;
    const b = calculatePlayerFines(data);
    return acc + b.finalTotal;
  }, 0);

  // ----------------------------------------------------
  // STEP 1: SQUAD SELECTION
  // ----------------------------------------------------
  if (step === 'SELECT') {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-300 max-w-xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={onCancel} 
            className="text-slate-500 flex items-center gap-1.5 hover:text-slate-900 transition-colors text-sm font-semibold py-1 px-2.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-bold">
            Step 1 of 4
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Post-Match Fines
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Select today's squad and enter the opponent name.
          </p>
        </div>

        {/* Match Fixture Input */}
        <div className="mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider font-mono">
            Match Fixture
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 whitespace-nowrap">
              <DuchyCrest className="w-5 h-5 flex-shrink-0" />
              <span>Duchy M1s</span>
              <span className="text-amber-600 font-serif italic font-normal">vs</span>
            </div>
            <input 
              type="text" 
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              placeholder="Opponent name (e.g. Truro, Penzance)..."
              className="flex-1 bg-white border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-slate-400 text-sm font-medium shadow-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Squad Selection Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">
            Matchday Squad ({selectedPlayerIds.size} of {allPlayers.length} selected)
          </div>
          <div className="flex gap-2 text-xs">
            <button
              onClick={selectAllVisible}
              className="text-amber-800 hover:text-amber-900 font-semibold px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200/60"
            >
              Select Active
            </button>
            <button
              onClick={clearSelection}
              className="text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 mb-24 no-scrollbar divide-y divide-slate-100 shadow-sm">
          {allPlayers.map(player => {
            const isSelected = selectedPlayerIds.has(player.id);
            return (
              <div 
                key={player.id}
                onClick={() => togglePlayerSelection(player.id)}
                className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                  isSelected ? 'bg-amber-50/70 hover:bg-amber-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-amber-500 text-white shadow-sm' : 'bg-white border border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                        {player.name}
                      </span>
                      {player.isU18 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-mono">
                          U18
                        </span>
                      )}
                      {player.isHidden && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                          (Hidden)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-sm">
                  <span className={player.totalOwed > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}>
                    {formatCurrency(player.totalOwed)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-slate-50/0 z-20">
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => setStep('VOTING')}
              disabled={selectedPlayerIds.size === 0 || !opponentName.trim()}
              className="w-full bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Next: Post-Match Voting</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STEP 2: VOTING (MOM & DOD)
  // ----------------------------------------------------
  if (step === 'VOTING') {
    const selectedPlayersList = allPlayers.filter(p => selectedPlayerIds.has(p.id));

    const renderVotingSection = (
      title: string, 
      type: 'MOTM' | 'DOTD', 
      votes: Record<string, number>, 
      perkText: string,
      color: 'emerald' | 'amber'
    ) => {
      const candidates = Object.entries(votes)
        .filter(([id]) => selectedPlayerIds.has(id))
        .sort((a,b) => b[1] - a[1]);
      const maxVotes = Math.max(...candidates.map(([, c]) => c), 0);

      return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6 shadow-sm">
          <div className={`p-4 border-b border-slate-100 flex items-center justify-between ${
            color === 'emerald' ? 'bg-emerald-50/60' : 'bg-amber-50/60'
          }`}>
            <div className="flex items-center gap-2.5">
              {type === 'MOTM' ? (
                <Trophy className="w-5 h-5 text-emerald-600" />
              ) : (
                <ThumbsDown className="w-5 h-5 text-amber-600" />
              )}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-sm">
                  {title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {type === 'MOTM' ? "Played above & beyond usual level" : "Did something daft"}
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${
              color === 'emerald' 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              {perkText}
            </span>
          </div>

          <div className="p-4 space-y-4">
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3.5 rounded-xl appearance-none focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                onChange={(e) => {
                  addNominee(type, e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>+ Nominate player...</option>
                {selectedPlayersList
                  .filter(p => !votes[p.id])
                  .sort((a,b) => a.name.localeCompare(b.name))
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Plus className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              {candidates.map(([id, count]) => {
                const player = allPlayers.find(p => p.id === id);
                const isLeader = count === maxVotes && count > 0;
                return (
                  <div 
                    key={id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isLeader 
                        ? (color === 'emerald' ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300')
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">{player?.name}</span>
                      {isLeader && (
                        <span className="text-[10px] font-bold bg-white text-slate-800 px-2 py-0.5 rounded-full border border-slate-200 uppercase font-mono shadow-sm">
                          Leader ({count})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleVoteChange(type, id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-base text-slate-900">{count}</span>
                      <button 
                        onClick={() => handleVoteChange(type, id, 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-white font-bold transition-colors shadow-sm ${
                          color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {candidates.length === 0 && (
                <div className="text-center py-4 text-slate-400 text-xs italic">
                  No nominations added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col h-full animate-in fade-in duration-300 max-w-xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => setStep('SELECT')} 
            className="text-slate-500 flex items-center gap-1.5 hover:text-slate-900 transition-colors text-sm font-semibold py-1 px-2.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Squad
          </button>
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-bold">
            Step 2 of 4
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Post-Match Honors
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Determine Man of the Match (-50p discount) and Dick of the Day (+50p fine).
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
          {renderVotingSection('Man of the Match', 'MOTM', motmVotes, '-50p MOM off fines', 'emerald')}
          {renderVotingSection('Dick of the Day', 'DOTD', dotdVotes, '50p fine, no appeal', 'amber')}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-slate-50/0 z-20">
          <div className="max-w-xl mx-auto space-y-2">
            <button
              onClick={finalizeVoting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Gavel className="w-4 h-4" />
              <span>Proceed to Fine Logging</span>
            </button>
            <button
              onClick={() => {
                setMotmVotes({});
                setDotdVotes({});
                setStep('ACTIVE');
              }}
              className="w-full text-slate-500 hover:text-slate-800 text-xs font-semibold py-1.5 transition-colors"
            >
              Skip voting and log fines directly
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STEP 3: ACTIVE FINE LOGGING
  // ----------------------------------------------------
  if (step === 'ACTIVE') {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-300 max-w-xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setStep('VOTING')} 
              className="text-slate-500 flex items-center gap-1.5 hover:text-slate-900 transition-colors text-sm font-semibold py-1 px-2.5 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Voting
            </button>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-bold">
              Step 3 of 4
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] text-amber-700 uppercase font-bold tracking-wider font-mono">
                Post-Match Teas
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Duchy M1s <span className="text-amber-600 font-serif italic text-base">vs</span> {opponentName}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Teas
            </span>
          </div>
        </div>

        {/* Players Cards */}
        <div className="space-y-4 pb-36">
          {(Array.from(selectedPlayerIds) as string[]).map(id => {
            const player = allPlayers.find(p => p.id === id);
            if (!player) return null;

            const state = sessionData[id] || {
              generalFines: 0,
              greenCards: 0,
              yellowCards: 0,
              redCards: 0,
              isDotd: false,
              isMotm: false,
              itemBrought: true,
              isU18: player.isU18 ?? false,
              isPaidOff: false,
              addedAmount: 0,
              tags: []
            };

            const breakdown = calculatePlayerFines(state);

            return (
              <div 
                key={id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 bg-slate-50/70 flex justify-between items-center border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{player.name}</span>
                      {state.isU18 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-mono">
                          U18 (½ Price)
                        </span>
                      )}
                      {state.isMotm && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> MOM (-50p)
                        </span>
                      )}
                      {state.isDotd && (
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3" /> DOD (+50p)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-mono">
                      Prior Debt: {formatCurrency(player.totalOwed)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                      Session Fine
                    </div>
                    <div className="text-xl font-bold font-mono text-amber-700">
                      {formatCurrency(breakdown.finalTotal)}
                    </div>
                  </div>
                </div>

                {/* 1. General Fines Section (25p each, capped at £2.50) */}
                <div className="p-4 border-b border-slate-100 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                        General Fines (25p each)
                      </span>
                      {breakdown.isGeneralCapped && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 font-mono">
                          <ShieldAlert className="w-3 h-3" /> Capped at £2.50
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-slate-500">
                      {state.generalFines} fines ({formatCurrency(breakdown.generalFinesCapped)})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustGeneralFines(id, -1)}
                      disabled={state.generalFines <= 0}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-xl font-bold text-sm transition-colors border border-slate-200 flex items-center justify-center gap-1"
                    >
                      <Minus className="w-3.5 h-3.5" /> -25p
                    </button>
                    <div className="w-16 text-center font-mono font-bold text-lg text-slate-900">
                      {state.generalFines}
                    </div>
                    <button
                      onClick={() => adjustGeneralFines(id, 1)}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-1 active:scale-[0.99]"
                    >
                      <Plus className="w-3.5 h-3.5" /> +25p Fine
                    </button>
                  </div>
                </div>

                {/* 2. Official Cards Grid: Green £2, Yellow £5, Red £20 */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/40">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 font-mono">
                    Official Cards (Extra to cap)
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Green Card £2 */}
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between shadow-xs">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono">
                          Green (£2)
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-700">
                          {state.greenCards}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 w-full">
                        <button
                          onClick={() => adjustCard(id, 'green', -1)}
                          disabled={state.greenCards <= 0}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustCard(id, 'green', 1)}
                          className="flex-1 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200 rounded-lg flex items-center justify-center transition-colors font-bold text-xs"
                        >
                          <Triangle className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>

                    {/* Yellow Card £5 */}
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between shadow-xs">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider font-mono">
                          Yellow (£5)
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-700">
                          {state.yellowCards}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 w-full">
                        <button
                          onClick={() => adjustCard(id, 'yellow', -1)}
                          disabled={state.yellowCards <= 0}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustCard(id, 'yellow', 1)}
                          className="flex-1 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 rounded-lg flex items-center justify-center transition-colors font-bold text-xs"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>

                    {/* Red Card £20 */}
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between shadow-xs">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider font-mono">
                          Red (£20)
                        </span>
                        <span className="font-mono text-xs font-bold text-red-700">
                          {state.redCards}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 w-full">
                        <button
                          onClick={() => adjustCard(id, 'red', -1)}
                          disabled={state.redCards <= 0}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustCard(id, 'red', 1)}
                          className="flex-1 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 border border-red-200 rounded-lg flex items-center justify-center transition-colors font-bold text-xs"
                        >
                          <Circle className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Quick Toggles: MOM, DOD, Teas Item */}
                <div className="p-3 bg-white flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => updatePlayerSessionState(id, { isMotm: !state.isMotm })}
                    className={`flex-1 py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all font-semibold ${
                      state.isMotm 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                    <span>MOM (-50p)</span>
                  </button>

                  <button
                    onClick={() => updatePlayerSessionState(id, { isDotd: !state.isDotd })}
                    className={`flex-1 py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all font-semibold ${
                      state.isDotd 
                        ? 'bg-amber-100 text-amber-800 border-amber-300' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5 text-amber-600" />
                    <span>DOD (+50p)</span>
                  </button>

                  <button
                    onClick={() => toggleItemBrought(id)}
                    className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1 transition-all font-semibold ${
                      !state.itemBrought 
                        ? 'bg-red-100 text-red-800 border-red-300' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {!state.itemBrought ? (
                      <>
                        <PackageX className="w-3.5 h-3.5 text-red-600" />
                        <span>Item Missing (+£1)</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Item OK</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-slate-50/0 z-30">
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => setStep('FINISHING')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Review Fines & U18 Check (Finishing Screen)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STEP 4: FINISHING SCREEN ("THE FINISHING ROOM")
  // User Prompt: "for u18 add a u18 button ont eh finisng screen"
  // ----------------------------------------------------
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 max-w-xl mx-auto">
      
      {/* Navigation Header */}
      <div className="mb-5 space-y-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setStep('ACTIVE')} 
            className="text-slate-500 flex items-center gap-1.5 hover:text-slate-900 transition-colors text-sm font-semibold py-1 px-2.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Fine Logging
          </button>
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-bold">
            Step 4 of 4 · Finishing Screen
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 mb-1 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5" />
            Finishing & Settlement Room
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Final Audit & U18 Review
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Tap the <strong className="text-amber-700">U18 (½ Price)</strong> button on any player to apply their half-price discount before publishing to the bank ledger.
          </p>
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">Gross Fines</div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(totalSessionGross)}
          </div>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-3 text-center shadow-xs">
          <div className="text-[10px] uppercase font-bold text-amber-700 font-mono">U18 Discounts</div>
          <div className="text-lg font-bold font-mono text-amber-700 mt-0.5">
            -{formatCurrency(totalU18Discounts)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
          <div className="text-[10px] uppercase font-bold text-emerald-700 font-mono">New Pot Added</div>
          <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
            +{formatCurrency(totalSessionNet)}
          </div>
        </div>
      </div>

      {/* Theme of the Week input */}
      <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            Theme of the Week (MOM's Choice)
          </div>
          {motmWinnerNames && (
            <span className="text-[11px] text-slate-600 font-medium">
              MOM: <strong className="text-slate-900">{motmWinnerNames}</strong>
            </span>
          )}
        </div>
        <input
          type="text"
          value={weekTheme}
          onChange={(e) => setWeekTheme(e.target.value)}
          placeholder="e.g. Hawaiian Shirts, Worst Kit, Bad Moustaches..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
        />
        <div className="text-[10px] text-slate-500 italic">
          Must be posted in team chat by end of Tuesday after training.
        </div>
      </div>

      {/* Players Itemized List with U18 BUTTON ON FINISHING SCREEN */}
      <div className="space-y-3 pb-36">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">
            Squad Breakdown & U18 Half-Price Toggles
          </span>
          <span className="text-[11px] text-slate-500">
            {selectedPlayerIds.size} players
          </span>
        </div>

        {(Array.from(selectedPlayerIds) as string[]).map(id => {
          const player = allPlayers.find(p => p.id === id);
          if (!player) return null;

          const state = sessionData[id] || {
            generalFines: 0,
            greenCards: 0,
            yellowCards: 0,
            redCards: 0,
            isDotd: false,
            isMotm: false,
            itemBrought: true,
            isU18: false,
            isPaidOff: false,
            addedAmount: 0,
            tags: []
          };

          const breakdown = calculatePlayerFines(state);

          return (
            <div 
              key={id}
              className={`bg-white border rounded-2xl p-4 transition-all duration-200 shadow-sm ${
                state.isPaidOff 
                  ? 'border-emerald-300 bg-emerald-50/20' 
                  : state.isU18
                    ? 'border-amber-300 bg-amber-50/10' 
                    : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-slate-900">{player.name}</span>
                    {state.isU18 && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-mono">
                        U18 · ½ PRICE ACTIVE
                      </span>
                    )}
                    {state.isPaidOff && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> SETTLED AT PUB
                      </span>
                    )}
                  </div>

                  {/* Itemized line items */}
                  <div className="text-xs text-slate-600 mt-1 space-y-0.5 font-mono">
                    {breakdown.generalFinesCount > 0 && (
                      <div>
                        {breakdown.generalFinesCount}x General Fines (25p): {formatCurrency(breakdown.generalFinesCapped)}
                        {breakdown.isGeneralCapped && ' (Capped at £2.50)'}
                      </div>
                    )}
                    {state.greenCards > 0 && <div>{state.greenCards}x Green Card (£2): {formatCurrency(state.greenCards * 2)}</div>}
                    {state.yellowCards > 0 && <div>{state.yellowCards}x Yellow Card (£5): {formatCurrency(state.yellowCards * 5)}</div>}
                    {state.redCards > 0 && <div>{state.redCards}x Red Card (£20): {formatCurrency(state.redCards * 20)}</div>}
                    {state.isDotd && <div className="text-amber-700">Dick of the Day (+50p)</div>}
                    {state.isMotm && <div className="text-emerald-700">Man of the Match (-50p discount)</div>}
                    {!state.itemBrought && <div className="text-red-700">Kit/Teas Item Missing (+£1)</div>}
                    {state.isU18 && breakdown.u18Discount > 0 && (
                      <div className="text-amber-700 font-bold">
                        U18 50% Discount Applied: -{formatCurrency(breakdown.u18Discount)}
                      </div>
                    )}
                    {breakdown.grossTotal === 0 && (
                      <div className="text-slate-400 italic">No fines this session.</div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">Net Session</div>
                  <div className={`text-xl font-bold font-mono ${state.isPaidOff ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {state.isPaidOff ? '£0.00' : formatCurrency(breakdown.finalTotal)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    New Total: {formatCurrency(state.isPaidOff ? 0 : player.totalOwed + breakdown.finalTotal)}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS ON FINISHING SCREEN: 
                  1. The requested U18 BUTTON!
                  2. Settle at pub button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                {/* PROMINENT U18 BUTTON ON FINISHING SCREEN */}
                <button
                  onClick={() => toggleU18(id)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                    state.isU18
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>{state.isU18 ? 'U18 Active (½ Price)' : 'Apply U18 (½ Price)'}</span>
                </button>

                <button
                  onClick={() => togglePaidOff(id)}
                  className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 active:scale-[0.98] ${
                    state.isPaidOff
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {state.isPaidOff ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Undo Paid</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Paid at Pub</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Save & Authorize Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-slate-50/0 z-30">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => onFinishSession(sessionData, opponentName, weekTheme)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Gavel className="w-5 h-5 stroke-[2.5]" />
            <span>Post Fines to Duchy Bank Ledger</span>
          </button>
        </div>
      </div>

    </div>
  );
};
