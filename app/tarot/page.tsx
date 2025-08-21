import React, { useMemo, useState, useEffect } from "react";

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
function CardFace({ name, reversed }: { name: string; reversed: boolean }) {
  return (
    <div className={`relative w-36 h-56 border rounded-2xl shadow-sm bg-white flex items-center justify-center p-2 ${reversed ? "rotate-180" : ""}`}>
      <div className="text-center text-sm font-medium leading-tight">{name}</div>
      {reversed && <div className="absolute bottom-1 right-2 text-[10px] opacity-60">reversed</div>}
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

function pick<T>(arr: T[], rnd: () => number) { return arr[Math.floor(rnd() * arr.length)]; }

function generateActionPlan(reading: any, lang: Lang) {
  const seed = reading.seed || String(Date.now());
  const rnd = mulberry32(Number(hashCode(seed)) >>> 0);
  const verbs = lang === "zh" ? ACTION_VERBS_ZH : ACTION_VERBS_EN;
  const majorHint = lang === "zh" ? MAJOR_HINT_ZH : MAJOR_HINT_EN;
  const actions: string[] = [];

  for (const c of reading.cards) {
    const name = c.name as string;
    if (c.type === "major") {
      const hint = majorHint[c.key] || (lang === "zh" ? "选择一个最小行动并今天完成" : "Pick a smallest next action and finish today");
      actions.push(`${name}: ${hint}`);
    } else {
      const suit = c.suit as keyof typeof verbs;
      const verb = pick(verbs[suit], rnd);
      actions.push(`${name}: ${verb}`);
    }
  }
  // 去重并限制为 3 条核心行动
  const dedup = Array.from(new Set(actions)).slice(0, 3);
  return dedup;
}

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

  const spread = (SPREADS as any)[spreadId];

  function draw() {
    const s = seed.trim() || String(Date.now());
    const rnd = mulberry32(Number(hashCode(s)) >>> 0);
    const deck = shuffle(FULL_DECK, rnd).slice(0, spread.positions.length);
    const cards = deck.map((c: any) => ({
      ...c,
      reversed: allowReverse ? rnd() < 0.5 : false,
      name: lang === "zh" ? c.cn : c.en,
      kws: (lang === "zh" ? c.kwCn : c.kwEn).join(", "),
    }));
    const rec = {
      ts: new Date().toISOString(),
      seed: s,
      spreadId,
      lang,
      allowReverse,
      q: currentQuestion,
      type: cards[0]?.type,
      cards: cards.map((c: any, i: number) => ({
        key: c.key, type: c.type, suit: c.suit, pip: c.pip,
        pos: spread.positions[i], name: c.name, reversed: c.reversed, kws: c.kws,
      })),
    };
    const plan = generateActionPlan(rec, lang);
    (rec as any).plan = plan;
    (rec as any).reviewAt = addDays(new Date(rec.ts), reviewDays).toISOString();

    setReading(rec);
    setHistory([rec, ...history].slice(0, 50));
  }

  function exportText(r = reading) {
    if (!r) return;
    const lines = [] as string[];
    lines.push(`Question: ${r.q}`);
    lines.push(`Spread: ${(SPREADS as any)[r.spreadId].name[lang]}`);
    lines.push(`Seed: ${r.seed}`);
    lines.push("---");
    r.cards.forEach((c: any, i: number) => {
      const p = c.pos[lang];
      lines.push(`${i + 1}. [${p}] ${c.name}${c.reversed ? (lang === "zh" ? "（逆位）" : " (reversed)") : ""} — ${c.kws}`);
    });
    if (r.plan?.length) {
      lines.push("---");
      lines.push(lang === "zh" ? "行动建议:" : "Action Plan:");
      r.plan.forEach((a: string, i: number) => lines.push(`${i + 1}. ${a}`));
      lines.push((lang === "zh" ? "复盘日期: " : "Review at: ") + new Date(r.reviewAt).toLocaleString());
    }
    if (notes) {
      lines.push("---");
      lines.push(lang === "zh" ? `笔记：${notes}` : `Notes: ${notes}`);
    }
    const txt = lines.join("
");
    navigator.clipboard.writeText(txt).then(() => alert(lang === "zh" ? "已复制到剪贴板" : "Copied to clipboard"));
  }

  return (
    <div className="max-w-5xl mx-auto p-6 text-gray-800">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Tarot · {lang === "zh" ? "结构化自我反思（MVP）" : "Structured Reflection (MVP)"}</h1>
        <div className="flex items-center gap-2">
          <button className={`px-3 py-1 rounded-full border ${lang === "zh" ? "bg-black text-white" : "bg-white"}`} onClick={() => setLang("zh")}>中</button>
          <button className={`px-3 py-1 rounded-full border ${lang === "en" ? "bg-black text-white" : "bg-white"}`} onClick={() => setLang("en")}>EN</button>
        </div>
      </header>

      <Section title={lang === "zh" ? "问题设置" : "Question"}>
        <input value={currentQuestion} onChange={(e) => setCurrentQuestion(e.target.value)} className="w-full border rounded-lg p-2" placeholder={lang === "zh" ? "例如：两周内推进 X 的最佳做法？" : "e.g., Best way to advance X in two weeks?"} />
        <div className="flex flex-wrap items-center gap-3">
          <select value={spreadId} onChange={(e) => setSpreadId(e.target.value)} className="border rounded-lg p-2">
            {Object.values(SPREADS).map((s: any) => (
              <option key={s.id} value={s.id}>{s.name[lang]}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allowReverse} onChange={(e) => setAllowReverse(e.target.checked)} />{lang === "zh" ? "允许逆位" : "Allow reversed"}</label>
          <input value={seed} onChange={(e) => setSeed(e.target.value)} className="border rounded-lg p-2" placeholder={lang === "zh" ? "可选：种子（可复现）" : "Optional: seed (reproducible)"} />
          <label className="flex items-center gap-2 text-sm">
            {lang === "zh" ? "复盘天数" : "Review in days"}
            <input type="number" min={1} max={60} value={reviewDays} onChange={(e) => setReviewDays(Number(e.target.value)||14)} className="w-20 border rounded-lg p-1" />
          </label>
          <button onClick={draw} className="px-4 py-2 rounded-lg bg-black text-white">{lang === "zh" ? "抽牌" : "Draw"}</button>
        </div>
        <p className="text-xs text-gray-500">{lang === "zh" ? "提示：设置种子可让结果可复现；此工具用于自我反思，不替代医疗/法律/投资建议。" : "Tip: Set a seed for reproducible draws. For reflection only; not medical/legal/financial advice."}</p>
      </Section>

      {reading && (
        <Section title={lang === "zh" ? "本次抽牌" : "Current Reading"}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {reading.cards.map((c: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <CardFace name={c.name} reversed={c.reversed} />
                <div className="text-xs text-gray-600 text-center">
                  <div className="font-medium">{c.pos[lang]}</div>
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
              <div className="text-xs text-gray-600 mt-1">{(lang === "zh" ? "复盘时间：" : "Review at: ") + new Date(reading.reviewAt).toLocaleString()}</div>
            </div>
          )}
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={lang === "zh" ? "写下你的行动与验证点…" : "Write actions & checkpoints…"} className="w-full border rounded-lg p-2 mt-3" />
          <div className="flex gap-2">
            <button onClick={() => exportText()} className="px-3 py-1.5 rounded-lg border">{lang === "zh" ? "复制结果" : "Copy result"}</button>
          </div>
        </Section>
      )}

      <Section title={lang === "zh" ? "历史记录（本地）" : "History (local)"}>
        {history.length === 0 ? (
          <div className="text-sm text-gray-500">{lang === "zh" ? "暂无记录。抽一组牌开始。" : "No records yet. Draw to start."}</div>
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="border rounded-xl p-3 flex flex-col gap-1">
                <div className="text-sm flex flex-wrap items-center gap-2">
                  <span className="font-medium">{new Date(h.ts).toLocaleString()}</span>
                  <Pill>{(SPREADS as any)[h.spreadId].name[lang]}</Pill>
                  <Pill>seed={h.seed}</Pill>
                </div>
                <div className="text-xs text-gray-600 line-clamp-2">
                  {h.cards.map((c: any, idx: number) => `${idx + 1}.${c.pos[lang]}-${c.name}${c.reversed ? (lang === "zh" ? "(逆)" : "(rev)") : ""}`).join("  ")}
                </div>
                {h.plan?.length > 0 && (
                  <div className="text-xs text-gray-700">{(lang === "zh" ? "行动：" : "Plan: ") + h.plan.join(" · ")}</div>
                )}
                <div className="flex gap-2 mt-1">
                  <button className="px-2 py-1 text-xs rounded border" onClick={() => setReading(h)}>{lang === "zh" ? "加载" : "Load"}</button>
                  <button className="px-2 py-1 text-xs rounded border" onClick={() => exportText(h)}>{lang === "zh" ? "复制" : "Copy"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

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
