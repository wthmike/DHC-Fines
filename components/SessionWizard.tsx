import React, { useState, useEffect } from 'react';
import { Player, SessionData, PlayerSessionState } from '../types';
import { formatCurrency, calculatePlayerFines } from '../utils';
import { 
  Check, ArrowLeft, Gavel, CreditCard, RotateCcw, 
  Triangle, Square, Circle, PackageCheck, PackageX,
  Trophy, ThumbsDown, Plus, Minus, ArrowRight, ShieldAlert,
  Percent
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

  // U18 toggle on the finishing screen
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
      <div className="flex flex-col h-full animate-in fade-in duration-200 max-w-xl mx-auto">
        <div className="mb-5 flex items-center justify-between">
          <button 
            onClick={onCancel} 
            className="text-slate-600 flex items-center gap-1 hover:text-slate-900 transition-colors text-xs font-mono font-semibold py-1 px-2 rounded-sm hover:bg-slate-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Cancel
          </button>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm font-semibold">
            Stage 01 / 04
          </span>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-mono font-bold text-slate-900 uppercase tracking-tight">
            Squad & Fixture
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Select squad members and specify the opposing club.
          </p>
        </div>

        {/* Match Fixture Input */}
        <div className="mb-4 bg-white p-3.5 rounded-sm border border-slate-200 shadow-xs space-y-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Fixture Opponent
          </label>
          <div className="flex items-center gap-2">
            <div className="text-slate-700 font-mono text-xs bg-slate-100 px-2.5 py-1.5 rounded-sm font-semibold whitespace-nowrap">
              Duchy M1s vs
            </div>
            <input 
              type="text" 
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              placeholder="Opponent name (e.g. Truro, Penzance)..."
              className="flex-1 bg-white border border-slate-200 text-slate-900 px-3 py-1.5 rounded-sm focus:border-slate-800 outline-none text-xs font-medium"
              autoFocus
            />
          </div>
        </div>

        {/* Squad Selection Header */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Squad Roster ({selectedPlayerIds.size} of {allPlayers.length})
          </div>
          <div className="flex gap-1.5 text-xs font-mono">
            <button
              onClick={selectAllVisible}
              className="text-slate-700 hover:text-slate-900 px-2 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 transition-colors text-[11px]"
            >
              Select Active
            </button>
            <button
              onClick={clearSelection}
              className="text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded-sm hover:bg-slate-100 transition-colors text-[11px]"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto bg-white rounded-sm border border-slate-200 mb-20 no-scrollbar divide-y divide-slate-100 shadow-xs">
          {allPlayers.map(player => {
            const isSelected = selectedPlayerIds.has(player.id);
            return (
              <div 
                key={player.id}
                onClick={() => togglePlayerSelection(player.id)}
                className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-xs flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                        {player.name}
                      </span>
                      {player.isU18 && (
                        <span className="text-[9px] font-mono text-amber-800 bg-amber-50 px-1 rounded-xs border border-amber-200">
                          U18
                        </span>
                      )}
                      {player.isHidden && (
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded-xs">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="font-mono text-xs">
                  <span className={player.totalOwed > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}>
                    {formatCurrency(player.totalOwed)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 z-20">
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => setStep('VOTING')}
              disabled={selectedPlayerIds.size === 0 || !opponentName.trim()}
              className="w-full bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 hover:bg-slate-800 text-white py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Next: Post-Match Honors</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
      isMotm: boolean
    ) => {
      const candidates = Object.entries(votes)
        .filter(([id]) => selectedPlayerIds.has(id))
        .sort((a,b) => b[1] - a[1]);
      const maxVotes = Math.max(...candidates.map(([, c]) => c), 0);

      return (
        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden mb-4 shadow-xs">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              {isMotm ? (
                <Trophy className="w-4 h-4 text-emerald-700" />
              ) : (
                <ThumbsDown className="w-4 h-4 text-amber-700" />
              )}
              <h3 className="font-mono font-bold text-slate-900 uppercase tracking-wider text-xs">
                {title}
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-xs border border-slate-200">
              {perkText}
            </span>
          </div>

          <div className="p-3 space-y-3">
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-1.5 px-3 rounded-sm appearance-none focus:border-slate-800 outline-none text-xs font-mono font-medium"
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
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              {candidates.map(([id, count]) => {
                const player = allPlayers.find(p => p.id === id);
                const isLeader = count === maxVotes && count > 0;
                return (
                  <div 
                    key={id} 
                    className={`flex items-center justify-between p-2 rounded-sm border transition-colors ${
                      isLeader ? 'bg-slate-50 border-slate-400' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">{player?.name}</span>
                      {isLeader && (
                        <span className="text-[9px] font-mono font-bold bg-slate-900 text-white px-1.5 py-0.2 rounded-xs uppercase">
                          Leading ({count})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <button 
                        onClick={() => handleVoteChange(type, id, -1)}
                        className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xs text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs">{count}</span>
                      <button 
                        onClick={() => handleVoteChange(type, id, 1)}
                        className="w-6 h-6 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xs font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {candidates.length === 0 && (
                <div className="text-center py-2 text-slate-400 text-xs italic font-mono">
                  No nominations recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col h-full animate-in fade-in duration-200 max-w-xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <button 
            onClick={() => setStep('SELECT')} 
            className="text-slate-600 flex items-center gap-1 hover:text-slate-900 transition-colors text-xs font-mono font-semibold py-1 px-2 rounded-sm hover:bg-slate-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Squad
          </button>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm font-semibold">
            Stage 02 / 04
          </span>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-mono font-bold text-slate-900 uppercase tracking-tight">
            Post-Match Honors
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            MOM: -50p rebate & selects theme. DOD: +50p penalty.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          {renderVotingSection('Man of the Match', 'MOTM', motmVotes, '-£0.50 off fines', true)}
          {renderVotingSection('Dick of the Day', 'DOTD', dotdVotes, '+£0.50 penalty', false)}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 z-20">
          <div className="max-w-xl mx-auto space-y-1.5">
            <button
              onClick={finalizeVoting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Proceed to Fine Tariff Logging</span>
            </button>
            <button
              onClick={() => {
                setMotmVotes({});
                setDotdVotes({});
                setStep('ACTIVE');
              }}
              className="w-full text-slate-500 hover:text-slate-800 text-[11px] font-mono py-1 transition-colors"
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
      <div className="flex flex-col h-full animate-in fade-in duration-200 max-w-xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setStep('VOTING')} 
              className="text-slate-600 flex items-center gap-1 hover:text-slate-900 transition-colors text-xs font-mono font-semibold py-1 px-2 rounded-sm hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Honors
            </button>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm font-semibold">
              Stage 03 / 04
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-sm border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                Match Record
              </div>
              <h2 className="text-base font-bold text-slate-900 font-mono">
                Duchy M1s vs {opponentName}
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs uppercase">
              Active Session
            </span>
          </div>
        </div>

        {/* Players Cards */}
        <div className="space-y-3 pb-32">
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
                className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-xs"
              >
                {/* Header */}
                <div className="p-3 bg-slate-50/70 flex justify-between items-center border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{player.name}</span>
                      {state.isU18 && (
                        <span className="text-[9px] font-mono text-amber-800 bg-amber-50 px-1 rounded-xs border border-amber-200 font-semibold">
                          U18 (½ Price)
                        </span>
                      )}
                      {state.isMotm && (
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs border border-emerald-200">
                          MOM (-50p)
                        </span>
                      )}
                      {state.isDotd && (
                        <span className="bg-amber-50 text-amber-800 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs border border-amber-200">
                          DOD (+50p)
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Prior: {formatCurrency(player.totalOwed)}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Session Fine</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {formatCurrency(breakdown.finalTotal)}
                    </span>
                  </div>
                </div>

                {/* 1. General Fines Section (25p, capped at £2.50) */}
                <div className="p-3 border-b border-slate-100 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="font-bold text-slate-800">
                        General Fines (25p)
                      </span>
                      {breakdown.isGeneralCapped && (
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1 py-0.2 rounded-xs border border-amber-200 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Capped at £2.50
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-slate-500">
                      {state.generalFines} fines = {formatCurrency(breakdown.generalFinesCapped)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => adjustGeneralFines(id, -1)}
                      disabled={state.generalFines <= 0}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 rounded-sm font-mono font-bold text-xs border border-slate-200 flex items-center justify-center gap-1"
                    >
                      <Minus className="w-3 h-3" /> -25p
                    </button>
                    <div className="w-12 text-center font-mono font-bold text-sm text-slate-900">
                      {state.generalFines}
                    </div>
                    <button
                      onClick={() => adjustGeneralFines(id, 1)}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-sm font-mono font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> +25p Fine
                    </button>
                  </div>
                </div>

                {/* 2. Official Cards Grid: Green £2, Yellow £5, Red £20 */}
                <div className="p-3 border-b border-slate-100 bg-slate-50/40">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Cards (Supplementary to Cap)
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Green Card £2 */}
                    <div className="bg-white border border-slate-200 rounded-sm p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between w-full mb-1.5 font-mono">
                        <span className="text-[10px] font-bold text-emerald-700">Green £2</span>
                        <span className="text-xs font-bold">{state.greenCards}</span>
                      </div>
                      <div className="flex items-center gap-1 w-full">
                        <button
                          onClick={() => adjustCard(id, 'green', -1)}
                          disabled={state.greenCards <= 0}
                          className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-20 text-slate-600 rounded-xs flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustCard(id, 'green', 1)}
                          className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xs flex items-center justify-center font-bold text-xs"
                        >
                          <Triangle className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>

                    {/* Yellow Card £5 */}
                    <div className="bg-white border border-slate-200 rounded-sm p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between w-full mb-1.5 font-mono">
                        <span className="text-[10px] font-bold text-yellow-800">Yellow £5</span>
                        <span className="text-xs font-bold">{state.yellowCards}</span>
                      </div>
                      <div className="flex items-center gap-1 w-full">
                        <button
                          onClick={() => adjustCard(id, 'yellow', -1)}
                          disabled={state.yellowCards <= 0}
                          className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-20 text-slate-600 rounded-xs flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustCard(id, 'yellow', 1)}
                          className="flex-1 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-xs flex items-center justify-center font-bold text-xs"
                        >
                          <Square className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>

                    {/* Red Card £20 */}
                    <div className="bg-white border border-slate-200 rounded-sm p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between w-full mb-1.5 font-mono">
                        <span className="text-[10px] font-bold text-red-700">Red £20</span>
                        <span className="text-xs font-bold">{state.redCards}</span>
                      </div>
                      <div className="flex items-center gap-1 w-full">
                        <button
                          onClick={() => adjustCard(id, 'red', -1)}
                          disabled={state.redCards <= 0}
                          className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-20 text-slate-600 rounded-xs flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustCard(id, 'red', 1)}
                          className="flex-1 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-xs flex items-center justify-center font-bold text-xs"
                        >
                          <Circle className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Quick Toggles: MOM, DOD, Teas Item */}
                <div className="p-2.5 bg-white flex items-center justify-between gap-1.5 text-xs font-mono">
                  <button
                    onClick={() => updatePlayerSessionState(id, { isMotm: !state.isMotm })}
                    className={`flex-1 py-1.5 px-2 rounded-sm border flex items-center justify-center gap-1 transition-colors ${
                      state.isMotm 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <Trophy className="w-3 h-3 text-emerald-600" />
                    <span>MOM (-50p)</span>
                  </button>

                  <button
                    onClick={() => updatePlayerSessionState(id, { isDotd: !state.isDotd })}
                    className={`flex-1 py-1.5 px-2 rounded-sm border flex items-center justify-center gap-1 transition-colors ${
                      state.isDotd 
                        ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3 text-amber-600" />
                    <span>DOD (+50p)</span>
                  </button>

                  <button
                    onClick={() => toggleItemBrought(id)}
                    className={`py-1.5 px-2 rounded-sm border flex items-center justify-center gap-1 transition-colors ${
                      !state.itemBrought 
                        ? 'bg-red-50 text-red-800 border-red-300 font-bold' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {!state.itemBrought ? (
                      <>
                        <PackageX className="w-3 h-3 text-red-600" />
                        <span>Item (+£1)</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck className="w-3 h-3 text-emerald-600" />
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
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 z-30">
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => setStep('FINISHING')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Review & U18 Check (Finishing Screen)</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
    <div className="flex flex-col h-full animate-in fade-in duration-200 max-w-xl mx-auto">
      
      {/* Navigation Header */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setStep('ACTIVE')} 
            className="text-slate-600 flex items-center gap-1 hover:text-slate-900 transition-colors text-xs font-mono font-semibold py-1 px-2 rounded-sm hover:bg-slate-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tariff Logging
          </button>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm font-semibold">
            Stage 04 / 04 · Finishing
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-0.5">
            Audit & U18 Concession Review
          </div>
          <h2 className="text-xl font-mono font-bold text-slate-900 uppercase tracking-tight">
            Match Settlement Sheet
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Tap <strong className="text-slate-800">U18 (½ Price)</strong> on any player to halve their fines before saving.
          </p>
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4 font-mono">
        <div className="bg-white border border-slate-200 rounded-sm p-2.5 text-center shadow-xs">
          <div className="text-[9px] uppercase font-bold text-slate-400">Gross Total</div>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            {formatCurrency(totalSessionGross)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-sm p-2.5 text-center shadow-xs">
          <div className="text-[9px] uppercase font-bold text-amber-700">U18 Concessions</div>
          <div className="text-base font-bold text-amber-700 mt-0.5">
            -{formatCurrency(totalU18Discounts)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-sm p-2.5 text-center shadow-xs">
          <div className="text-[9px] uppercase font-bold text-emerald-700">Net Pot Added</div>
          <div className="text-base font-bold text-emerald-700 mt-0.5">
            +{formatCurrency(totalSessionNet)}
          </div>
        </div>
      </div>

      {/* Theme of the Week input */}
      <div className="mb-4 bg-white border border-slate-200 rounded-sm p-3.5 shadow-xs space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 uppercase text-[11px]">
            Theme of the Week (MOM's Choice)
          </span>
          {motmWinnerNames && (
            <span className="text-[10px] text-slate-500">
              MOM: <strong>{motmWinnerNames}</strong>
            </span>
          )}
        </div>
        <input
          type="text"
          value={weekTheme}
          onChange={(e) => setWeekTheme(e.target.value)}
          placeholder="Enter theme (e.g. Hawaiian Shirts, Bad Moustaches)..."
          className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-1.5 text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:border-slate-400 outline-none"
        />
      </div>

      {/* Players Itemized List with U18 BUTTON ON FINISHING SCREEN */}
      <div className="space-y-2.5 pb-28">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            Player Schedule & U18 Toggles
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {selectedPlayerIds.size} Members
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
              className={`bg-white border rounded-sm p-3 transition-colors shadow-xs ${
                state.isPaidOff 
                  ? 'border-emerald-300 bg-emerald-50/20' 
                  : state.isU18
                    ? 'border-slate-300 bg-slate-50/50' 
                    : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{player.name}</span>
                    {state.isU18 && (
                      <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-50 px-1 rounded-xs border border-amber-200">
                        U18 · ½ Price
                      </span>
                    )}
                    {state.isPaidOff && (
                      <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1 rounded-xs border border-emerald-200">
                        Settled at pub
                      </span>
                    )}
                  </div>

                  {/* Itemized line items */}
                  <div className="text-[11px] text-slate-500 mt-1 space-y-0.5 font-mono">
                    {breakdown.generalFinesCount > 0 && (
                      <div>
                        {breakdown.generalFinesCount}x General (25p): {formatCurrency(breakdown.generalFinesCapped)}
                        {breakdown.isGeneralCapped && ' (Capped at £2.50)'}
                      </div>
                    )}
                    {state.greenCards > 0 && <div>{state.greenCards}x Green (£2): {formatCurrency(state.greenCards * 2)}</div>}
                    {state.yellowCards > 0 && <div>{state.yellowCards}x Yellow (£5): {formatCurrency(state.yellowCards * 5)}</div>}
                    {state.redCards > 0 && <div>{state.redCards}x Red (£20): {formatCurrency(state.redCards * 20)}</div>}
                    {state.isDotd && <div>Dick of the Day (+50p)</div>}
                    {state.isMotm && <div>Man of the Match (-50p rebate)</div>}
                    {!state.itemBrought && <div>Item Missing (+£1)</div>}
                    {state.isU18 && breakdown.u18Discount > 0 && (
                      <div className="text-amber-800 font-bold">
                        U18 50% Concession: -{formatCurrency(breakdown.u18Discount)}
                      </div>
                    )}
                    {breakdown.grossTotal === 0 && (
                      <div className="text-slate-400 italic">No fines this fixture.</div>
                    )}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Session Net</span>
                  <span className={`text-base font-bold ${state.isPaidOff ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {state.isPaidOff ? '£0.00' : formatCurrency(breakdown.finalTotal)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    New total: {formatCurrency(state.isPaidOff ? 0 : player.totalOwed + breakdown.finalTotal)}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS ON FINISHING SCREEN: 
                  1. The requested U18 BUTTON!
                  2. Settle at pub button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 font-mono">
                {/* PROMINENT U18 BUTTON ON FINISHING SCREEN */}
                <button
                  onClick={() => toggleU18(id)}
                  className={`flex-1 py-1 px-2.5 rounded-sm border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    state.isU18
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Percent className="w-3 h-3" />
                  <span>{state.isU18 ? 'U18 (½ Price) Active' : 'Apply U18 (½ Price)'}</span>
                </button>

                <button
                  onClick={() => togglePaidOff(id)}
                  className={`py-1 px-2.5 rounded-sm border text-xs font-semibold transition-colors flex items-center gap-1 ${
                    state.isPaidOff
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {state.isPaidOff ? (
                    <>
                      <RotateCcw className="w-3 h-3" />
                      <span>Undo</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3 h-3" />
                      <span>Settled</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Save & Authorize Action */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 z-30">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => onFinishSession(sessionData, opponentName, weekTheme)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Commit Fines to Ledger</span>
          </button>
        </div>
      </div>

    </div>
  );
};
