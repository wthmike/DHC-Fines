import React, { useState } from 'react';
import { Player, SessionRecord } from '../types';
import { formatCurrency } from '../utils';
import { HistoryList } from './HistoryList';
import { Edit2, Save, Play, UserPlus, Trash2, Shield, Lock, ArrowRight, AlertCircle, AlertTriangle, Banknote } from 'lucide-react';

interface AdminPanelProps {
  players: Player[];
  history: SessionRecord[];
  onUpdatePlayer: (id: string, newTotal: number) => void;
  onUpdatePlayerName: (id: string, newName: string) => void;
  onStartSession: () => void;
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onPayOffPlayer: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  players, 
  history,
  onUpdatePlayer, 
  onUpdatePlayerName,
  onStartSession,
  onAddPlayer,
  onRemovePlayer,
  onDeleteSession,
  onPayOffPlayer
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editNameValue, setEditNameValue] = useState<string>('');
  const [newPlayerName, setNewPlayerName] = useState('');

  // Modals State
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [playerToPayOff, setPlayerToPayOff] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'kevmick') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPasswordInput('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-in fade-in zoom-in duration-300 py-12">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-2 shadow-xl border border-slate-800 ring-1 ring-white/5">
          <Lock className="w-8 h-8 text-orange-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif text-white">Admin Access</h2>
          <p className="text-slate-500 text-sm">This area is restricted to team administrators.</p>
        </div>
        
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <div>
             <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setError(false);
              }}
              placeholder="Enter Password"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-center tracking-widest font-sans text-lg transition-all"
              autoFocus
             />
             {error && (
               <div className="flex items-center justify-center gap-2 text-red-400 text-xs mt-3 animate-in slide-in-from-top-1 bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                 <AlertCircle className="w-3 h-3" />
                 <span>Invalid credentials</span>
               </div>
             )}
          </div>
          <button 
            type="submit"
            className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-white/5"
          >
            Unlock Panel <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setEditValue(player.totalOwed.toString());
    setEditNameValue(player.name);
  };

  const saveEdit = (id: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      onUpdatePlayer(id, val);
    }
    if (editNameValue.trim()) {
      onUpdatePlayerName(id, editNameValue.trim());
    }
    setEditingId(null);
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Session Delete Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-red-400 mb-1">
                    <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Delete Session?</h3>
                </div>
                
                <p className="text-slate-400 text-sm leading-relaxed">
                    This will permanently remove the match record and <span className="text-red-400 font-bold">reverse all fines</span> (including cards, MoM, DoD) associated with it from the players' totals.
                </p>
                
                <div className="flex gap-3 pt-3">
                    <button 
                        onClick={() => setSessionToDelete(null)}
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onDeleteSession(sessionToDelete);
                            setSessionToDelete(null);
                        }}
                        className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Pay Off Modal */}
      {playerToPayOff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-emerald-400 mb-1">
                    <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <Banknote className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Confirm Payment</h3>
                </div>
                
                <p className="text-slate-400 text-sm leading-relaxed">
                    Reset <span className="text-white font-bold">{playerToPayOff.name}'s</span> debt of <span className="text-white font-bold">{formatCurrency(playerToPayOff.totalOwed)}</span> to £0.00?
                </p>
                
                <div className="flex gap-3 pt-3">
                    <button 
                        onClick={() => setPlayerToPayOff(null)}
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onPayOffPlayer(playerToPayOff.id);
                            setPlayerToPayOff(null);
                        }}
                        className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Banknote className="w-4 h-4" />
                        Confirm Paid
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Delete Player Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-red-400 mb-1">
                    <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Remove Player?</h3>
                </div>
                
                <p className="text-slate-400 text-sm leading-relaxed">
                    Permanently delete <span className="text-white font-bold">{playerToDelete.name}</span> from the roster?
                </p>
                
                <div className="flex gap-3 pt-3">
                    <button 
                        onClick={() => setPlayerToDelete(null)}
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onRemovePlayer(playerToDelete.id);
                            setPlayerToDelete(null);
                        }}
                        className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700/50">
        <h3 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Admin Controls
        </h3>
        <button
          onClick={onStartSession}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:transform active:scale-95"
        >
          <Play className="w-5 h-5 fill-current" />
          Start Match Session
        </button>
      </div>

      {/* Roster Management */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-sans">Team Roster</h3>
          <span className="text-xs text-slate-600 font-mono">{players.length} Players</span>
        </div>

        {/* Add Player Input */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/30">
          <form onSubmit={handleAddPlayer} className="flex gap-3">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Enter player name..."
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
            />
            <button 
              type="submit"
              disabled={!newPlayerName.trim()}
              className="bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 rounded-xl hover:bg-emerald-500 transition-colors flex items-center justify-center"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Player List */}
        <div className="divide-y divide-slate-800">
          {/* Header Row for clearer columns */}
          {players.length > 0 && (
            <div className="px-4 py-2 flex items-center justify-between bg-slate-900/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
               <span>Name</span>
               <div className="flex items-center gap-4 pr-1">
                   <span>Fine</span>
                   <span>Actions</span>
               </div>
            </div>
          )}

          {players.map((player) => (
            <div key={player.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
              {editingId === player.id ? (
                <input
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(player.id)}
                  className="flex-1 bg-slate-950 border border-blue-500/50 rounded-lg text-white px-3 py-2 mr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-w-0"
                  placeholder="Player Name"
                  autoFocus
                />
              ) : (
                <span className="font-medium text-slate-200 text-base sm:text-lg truncate mr-2">{player.name}</span>
              )}
              
              <div className="flex items-center gap-3 flex-shrink-0">
                {editingId === player.id ? (
                  <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                    <span className="text-slate-500 text-sm">£</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(player.id)}
                      className="w-20 px-2 py-1 bg-slate-950 border border-blue-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                    <button
                      onClick={() => saveEdit(player.id)}
                      className="p-1.5 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-medium text-base sm:text-lg w-16 text-right ${player.totalOwed > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                      {formatCurrency(player.totalOwed)}
                    </span>
                    <div className="flex gap-1 items-center">
                        {player.totalOwed > 0 && (
                            <button
                                onClick={() => setPlayerToPayOff(player)}
                                className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-all flex items-center gap-2 mr-2 group active:scale-95"
                                title="Pay Off Debt"
                            >
                                <Banknote className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold uppercase tracking-wide">Pay Off</span>
                            </button>
                        )}
                        <button
                        onClick={() => startEditing(player)}
                        className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        >
                        <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPlayerToDelete(player)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {players.length === 0 && (
             <div className="p-8 text-center text-slate-600 text-sm italic">
                Roster is empty.
             </div>
          )}
        </div>
      </div>

      {/* Match History Management */}
      <div className="pt-6">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 px-1 font-sans">Manage History</h3>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm p-4">
            {/* We pass a function that sets state instead of executing delete immediately */}
            <HistoryList history={history} onDelete={(id) => setSessionToDelete(id)} />
        </div>
      </div>
    </div>
  );
};
