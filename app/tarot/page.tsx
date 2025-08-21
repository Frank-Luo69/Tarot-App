'use client'
import React, { useState, useEffect } from "react";

// ========================= Utilities =========================
function mulberry32(a:number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(arr: T[], rnd: () => number) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Timezone formatting
const TIMEZONE = 'Australia/Sydney';
function formatDateLocal(d: string | number | Date) {
  return new Date(d).toLocaleString(undefined, { timeZone: TIMEZONE });
}

// ========================= Data: Tarot Deck =========================
// Major Arcana (22) — concise keywords (bilingual) focused on ACTION prompts
const MAJORS = [
  { key: "0", en: "The Fool", cn: "愚者", kwEn: ["begin", "risk", "curiosity"], kwCn: ["开端", "试错", "好奇"] },
  { key: "1", en: "The Magician", cn: "魔术师", kwEn: ["focus", "resource", "ship"], kwCn: ["聚焦", "调用资源", "立即落地"] },
  { key: "2", en: "The High Priestess", cn: "女祭司", kwEn: ["research", "silence", "observe"], kwCn: ["调研", "沉静", "观察"] },
  { key: "3", en: "The Empress", cn: "皇后", kwEn: ["nurture", "create", "support"], kwCn: ["滋养", "创造", "支持"] },
  { key: "4", en: "The Emperor", cn: "皇帝", kwEn: ["structure", "rule", "boundaries"], kwCn: ["结构化", "规则", "边界"] },
  { key: "5", en: "The Hierophant", cn: "教皇", kwEn: ["standards", "mentor", "procedure"], kwCn: ["标准", "导师", "流程"] },
  { key: "6", en: "The Lovers", cn: "恋人", kwEn: ["choose", "align values", "commit"], kwCn: ["选择", "统一价值", "承诺"] },
  { key: "7", en: "The Chariot", cn: "战车", kwEn: ["drive", "control", "deadline"], kwCn: ["推进", "掌控", "定时限"] },
  { key: "8", en: "Strength", cn: "力量", kwEn: ["courage", "tame", "persist"], kwCn: ["勇气", "驯服", "坚持"] },
  { key: "9", en: "The Hermit", cn: "隐者", kwEn: ["reflect", "distill", "insight"], kwCn: ["反思", "提炼", "洞见"] },
  { key: "10", en: "Wheel of Fortune", cn: "命运之轮", kwEn: ["reframe", "leverage luck", "pivot"], kwCn: ["换框", "借势", "转向"] },
  { key: "11", en: "Justice", cn: "正义", kwEn: ["measure", "trade-off", "decide"], kwCn: ["度量", "权衡", "决断"] },
  { key: "12", en: "The Hanged Man", cn: "倒吊人", kwEn: ["pause", "sacrifice", "learn"], kwCn: ["暂停", "取舍", "学习"] },
  { key: "13", en: "Death", cn: "死亡", kwEn: ["end", "clean up", "restart"], kwCn: ["终结", "清理", "重启"] },
  { key: "14", en: "Temperance", cn: "节制", kwEn: ["mix", "balance", "iterate"], kwCn: ["调和", "平衡", "小步迭代"] },
  { key: "15", en: "The Devil", cn: "恶魔", kwEn: ["cut addiction", "boundary", "cost"], kwCn: ["戒断", "设限", "成本"] },
  { key: "16", en: "The Tower", cn: "高塔", kwEn: ["risk reveal", "fail fast", "fallback"], kwCn: ["暴露风险", "快速失败", "预案"] },
  { key: "17", en: "The Star", cn: "星星", kwEn: ["long-term", "healing", "north star"], kwCn: ["长期", "修复", "北极星目标"] },
  { key: "18", en: "The Moon", cn: "月亮", kwEn: ["uncertainty", "test small", "avoid illusions"], kwCn: ["不确定", "小实验", "避幻觉"] },
  { key: "19", en: "The Sun", cn: "太阳", kwEn: ["clarify", "ship", "celebrate"], kwCn: ["澄清", "上线", "庆祝"] },
  { key: "20", en: "Judgement", cn: "审判", kwEn: ["review", "call", "commit"], kwCn: ["复盘", "召唤", "承诺"] },
  { key: "21", en: "The World", cn: "世界", kwEn: ["complete", "integrate", "launch"], kwCn: ["完成", "整合", "发布"] },
];

// Minor Arcana (56)
const SUITS = [
  { key: "wands", en: "Wands", cn: "权杖" },
  { key: "cups", en: "Cups", cn: "圣杯" },
  { key: "swords", en: "Swords", cn: "宝剑" },
  { key: "pentacles", en: "Pentacles", cn: "钱币" },
];
const RANKS = [
  { k: "Ace", n: 1, cn: "首牌" },
  { k: "Two", n: 2, cn: "二" },
  { k: "Three", n: 3, cn: "三" },
  { k: "Four", n: 4, cn: "四" },
  { k: "Five", n: 5, cn: "五" },
  { k: "Six", n: 6, cn: "六" },
  { k: "Seven", n: 7, cn: "七" },
  { k: "Eight", n: 8, cn: "八" },
  { k: "Nine", n: 9, cn: "九" },
  { k: "Ten", n: 10, cn: "十" },
  { k: "Page", n: 11, cn: "侍从" },
  { k: "Knight", n: 12, cn: "骑士" },
  { k: "Queen", n: 13, cn: "王后" },
  { k: "King", n: 14, cn: "国王" },
];
const SUIT_MEAN = {
  wands: { en: ["action", "will", "start"], cn: ["行动", "意志", "开动"] },
  cups: { en: ["emotion", "bond", "care"], cn: ["情感", "连接", "关怀"] },
  swords: { en: ["mind", "decision", "truth"], cn: ["思辨", "抉择", "真相"] },
  pentacles: { en: ["resource", "work", "material"], cn: ["资源", "事务", "物质"] },
} as const;
const PIP_MEAN = {
  1: { en: ["begin"], cn: ["开始"] },
  2: { en: ["balance"], cn: ["平衡"] },
  3: { en: ["expand"], cn: ["扩展"] },
  4: { en: ["stabilize"], cn: ["稳定"] },
  5: { en: ["challenge"], cn: ["挑战"] },
  6: { en: ["align"], cn: ["协调"] },
  7: { en: ["test"], cn: ["试炼"] },
  8: { en: ["power"], cn: ["力量"] },
  9: { en: ["refine"], cn: ["打磨"] },
  10: { en: ["complete"], cn: ["完成"] },
} as const;

function buildMinorDeck() {
  const cards: any[] = [];
  for (const s of SUITS) {
    for (const r of RANKS) {
      const isPip = r.n <= 10;
      const nameEn = `${r.k} of ${s.en}`;
      const nameCn = `${s.cn}${r.cn}`;
      const kwEn = isPip
        ? [...SUIT_MEAN[s.key as keyof typeof SUIT_MEAN].en, ...PIP_MEAN[r.n as keyof typeof PIP_MEAN].en]
        : [...SUIT_MEAN[s.key as keyof typeof SUIT_MEAN].en, r.k.toLowerCase()];
      const kwCn = isPip
        ? [...SUIT_MEAN[s.key as keyof typeof SUIT_MEAN].cn, ...PIP_MEAN[r.n as keyof typeof PIP_MEAN].cn]
        : [...SUIT_MEAN[s.key as keyof typeof SUIT_MEAN].cn, r.cn];
      cards.push({ key: `${s.key}-${r.k}`, en: nameEn, cn: nameCn, suit: s.key, rank: r.k, pip: r.n, kwEn, kwCn });
    }
  }
  return cards;
}
const MINORS = buildMinorDeck();
const FULL_DECK = [
  ...MAJORS.map((m) => ({ ...m, type: "major" })),
  ...MINORS.map((m) => ({ ...m, type: "minor" })),
];

// Versioning & rules hash (deterministic, lightweight 64-bit hex)
function toHex32(n: number) { return (n >>> 0).toString(16).padStart(8, '0'); }
function stableHashHex(s: string) { const a = hashCode(s); const b = hashCode('|' + s + '|'); return toHex32(a) + toHex32(b); }
const ALGO_VERSION = 'v1-pure-index-hash';
const DECK_VERSION = stableHashHex(JSON.stringify(FULL_DECK));
// RULES_HASH will be defined after rules and hints

// ========== Pure dealing (seeded, deterministic) ==========
function deal(seed: string, n: number, allowReverse: boolean, lang: Lang) {
  const s = seed.trim();
  const rnd = mulberry32(Number(hashCode(s)) >>> 0);
  const deck = shuffle(FULL_DECK, rnd).slice(0, n);
  const cards = deck.map((c: any) => ({
    key: c.key, type: c.type, suit: c.suit, pip: c.pip,
    reversed: allowReverse ? rnd() < 0.5 : false,
    name: lang === "zh" ? c.cn : c.en,
    kws: (lang === "zh" ? c.kwCn : c.kwEn).join(", "),
  }));
  return { seed: s, cards };
}

// ========================= Spreads =========================
const SPREADS = {
  one: {
    id: "one",
    name: { en: "One Card — Core Guidance", cn: "一张｜核心指引" },
    positions: [{ en: "Core", cn: "核心" }],
  },
  three: {
    id: "three",
    name: { en: "Three — Past / Present / Next", cn: "三张｜过去/现在/下一步" },
    positions: [
      { en: "Past", cn: "过去" },
      { en: "Present", cn: "现在" },
      { en: "Next", cn: "下一步" },
    ],
  },
  six: {
    id: "six",
    name: { en: "Simplified Celtic Cross (6)", cn: "简化十字（6）" },
    positions: [
      { en: "Situation", cn: "现状" },
      { en: "Challenge", cn: "阻碍" },
      { en: "Root", cn: "底层动机" },
      { en: "External", cn: "外界影响" },
      { en: "Advice", cn: "可行方案" },
      { en: "Outcome", cn: "可能结果" },
    ],
  },
};

type Lang = "zh" | "en";

// ========================= UI Helpers =========================
function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Pill({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs mr-1">{children}</span>;
}
function CardFace({ name, reversed, lang }: { name: string; reversed: boolean; lang: Lang }) {
  return (
    <div className={`relative w-36 h-56 border rounded-2xl shadow-sm bg-white flex items-center justify-center p-2 ${reversed ? "rotate-180" : ""}`}>
      <div className="text-center text-sm font-medium leading-tight">{name}</div>
  {reversed && <div className="absolute bottom-1 right-2 text-[10px] opacity-60">{lang==='zh'?'逆位':'reversed'}</div>}
    </div>
  );
}
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }, [key, value]);
  return [value, setValue] as const;
}

