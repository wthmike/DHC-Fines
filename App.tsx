import React, { useState, useEffect } from 'react';
import { Player, ViewState, SessionData, SessionRecord } from './types';
import { Leaderboard } from './components/Leaderboard';
import { AdminPanel } from './components/AdminPanel';
import { SessionWizard } from './components/SessionWizard';
import { Settings, ArrowLeft, Activity } from 'lucide-react';
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
  orderBy
} from 'firebase/firestore';

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [view, setView] = useState<ViewState>(ViewState.LEADERBOARD);
  const [loading, setLoading] = useState(true);

  // Load Data from Firebase
  useEffect(() => {
    // Subscribe to Players
    const playersUnsub = onSnapshot(collection(db, "players"), (snapshot) => {
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
  }, []);

  const updatePlayerTotal = async (id: string, newTotal: number) => {
    try {
      await updateDoc(doc(db, "players", id), { totalOwed: newTotal });
    } catch (e) {
      console.error("Error updating player", e);
    }
  };

  const addPlayer = async (name: string) => {
    try {
      await addDoc(collection(db, "players"), {
        name,
        totalOwed: 0
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

  const handleFinishSession = async (sessionData: SessionData, opponentName: string) => {
    const transactions: { playerId: string; playerName: string; amount: number; tags: string[] }[] = [];
    
    // We use a batch to ensure all updates happen together or not at all
    const batch = writeBatch(db);

    players.forEach(player => {
      const data = sessionData[player.id];
      if (!data) return;

      // 1. Prepare History Transaction Data
      if (data.addedAmount > 0) {
        transactions.push({
          playerId: player.id,
          playerName: player.name,
          amount: data.addedAmount,
          tags: data.tags || []
        });
      }

      // 2. Prepare Player Balance Update
      const playerRef = doc(db, "players", player.id);
      
      if (data.isPaidOff) {
        batch.update(playerRef, { totalOwed: 0 });
      } else if (data.addedAmount !== 0) {
        // We calculate the new total based on current client state
        // In a high-concurrency app we might use increment(), but direct set is fine here
        batch.update(playerRef, { totalOwed: player.totalOwed + data.addedAmount });
      }
    });

    // 3. Create History Record
    if (transactions.length > 0) {
      const newRecordRef = doc(collection(db, "history"));
      batch.set(newRecordRef, {
        timestamp: Date.now(),
        opponent: opponentName,
        transactions: transactions
      });
    }

    try {
      await batch.commit();
      setView(ViewState.LEADERBOARD);
    } catch (e) {
      console.error("Error finishing session", e);
      alert("Failed to save session. Check internet connection.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Activity className="w-8 h-8 animate-pulse text-blue-500" />
      </div>
    );
  }

  // --- Main Render ---

  // Wizard Mode (Full Screen)
  if (view === ViewState.SESSION_SETUP || view === ViewState.ACTIVE_SESSION) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Navbar */}
      <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Square Orange Logo akin to Deutsche Bank */}
            <div className="w-9 h-9 bg-orange-600 rounded-sm flex items-center justify-center text-white font-bold shadow-lg shadow-orange-900/20 border border-white/10">
              <span className="font-serif italic text-xl">D</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-serif">
              DuchyBank
            </h1>
          </div>
          
          <div className="flex gap-2">
            {view === ViewState.ADMIN_PANEL ? (
               <button 
                onClick={() => setView(ViewState.LEADERBOARD)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
               >
                 <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
               </button>
            ) : (
                <button 
                onClick={() => setView(ViewState.ADMIN_PANEL)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Admin Settings"
                >
                <Settings className="w-5 h-5" />
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
                <div className="text-center text-xs text-slate-600 mt-8 pb-8">
                    Duchy Hockey Club • Fine Management System
                </div>
            </>
        )}

        {view === ViewState.ADMIN_PANEL && (
            <AdminPanel 
                players={players}
                onUpdatePlayer={updatePlayerTotal}
                onAddPlayer={addPlayer}
                onRemovePlayer={removePlayer}
                onStartSession={() => setView(ViewState.SESSION_SETUP)}
            />
        )}

      </main>
    </div>
  );
}