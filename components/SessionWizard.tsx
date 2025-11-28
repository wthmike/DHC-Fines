import React, { useState, useEffect } from 'react';
import { Player, SessionData } from '../types';
import { FINE_AMOUNTS } from '../constants';
import { formatCurrency } from '../utils';
import { 
  Check, User, ArrowLeft, Gavel, CreditCard, RotateCcw, 
  Triangle, Square, Circle, PackageCheck, PackageX,
  Trophy, ThumbsDown, Plus, Minus, ArrowRight
} from 'lucide-react';

interface SessionWizardProps {
  allPlayers: Player[];
  onFinishSession: (sessionData: SessionData, opponentName: string) => void;
  onCancel: () => void;
}

export const SessionWizard: React.FC<SessionWizardProps> = ({ allPlayers, onFinishSession, onCancel }) => {
  const [step, setStep] = useState<'SELECT' | 'VOTING' | 'ACTIVE'>('SELECT');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [sessionData, setSessionData] = useState<SessionData>({});
  const [opponentName, setOpponentName] = useState('');

  // Voting State
  const [motmVotes, setMotmVotes] = useState<Record<string, number>>({});
  const [dotdVotes, setDotdVotes] = useState<Record<string, number>>({});

  // Initialize session data when players are selected
  useEffect(() => {
    const initialData: SessionData = {};
    selectedPlayerIds.forEach(id => {
      // Preserve existing data if navigating back/forth
      initialData[id] = sessionData[id] || { 
        addedAmount: 0, 
        isPaidOff: false, 
        tags: [],
        itemBrought: false 
      };
    });
    setSessionData(prev => ({ ...prev, ...initialData }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayerIds]);

  const togglePlayerSelection = (id: string) => {
    const newSet = new Set(selectedPlayerIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPlayerIds(newSet);
  };

  const updateSessionAmount = (id: string, amount: number, tag?: string) => {
    setSessionData(prev => {
      const currentTags = prev[id]?.tags || [];
      const newTags = tag ? [...currentTags, tag] : currentTags;
      
      return {
        ...prev,
        [id]: {
          ...prev[id],
          addedAmount: (prev[id]?.addedAmount || 0) + amount,
          isPaidOff: false,
          tags: newTags
        }
      };
    });
  };

  const toggleItemBrought = (id: string) => {
      setSessionData(prev => ({
          ...prev,
          [id]: {
              ...prev[id],
              itemBrought: !prev[id].itemBrought,
              isPaidOff: false // Unpay if modifying amount
          }
      }));
  };

  const markAsPaid = (id: string) => {
    setSessionData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isPaidOff: !prev[id].isPaidOff
      }
    }));
  };

  const calculateTotalForPlayer = (id: string) => {
    const base = allPlayers.find(p => p.id === id)?.totalOwed || 0;
    const added = sessionData[id]?.addedAmount || 0;
    const itemFine = !sessionData[id]?.itemBrought ? 1.00 : 0;
    const isPaid = sessionData[id]?.isPaidOff;
    
    if (isPaid) return 0;
    return base + added + itemFine;
  };

  // Voting Logic
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
    handleVoteChange(type, playerId, 1); // Start with 1 vote
  };

  const finalizeVoting = () => {
    // 1. Reset any existing MOTM/DOTD data in sessionData (in case we went back and changed votes)
    const newSessionData = { ...sessionData };
    Object.keys(newSessionData).forEach(id => {
       const playerSession = { ...newSessionData[id] };
       // Filter out existing MOTM/DOTD tags to avoid duplicates if re-running
       const hasMotm = playerSession.tags.includes('MOTM');
       const hasDotd = playerSession.tags.includes('DOTD');
       
       if (hasMotm || hasDotd) {
          let deduction = 0;
          if (hasMotm) deduction += FINE_AMOUNTS.MOTM;
          if (hasDotd) deduction += FINE_AMOUNTS.DOTD;
          
          playerSession.tags = playerSession.tags.filter(t => t !== 'MOTM' && t !== 'DOTD');
          playerSession.addedAmount -= deduction;
          newSessionData[id] = playerSession;
       }
    });

    // 2. Determine Winners
    const getWinners = (votes: Record<string, number>) => {
      let max = 0;
      let winners: string[] = [];
      Object.entries(votes).forEach(([id, count]) => {
         // Only consider players who are still selected in the squad
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

    // 3. Apply Fines & Tags
    motmWinners.forEach(id => {
       if (newSessionData[id]) {
         newSessionData[id].addedAmount += FINE_AMOUNTS.MOTM;
         newSessionData[id].tags.push('MOTM');
       }
    });

    dotdWinners.forEach(id => {
       if (newSessionData[id]) {
         newSessionData[id].addedAmount += FINE_AMOUNTS.DOTD;
         newSessionData[id].tags.push('DOTD');
       }
    });

    setSessionData(newSessionData);
    setStep('ACTIVE');
  };

  // --- RENDER STEP 1: SELECTION ---
  if (step === 'SELECT') {
    return (
      <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
        <div className="mb-6">
          <button onClick={onCancel} className="text-slate-400 flex items-center gap-1 hover:text-white mb-4 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>
          <h2 className="text-3xl font-serif text-white mb-1">New Match</h2>
          <p className="text-slate-400 text-sm font-light">Configure session details.</p>
        </div>

        <div className="mb-6 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Opponent</label>
           <div className="flex items-center gap-3">
             <span className="text-slate-300 font-serif italic text-lg">Duchy M1s vs</span>
             <input 
                type="text" 
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                placeholder="Team Name..."
                className="flex-1 bg-slate-950 border border-slate-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-600 font-medium"
             />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-900/50 rounded-2xl border border-slate-800 mb-20 no-scrollbar">
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
            Select Squad
          </div>
          {allPlayers.map(player => (
            <div 
              key={player.id}
              onClick={() => togglePlayerSelection(player.id)}
              className={`p-4 border-b border-slate-800 flex items-center justify-between cursor-pointer transition-all ${selectedPlayerIds.has(player.id) ? 'bg-blue-900/20' : 'hover:bg-slate-800/50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${selectedPlayerIds.has(player.id) ? 'bg-blue-500 text-white' : 'bg-slate-800 border border-slate-600'}`}>
                  {selectedPlayerIds.has(player.id) && <Check className="w-3 h-3" />}
                </div>
                <span className={`font-medium ${selectedPlayerIds.has(player.id) ? 'text-white' : 'text-slate-400'}`}>{player.name}</span>
              </div>
              <div className="text-slate-500 font-mono text-sm">
                {formatCurrency(player.totalOwed)}
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-slate-950/0 z-20">
          <div className="max-w-md mx-auto">
             <button
                onClick={() => setStep('VOTING')}
                disabled={selectedPlayerIds.size === 0 || !opponentName.trim()}
                className="w-full bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                Next: Voting <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER STEP 2: VOTING ---
  if (step === 'VOTING') {
    const selectedPlayersList = allPlayers.filter(p => selectedPlayerIds.has(p.id));
    
    // Helper for rendering a voting section
    const renderVotingSection = (
      title: string, 
      type: 'MOTM' | 'DOTD', 
      votes: Record<string, number>, 
      icon: React.ReactNode,
      themeColor: string
    ) => {
      const candidates = Object.entries(votes).filter(([id]) => selectedPlayerIds.has(id)).sort((a,b) => b[1] - a[1]);
      const maxVotes = Math.max(...candidates.map(([, c]) => c), 0);
      
      return (
        <div className={`bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden mb-6`}>
           <div className={`p-4 border-b border-slate-800 flex items-center justify-between ${themeColor === 'blue' ? 'bg-blue-900/20' : 'bg-pink-900/20'}`}>
              <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-sm">
                 {icon} {title}
              </div>
           </div>
           
           <div className="p-4 space-y-4">
              {/* Add Candidate Dropdown */}
              <div className="relative">
                <select 
                  className="w-full bg-slate-950 border border-slate-700 text-slate-300 py-3 px-4 rounded-xl appearance-none focus:ring-2 focus:ring-slate-500 outline-none"
                  onChange={(e) => {
                     addNominee(type, e.target.value);
                     e.target.value = '';
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>+ Add Nominee</option>
                  {selectedPlayersList
                    .filter(p => !votes[p.id]) // Hide already nominated
                    .sort((a,b) => a.name.localeCompare(b.name))
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                   <Plus className="w-4 h-4" />
                </div>
              </div>

              {/* Candidates List */}
              <div className="space-y-2">
                 {candidates.map(([id, count]) => {
                   const player = allPlayers.find(p => p.id === id);
                   const isLeader = count === maxVotes && count > 0;
                   return (
                     <div key={id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isLeader ? (themeColor === 'blue' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-pink-500/10 border-pink-500/50') : 'bg-slate-800/30 border-slate-800'}`}>
                        <div className="font-medium text-slate-200">
                           {player?.name}
                           {isLeader && <span className="ml-2 text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-white uppercase">Leader</span>}
                        </div>
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={() => handleVoteChange(type, id, -1)}
                             className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                           >
                             <Minus className="w-4 h-4" />
                           </button>
                           <span className="w-6 text-center font-mono font-bold text-lg">{count}</span>
                           <button 
                             onClick={() => handleVoteChange(type, id, 1)}
                             className={`w-8 h-8 flex items-center justify-center rounded-lg text-white ${themeColor === 'blue' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-pink-600 hover:bg-pink-500'}`}
                           >
                             <Plus className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   );
                 })}
                 {candidates.length === 0 && (
                    <div className="text-center py-4 text-slate-600 text-sm italic">
                       No nominees yet.
                    </div>
                 )}
              </div>
           </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
         <div className="mb-6">
          <button onClick={() => setStep('SELECT')} className="text-slate-400 flex items-center gap-1 hover:text-white mb-4 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Squad
          </button>
          <h2 className="text-3xl font-serif text-white mb-1">Post-Match Voting</h2>
          <p className="text-slate-400 text-sm font-light">Determine honors & dishonors.</p>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
            {renderVotingSection('Man of the Match', 'MOTM', motmVotes, <Trophy className="w-4 h-4 text-blue-400"/>, 'blue')}
            {renderVotingSection('Dick of the Day', 'DOTD', dotdVotes, <ThumbsDown className="w-4 h-4 text-pink-400"/>, 'pink')}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-slate-950/0 z-20">
          <div className="max-w-md mx-auto space-y-3">
             <button
                onClick={finalizeVoting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-900/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Gavel className="w-5 h-5" />
                Start Fines Session
            </button>
            <button
                onClick={() => {
                   // Clear votes and proceed
                   setMotmVotes({});
                   setDotdVotes({});
                   setStep('ACTIVE');
                }}
                className="w-full text-slate-500 hover:text-white text-sm font-medium py-2"
            >
                Skip Voting & Proceed
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER STEP 3: ACTIVE SESSION ---
  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300 bg-slate-950">
      <div className="mb-6 space-y-4">
        <button onClick={() => setStep('VOTING')} className="text-slate-400 flex items-center gap-1 hover:text-white w-fit transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Voting
        </button>
        <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
            <div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Match In Progress</div>
                <h2 className="text-2xl font-serif text-white leading-tight">
                    Duchy M1s <span className="text-slate-500 italic text-lg px-1 font-sans">vs</span> {opponentName}
                </h2>
            </div>
            <div className="relative">
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Live
                </span>
            </div>
        </div>
      </div>

      <div className="space-y-6 pb-40">
        {(Array.from(selectedPlayerIds) as string[]).map(id => {
          const player = allPlayers.find(p => p.id === id);
          if (!player) return null;
          
          const sessionAdded = sessionData[id]?.addedAmount || 0;
          const itemBrought = sessionData[id]?.itemBrought || false;
          const itemFine = !itemBrought ? 1.00 : 0;
          const isPaid = sessionData[id]?.isPaidOff || false;
          const projectedTotal = calculateTotalForPlayer(id);
          
          const hasMotm = sessionData[id]?.tags?.includes('MOTM');
          const hasDotd = sessionData[id]?.tags?.includes('DOTD');

          return (
            <div key={id} className={`bg-slate-900 rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 ${isPaid ? 'border-emerald-500/50 shadow-emerald-900/20' : 'border-slate-800'}`}>
              
              {/* Header */}
              <div className="p-4 bg-slate-800/30 flex justify-between items-start border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {player.name}
                    {hasMotm && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/30 flex items-center gap-1 uppercase tracking-wider"><Trophy size={10} /> MOM</span>}
                    {hasDotd && <span className="bg-pink-500/20 text-pink-400 text-[10px] px-2 py-0.5 rounded border border-pink-500/30 flex items-center gap-1 uppercase tracking-wider"><ThumbsDown size={10} /> DOD</span>}
                  </h3>
                  <div className="text-sm text-slate-400 mt-1 flex gap-3 font-mono">
                    <span>Base: {formatCurrency(player.totalOwed)}</span>
                    <span className={sessionAdded + itemFine > 0 ? "text-red-400 font-bold" : "text-slate-600"}>
                        Session: {sessionAdded + itemFine > 0 ? '+' : ''}{formatCurrency(sessionAdded + itemFine)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Net Total</div>
                    <div className={`text-2xl font-bold tracking-tight font-mono ${isPaid ? 'text-emerald-400' : 'text-white'}`}>
                        {formatCurrency(projectedTotal)}
                    </div>
                </div>
              </div>

              {/* Item Check Toggle */}
              <div className="px-4 pt-4">
                  <button
                    disabled={isPaid}
                    onClick={() => toggleItemBrought(id)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between border transition-all ${
                        itemBrought 
                        ? 'bg-emerald-900/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-red-900/10 border-red-500/30 text-red-400'
                    }`}
                  >
                      <div className="flex items-center gap-3">
                        {itemBrought ? <PackageCheck className="w-5 h-5" /> : <PackageX className="w-5 h-5" />}
                        <span className="font-bold text-sm uppercase tracking-wide">
                            {itemBrought ? 'Item Brought' : 'Item Missing'}
                        </span>
                      </div>
                      <span className="font-mono font-bold">
                          {itemBrought ? '£0.00' : '+£1.00'}
                      </span>
                  </button>
              </div>

              {/* Actions Grid */}
              <div className="p-4 grid grid-cols-6 gap-2">
                {/* Basic Increment */}
                <button 
                  disabled={isPaid}
                  onClick={() => updateSessionAmount(id, FINE_AMOUNTS.STANDARD_INCREMENT)}
                  className="col-span-3 bg-slate-800/80 hover:bg-slate-700 text-white py-4 rounded-xl font-semibold flex flex-col items-center justify-center disabled:opacity-20 border border-slate-700 active:scale-95 transition-all"
                >
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">Fine</span>
                  <span className="text-lg font-mono">+50p</span>
                </button>
                <button 
                  disabled={isPaid}
                  onClick={() => updateSessionAmount(id, -FINE_AMOUNTS.STANDARD_INCREMENT)}
                  className="col-span-3 bg-slate-800/80 hover:bg-slate-700 text-white py-4 rounded-xl font-semibold flex flex-col items-center justify-center disabled:opacity-20 border border-slate-700 active:scale-95 transition-all"
                >
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Undo</span>
                    <span className="text-lg font-mono">-50p</span>
                </button>

                {/* Cards */}
                <button 
                  disabled={isPaid}
                  onClick={() => updateSessionAmount(id, FINE_AMOUNTS.GREEN_CARD, 'GRN')}
                  className="col-span-2 aspect-[4/3] bg-slate-800/80 hover:bg-emerald-900/20 text-emerald-500 rounded-xl flex flex-col items-center justify-center disabled:opacity-20 border border-slate-700 active:scale-95 transition-all"
                >
                  <Triangle className="w-6 h-6 mb-1 fill-current" />
                </button>
                <button 
                  disabled={isPaid}
                  onClick={() => updateSessionAmount(id, FINE_AMOUNTS.YELLOW_CARD, 'YLW')}
                  className="col-span-2 aspect-[4/3] bg-slate-800/80 hover:bg-yellow-900/20 text-yellow-500 rounded-xl flex flex-col items-center justify-center disabled:opacity-20 border border-slate-700 active:scale-95 transition-all"
                >
                   <Square className="w-6 h-6 mb-1 fill-current" />
                </button>
                <button 
                  disabled={isPaid}
                  onClick={() => updateSessionAmount(id, FINE_AMOUNTS.RED_CARD, 'RED')}
                  className="col-span-2 aspect-[4/3] bg-slate-800/80 hover:bg-red-900/20 text-red-500 rounded-xl flex flex-col items-center justify-center disabled:opacity-20 border border-slate-700 active:scale-95 transition-all"
                >
                   <Circle className="w-6 h-6 mb-1 fill-current" />
                </button>
              </div>

               {/* Payment */}
               <div className="px-4 pb-4">
                 {isPaid ? (
                    <button 
                        onClick={() => markAsPaid(id)} // Toggle off
                        className="w-full py-3 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Undo Payment
                    </button>
                 ) : (
                    <button 
                        onClick={() => markAsPaid(id)}
                        disabled={projectedTotal <= 0}
                        className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${projectedTotal <= 0 ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 active:scale-95'}`}
                    >
                        <CreditCard className="w-5 h-5" />
                        Pay Off {formatCurrency(projectedTotal)}
                    </button>
                 )}
               </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-slate-950/0 z-30">
        <div className="max-w-md mx-auto">
            <button
            onClick={() => onFinishSession(sessionData, opponentName)}
            className="w-full bg-white text-slate-950 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-200 shadow-xl shadow-white/10 active:scale-95 transition-all"
            >
            <Gavel className="w-5 h-5" />
            Finish & Save Session
            </button>
        </div>
      </div>
    </div>
  );
};