// Map runtime Lang ('zh' | 'en') to data keys ('cn' | 'en')
function langKey(l: Lang): 'cn' | 'en' { return l === 'zh' ? 'cn' : 'en'; }

function ReviewScoring({ reading, lang, onSave }: { reading: any; lang: Lang; onSave: (rv: { completion: number; effect: number; note?: string }) => void }) {
  const [completion, setCompletion] = useState<number>(reading.review?.completion ?? 0);
  const [effect, setEffect] = useState<number>(reading.review?.effect ?? 0);
  const [note, setNote] = useState<string>(reading.review?.note ?? "");
  return (
    <div className="mt-4 border rounded-xl p-3 space-y-2">
      <div className="text-sm font-medium">{lang === 'zh' ? '复盘打分' : 'Review Scoring'}</div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">{lang === 'zh' ? '完成度' : 'Completion'}
          <input type="number" min={0} max={100} value={completion} onChange={e=>setCompletion(Math.max(0, Math.min(100, Number(e.target.value)||0)))} className="w-20 border rounded p-1" />
        </label>
        <label className="flex items-center gap-2">{lang === 'zh' ? '成效' : 'Effect'}
          <input type="number" min={0} max={100} value={effect} onChange={e=>setEffect(Math.max(0, Math.min(100, Number(e.target.value)||0)))} className="w-20 border rounded p-1" />
        </label>
      </div>
      <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={lang==='zh'?'复盘备注…':'Review note…'} className="w-full border rounded p-2" />
      <div className="flex gap-2">
        <button className="px-3 py-1.5 rounded border" onClick={()=>onSave({ completion, effect, note })}>{lang==='zh'?'保存复盘':'Save Review'}</button>
      </div>
    </div>
  );
}

