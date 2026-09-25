import { useState, useEffect } from 'react';
import { Player, ViewState, SessionData, SessionRecord, SessionTransaction } from './types';
import { Leaderboard } from './components/Leaderboard';
import { AdminPanel } from './components/AdminPanel';
import { SessionWizard } from './components/SessionWizard';
import { calculatePlayerFines } from './utils';
import { INITIAL_PLAYERS } from './constants';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  writeBatch,
  query,
  orderBy,
  increment
} from 'firebase/firestore';
import { Settings, ArrowLeft, Activity } from 'lucide-react';

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [view, setView] = useState<ViewState>(ViewState.LEADERBOARD);
  const [loading, setLoading] = useState(true);

  // Load Data from Firebase
  useEffect(() => {
    // Subscribe to Players
    const playersUnsub = onSnapshot(collection(db, "players"), (snapshot) => {
      if (snapshot.empty && loading) {
        INITIAL_PLAYERS.forEach(async (p) => {
          try {
            await addDoc(collection(db, "players"), {
              name: p.name,
              totalOwed: p.totalOwed,
              isU18: p.isU18 || false,
              isHidden: false
            });
          } catch (e) {
            console.error("Error seeding player", e);
          }
        });
      }

      const loadedPlayers: Player[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Player));
      
      setPlayers(loadedPlayers);
      setLoading(false);
    });

    // Subscribe to History (Ordered by timestamp desc)
    const historyQuery = query(collection(db, "history"), orderBy("timestamp", "desc"));
    const historyUnsub = onSnapshot(historyQuery, (snapshot) => {
      const loadedHistory: SessionRecord[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SessionRecord));
      setHistory(loadedHistory);
    });

    return () => {
      playersUnsub();
      historyUnsub();
    };
  }, [loading]);

  const updatePlayerTotal = async (id: string, newTotal: number, isU18?: boolean, isHidden?: boolean) => {
    try {
      const updateData: Record<string, any> = { totalOwed: newTotal };
      if (typeof isU18 === 'boolean') updateData.isU18 = isU18;
      if (typeof isHidden === 'boolean') updateData.isHidden = isHidden;
      await updateDoc(doc(db, "players", id), updateData);
    } catch (e) {
      console.error("Error updating player", e);
    }
  };

  const updatePlayerName = async (id: string, newName: string) => {
    try {
      await updateDoc(doc(db, "players", id), { name: newName });
    } catch (e) {
      console.error("Error updating player name", e);
    }
  };

  // Toggle Hide from public view (keeping fines intact)
  const toggleHidePlayer = async (id: string, isHidden: boolean) => {
    try {
      await updateDoc(doc(db, "players", id), { isHidden });
    } catch (e) {
      console.error("Error toggling player hide status", e);
    }
  };

  const addPlayer = async (name: string, isU18?: boolean) => {
    try {
      await addDoc(collection(db, "players"), {
        name,
        totalOwed: 0,
        isU18: !!isU18,
        isHidden: false
      });
    } catch (e) {
      console.error("Error adding player", e);
    }
  };

  const removePlayer = async (id: string) => {
    try {
      await deleteDoc(doc(db, "players", id));
    } catch (e) {
      console.error("Error removing player", e);
    }
  };

  const payOffPlayer = async (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;

    const batch = writeBatch(db);

    const playerRef = doc(db, "players", id);
    batch.update(playerRef, { totalOwed: 0 });

    const newRecordRef = doc(collection(db, "history"));
    batch.set(newRecordRef, {
      timestamp: Date.now(),
      opponent: "Debt Settled",
      type: 'PAYMENT',
      transactions: [{
        playerId: id,
        playerName: player.name,
        amount: 0,
        tags: ['PAID'],
        isPaidOff: true
      }]
    });

    try {
      await batch.commit();
    } catch (e) {
      console.error("Error paying off player", e);
    }
  };

  const deleteSession = async (sessionId: string) => {
    const session = history.find(s => s.id === sessionId);
    if (!session) return;
    
    const batch = writeBatch(db);
    
    session.transactions.forEach(t => {
      const playerExists = players.some(p => p.id === t.playerId);
      if (playerExists && t.amount > 0 && !t.isPaidOff) {
        const playerRef = doc(db, "players", t.playerId);
        batch.update(playerRef, { totalOwed: increment(-t.amount) });
      }
    });

    batch.delete(doc(db, "history", sessionId));

    try {
      await batch.commit();
    } catch (e) {
      console.error("Error deleting session", e);
    }
  };

  const handleFinishSession = async (
    sessionData: SessionData, 
    opponentName: string, 
    theme?: string
  ) => {
    const transactions: SessionTransaction[] = [];
    const batch = writeBatch(db);

    players.forEach(player => {
      const data = sessionData[player.id];
      if (!data) return;

      const breakdown = calculatePlayerFines(data);
      const sessionAmount = breakdown.finalTotal;

      const playerRef = doc(db, "players", player.id);

      if (data.isPaidOff) {
        batch.update(playerRef, { 
          totalOwed: 0,
          isU18: data.isU18 
        });
      } else if (sessionAmount > 0) {
        batch.update(playerRef, { 
          totalOwed: increment(sessionAmount),
          isU18: data.isU18 
        });
      } else if (data.isU18 !== player.isU18) {
        batch.update(playerRef, { isU18: data.isU18 });
      }

      if (sessionAmount > 0 || data.isPaidOff || data.tags.length > 0) {
        transactions.push({
          playerId: player.id,
          playerName: player.name,
          amount: sessionAmount,
          generalFines: data.generalFines,
          greenCards: data.greenCards,
          yellowCards: data.yellowCards,
          redCards: data.redCards,
          isDotd: data.isDotd,
          isMotm: data.isMotm,
          isU18: data.isU18,
          tags: data.tags,
          isPaidOff: data.isPaidOff
        });
      }
    });

    if (transactions.length > 0) {
      const newRecordRef = doc(collection(db, "history"));
      batch.set(newRecordRef, {
        timestamp: Date.now(),
        opponent: opponentName,
        type: 'MATCH',
        theme: theme || '',
        transactions: transactions
      });
    }

    try {
      await batch.commit();
      setView(ViewState.LEADERBOARD);
    } catch (e) {
      console.error("Error finishing session", e);
      alert("Failed to save session.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700">
        <Activity className="w-8 h-8 animate-pulse text-amber-500" />
      </div>
    );
  }

  // Wizard Mode (Full Screen)
  if (view === ViewState.SESSION_SETUP || view === ViewState.ACTIVE_SESSION) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-md mx-auto p-4 min-h-screen">
          <SessionWizard 
            allPlayers={players}
            onFinishSession={handleFinishSession}
            onCancel={() => setView(ViewState.ADMIN_PANEL)}
          />
        </div>
      </div>
    );
  }

  // Dashboard / Admin Mode
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Clean Light-Mode Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xs flex items-center justify-center text-white font-mono font-bold text-xs shadow-xs">
              D
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 font-mono uppercase">
              DuchyBank
            </h1>
          </div>
          
          <div className="flex gap-2">
            {view === ViewState.ADMIN_PANEL ? (
              <button 
                onClick={() => setView(ViewState.LEADERBOARD)}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-sm flex items-center gap-1.5 text-xs font-mono font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> <span>Back</span>
              </button>
            ) : (
              <button 
                onClick={() => setView(ViewState.ADMIN_PANEL)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-sm transition-colors"
                aria-label="Admin Settings"
                title="Admin Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {view === ViewState.LEADERBOARD && (
          <>
            <Leaderboard players={players} history={history} />
            <div className="text-center text-xs text-slate-400 mt-8 pb-8 font-medium">
              Duchy Hockey Club • Fine Management System
            </div>
          </>
        )}

        {view === ViewState.ADMIN_PANEL && (
          <AdminPanel 
            players={players}
            history={history}
            onUpdatePlayer={updatePlayerTotal}
            onUpdatePlayerName={updatePlayerName}
            onToggleHidePlayer={toggleHidePlayer}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            onStartSession={() => setView(ViewState.SESSION_SETUP)}
            onDeleteSession={deleteSession}
            onPayOffPlayer={payOffPlayer}
          />
        )}

      </main>
    </div>
  );
}
