import Link from 'next/link';

export default function Home() {
  return (
    <main className="container-prose">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tarot · 结构化自我反思（MVP）</h1>
        <p className="text-gray-600">抽牌只是开始：本应用提供可复现的结果、可验证的行动建议、复盘打分与周报导出，帮你把灵感落地为行动。</p>
        <div className="mt-4 flex gap-3">
          <Link href="/tarot" className="btn btn-primary">开始使用</Link>
          <a href="#how" className="btn btn-ghost">如何使用</a>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <h3 className="font-semibold mb-1">可复现</h3>
          <p className="text-sm text-gray-600">设置 Seed（种子）即可复现同一抽牌；算法/牌组版本与规则哈希写入导出，便于回溯。</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-1">可执行</h3>
          <p className="text-sm text-gray-600">基于牌面生成 1-3 条具体、可验证的行动建议，避免空泛结论。</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-1">可复盘</h3>
          <p className="text-sm text-gray-600">设置复盘日期，支持复盘打分、周报汇总，并一键导出 .txt/.json/.ics。</p>
        </div>
      </section>

      <section id="how" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">如何使用</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sm text-gray-700">
          <li>在问题栏写下你要推进的主题（默认中文，可在页面右上方切换 EN）。</li>
          <li>选择牌阵、是否允许逆位；可选填 Seed（种子）以便复现同一结果。</li>
          <li>设置复盘天数，点击「抽牌」。</li>
          <li>查看「行动建议」，把能当天完成的最小行动记入笔记并执行。</li>
          <li>使用「复制/下载」或「.ics」把提醒加入日历；分享链接可复现相同结果。</li>
          <li>复盘时给完成度与成效打分，周报会自动汇总。</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">常见问题</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <div className="font-medium">Seed 是什么？</div>
            <div>Seed（种子）让抽牌可复现；同样的 Seed 与设置会得到相同结果，便于记录与分享。</div>
          </div>
          <div>
            <div className="font-medium">行动建议怎么来的？</div>
            <div>根据牌面（花色/点数/大阿尔卡纳）与位置，使用稳定映射生成 1-3 条具体行动。</div>
          </div>
          <div>
            <div className="font-medium">我的数据存在哪里？</div>
            <div>全部存储在你的浏览器本地（LocalStorage）。导入/导出由你控制，我们不上传数据。</div>
          </div>
          <div>
            <div className="font-medium">这是否是专业建议？</div>
            <div>不是。本应用用于象征性反思与自我问答，不提供医疗/法律/投资建议。</div>
          </div>
        </div>
      </section>

      <footer className="text-xs text-gray-500">
        已准备好开始？
        <Link href="/tarot" className="ml-2 btn btn-primary btn-xs">进入 Tarot</Link>
      </footer>
    </main>
  );
}