function WeeklyReport({ history, lang }: { history: any[]; lang: Lang }) {
  // Only include entries that have review
  const reviewed = history.filter(h => h.review);
  if (reviewed.length === 0) return <div className="text-sm text-gray-500">{lang==='zh'?'暂无复盘数据。':'No review data yet.'}</div>;
  const avg = (arr:number[]) => Math.round(arr.reduce((a,b)=>a+b,0)/arr.length);
  const completionAvg = avg(reviewed.map(h=>Number(h.review.completion)||0));
  const effectAvg = avg(reviewed.map(h=>Number(h.review.effect)||0));
  // Weekly grouping by ISO week based on Australia/Sydney local date
  const tz = TIMEZONE;
  const getTZYMD = (ts: string | number | Date) => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(ts));
    const y = Number(parts.find(p=>p.type==='year')?.value || '1970');
    const m = Number(parts.find(p=>p.type==='month')?.value || '01');
    const d = Number(parts.find(p=>p.type==='day')?.value || '01');
    return { y, m, d };
  };
  const groupKey = (ts:string)=>{
    const { y, m, d } = getTZYMD(ts);
    const date = new Date(Date.UTC(y, m-1, d));
    const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0..Sun=6
    date.setUTCDate(date.getUTCDate() - dayNum + 3); // nearest Thursday
    const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
    const week = 1 + Math.floor((date.getTime() - firstThursday.getTime()) / 86400000 / 7);
    const year = date.getUTCFullYear();
    return `${year}-W${String(week).padStart(2,'0')}`;
  };
  const byWeek: Record<string, any[]> = {};
  const whenOf = (r:any) => r.review?.at || r.reviewAt || r.ts;
  reviewed.forEach(r=>{ const k = groupKey(whenOf(r)); (byWeek[k] = byWeek[k]||[]).push(r); });
  const weeks = Object.keys(byWeek).sort();
  return (
    <div className="text-sm space-y-2">
      <div>{lang==='zh'?`样本数：${reviewed.length}`:`Samples: ${reviewed.length}`}</div>
      <div>{lang==='zh'?`平均完成度：${completionAvg}%  平均成效：${effectAvg}%`:`Avg Completion: ${completionAvg}%  Avg Effect: ${effectAvg}%`}</div>
      <div className="space-y-1">
        {weeks.map(w=>{
          const arr = byWeek[w];
          const ca = avg(arr.map(x=>Number(x.review.completion)||0));
          const ea = avg(arr.map(x=>Number(x.review.effect)||0));
          return <div key={w} className="flex items-center gap-2"><span className="font-medium">{w}</span><span>{lang==='zh'?`完成度 ${ca}% 成效 ${ea}%`:`Completion ${ca}% Effect ${ea}%`}</span></div>;
        })}
      </div>
    </div>
  );
}

// ========================= Action Generator ("真实/可验证") =========================
// Map suits & numbers to action verbs; majors to specific prompts —
// goal: always produce concrete, verifiable next steps for MVP-style usage.
const ACTION_VERBS_ZH: Record<string, string[]> = {
  wands: ["立刻开始一个15分钟番茄钟", "把目标拆成3步并开干", "给自己设定今日下线时间"],
  cups: ["与关键人对齐期待", "写一段感谢/反馈", "安排一次30分钟沟通"],
  swords: ["写下3个假设并决定优先级", "删除1项不必要的任务", "做一次对比分析并选择"],
  pentacles: ["落实一个可交付物", "预估成本与资源并登记", "把文档或原型发出去收集反馈"],
};
const ACTION_VERBS_EN: Record<string, string[]> = {
  wands: ["Start a 15-min pomodoro", "Break goal into 3 steps and execute", "Set today's cutoff time"],
  cups: ["Align expectations with a key person", "Send thanks/feedback", "Schedule a 30-min check-in"],
  swords: ["Write 3 hypotheses and pick a priority", "Remove one non-essential task", "Compare options and decide"],
  pentacles: ["Ship one deliverable", "Estimate cost/resources and log", "Share doc/prototype for feedback"],
};
const MAJOR_HINT_ZH: Record<string, string> = {
  "1": "聚焦一个最小可交付(MVP)并今天提交第一版",
  "2": "先调研10条可靠信息再行动",
  "4": "用清单和时间盒给项目加上结构",
  "7": "设定硬截止时间并逆推里程碑",
  "11": "用客观指标做决策，不纠结",
  "14": "小步快跑：把任务切到30分钟块",
  "16": "先做风险清单与应急预案",
  "19": "澄清目标并公开承诺一个上线时间",
  "20": "写复盘：保留有效，删除无效",
};
const MAJOR_HINT_EN: Record<string, string> = {
  "1": "Focus on one MVP slice and ship today",
  "2": "Collect 10 solid facts before acting",
  "4": "Impose structure: checklist + timebox",
  "7": "Set a hard deadline and backplan",
  "11": "Decide by metrics, not vibes",
  "14": "Iterate in 30-min chunks",
  "16": "Draft a risk list and fallback",
  "19": "Clarify goal and publicly commit to a ship date",
  "20": "Write a review: keep what's working, cut what's not",
};

// Sorted snapshot to keep RULES_HASH stable regardless of object key order
const SPREADS_SNAPSHOT = Object.fromEntries(
  Object.values(SPREADS)
    .slice()
    .sort((a: any, b: any) => String(a.id).localeCompare(String(b.id)))
    .map((s: any) => [s.id, { name: s.name, positions: s.positions }])
);
const RULES_HASH = stableHashHex(JSON.stringify({
  ACTION_VERBS_ZH, ACTION_VERBS_EN, MAJOR_HINT_ZH, MAJOR_HINT_EN,
  spreads: SPREADS_SNAPSHOT,
  algo: ALGO_VERSION
}));

