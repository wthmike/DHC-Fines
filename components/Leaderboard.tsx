import React from 'react';
import { Player, SessionRecord } from '../types';
import { formatCurrency } from '../utils';
import { HistoryList } from './HistoryList';
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
  history: SessionRecord[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players, history }) => {
  const sortedPlayers = [...players].sort((a, b) => b.totalOwed - a.totalOwed);
  const totalDebt = players.reduce((sum, p) => sum + p.totalOwed, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Total Pot Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl shadow-2xl shadow-orange-900/20 p-6 text-white border border-white/10">
            {/* Decorative blurs */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-2 text-orange-100/90 text-xs font-semibold uppercase tracking-widest font-sans">
                        <Wallet className="w-4 h-4" />
                        Team Fund
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-1 text-xs font-bold text-white/90 font-serif tracking-wide border border-white/10">
                        DUCHY M1
                    </div>
                </div>
                
                <div>
                    <div className="text-5xl font-sans font-bold tracking-tighter mb-2 text-white">
                        {formatCurrency(totalDebt)}
                    </div>
                    <div className="text-orange-100 text-sm flex items-center gap-1.5 font-light">
                        <TrendingUp className="w-3 h-3" />
                        <span>Outstanding balance</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Players List */}
        <div>
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 px-1 font-sans">Active Debts</h2>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-800/50">
                    {sortedPlayers.map((player, index) => (
                    <div key={player.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors group">
                        <div className="flex items-center gap-4">
                        <span className={`
                            w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs font-mono
                            ${index === 0 ? 'bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/50' : 
                            index === 1 ? 'bg-slate-200/20 text-slate-200 ring-1 ring-slate-200/50' :
                            index === 2 ? 'bg-orange-500/20 text-orange-500 ring-1 ring-orange-500/50' : 'text-slate-500 bg-slate-800/50'}
                        `}>
                            {index + 1}
                        </span>
                        <div>
                            <span className="font-medium text-slate-200 block text-base group-hover:text-white transition-colors">
                                {player.name}
                            </span>
                        </div>
                        {player.totalOwed > 10 && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20">
                                <AlertCircle className="w-3 h-3" /> HIGH
                            </div>
                        )}
                        </div>
                        <span className={`font-mono font-medium text-lg tracking-tight ${player.totalOwed > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatCurrency(player.totalOwed)}
                        </span>
                    </div>
                    ))}
                    {sortedPlayers.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm">
                        No players found. Add them in settings.
                        </div>
                    )}
                </div>
            </div>
        </div>

        <HistoryList history={history} />
    </div>
  );
};