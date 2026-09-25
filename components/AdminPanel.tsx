import React, { useState } from 'react';
import { Player, SessionRecord } from '../types';
import { formatCurrency } from '../utils';
import { HistoryList } from './HistoryList';
import { 
  Edit2, Save, Play, UserPlus, Trash2, Shield, Lock, 
  ArrowRight, AlertCircle, AlertTriangle, Banknote, 
  Eye, EyeOff
} from 'lucide-react';

interface AdminPanelProps {
  players: Player[];
  history: SessionRecord[];
  onUpdatePlayer: (id: string, newTotal: number, isU18?: boolean, isHidden?: boolean) => void;
  onUpdatePlayerName: (id: string, newName: string) => void;
  onToggleHidePlayer: (id: string, isHidden: boolean) => void;
  onStartSession: () => void;
  onAddPlayer: (name: string, isU18?: boolean) => void;
  onRemovePlayer: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onPayOffPlayer: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  players, 
  history,
  onUpdatePlayer, 
  onUpdatePlayerName,
  onToggleHidePlayer,
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
  const [editIsU18, setEditIsU18] = useState<boolean>(false);
  const [editIsHidden, setEditIsHidden] = useState<boolean>(false);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerIsU18, setNewPlayerIsU18] = useState(false);
  const [rosterTab, setRosterTab] = useState<'all' | 'visible' | 'hidden'>('all');

  // Modals State
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [playerToPayOff, setPlayerToPayOff] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.toLowerCase() === 'kevmick') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPasswordInput('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-in fade-in duration-300 py-12 max-w-sm mx-auto">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg border border-slate-200">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight font-sans">
            Admin Vault
          </h2>
          <p className="text-slate-500 text-xs">
            Enter team administrator password to manage roster, visibility, and debts.
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="w-full space-y-3.5">
          <div>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setError(false);
              }}
              placeholder="Enter Password"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 outline-none text-center tracking-widest font-mono text-base transition-all shadow-sm"
              autoFocus
            />
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-600 text-xs mt-2.5 bg-red-50 py-2 rounded-lg border border-red-200 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Incorrect credentials</span>
              </div>
            )}
          </div>
          <button 
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/20 text-sm"
          >
            <span>Unlock Vault</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setEditValue(player.totalOwed.toString());
    setEditNameValue(player.name);
    setEditIsU18(player.isU18 ?? false);
    setEditIsHidden(player.isHidden ?? false);
  };

  const saveEdit = (id: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      onUpdatePlayer(id, val, editIsU18, editIsHidden);
    }
    if (editNameValue.trim()) {
      onUpdatePlayerName(id, editNameValue.trim());
    }
    setEditingId(null);
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim(), newPlayerIsU18);
      setNewPlayerName('');
      setNewPlayerIsU18(false);
    }
  };

  const hiddenCount = players.filter(p => p.isHidden).length;
  const visibleCount = players.length - hiddenCount;

  const displayedPlayers = players.filter(p => {
    if (rosterTab === 'visible') return !p.isHidden;
    if (rosterTab === 'hidden') return p.isHidden;
    return true;
  });

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-300">
      
      {/* ------------------------------------------------ */}
      {/* CONFIRMATION MODALS                              */}
      {/* ------------------------------------------------ */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-1">
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Reverse Session?</h3>
            </div>
            
            <p className="text-slate-600 text-xs leading-relaxed">
              This will permanently delete this match ledger entry and <strong className="text-red-600">reverse all fines</strong> added to the players' totals.
            </p>
            
            <div className="flex gap-3 pt-3">
              <button 
                onClick={() => setSessionToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onDeleteSession(sessionToDelete);
                  setSessionToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete & Reverse</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {playerToPayOff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-emerald-600 mb-1">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <Banknote className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Clear Player Debt</h3>
            </div>
            
            <p className="text-slate-600 text-xs leading-relaxed">
              Reset <strong className="text-slate-900 font-bold">{playerToPayOff.name}'s</strong> outstanding debt of <strong className="text-emerald-700 font-mono">{formatCurrency(playerToPayOff.totalOwed)}</strong> to £0.00?
            </p>
            
            <div className="flex gap-3 pt-3">
              <button 
                onClick={() => setPlayerToPayOff(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onPayOffPlayer(playerToPayOff.id);
                  setPlayerToPayOff(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Confirm Paid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-1">
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Remove Player?</h3>
            </div>
            
            <p className="text-slate-600 text-xs leading-relaxed">
              Permanently delete <strong className="text-slate-900">{playerToDelete.name}</strong> from the database? If you only want to hide them from the public board while keeping their debt intact, use the <strong className="text-amber-700">Hide</strong> button instead.
            </p>
            
            <div className="flex gap-3 pt-3">
              <button 
                onClick={() => setPlayerToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onRemovePlayer(playerToDelete.id);
                  setPlayerToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Session Quick CTA */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Launch Match Session</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Log today's 25p fines, cards, MOM/DOD & U18 half-price.
          </p>
        </div>
        <button
          onClick={onStartSession}
          className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all whitespace-nowrap"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Session</span>
        </button>
      </div>

      {/* Roster Management Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        
        <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2 bg-slate-50/60">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Team Roster & Visibility
            </h3>
            <p className="text-[11px] text-slate-500">
              Manage players, U18 status, and hide inactive members while keeping fines intact
            </p>
          </div>
          <span className="text-xs text-amber-700 font-mono font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {players.length} Total
          </span>
        </div>

        {/* Tabs: All / Visible / Hidden */}
        <div className="p-2 border-b border-slate-100 bg-slate-50/40 flex items-center gap-1 text-xs">
          <button
            onClick={() => setRosterTab('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              rosterTab === 'all' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Players ({players.length})
          </button>
          <button
            onClick={() => setRosterTab('visible')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              rosterTab === 'visible' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visible ({visibleCount})
          </button>
          <button
            onClick={() => setRosterTab('hidden')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              rosterTab === 'hidden' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hidden from Public ({hiddenCount})
          </button>
        </div>

        {/* Add Player Input */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <form onSubmit={handleAddPlayer} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Add new player name..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
              />
              <button 
                type="submit"
                disabled={!newPlayerName.trim()}
                className="bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white px-4 rounded-xl font-bold text-xs hover:bg-amber-600 transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
              <input
                type="checkbox"
                checked={newPlayerIsU18}
                onChange={(e) => setNewPlayerIsU18(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
              />
              <span>Under 18 (Eligible for ½ price fines)</span>
            </label>
          </form>
        </div>

        {/* Player Roster Rows */}
        <div className="divide-y divide-slate-100">
          {displayedPlayers.map((player) => (
            <div key={player.id} className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
              
              {editingId === player.id ? (
                <div className="flex-1 space-y-2 mr-3 animate-in fade-in duration-150">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      className="flex-1 bg-white border border-amber-500 rounded-lg text-slate-900 px-3 py-1.5 text-sm focus:outline-none"
                      placeholder="Player Name"
                      autoFocus
                    />
                    <div className="flex items-center gap-1 bg-white border border-amber-500 rounded-lg px-2">
                      <span className="text-slate-400 text-xs font-mono">£</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-16 bg-transparent text-slate-900 focus:outline-none font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editIsU18}
                          onChange={(e) => setEditIsU18(e.target.checked)}
                          className="rounded border-slate-300 text-amber-500"
                        />
                        <span>U18</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editIsHidden}
                          onChange={(e) => setEditIsHidden(e.target.checked)}
                          className="rounded border-slate-300 text-amber-500"
                        />
                        <span>Hide from public</span>
                      </label>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => saveEdit(player.id)}
                        className="py-1 px-3 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="py-1 px-2.5 bg-slate-100 text-slate-600 rounded-lg text-xs hover:text-slate-900"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm ${player.isHidden ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {player.name}
                      </span>
                      {player.isU18 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-mono">
                          U18
                        </span>
                      )}
                      {player.isHidden && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-mono flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Hidden from Public
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {formatCurrency(player.totalOwed)} owed {player.isHidden && '(kept safe in database)'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* HIDE / UNHIDE BUTTON (The feature requested by user) */}
                    <button
                      onClick={() => onToggleHidePlayer(player.id, !player.isHidden)}
                      className={`py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        player.isHidden 
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                      title={player.isHidden ? "Unhide player to show on public leaderboard" : "Hide player from public leaderboard (fines stay intact)"}
                    >
                      {player.isHidden ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                          <span>Unhide</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Hide</span>
                        </>
                      )}
                    </button>

                    {player.totalOwed > 0 && (
                      <button
                        onClick={() => setPlayerToPayOff(player)}
                        className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                        title="Mark as paid"
                      >
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Settle</span>
                      </button>
                    )}

                    <button
                      onClick={() => startEditing(player)}
                      className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit player"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setPlayerToDelete(player)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete player permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {displayedPlayers.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              No players found in this category.
            </div>
          )}
        </div>
      </div>

      {/* History Management */}
      <div className="pt-2">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 px-1 font-mono">
          Manage Match Ledgers
        </h3>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden p-4 shadow-sm">
          <HistoryList history={history} onDelete={(id) => setSessionToDelete(id)} />
        </div>
      </div>

    </div>
  );
};