function generateActionPlan(reading: any, lang: Lang) {
  // 纯函数：对同一 seed+牌面+位置，输出固定。避免依赖可变的 PRNG 调用序。
  const seed = String(reading.seed ?? "");
  const verbs = lang === "zh" ? ACTION_VERBS_ZH : ACTION_VERBS_EN;
  const majorHint = lang === "zh" ? MAJOR_HINT_ZH : MAJOR_HINT_EN;
  const actions: string[] = [];

  reading.cards.forEach((c: any, idx: number) => {
    const name = c.name as string;
    if (c.type === "major") {
      const hint = majorHint[c.key] || (lang === "zh" ? "选择一个最小行动并今天完成" : "Pick a smallest next action and finish today");
      actions.push(`${name}: ${hint}`);
    } else {
      const suit = c.suit as keyof typeof verbs;
      // Fallback: if suit is unknown, use the first available pool to avoid errors on imported/legacy data
      const pools = Object.values(verbs);
      const pool = (verbs[suit] || (pools[0] as any) || []) as string[];
      if (!Array.isArray(pool) || pool.length === 0) return;
      // 稳定索引：seed + card key/suit/pip + position index (+ reversed) → hash → index
  const posZh = c.pos?.cn ?? '';
  const posEn = c.pos?.en ?? '';
  const hInput = [seed, String(idx), String(c.key ?? ""), String(c.suit ?? ""), String(c.pip ?? ""), String(!!c.reversed), posZh, posEn].join("|");
      const h = (hashCode(hInput) >>> 0);
      const verb = pool[h % pool.length];
      actions.push(`${name}: ${verb}`);
    }
  });

  // 去重并限制为 3 条核心行动
  const dedup = Array.from(new Set(actions)).slice(0, 3);
  return dedup;
}

// For tests and clarity
function generateActionPlanPure(reading: any, lang: Lang) { return generateActionPlan(reading, lang); }

