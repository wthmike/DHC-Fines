import React, { useState } from 'react';
import { DuchyCrest } from './DuchyCrest';
import { Sparkles, Check, MessageSquare, ShieldAlert } from 'lucide-react';

const SUGGESTED_THEMES = [
  "Hawaiian Shirts & Sunglasses",
  "Bad Moustaches & 70s Retro",
  "Draw-A-Teammate on a Napkin",
  "Opponent Team Mock / Worst Kit",
  "Winter Ski Lodge & Retro Knits",
  "Pub Golf / Caddy Attire",
  "Schoolboy Uniform Classics",
  "Festival / Bucket Hats & Neon",
  "Famous Duos / Hockey Legends",
  "Fancy Black Tie with Hockey Shorts"
];

export const Rulebook: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState(SUGGESTED_THEMES[0]);
  const [customTheme, setCustomTheme] = useState('');
  const [copied, setCopied] = useState(false);

  const activeTheme = customTheme.trim() || selectedTheme;

  const copyThemeToClipboard = () => {
    const text = `🏒 *DUCHY HC MEN'S 1s — POST-MATCH TEAS*\n👑 *Next Week's Theme:* ${activeTheme}\n🗓️ *Deadline:* Posted by end of Tuesday after training.\n🍻 *Rule:* Keep it accessible — everyone joins in at the pub!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const rollTheme = () => {
    const random = SUGGESTED_THEMES[Math.floor(Math.random() * SUGGESTED_THEMES.length)];
    setSelectedTheme(random);
    setCustomTheme('');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-300">
      
      {/* Official Poster Container matching the uploaded sheet in clean light mode */}
      <div className="bg-white border-t-4 border-t-amber-500 border-x border-b border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        
        {/* Club Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
          <DuchyCrest className="w-11 h-11 flex-shrink-0" />
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] text-amber-700 uppercase font-mono">
              DUCHY HC — MEN'S 1s
            </div>
            <div className="text-slate-500 text-xs">
              Official Post-Match Teas Constitution
            </div>
          </div>
        </div>

        {/* Big Bold Title */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase leading-none font-sans">
            POST-MATCH<br />
            <span className="text-amber-500">TEAS.</span>
          </h1>
          <p className="text-slate-600 text-sm mt-3 font-medium">
            The rules of the room. Read it once, argue about it every week.
          </p>
        </div>

        {/* Top 2 Cards: MOM vs DOD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-7">
          {/* MOM Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 space-y-2">
            <div className="text-sm font-bold text-slate-900 tracking-wide">
              Man of the Match
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Voted for playing above and beyond their usual level.
            </p>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Perk</span>
              <span className="text-emerald-800 font-bold text-xs font-mono bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                −50p MOM off fines
              </span>
            </div>
          </div>

          {/* DOD Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 space-y-2">
            <div className="text-sm font-bold text-slate-900 tracking-wide">
              Dick of the Day
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Voted for doing something daft.
            </p>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Penalty</span>
              <span className="text-amber-800 font-bold text-xs font-mono bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                50p fine, no appeal.
              </span>
            </div>
          </div>
        </div>

        {/* Fines Section */}
        <div className="mb-7">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 mb-3 font-mono">
            FINES
          </div>

          <div className="divide-y divide-slate-100 border-y border-slate-200 font-medium">
            <div className="py-3 flex items-center justify-between text-sm">
              <span className="text-slate-800">General fines</span>
              <span className="text-amber-700 font-mono font-bold text-base">25p</span>
            </div>
            <div className="py-3 flex items-center justify-between text-sm">
              <span className="text-slate-800">Green card</span>
              <span className="text-amber-700 font-mono font-bold text-base">£2</span>
            </div>
            <div className="py-3 flex items-center justify-between text-sm">
              <span className="text-slate-800">Yellow card</span>
              <span className="text-amber-700 font-mono font-bold text-base">£5</span>
            </div>
            <div className="py-3 flex items-center justify-between text-sm">
              <span className="text-slate-800">Red card</span>
              <span className="text-amber-700 font-mono font-bold text-base">£20</span>
            </div>
            <div className="py-3 flex items-center justify-between text-sm">
              <span className="text-slate-800">Dick of the Day</span>
              <span className="text-amber-700 font-mono font-bold text-base">50p</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 mt-2.5 font-medium flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Capped at £2.50, cards and DOD extra.</span>
          </div>

          {/* Discounts / Rules Row */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <div className="text-emerald-700 font-mono font-bold text-lg leading-tight">−50p</div>
              <div className="text-slate-600 text-xs mt-0.5">MOM off fines</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <div className="text-amber-700 font-mono font-bold text-lg leading-tight">½ price</div>
              <div className="text-slate-600 text-xs mt-0.5">fines for U18s</div>
            </div>
          </div>
        </div>

        {/* Theme of the Week */}
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 mb-3 font-mono">
            THEME OF THE WEEK
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <div className="flex gap-2">
                <span className="text-amber-700 font-bold font-mono">1.</span>
                <span><strong>MOM chooses</strong> next week's theme — or delegates to DOD.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-700 font-bold font-mono">2.</span>
                <span>Posted into team chat <strong>by end of Tuesday</strong>, after training.</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 italic">
              Keep it accessible — dress, fun facts, draw-a-teammate, whatever. Everyone should be able to join in.
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center pt-4 text-[10px] text-slate-400 font-mono border-t border-slate-100">
          <span>DUCHY HC</span>
          <span>Post-match, at the pub</span>
        </div>
      </div>

      {/* WhatsApp Theme Announcer Helper */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              WhatsApp Theme Announcer
            </span>
          </div>
          <button
            onClick={rollTheme}
            className="text-xs text-amber-800 hover:text-amber-900 font-semibold px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200/60"
          >
            🎲 Roll Idea
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5 font-mono">
              Current Week's Theme
            </label>
            <input
              type="text"
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder={selectedTheme}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-xs"
            />
          </div>

          <button
            onClick={copyThemeToClipboard}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all active:scale-[0.99]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>Copy Formatted for Team Chat</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
