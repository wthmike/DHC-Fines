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
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-5 animate-in fade-in duration-200 py-12 max-w-sm mx-auto">
        <div className="w-12 h-12 bg-slate-900 rounded-sm flex items-center justify-center shadow-xs">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold font-mono text-slate-900 uppercase tracking-tight">
            Admin Vault
          </h2>
          <p className="text-slate-500 text-xs">
            Enter team administrator password to manage roster and debts.
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="w-full space-y-3">
          <div>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setError(false);
              }}
              placeholder="Enter Password"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-sm text-slate-900 placeholder-slate-400 focus:border-slate-800 outline-none text-center tracking-widest font-mono text-sm shadow-xs"
              autoFocus
            />
            {error && (
              <div className="flex items-center justify-center gap-1.5 text-red-600 text-xs mt-2 bg-red-50 py-1.5 rounded-sm border border-red-200 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Incorrect credentials</span>
              </div>
            )}
          </div>
          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-sm font-mono font-bold flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-wider"
          >
            <span>Unlock Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
    <div className="space-y-5 max-w-xl mx-auto animate-in fade-in duration-200">
      
      {/* ------------------------------------------------ */}
      {/* CONFIRMATION MODALS                              */}
      {/* ------------------------------------------------ */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-sm p-5 max-w-sm w-full shadow-lg space-y-3 text-slate-900">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase font-mono">Reverse Session?</h3>
            </div>
            
            <p className="text-slate-600 text-xs leading-relaxed">
              This will permanently delete this match ledger entry and <strong className="text-red-600">reverse all fines</strong> added to players' balances.
            </p>
            
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setSessionToDelete(null)}
                className="flex-1 px-3 py-1.5 rounded-sm bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onDeleteSession(sessionToDelete);
                  setSessionToDelete(null);
                }}
                className="flex-1 px-3 py-1.5 rounded-sm bg-red-600 text-white font-bold text-xs hover:bg-red-700 flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {playerToPayOff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-sm p-5 max-w-sm w-full shadow-lg space-y-3 text-slate-900">
            <div className="flex items-center gap-2 text-emerald-700">
              <Banknote className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase font-mono">Clear Player Debt</h3>
            </div>
            
            <p className="text-slate-600 text-xs leading-relaxed">
              Reset <strong className="text-slate-900">{playerToPayOff.name}'s</strong> outstanding debt of <strong className="font-mono text-emerald-700">{formatCurrency(playerToPayOff.totalOwed)}</strong> to £0.00?
            </p>
            
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setPlayerToPayOff(null)}
                className="flex-1 px-3 py-1.5 rounded-sm bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onPayOffPlayer(playerToPayOff.id);
                  setPlayerToPayOff(null);
                }}
                className="flex-1 px-3 py-1.5 rounded-sm bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 flex items-center justify-center gap-1"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Confirm Paid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-sm p-5 max-w-sm w-full shadow-lg space-y-3 text-slate-900">
            <div className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase font-mono">Delete Player?</h3>
            </div>
            
            <p className="text-slate-600 text-xs leading-relaxed">
              Permanently delete <strong className="text-slate-900">{playerToDelete.name}</strong> from the database? If you only want to hide them from the public table while keeping fines intact, use <strong className="text-slate-900 font-mono">Hide</strong>.
            </p>
            
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setPlayerToDelete(null)}
                className="flex-1 px-3 py-1.5 rounded-sm bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onRemovePlayer(playerToDelete.id);
                  setPlayerToDelete(null);
                }}
                className="flex-1 px-3 py-1.5 rounded-sm bg-red-600 text-white font-bold text-xs hover:bg-red-700 flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Match Session Button (ONLY HERE IN ADMIN) */}
      <div className="bg-slate-900 text-white p-4 rounded-sm border border-slate-800 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Match Operations</span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Start new post-match teas fine session.
          </p>
        </div>
        <button
          onClick={onStartSession}
          className="py-2 px-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-sm flex items-center gap-1.5 uppercase tracking-wider transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Session</span>
        </button>
      </div>

      {/* Roster & Visibility Section */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
              Roster & Account Status
            </h3>
            <p className="text-[11px] text-slate-500">
              Manage players, U18 flags, and hide from public view
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 font-bold">
            {players.length} Total
          </span>
        </div>

        {/* Tab Filters */}
        <div className="p-2 border-b border-slate-100 bg-slate-50/40 flex items-center gap-1 text-xs">
          <button
            onClick={() => setRosterTab('all')}
            className={`px-2.5 py-1 rounded-sm font-mono text-xs transition-colors ${
              rosterTab === 'all' 
                ? 'bg-slate-900 text-white font-semibold' 
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            All ({players.length})
          </button>
          <button
            onClick={() => setRosterTab('visible')}
            className={`px-2.5 py-1 rounded-sm font-mono text-xs transition-colors ${
              rosterTab === 'visible' 
                ? 'bg-slate-900 text-white font-semibold' 
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Visible ({visibleCount})
          </button>
          <button
            onClick={() => setRosterTab('hidden')}
            className={`px-2.5 py-1 rounded-sm font-mono text-xs transition-colors ${
              rosterTab === 'hidden' 
                ? 'bg-slate-900 text-white font-semibold' 
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Hidden ({hiddenCount})
          </button>
        </div>

        {/* Add Player Input */}
        <div className="p-3.5 border-b border-slate-100 bg-white">
          <form onSubmit={handleAddPlayer} className="space-y-2.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Add player name..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-sm text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:border-slate-400 outline-none font-medium"
              />
              <button 
                type="submit"
                disabled={!newPlayerName.trim()}
                className="bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white px-3.5 rounded-sm font-mono text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-mono">
              <input
                type="checkbox"
                checked={newPlayerIsU18}
                onChange={(e) => setNewPlayerIsU18(e.target.checked)}
                className="rounded-xs border-slate-300 text-slate-900"
              />
              <span>Under 18 (½ price fines)</span>
            </label>
          </form>
        </div>

        {/* Players List */}
        <div className="divide-y divide-slate-100">
          {displayedPlayers.map((player) => (
            <div key={player.id} className="p-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
              
              {editingId === player.id ? (
                <div className="flex-1 space-y-2 mr-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      className="flex-1 bg-white border border-slate-400 rounded-sm text-slate-900 px-2 py-1 text-xs focus:outline-none"
                      placeholder="Player Name"
                      autoFocus
                    />
                    <div className="flex items-center gap-1 bg-white border border-slate-400 rounded-sm px-2">
                      <span className="text-slate-400 text-xs font-mono">£</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-14 bg-transparent text-slate-900 focus:outline-none font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editIsU18}
                          onChange={(e) => setEditIsU18(e.target.checked)}
                          className="rounded-xs border-slate-300"
                        />
                        <span>U18</span>
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editIsHidden}
                          onChange={(e) => setEditIsHidden(e.target.checked)}
                          className="rounded-xs border-slate-300"
                        />
                        <span>Hide</span>
                      </label>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => saveEdit(player.id)}
                        className="py-1 px-2.5 bg-slate-900 text-white rounded-sm text-xs font-bold hover:bg-slate-800 flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="py-1 px-2 bg-slate-100 text-slate-600 rounded-sm text-xs hover:text-slate-900"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${player.isHidden ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {player.name}
                      </span>
                      {player.isU18 && (
                        <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded-sm border border-amber-200">
                          U18
                        </span>
                      )}
                      {player.isHidden && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-sm border border-slate-200 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Hidden
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {formatCurrency(player.totalOwed)} owed {player.isHidden && '(retained in ledger)'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* HIDE / UNHIDE BUTTON */}
                    <button
                      onClick={() => onToggleHidePlayer(player.id, !player.isHidden)}
                      className={`py-1 px-2 rounded-sm text-xs font-mono font-semibold flex items-center gap-1 transition-colors ${
                        player.isHidden 
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                      title={player.isHidden ? "Unhide player from public view" : "Hide player from public table"}
                    >
                      {player.isHidden ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
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
                        className="py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-sm text-xs font-mono font-semibold flex items-center gap-1"
                        title="Mark paid"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Settle</span>
                      </button>
                    )}

                    <button
                      onClick={() => startEditing(player)}
                      className="p-1 text-slate-400 hover:text-slate-800 rounded-sm hover:bg-slate-100"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setPlayerToDelete(player)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-sm hover:bg-red-50"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {displayedPlayers.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs font-mono">
              No players found in this view.
            </div>
          )}
        </div>
      </div>

      {/* History Management */}
      <div className="pt-1">
        <h3 className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider mb-2 px-1">
          Audit & Reversal
        </h3>
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden p-3 shadow-xs">
          <HistoryList history={history} onDelete={(id) => setSessionToDelete(id)} />
        </div>
      </div>

    </div>
  );
};