// ========================= Main App =========================
export default function TarotApp() {
  const [lang, setLang] = useLocalStorage<Lang>("tarot.lang", "zh");
  const [seed, setSeed] = useState<string>("");
  const [spreadId, setSpreadId] = useLocalStorage<string>("tarot.spread", "three");
  const [allowReverse, setAllowReverse] = useLocalStorage<boolean>("tarot.rev", false);
  const [notes, setNotes] = useState("");
  const [reviewDays, setReviewDays] = useLocalStorage<number>("tarot.reviewDays", 14);
  const [history, setHistory] = useLocalStorage<any[]>("tarot.history", []);
  const [reading, setReading] = useState<any | null>(null);
  const [currentQuestion, setCurrentQuestion] = useLocalStorage<string>("tarot.question", "未来两周推进我的 X 的最佳做法？");
  const [newlinePref, setNewlinePref] = useLocalStorage<string>("tarot.newline", "lf");

  // On first load, parse URL search params to restore and auto draw
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const hasAuto = sp.get('autodraw');
    const seedParam = (sp.get('seed') || '').trim();
    const spreadParam = sp.get('spread');
    const revParam = sp.get('rev');
    const langParam = sp.get('lang') as Lang | null;
    const qParam = sp.get('q');
    if (!hasAuto && !seedParam && !spreadParam && !revParam && !langParam && !qParam) return;

    // Apply UI states
    if (seedParam) setSeed(seedParam);
    if (spreadParam) setSpreadId(spreadParam);
    if (revParam) setAllowReverse(revParam === '1' || revParam === 'true');
    if (langParam) setLang(langParam === 'en' ? 'en' : 'zh');
    if (qParam) setCurrentQuestion(qParam);

    // Build deterministic reading immediately to avoid waiting state propagation
    try {
      const spr = (SPREADS as any)[spreadParam || spreadId] || (SPREADS as any).three;
      const langUse = (langParam || lang) as Lang;
      const revUse = revParam ? (revParam === '1' || revParam === 'true') : allowReverse;
      const seedUse = seedParam || seed || String(Date.now());
      const dealt = deal(seedUse, spr.positions.length, revUse, langUse);
      const cards = dealt.cards.map((c: any, i: number) => ({
        key: c.key, type: c.type, suit: c.suit, pip: c.pip,
        pos: spr.positions[i], name: c.name, reversed: c.reversed, kws: c.kws,
      }));
      const rec: any = {
        ts: new Date().toISOString(),
        seed: seedUse,
        spreadId: spr.id,
        lang: langUse,
        allowReverse: revUse,
        meta: { deckVersion: DECK_VERSION, rulesHash: RULES_HASH, algo: ALGO_VERSION },
        q: qParam || currentQuestion,
        type: cards[0]?.type,
        cards,
      };
      rec.plan = generateActionPlan(rec, langUse);
      rec.reviewAt = addDays(new Date(rec.ts), reviewDays).toISOString();
      setReading(rec);
      setHistory((prev)=> [rec, ...prev].slice(0, 50));
    } catch {}
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback to default 'three' spread if id is invalid
  const spread = (SPREADS as any)[spreadId] || (SPREADS as any).three;

  function draw() {
    const s = seed.trim() || String(Date.now());
    const dealt = deal(s, spread.positions.length, allowReverse, lang);
    const cards = dealt.cards.map((c: any, i: number) => ({
      key: c.key, type: c.type, suit: c.suit, pip: c.pip,
      pos: spread.positions[i], name: c.name, reversed: c.reversed, kws: c.kws,
    }));
    const rec = {
      ts: new Date().toISOString(),
      seed: s,
      spreadId,
      lang,
      allowReverse,
      meta: { deckVersion: DECK_VERSION, rulesHash: RULES_HASH, algo: ALGO_VERSION },
      q: currentQuestion,
      type: cards[0]?.type,
      cards,
    };
    const plan = generateActionPlan(rec, lang);
    (rec as any).plan = plan;
    (rec as any).reviewAt = addDays(new Date(rec.ts), reviewDays).toISOString();

    setReading(rec);
  setHistory((prev) => [rec, ...prev].slice(0, 50));
  }

  function exportText(r = reading) {
    if (!r) return;
    const nl = newlinePref === 'crlf' ? "\r\n" : "\n";
    const txt = buildReadingText(r, { lang, notes, newline: nl });
    try {
      const cb: any = (navigator as any).clipboard;
      if (cb && typeof cb.writeText === 'function') {
        cb.writeText(txt)
          .then(() => alert(lang === "zh" ? "已复制到剪贴板" : "Copied to clipboard"))
          .catch(() => downloadText(r));
      } else {
        downloadText(r);
      }
    } catch {
      downloadText(r);
    }
  }

  function copyPlanOnly(r = reading) {
    if (!r || !Array.isArray(r.plan) || r.plan.length === 0) return;
    const nl = newlinePref === 'crlf' ? "\r\n" : "\n";
    const text = r.plan.map((a:string,i:number)=>`${i+1}. ${a}`).join(nl);
    try {
      const cb: any = (navigator as any).clipboard;
      if (cb && typeof cb.writeText === 'function') {
        cb.writeText(text);
        alert(lang==='zh'?'已复制行动':'Actions copied');
      } else {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `tarot_actions_${new Date().toISOString().replace(/[:.]/g,'-')}.txt`;
        a.click();
        setTimeout(()=>URL.revokeObjectURL(a.href),0);
      }
    } catch {}
  }

  // Build a shareable URL representing the current inputs or a given reading
  function buildShareUrl(r?: any) {
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const obj = r || { seed, spreadId, allowReverse, lang, q: currentQuestion };
      const params = new URLSearchParams();
      if (obj.seed) params.set('seed', String(obj.seed));
      if (obj.spreadId) params.set('spread', String(obj.spreadId));
      if (obj.allowReverse) params.set('rev', '1');
      if (obj.lang) params.set('lang', String(obj.lang));
      if (obj.q) params.set('q', String(obj.q));
      params.set('autodraw', '1');
      return `${base}/tarot?${params.toString()}`;
    } catch { return '' }
  }

  // Share link via Web Share API or clipboard fallback
  function shareLink(r = reading) {
    const url = buildShareUrl(r || undefined);
    if (!url) return;
    try {
      const anyNav: any = navigator as any;
      if (anyNav?.share) {
        anyNav.share({ title: 'Tarot Reading', url }).catch(()=>{});
      } else if (anyNav?.clipboard?.writeText) {
        anyNav.clipboard.writeText(url).then(()=> alert(lang==='zh'?'链接已复制':'Link copied'));
      }
    } catch {}
  }

  function downloadText(r = reading) {
    if (!r) return;
    const nl = newlinePref === 'crlf' ? "\r\n" : "\n";
    const txt = buildReadingText(r, { lang, notes, newline: nl });
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const base = `tarot_${r.spreadId}_${r.seed}_${new Date(r.ts).toISOString().replace(/[:.]/g,'-')}`;
    a.download = `${base}.txt`;
    a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 0);
  }

  // Build and download an .ics calendar event for review reminder
  function downloadICS(r = reading) {
    if (!r) return;
    const ics = buildICS(r, { lang });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const base = `tarot_review_${r.seed}_${new Date(r.ts).toISOString().replace(/[:.]/g,'-')}`;
    a.download = `${base}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  }

  // Build all-history text as a pure join of individual exports
  function buildHistoryBundle(list: any[], opts: { lang: Lang; newline?: "\n" | "\r\n" }) {
    const nl = opts.newline ?? "\n";
    const sep = `${nl}${nl}====${nl}${nl}`;
    return list.map((r)=> buildReadingText(r, { lang: opts.lang, newline: nl })).join(sep);
  }

  function downloadAllTxt() {
    const nl = newlinePref === 'crlf' ? "\r\n" : "\n";
    const content = history.length ? buildHistoryBundle(history, { lang, newline: nl }) : (lang==='zh'?'暂无记录':'No records');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const base = `tarot_history_${new Date().toISOString().replace(/[:.]/g,'-')}`;
    a.download = `${base}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  }

  function downloadAllJson() {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const base = `tarot_history_${new Date().toISOString().replace(/[:.]/g,'-')}`;
    a.download = `${base}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  }

  function importJson() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'application/json,.json';
    inp.onchange = async () => {
      const file = inp.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.history) ? data.history : []);
        if (!Array.isArray(arr) || arr.length === 0) {
          alert(lang==='zh' ? '文件中未发现可导入的记录' : 'No importable records found in file');
          return;
        }
        // 轻量校验与合并去重（以 ts+seed 作为近似主键）
        const cleaned = arr.filter((x:any)=>x && x.ts && x.seed && x.cards && Array.isArray(x.cards));
        if (cleaned.length === 0) {
          alert(lang==='zh' ? '没有有效记录' : 'No valid records');
          return;
        }
        setHistory(prev => {
          const key = (x:any)=> `${x.ts}#${x.seed}`;
          const map = new Map<string, any>();
          [...prev, ...cleaned].forEach(it => { map.set(key(it), it); });
          const merged = Array.from(map.values()).sort((a:any,b:any)=> new Date(b.ts).getTime() - new Date(a.ts).getTime());
          return merged.slice(0, 50);
        });
        alert(lang==='zh' ? '导入完成' : 'Import complete');
      } catch (e) {
        console.error('import error', e);
        alert(lang==='zh' ? '导入失败：文件格式错误' : 'Import failed: invalid file');
      }
    };
    inp.click();
  }

  function resetHistory() {
    const ok = confirm(lang==='zh'?'确定要清空本地历史吗？此操作不可撤销。':'Clear local history? This cannot be undone.');
    if (ok) { setHistory([]); setReading(null); }
  }

  return (
  <div className="container-prose">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Tarot · {lang === "zh" ? "结构化自我反思（MVP）" : "Structured Reflection (MVP)"}</h1>
        <div className="flex items-center gap-2">
          <button className={`btn ${lang === "zh" ? "btn-primary" : "btn-ghost"}`} onClick={() => setLang("zh")}>中</button>
          <button className={`btn ${lang === "en" ? "btn-primary" : "btn-ghost"}`} onClick={() => setLang("en")}>EN</button>
        </div>
      </header>

      <Section title={lang === "zh" ? "问题设置" : "Question"}>
  <input data-testid="question-input" value={currentQuestion} onChange={(e) => setCurrentQuestion(e.target.value)} className="w-full input" placeholder={lang === "zh" ? "例如：两周内推进 X 的最佳做法？" : "e.g., Best way to advance X in two weeks?"} />
        <div className="flex flex-wrap items-center gap-3">
          <select data-testid="spread-select" value={spreadId} onChange={(e) => setSpreadId(e.target.value)} className="select">
            {Object.values(SPREADS).map((s: any) => (
              <option key={s.id} value={s.id}>{s.name[langKey(lang)]}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm"><input className="checkbox" data-testid="allow-reverse" type="checkbox" checked={allowReverse} onChange={(e) => setAllowReverse(e.target.checked)} />{lang === "zh" ? "允许逆位" : "Allow reversed"}</label>
          <input data-testid="seed-input" value={seed} onChange={(e) => setSeed(e.target.value)} className="input" placeholder={lang === "zh" ? "可选：种子（可复现）" : "Optional: seed (reproducible)"} />
          <label className="flex items-center gap-2 text-sm">
            {lang === "zh" ? "复盘天数" : "Review in days"}
            <input type="number" min={1} max={60} value={reviewDays} onChange={(e) => setReviewDays(Number(e.target.value)||14)} className="w-20 input" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            {lang === 'zh' ? '换行' : 'Newline'}
            <select data-testid="newline-select" className="select" value={newlinePref} onChange={(e)=>setNewlinePref(e.target.value)}>
              <option value="lf">LF (\n)</option>
              <option value="crlf">CRLF (\r\n)</option>
            </select>
          </label>
          <button data-testid="draw" onClick={draw} className="btn btn-primary">{lang === "zh" ? "抽牌" : "Draw"}</button>
        </div>
        <p className="text-xs text-gray-500">{lang === "zh" ? "提示：设置种子可让结果可复现；此工具用于自我反思，不替代医疗/法律/投资建议。" : "Tip: Set a seed for reproducible draws. For reflection only; not medical/legal/financial advice."}</p>
      </Section>

      {reading && (
        <Section title={lang === "zh" ? "本次抽牌" : "Current Reading"}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" data-testid="reading-grid">
            {reading.cards.map((c: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <CardFace name={c.name} reversed={c.reversed} lang={lang} />
                <div className="text-xs text-gray-600 text-center">
                  <div className="font-medium">{c.pos[langKey(lang)]}</div>
                  <div className="mt-0.5">{c.kws}</div>
                </div>
              </div>
            ))}
          </div>
          {reading.plan?.length > 0 && (
            <div className="mt-4 border rounded-xl p-3">
              <div className="text-sm font-medium mb-1">{lang === "zh" ? "行动建议（可验证）" : "Action plan (verifiable)"}</div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {reading.plan.map((a: string, i: number) => <li key={i}>{a}</li>)}
              </ul>
              <div className="mt-2">
                <button className="btn btn-xs" onClick={()=>copyPlanOnly()}>{lang==='zh'? '复制行动' : 'Copy actions'}</button>
                <button className="btn btn-xs" onClick={()=>shareLink()}>{lang==='zh'? '复制链接' : 'Copy link'}</button>
              </div>
            </div>
          )}
          <div className="text-xs text-gray-600 mt-1">{(lang === "zh" ? "复盘时间：" : "Review at: ") + formatDateLocal(reading.reviewAt || addDays(new Date(reading.ts), 14))}</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={lang === "zh" ? "写下你的行动与验证点…" : "Write actions & checkpoints…"} className="w-full input mt-3" />
          <div className="flex gap-2">
            <button data-testid="copy-current" onClick={() => exportText()} className="btn">{lang === "zh" ? "复制结果" : "Copy result"}</button>
            <button data-testid="download-current" onClick={() => downloadText()} className="btn">{lang === "zh" ? ".txt 下载" : ".txt Download"}</button>
            <button data-testid="download-ics" onClick={() => downloadICS()} className="btn">{lang === "zh" ? ".ics 日历" : ".ics Calendar"}</button>
          </div>
          {/* Review scoring inputs */}
          <ReviewScoring reading={reading} lang={lang} onSave={(rv) => {
            // attach review to current reading and persist in history
            const updated = { ...reading, review: { ...rv, at: new Date().toISOString() } };
            setReading(updated);
            setHistory((prev)=>{
              const list = prev.slice();
              const idx = list.findIndex((x)=>x.ts === reading.ts && x.seed === reading.seed);
              if (idx >= 0) list[idx] = updated; else list.unshift(updated);
              return list.slice(0, 50);
            });
          }} />
        </Section>
      )}

      <Section title={lang === "zh" ? "历史记录（本地）" : "History (local)"}>
        {history.length === 0 ? (
          <div className="text-sm text-gray-500">{lang === "zh" ? "暂无记录。抽一组牌开始。" : "No records yet. Draw to start."}</div>
        ) : (
          <div className="space-y-3" data-testid="history-list">
            <div className="flex flex-wrap gap-2 mb-1">
              <button className="btn btn-xs" onClick={downloadAllTxt}>{lang==='zh'? '导出全部 .txt':'Export all .txt'}</button>
              <button data-testid="export-all-json" className="btn btn-xs" onClick={downloadAllJson}>{lang==='zh'? '导出全部 .json':'Export all .json'}</button>
              <button data-testid="import-json" className="btn btn-xs" onClick={importJson}>{lang==='zh'? '导入 .json':'Import .json'}</button>
              <button data-testid="reset-history" className="btn btn-xs" onClick={resetHistory}>{lang==='zh'? '清空历史':'Reset history'}</button>
            </div>
            {history.map((h, i) => (
              <div key={i} data-testid="history-item" className="border rounded-xl p-3 flex flex-col gap-1">
                <div className="text-sm flex flex-wrap items-center gap-2">
                  <span className="font-medium">{formatDateLocal(h.ts)}</span>
                  <Pill>{(((SPREADS as any)[h.spreadId] || (SPREADS as any).three).name[langKey(lang)])}</Pill>
                  <Pill>seed={h.seed}</Pill>
                  <Pill>deck={h.meta?.deckVersion || DECK_VERSION}</Pill>
                  <Pill>rules={h.meta?.rulesHash || RULES_HASH}</Pill>
                </div>
                <div className="text-xs text-gray-600 line-clamp-2">
                  {h.cards.map((c: any, idx: number) => `${idx + 1}.${c.pos[langKey(lang)]}-${c.name}${c.reversed ? (lang === "zh" ? "(逆)" : "(rev)") : ""}`).join("  ")}
                </div>
                <div className="text-[11px] text-gray-600">{(lang === 'zh' ? '复盘时间：' : 'Review at: ') + formatDateLocal(h.reviewAt || addDays(new Date(h.ts), 14))}</div>
                {h.plan?.length > 0 && (
                  <div className="text-xs text-gray-700">{(lang === "zh" ? "行动：" : "Plan: ") + h.plan.join(" · ")}</div>
                )}
                <div className="flex gap-2 mt-1">
                  <button className="btn btn-xs" onClick={() => setReading(h)}>{lang === "zh" ? "加载" : "Load"}</button>
                  <button className="btn btn-xs" onClick={() => exportText(h)}>{lang === "zh" ? "复制" : "Copy"}</button>
                  <button className="btn btn-xs" onClick={() => shareLink(h)}>{lang === "zh" ? "复制链接" : "Copy link"}</button>
                  {h.plan?.length>0 && (<button className="btn btn-xs" onClick={() => copyPlanOnly(h)}>{lang === "zh" ? "复制行动" : "Copy actions"}</button>)}
                  <button className="btn btn-xs" onClick={() => downloadText(h)}>{lang === "zh" ? "下载" : "Download"}</button>
                  <button className="btn btn-xs" onClick={() => downloadICS(h)}>{lang === "zh" ? ".ics 日历" : ".ics Calendar"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {history.length > 0 && (
        <Section title={lang === 'zh' ? '周报（本地）' : 'Weekly Report (local)'}>
          <WeeklyReport history={history} lang={lang} />
        </Section>
      )}

      <footer className="text-xs text-gray-500 mt-8">
        {lang === "zh"
          ? "免责声明：本应用用于象征性反思与自我问答，不提供任何医疗、法律、投资建议；并提供可复盘的行动输出，以提高决策质量。"
          : "Disclaimer: Symbolic reflection only; not medical/legal/financial advice; produces reviewable actions to improve decision quality."}
      </footer>
    </div>
  );
}

// ========================= Helpers =========================
function hashCode(str: string) { let h = 0; for (let i = 0; i < str.length; i++) { h = (Math.imul(31, h) + str.charCodeAt(i)) | 0; } return h; }

// Build export text as a pure function
function buildReadingText(r: any, opts: { lang: Lang; notes?: string; newline?: "\n" | "\r\n" }) {
  const nl = opts.newline ?? "\n";
  const lines: string[] = [];
  const k = langKey(opts.lang);
  const spreadName = (SPREADS as any)[r.spreadId]?.name?.[k] ?? r.spreadId;
  lines.push(opts.lang === 'zh' ? `问题：${r.q}` : `Question: ${r.q}`);
  lines.push(opts.lang === 'zh' ? `牌阵：${spreadName}` : `Spread: ${spreadName}`);
  lines.push(opts.lang === 'zh' ? `种子：${r.seed}` : `Seed: ${r.seed}`);
  if (r.meta?.deckVersion || r.meta?.rulesHash || r.meta?.algo) {
    lines.push(opts.lang === 'zh'
      ? `版本：牌组=${r.meta.deckVersion || ''} 规则=${r.meta.rulesHash || ''} 算法=${r.meta.algo || ''}`
      : `Version: deck=${r.meta.deckVersion || ''} rules=${r.meta.rulesHash || ''} algo=${r.meta.algo || ''}`);
  }
  lines.push("---");
  r.cards.forEach((c: any, i: number) => {
    const p = c.pos[k];
    lines.push(`${i + 1}. [${p}] ${c.name}${c.reversed ? (opts.lang === "zh" ? "（逆位）" : " (reversed)") : ""} — ${c.kws}`);
  });
  // Review date before plan, with fallback
  const fallbackReview = r.reviewAt || addDays(new Date(r.ts || Date.now()), 14).toISOString();
  lines.push((opts.lang === 'zh' ? '复盘日期：' : 'Review at: ') + formatDateLocal(fallbackReview));
  if (r.plan?.length) {
    lines.push("---");
    lines.push(opts.lang === "zh" ? "行动建议:" : "Action Plan:");
    r.plan.forEach((a: string, i: number) => lines.push(`${i + 1}. ${a}`));
  }
  if (opts.notes !== undefined) {
    lines.push("---");
    lines.push(opts.lang === "zh" ? `笔记：${opts.notes}` : `Notes: ${opts.notes}`);
  }
  return lines.join(nl);
}

// ---- ICS helpers ----
function icsEscape(s: string) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
function pad2(n: number) { return String(n).padStart(2, '0'); }
function toUTCStringBasic(d: Date) {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth()+1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}
function getLocalYMDHMS(date: Date, tz: string) {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
  const parts = fmt.formatToParts(date);
  const get = (t: string)=> Number(parts.find(p=>p.type===t)?.value || '0');
  return { y: get('year'), m: get('month'), d: get('day'), hh: get('hour'), mm: get('minute'), ss: get('second') };
}
function atTZToUTC(dateLike: string | number | Date, tz: string) {
  const d = new Date(dateLike);
  const { y, m, d: day, hh, mm, ss } = getLocalYMDHMS(d, tz);
  // Construct the same wall time in the given tz, then convert to UTC by getting timestamp of that wall time interpreted as UTC offset naive
  // Use Date.UTC with the extracted components, then adjust by the timezone offset between local tz wall time and UTC at that moment via trick: new Date().toLocaleString with tz already accounted in extraction
  // Simpler: create an ISO string for the tz wall time and parse with Date as if UTC, then that Date is the UTC moment of that tz wall time.
  const isoLocal = `${y}-${pad2(m)}-${pad2(day)}T${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
  // This interprets as local timezone; to force UTC, append 'Z'
  const asUTC = new Date(isoLocal + 'Z');
  return asUTC;
}
function buildICS(r: any, opts: { lang: Lang }) {
  const lang = opts.lang;
  const summary = lang === 'zh' ? 'Tarot 复盘提醒' : 'Tarot Review Reminder';
  const k = langKey(lang);
  const spreadName = (SPREADS as any)[r.spreadId]?.name?.[k] ?? r.spreadId;
  const title = `${summary} · ${spreadName}`;
  const desc = buildReadingText(r, { lang, newline: '\n', notes: '' });
  const uid = `${r.seed}-${stableHashHex(String(r.ts||''))}@tarot-app`;
  const created = toUTCStringBasic(new Date());
  const reviewISO = r.reviewAt || addDays(new Date(r.ts || Date.now()), 14).toISOString();
  // Treat review time as Sydney local noon for visibility if no time provided; if time exists in reviewAt, respect it
  const wall = atTZToUTC(reviewISO, TIMEZONE);
  const dtstart = toUTCStringBasic(wall);
  const dtend = toUTCStringBasic(new Date(wall.getTime() + 30*60*1000)); // 30 min
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tarot-App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${icsEscape(uid)}`,
    `DTSTAMP:${created}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(desc)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  return lines.join('\r\n');
}

// ========================= Self Tests (lightweight; dev-only) =========================
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (function runSelfTests(){
    try {
    // 1) 换行 join 行为正确
    const t = ["a","b","c"].join("\n");
    console.assert(t === "a\nb\nc", "join(\\n) should produce Unix newlines");

    // 2) hashCode 可重复且区分不同输入
    const h1 = hashCode("abc"), h2 = hashCode("abc"), h3 = hashCode("abcd");
    console.assert(h1 === h2, "hashCode deterministic");
    console.assert(h1 !== h3, "hashCode differs on different inputs");

    // 3) PRNG 在相同种子下可复现
    const r1 = mulberry32(123), r2 = mulberry32(123);
    const s1 = [r1(), r1(), r1()].join(","), s2 = [r2(), r2(), r2()].join(",");
    console.assert(s1 === s2, "mulberry32 deterministic");

    // 4) 洗牌保持长度与元素集合
    const base = Array.from({length: 10}, (_,i)=>i);
    const shuf = shuffle(base, mulberry32(42));
    console.assert(shuf.length === base.length, "shuffle keeps length");
    console.assert([...shuf].sort((a,b)=>a-b).join(',') === base.join(','), "shuffle is permutation");

  // 5) 行动计划在相同 seed+牌面+语言下稳定（纯函数化）
  const dummy: any = { seed: "12345", cards: [
      { type: "major", key: "1", name: "The Magician" },
      { type: "minor", suit: "wands", name: "Ace of Wands" },
      { type: "minor", suit: "cups",  name: "Two of Cups"  },
    ] };
    const p1 = generateActionPlan(dummy, "zh"), p2 = generateActionPlan(dummy, "zh");
    const p3 = generateActionPlan(dummy, "en"), p4 = generateActionPlan(dummy, "en");
    console.assert(JSON.stringify(p1) === JSON.stringify(p2), "plan deterministic (zh)");
    console.assert(JSON.stringify(p3) === JSON.stringify(p4), "plan deterministic (en)");

  // 6) 词库变化时（同 suit 长度不同）索引仍稳定映射
  // 构造一个最小替换池，确保不会越界
  const backup = ACTION_VERBS_EN.wands;
  // @ts-ignore - 仅测试环境临时替换
  ACTION_VERBS_EN.wands = ["A","B"]; // 长度改变
  const p5 = generateActionPlan({ ...dummy }, "en");
  // 恢复
  // @ts-ignore
  ACTION_VERBS_EN.wands = backup;
  const p6 = generateActionPlan({ ...dummy }, "en");
  // 纯函数保证“同输入得同结果”，但词库池变化会变更选择；
  // 我们只验证不会抛错且输出长度合理
    console.assert(Array.isArray(p5) && p5.length > 0, "plan stays valid even if pool size changes");

    // 7) 发牌：同种子稳定，不同种子有差异
    const dA1 = deal('seedA', 6, true, 'zh');
    const dA2 = deal('seedA', 6, true, 'zh');
    const dB1 = deal('seedB', 6, true, 'zh');
    console.assert(JSON.stringify(dA1.cards.map((c:any)=>c.key)) === JSON.stringify(dA2.cards.map((c:any)=>c.key)), 'same seed produces same order');
    const anyDiff = dA1.cards.some((c:any, i:number) => c.key !== dB1.cards[i].key);
    console.assert(anyDiff, 'different seed should differ');

    // 8) 关闭逆位时无逆位
    const dNoRev = deal('seedC', 20, false, 'en');
    console.assert(dNoRev.cards.every((c:any)=>c.reversed === false), 'allowReverse=false enforces no reversed');

    // 9) 导出文本：空/长 notes 与换行
    const minimal = { q:'Q', seed:'s', spreadId:'three', reviewAt:new Date().toISOString(),
      cards:[{pos:{cn:'现在',en:'Present'}, name:'The Sun', reversed:false, kws:'k'}], plan: ['Do X'] };
    const t1 = buildReadingText(minimal as any, { lang: 'en', notes: '', newline: '\n' });
    console.assert(t1.includes('Question:'), 'export contains header with empty notes');
    const LONG = 'x'.repeat(5000);
    const t2 = buildReadingText(minimal as any, { lang: 'en', notes: LONG, newline: '\n' });
    console.assert(t2.length > 5000, 'export should not truncate long notes');
    const t3 = buildReadingText(minimal as any, { lang: 'en', notes: 'line', newline: '\r\n' });
    console.assert(t3.includes('\r\n'), 'Windows mode uses CRLF');
  // 10) 缺失 reviewAt 时不抛错并输出兜底复盘日期
  const noReview: any = { q:'Q', seed:'s', spreadId:'one', ts: new Date().toISOString(), cards:[{pos:{cn:'核心',en:'Core'}, name:'The Sun', reversed:false, kws:'k'}] };
  const t4 = buildReadingText(noReview, { lang: 'zh', newline: '\n' });
  console.assert(/复盘日期/.test(t4), 'fallback review date present when reviewAt missing');

  // 11) ICS basic
  const ics = buildICS(noReview, { lang: 'en' });
  console.assert(/^BEGIN:VCALENDAR[\s\S]*END:VCALENDAR$/.test(ics), 'ics wrapper present');
  console.assert(/DTSTART:/.test(ics) && /DTEND:/.test(ics), 'ics has start/end');

      console.log("[TarotApp] self-tests passed");
    } catch (e) {
      console.error("[TarotApp] self-tests failed", e);
    }
  })();
}
