import React, { useState } from 'react';
import { Check, Copy, ShieldAlert, Award, AlertTriangle, FileText } from 'lucide-react';

export const Rulebook: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [themeInput, setThemeInput] = useState('');

  const copyAnnouncement = () => {
    const themeText = themeInput.trim() ? themeInput.trim() : '[Theme TBD by MOM]';
    const text = `DUCHY HC — MEN'S 1s\nPOST-MATCH TEAS NOTICE\n\nTheme of the Week: ${themeText}\nDeadline: Tuesday by 22:00 (post-training)\nRules: General fines 25p (capped at £2.50). Cards & DOD extra. U18s half price.\n\nAll debts to be settled via DuchyBank to Mick (04-00-03 / 76851045, ref: DHC).`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto animate-in fade-in duration-200">
      
      {/* Official Schedule Card */}
      <div className="bg-white border border-slate-300 rounded-sm shadow-xs overflow-hidden">
        
        {/* Document Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-slate-500 uppercase block">
                DUCHY HC — MEN'S 1s
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Regulations Schedule
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200 uppercase tracking-wider">
              Constitution
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 font-sans uppercase">
            Post-Match <span className="text-amber-600">Teas.</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            The rules of the room. Read it once, argue about it every week.
          </p>
        </div>

        {/* Executive Awards: MOM vs DOD */}
        <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200">
          <div className="p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Man of the Match</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Voted for playing above and beyond usual level.
            </p>
            <div className="pt-1 font-mono text-xs font-bold text-emerald-700">
              −£0.50 off fines
            </div>
          </div>

          <div className="p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Dick of the Day</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Voted for doing something daft. No appeal.
            </p>
            <div className="pt-1 font-mono text-xs font-bold text-amber-800">
              +£0.50 penalty
            </div>
          </div>
        </div>

        {/* Schedule of Fines & Tariffs Table */}
        <div className="p-4 border-b border-slate-200">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2.5">
            Schedule of Tariffs
          </div>

          <div className="border border-slate-200 rounded-sm overflow-hidden divide-y divide-slate-100 text-xs font-mono">
            <div className="bg-slate-50 px-3.5 py-2 text-[10px] font-bold text-slate-500 uppercase flex justify-between tracking-wider">
              <span>Infraction</span>
              <span>Tariff & Condition</span>
            </div>

            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block font-sans">General Fines</span>
                <span className="text-[11px] text-slate-400 font-sans">Banter, minor lapses, late arrivals</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">£0.25</span>
                <span className="text-[10px] text-slate-400 block font-sans">Capped at £2.50</span>
              </div>
            </div>

            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block font-sans">Green Card</span>
                <span className="text-[11px] text-slate-400 font-sans">2-minute suspension</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">£2.00</span>
                <span className="text-[10px] text-slate-400 block font-sans">Extra to cap</span>
              </div>
            </div>

            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block font-sans">Yellow Card</span>
                <span className="text-[11px] text-slate-400 font-sans">5/10-minute suspension</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">£5.00</span>
                <span className="text-[10px] text-slate-400 block font-sans">Extra to cap</span>
              </div>
            </div>

            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block font-sans">Red Card</span>
                <span className="text-[11px] text-slate-400 font-sans">Expulsion from match</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-red-600">£20.00</span>
                <span className="text-[10px] text-slate-400 block font-sans">Extra to cap</span>
              </div>
            </div>

            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block font-sans">Dick of the Day</span>
                <span className="text-[11px] text-slate-400 font-sans">Room-voted dishonor</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">£0.50</span>
                <span className="text-[10px] text-slate-400 block font-sans">Extra to cap</span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>General fines capped at £2.50. Cards and DOD extra.</span>
          </div>
        </div>

        {/* Concessions Section: U18 & MOM */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/40">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
            Concessions
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-white border border-slate-200 p-3 rounded-sm">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Youth Concession
              </span>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                ½ Price Fines
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Applies to all fines for U18s.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-3 rounded-sm">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                MOM Rebate
              </span>
              <div className="font-mono font-bold text-emerald-700 text-sm mt-0.5">
                −£0.50 Off
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Deducted from MOM's fines.
              </p>
            </div>
          </div>
        </div>

        {/* Theme of the Week Directive */}
        <div className="p-4 space-y-2.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            Theme of the Week By-Law
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="font-mono font-bold text-slate-400">1.</span>
              <p><strong>MOM selects</strong> next week's theme, or delegates to DOD.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono font-bold text-slate-400">2.</span>
              <p>Posted into team chat <strong>by end of Tuesday</strong> after training.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono font-bold text-slate-400">3.</span>
              <p className="text-slate-500">Must be accessible (costume, trivia, drawing). Everyone participates.</p>
            </div>
          </div>
        </div>

        {/* Notice Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>DUCHY HOCKEY CLUB</span>
          <span>Post-match, at the pub</span>
        </div>

      </div>

      {/* Official Copy Notice Helper */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 uppercase">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Theme Notice Generator</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">WhatsApp Ready</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={themeInput}
            onChange={(e) => setThemeInput(e.target.value)}
            placeholder="Enter next week's theme..."
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-sm text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 outline-none font-medium"
          />
          <button
            onClick={copyAnnouncement}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
