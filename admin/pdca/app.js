const state = {
  currentView: "dashboard",
  data: window.PDCA_DATA,
  pendingAction: null,
  syncCount: 0,
};

const viewMeta = {
  dashboard: {
    title: "問い合わせ営業PDCA",
    lead: "配信結果、フォーム未達補完、次回の高速検証計画を整理します。",
  },
  "ab-test": {
    title: "ABテスト設計",
    lead: "業種ごとに仮説、文面意図、成功指標を設計します。",
  },
  approval: {
    title: "配信管理",
    lead: "承認OK、フォーム配信チャネル、予約日時、送信後集計を確認します。",
  },
  results: {
    title: "結果分析",
    lead: "配信結果を読み取り、文面・対象・LP導線の改善案を作成します。",
  },
  templates: {
    title: "テンプレート",
    lead: "業種別・訴求軸別の文面と改善履歴を蓄積します。",
  },
  segments: {
    title: "セグメント",
    lead: "小ロット配信用の対象企業群を設計し、選定理由を管理します。",
  },
};

const $ = (selector) => document.querySelector(selector);

function icon(name, extraClass = "") {
  return `<span class="icon icon-${name} ${extraClass}" aria-hidden="true"></span>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMultiline(value) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function statusClass(label) {
  if (/勝ち|OK|作成済み|承認済み|送信済み|配信済み/.test(label)) return "ok";
  if (/設計/.test(label)) return "design";
  if (/待ち|準備|送信|作成予定|候補/.test(label)) return "wait";
  if (/修正|停止|要確認/.test(label)) return "fix";
  if (/保留|レビュー/.test(label)) return "hold";
  return "review";
}

function renderPrefCell(value) {
  const text = String(value);
  const parts = text.split("・").map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 5) return escapeHtml(text);
  const summary = `${parts.slice(0, 3).join("・")} ほか${parts.length - 3}都道府県`;
  return `<span title="${escapeHtml(text)}">${escapeHtml(summary)}</span>`;
}

function priorityClass(priority) {
  if (priority === "高") return "high";
  if (priority === "中") return "medium";
  return "low";
}

function renderNav() {
  $("#sideNav").innerHTML = state.data.nav
    .map(
      (item) => `
        <button class="nav-link ${item.id === state.currentView ? "active" : ""}" data-view="${item.id}" type="button">
          ${icon(item.icon)}
          <span>${item.label}</span>
          ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ""}
        </button>
      `,
    )
    .join("");
}

function renderProgressBanner() {
  return `
    <section class="sync-banner">
      <div class="next-action-main">
        ${icon("approval")}
        <strong>次にやること:</strong>
        <span class="step-inline"><span class="step-number">1</span>5/1結果反映</span>
        <span class="step-separator">→</span>
        <span class="step-inline"><span class="step-number">2</span>未達メール補完</span>
        <span class="step-separator">→</span>
        <span class="step-inline"><span class="step-number">3</span>新比較軸を設計</span>
        <span class="step-separator">→</span>
        <span class="step-inline"><span class="step-number">4</span>連休明けに再開</span>
      </div>
      <span class="label-chip action-chip">5/8結果反映・メールID43は要確認</span>
      <span class="label-chip action-chip">ツール側予約へ切替済み</span>
    </section>
  `;
}

function renderAbInsightPanel() {
  const comparisons = state.data.results?.comparisons || [];
  const summaryItems = [
    comparisons.find((item) => item.test === "5/8自動車 B_品質安定"),
    comparisons.find((item) => item.test === "5/8保険・金融 A_業務整理"),
    comparisons.find((item) => item.test === "累計"),
  ].filter(Boolean);
  const insightCards = [
    {
      title: "判断",
      text: "5/8はフォーム送信成功526件、補正クリック7社でした。広告・デザインC/Dは弱めで、自動車Bと保険・金融Aに反応が残りました。",
      icon: "approval",
    },
    {
      title: "考察",
      text: "クリック率は5/7より落ちたため、単純増量ではなく業種の勝ち筋を見ます。5/11は反応が残った複数業種で平日回復を確認します。",
      icon: "improve",
    },
    {
      title: "次の検証",
      text: "5/9は675件、5/10は600件を維持し、5/11はID194-199で1,144件を追加予約済みです。メールID43はrunning 0件のため要確認です。",
      icon: "target",
    },
  ];
  return `
    <section class="panel ab-insight-panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">${icon("ab")}ABテスト結果・考察</h2>
          <span class="panel-sub">5/8時点のトラッキング補正値と予約ジョブsend_countを正として表示します。</span>
        </div>
        <span class="status ok">5/11平日フォロー予約済み</span>
      </div>
      <div class="ab-result-card-list">
        ${summaryItems
          .map(
            (item) => `
              <article class="ab-result-card">
                <div class="ab-result-head">
                  <strong>${item.test}</strong>
                  <span>${item.decision}</span>
                </div>
                ${renderKeyValueGrid([
                  ["クリック", item.click],
                  ["導線", item.line],
                  ["次回方針", item.next],
                ])}
              </article>
            `,
          )
          .join("")}
      </div>
      ${renderNoteCards(insightCards, "ab-insight-notes")}
    </section>
  `;
}

function renderFastPdcaPlan() {
  const plan = state.data.fastPdcaPlan;
  if (!plan) return "";
  return `
    <section class="panel plan-panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">${icon("line")}${plan.title}</h2>
          <span class="panel-sub">${plan.goal}</span>
        </div>
        <span class="status ${statusClass("設計")}">設計反映済み</span>
      </div>
      <div class="summary-row plan-summary">
        <div class="summary-cell"><span>実行候補</span><strong>${plan.targetCandidates.toLocaleString()}<small>件</small></strong></div>
        <div class="summary-cell"><span>想定成功</span><strong>${plan.expectedSuccess}</strong></div>
        <div class="summary-cell"><span>想定クリック</span><strong>${plan.expectedClicks}</strong></div>
        <div class="summary-cell"><span>A/B配分</span><strong>65/35<small>目安</small></strong></div>
      </div>
      ${renderPlanWaveCards(plan.waves)}
      <div class="notice-stack">
        <div class="notice"><span><strong>A/B配分</strong><br />${plan.abAllocation}</span></div>
        <div class="notice"><span><strong>フォーム主配信</strong><br />${plan.primaryFormSettings}</span></div>
        <div class="notice"><span><strong>メール補完</strong><br />${plan.emailFallbackSettings}</span></div>
      </div>
      <div class="chip-row">
        ${plan.gates.map((gate) => `<span class="label-chip">${gate}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderKpis(metrics) {
  const countClass = metrics.length === 4 ? "kpi-four" : metrics.length === 5 ? "kpi-five" : "";
  return `
    <section class="grid kpi-grid ${countClass}">
      ${metrics
        .map(
          (item) => `
            <article class="panel kpi-card ${String(item.value).length >= 5 ? "long-kpi" : ""}">
              ${icon(item.icon)}
              <div>
                <div class="kpi-label">${item.label}</div>
                <div class="kpi-value">${item.value}<span class="kpi-unit">${item.unit}</span></div>
                ${item.trend ? `<div class="kpi-trend">${item.trend}${icon("improve", "trend-icon")}</div>` : ""}
              </div>
            </article>
          `,
        )
        .join("")}
    </section>
  `;
}

function renderValueRows(rows) {
  return `
    <div class="value-rows">
      ${rows
        .map(
          ([label, value]) => `
            <div class="value-row">
              <span>${label}</span>
              <strong>${value}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderNoteCards(cards, className = "") {
  return `
    <div class="note-card-grid ${className}">
      ${cards
        .map(
          (card) => `
            <article class="note-card">
              ${card.icon ? icon(card.icon) : ""}
              <div>
                <h3>${card.title}</h3>
                <p>${card.text}</p>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderKeyValueGrid(rows, className = "") {
  return `
    <div class="kv-grid ${className}">
      ${rows
        .map(
          ([label, value]) => `
            <div class="kv-item">
              <span>${label}</span>
              <strong>${value}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderPlanWaveCards(waves) {
  return `
    <div class="wave-card-list">
      ${waves
        .map(
          (wave, index) => `
            <article class="wave-card">
              <div class="wave-index">${String(index + 1).padStart(2, "0")}</div>
              <div class="wave-main">
                <div class="wave-head">
                  <div>
                    <h3>${wave.step}</h3>
                    <p>${wave.timing}</p>
                  </div>
                  <span class="status ${statusClass(wave.channel)}">${wave.channel}</span>
                </div>
                ${renderKeyValueGrid([
                  ["目安", wave.volume],
                  ["設定", wave.settings],
                  ["目的", wave.purpose],
                ])}
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderCarryoverWatchlist() {
  const watch = state.data.carryoverWatchlist;
  if (!watch) return "";
  return `
    <div class="carryover-watch">
      <div class="carryover-watch-head">
        <strong>残候補チェック</strong>
        <span>${watch.checkedAt}</span>
      </div>
      <p>${watch.rule}</p>
      <div class="carryover-item-list">
        ${watch.items
          .map(
            (item) => `
              <article class="carryover-item">
                <div>
                  <strong>${item.label}</strong>
                  <span>${item.source}</span>
                </div>
                <b>${item.count}</b>
                <p>${item.handling}</p>
              </article>
            `,
          )
          .join("")}
      </div>
      <div class="carryover-checks">
        ${watch.preflightChecklist.map((item) => `<span class="label-chip">${item}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderCampaignCards(items) {
  return `
    <div class="campaign-card-list">
      ${items
        .map(
          (item) => `
            <article class="campaign-card">
              <div class="campaign-card-head">
                <div>
                  <h3>${item.campaign}</h3>
                  <p>${item.lp}</p>
                </div>
                <span class="status ${statusClass(item.userStatus)}">${item.userStatus}</span>
              </div>
              ${renderKeyValueGrid([
                ["業種", item.industry],
                ["グループ", item.group],
                ["対象 / 指定", `${item.target}件 / ${item.recommended}件`],
                ["送信可能", item.sendableEstimate ? `${item.sendableEstimate}件` : "-"],
                ["チャネル", item.deliveryChannel || "フォーム配信"],
                ["予定日時", item.scheduledAt || "-"],
              ])}
              <div class="campaign-actions">
                ${
                  String(item.scheduledAt || "").includes("配信済み") || item.userStatus === "送信済み"
                    ? '<span class="label-chip">集計値のみ表示</span>'
                    : `<button class="ghost-button" data-approve="${item.id}" type="button">日時設定</button>`
                }
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderComparisonCards(items) {
  return `
    <div class="comparison-card-list">
      ${items
        .map(
          (item) => `
            <article class="comparison-card">
              <div class="comparison-card-head">
                <h3>${item.test}</h3>
                <span class="status ${statusClass(item.decision)}">${item.decision}</span>
              </div>
              ${renderKeyValueGrid([
                ["件名", item.subject],
                ["冒頭", item.intro],
                ["CTA", item.cta],
                ["クリック率", item.click],
                ["LINE", item.line],
                ["次回方針", item.next],
              ])}
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderSegmentCards(items) {
  return `
    <div class="segment-card-list">
      ${items
        .map(
          (item) => `
            <article class="segment-card">
              <div class="segment-card-head">
                <div>
                  <h3>${item.name}</h3>
                  <p>${item.db} / ${item.industry}</p>
                </div>
                <span class="status ${statusClass(item.group)}">${item.group}</span>
              </div>
              ${renderKeyValueGrid([
                ["都道府県", renderPrefCell(item.pref)],
                ["推定", `${item.estimated.toLocaleString()}件`],
                ["送信可能", `${item.sendable.toLocaleString()}件`],
                ["除外理由", item.excluded],
                ["配信順", item.order],
              ])}
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderDashboard() {
  const dashboard = state.data.dashboard;
  const guardRows = dashboard.guardRows || [
    ["フォーム主配信", "未送信中心"],
    ["メール補完", "未達分だけ"],
    ["公開画面", "個社情報なし"],
  ];

  return `
    ${renderKpis(dashboard.metrics)}
    <section class="grid dashboard-focus-grid dashboard-ab-focus">
      ${renderAbInsightPanel()}
      <article class="panel pad compact-decision">
        <h2 class="panel-title">${icon("warning")}送信ガード</h2>
        ${renderValueRows(guardRows)}
        ${renderCarryoverWatchlist()}
      </article>
    </section>
  `;
}

function renderFilters(labels, buttonLabel = "絞り込む") {
  return `
    <section class="panel filters-panel">
      <div class="filter-head">
        <strong>${icon("target")}条件</strong>
        <span>横幅に合わせて読みやすい幅で配置します。</span>
      </div>
      <div class="filter-row">
        ${labels
          .map(
            (label) => `
              <div class="field">
                <label>${label}</label>
                <select><option>すべて</option><option>広告・デザイン</option><option>IT・ソフトウェア</option><option>広告・デザイン向けLP</option></select>
              </div>
            `,
          )
          .join("")}
        <button class="ghost-button" type="button">${buttonLabel}</button>
      </div>
    </section>
  `;
}

function renderAbTest() {
  const selected = state.data.abTests[0];
  return `
    ${renderProgressBanner()}
    ${renderFilters(["業種", "都道府県", "詳細業種", "LP", "状態"])}
    <section class="panel ab-hero-panel">
      <div class="panel-head">
        <h2 class="panel-title">${icon("ab")}AB比較軸</h2>
        <button class="primary-button" type="button">${icon("ab")}新規テスト案を作成</button>
      </div>
      <div class="ab-card-grid">
        <article class="ab-card accent-a">
          <div class="ab-card-head">
            <span class="ab-badge">A案</span>
            <strong>${selected.appealA}</strong>
          </div>
          ${renderValueRows([
            ["件名", selected.subjectA],
            ["冒頭", selected.introA],
            ["対象", "制作進行短縮ニーズ"],
            ["現状", "369成功 / 20クリック"],
          ])}
        </article>
        <article class="ab-card accent-b">
          <div class="ab-card-head">
            <span class="ab-badge">B案</span>
            <strong>${selected.appealB}</strong>
          </div>
          ${renderValueRows([
            ["件名", selected.subjectB],
            ["冒頭", selected.introB],
            ["対象", "品質安定ニーズ"],
            ["現状", "225成功 / 12クリック"],
          ])}
        </article>
      </div>
    </section>

    <section class="grid split-wide" style="margin-top:16px">
      <article class="panel">
        <div class="panel-head">
          <h2 class="panel-title">${icon("ab")}テスト設計一覧</h2>
          <span class="panel-sub">比較したい仮説と状態</span>
        </div>
        <div class="ab-test-card-list">
          ${state.data.abTests
            .map(
              (test) => `
                <article class="test-design-card">
                  <div class="test-design-head">
                    <div>
                      <h3>${test.name}</h3>
                      <p>${test.industry}</p>
                    </div>
                    <span class="status ${statusClass(test.status)}">${test.status}</span>
                  </div>
                  ${renderKeyValueGrid([
                    ["対象", test.segment],
                    ["仮説", test.hypothesis],
                    ["A案", test.appealA],
                    ["B案", test.appealB],
                    ["成功指標", test.success],
                  ])}
                </article>
              `,
            )
            .join("")}
        </div>
      </article>

      <aside class="panel pad preview-panel">
        <h2 class="panel-title">${icon("template")}文面プレビュー</h2>
        <div class="detail-list" style="margin-top:14px">
          <div class="detail-box"><strong>件名A</strong><p>${selected.subjectA}</p></div>
          <div class="detail-box"><strong>件名B</strong><p>${selected.subjectB}</p></div>
          <div class="detail-box"><strong>冒頭A</strong><p>${selected.introA}</p></div>
          <div class="detail-box"><strong>冒頭B</strong><p>${selected.introB}</p></div>
          <div class="detail-box"><strong>CTA</strong><p>${selected.cta}</p></div>
          ${selected.bodyA ? `<div class="detail-box body-preview"><strong>本文A</strong><p>${formatMultiline(selected.bodyA)}</p></div>` : ""}
          ${selected.bodyB ? `<div class="detail-box body-preview"><strong>本文B</strong><p>${formatMultiline(selected.bodyB)}</p></div>` : ""}
        </div>
      </aside>
    </section>

    <section class="panel" style="margin-top:16px">
      <div class="panel-head">
        <h2 class="panel-title">${icon("target")}文面設計メモ</h2>
        <span class="panel-sub">この文面がなぜ書かれているか、結果をどう使うか</span>
      </div>
      ${renderNoteCards([
        { title: "作成意図", text: `${selected.intent}。業種特有の課題を具体化する。`, icon: "target" },
        { title: "期待する反応", text: `${selected.reaction}。最終的に面談・相談を申し込む。`, icon: "results" },
        { title: "比較したい差分", text: `${selected.diff}。CTAの種類も次回比較候補にする。`, icon: "ab" },
        { title: "悪い場合に変える箇所", text: `${selected.improve}。冒頭・CTA・対象条件を順に見直す。`, icon: "improve" },
      ])}
    </section>
  `;
}

function renderApproval() {
  const approvalMetrics = state.data.approvalMetrics || [
    { label: "配信済み", value: "2", unit: "件", icon: "approval" },
    { label: "送信成功", value: "58", unit: "件", icon: "campaign" },
    { label: "補正クリック", value: "5", unit: "社", icon: "results" },
    { label: "要確認", value: "2", unit: "件", icon: "warning" },
    { label: "公開PII", value: "0", unit: "件", icon: "lock" },
  ];
  return `
    ${renderProgressBanner()}
    ${renderKpis(approvalMetrics.slice(0, 4))}
    <section class="panel approval-table-panel" style="margin-top:16px">
        <div class="panel-head">
          <h2 class="panel-title">${icon("approval")}配信管理キャンペーン</h2>
          <span class="panel-sub">4/30配信済みキャンペーンの結果です。次回予約は既存ツール側の日時予約を使います。</span>
        </div>
        ${renderCampaignCards(state.data.approvals)}
    </section>

    <section class="panel pad" style="margin-top:16px">
      <div class="panel-head">
        <h2 class="panel-title">${icon("lock")}結果確認メモ / 送信前チェック</h2>
        <span class="panel-sub">長文メモは幅を確保して下段にまとめる</span>
      </div>
      ${renderNoteCards([
        { title: "文面作成意図", text: state.data.approvals[0].intent, icon: "template" },
        { title: "対象条件", text: state.data.approvals[0].conditions, icon: "segment" },
        { title: "除外条件", text: state.data.approvals[0].exclusions, icon: "warning" },
        { title: "注意事項", text: state.data.approvals[0].caution, icon: "approval" },
      ])}
        <div class="notice">
          <span><strong>企業名・IDは公開画面に載せない</strong><br />クリック企業の特定は既存ツール内で行い、この画面では集計値だけを扱います。</span>
        </div>
    </section>

    <section class="panel pad" style="margin-top:16px">
      <h2 class="panel-title">${icon("improve")}送信後に確認する改善ポイント</h2>
      <div style="margin-top:14px">
        ${["クリック率", "LP閲覧", "LINEクリック", "失敗理由", "返信", "次回変えること"].map((chip) => `<span class="label-chip">${chip}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderResults() {
  const results = state.data.results;
  return `
    ${renderProgressBanner()}
    ${renderFilters(["期間", "業種", "キャンペーン", "テスト", "状態"], "更新")}
    <div style="margin-top:16px">${renderKpis(results.metrics)}</div>
    <section class="grid split-wide results-grid" style="margin-top:16px">
      <article class="panel">
        <div class="panel-head"><h2 class="panel-title">${icon("results")}キャンペーン別結果</h2><span class="panel-sub">補正クリックを優先して判断</span></div>
        ${renderComparisonCards(results.comparisons)}
      </article>
      <aside class="panel pad">
        <h2 class="panel-title">${icon("improve")}Codex改善案</h2>
        <div class="detail-list" style="margin-top:14px">
          ${results.improvements.map((item) => `<div class="detail-box"><strong>${item.title}</strong><p>${item.text}</p></div>`).join("")}
        </div>
      </aside>
    </section>

    <section class="grid insight-grid" style="margin-top:16px">
      <article class="panel pad">
        <h2 class="panel-title">${icon("warning")}失敗理由分布</h2>
        <div class="comparison-bars" style="margin-top:18px">
          ${results.failures
            .map(
              (item) => `
                <div class="bar-row">
                  <span>${item.label}</span>
                  <span class="bar-track"><span class="bar" style="width:${item.value}%"></span></span>
                  <span>${item.value}%</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>
      <article class="panel pad">
        <h2 class="panel-title">${icon("target")}改善キュー</h2>
        <div style="margin-top:14px">
          ${["次回テンプレ修正", "セグメント再設計", "LP CTA確認", "承認待ちへ反映"].map((chip) => `<span class="label-chip">${chip}</span>`).join("")}
        </div>
      </article>
      <article class="panel pad">
        <h2 class="panel-title">${icon("approval")}学びと次回仮説</h2>
        ${renderValueRows([
          ["継続すること", "広告・デザインLPとA/B訴求"],
          ["変えること", "母数と地域の分け方"],
          ["停止すること", "個社情報の公開表示"],
        ])}
      </article>
    </section>
  `;
}

function renderTemplates() {
  return `
    ${renderProgressBanner()}
    ${renderFilters(["業種", "訴求軸", "判定", "LP", "状態"])}
    ${renderKpis([
      { label: "使用中テンプレート", value: String(state.data.templates.length), unit: "件", icon: "template" },
      { label: "A案", value: "1", unit: "件", icon: "ab" },
      { label: "B案", value: "1", unit: "件", icon: "ab" },
      { label: "メール補完", value: "1", unit: "件", icon: "results" },
    ])}
    <section class="panel template-library" style="margin-top:16px">
        <div class="panel-head">
          <h2 class="panel-title">${icon("template")}テンプレートライブラリ</h2>
          <button class="primary-button" type="button">${icon("template")}新規テンプレート案</button>
        </div>
        <div class="template-card-list">
          ${state.data.templates
            .map(
              (item) => `
                <article class="template-card">
                  <div class="template-card-head">
                    <div>
                      <strong>${item.name}</strong>
                      <small>${item.lp}</small>
                    </div>
                    <span class="status ${statusClass(item.label)}">${item.label}</span>
                  </div>
                  <div class="template-card-body">
                    ${renderValueRows([
                      ["業種", item.industry],
                      ["訴求軸", item.appeal],
                      ["件名", item.subject],
                    ])}
                    ${renderValueRows([
                      ["使用", `${item.count}回`],
                      ["クリック率", item.click],
                      ["更新", item.updated],
                    ])}
                  </div>
                  <div class="template-actions">
                    <button class="ghost-button" type="button">プレビュー</button>
                    <button class="ghost-button" type="button">改善メモ</button>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
    </section>
    <section class="panel pad" style="margin-top:16px">
      <h2 class="panel-title">${icon("target")}文面意図と改善履歴</h2>
      ${renderNoteCards([
        { title: "作成意図", text: "広告・デザイン企業に絞り、制作進行・提案文・更新報告の負担を具体化する。", icon: "template" },
        { title: "期待する反応", text: "制作現場の文章業務に近いと感じ、本文中の {{tracking_url}} から広告・デザイン向けLPを確認する。", icon: "results" },
        { title: "今回結果", text: "静岡Aは35件送信で補正クリック3社、長野Bは23件送信で補正クリック2社。トラッキング補正で見る。", icon: "improve" },
        { title: "次回変えること", text: "文面の方向性は維持し、約3,000候補をフォーム3波に分ける。フォーム未達分はメール補完として別枠で扱う。", icon: "target" },
        { title: "停止する表現", text: "システム開発寄り、IT全般向け、大企業向けに見える表現は今回使わない。", icon: "warning" },
      ])}
    </section>
  `;
}

function renderSegments() {
  const estimatedTotal = state.data.segments.reduce((sum, item) => sum + item.estimated, 0);
  const sendableTotal = state.data.segments.reduce((sum, item) => sum + item.sendable, 0);
  const createdGroups = state.data.segments.filter((item) => item.group.includes("作成済み")).length;
  const nextTarget = state.data.fastPdcaPlan?.targetCandidates || 3000;
  return `
    ${renderProgressBanner()}
    ${renderFilters(["DB", "大カテゴリ", "詳細業種", "都道府県", "状態"], "セグメント候補を更新")}
    ${renderKpis([
      { label: "候補推定対象", value: estimatedTotal.toLocaleString(), unit: "件", icon: "database" },
      { label: "送信可能見込み", value: sendableTotal.toLocaleString(), unit: "件", icon: "approval" },
      { label: "除外見込み", value: (estimatedTotal - sendableTotal).toLocaleString(), unit: "件", icon: "warning" },
      { label: "次回指定目安", value: nextTarget.toLocaleString(), unit: "件", icon: "target" },
      { label: "作成済みグループ", value: String(createdGroups), unit: "件", icon: "segment" },
    ])}
    <section class="grid content-stack segment-layout" style="margin-top:22px">
      <article class="panel segment-table-panel">
        <div class="panel-head"><h2 class="panel-title">${icon("segment")}セグメント候補</h2></div>
        ${renderSegmentCards(state.data.segments)}
      </article>
      <aside class="panel pad segment-memo">
        <h2 class="panel-title">${icon("target")}対象選定メモ</h2>
        ${renderNoteCards([
          { title: "なぜこの企業群を選ぶか", text: "広告・デザイン向けLPとの課題一致度が、IT・ソフトウェア広めの企業群より高いと判断できるため。", icon: "target" },
          { title: "次回の切り方", text: "約3,000候補をフォーム配信3波に分ける。Aを厚めにしつつBも残し、都道府県は重複しない別グループにする。", icon: "segment" },
          { title: "メール補完の扱い", text: "フォーム配信後、失敗・スキップ済みでメールありの企業だけを別グループ化する。同時予約はせず、1アカウント1日100件を上限にする。", icon: "results" },
          { title: "除外条件チェック", text: "旧Pending除外 / 送信済み除外 / フォーム未達補完", icon: "warning" },
        ])}
      </aside>
    </section>
  `;
}

function buildAnalysisPrompt() {
  const context = state.data.analysisContext;
  const plan = state.data.fastPdcaPlan;
  const carryover = state.data.carryoverWatchlist;
  const carryoverLines = carryover
    ? carryover.items.map((item) => `- ${item.label}: ${item.source} / ${item.count} / ${item.handling}`).join("\n")
    : "-";
  const carryoverCheckLines = carryover ? carryover.preflightChecklist.map((item) => `- ${item}`).join("\n") : "-";
  const waveLines = plan
    ? plan.waves
        .map(
          (wave) =>
            `- ${wave.step}: ${wave.timing} / ${wave.channel} / ${wave.volume} / 設定=${wave.settings} / 目的=${wave.purpose}`,
        )
        .join("\n")
    : "";
  const gateLines = plan ? plan.gates.map((item) => `- ${item}`).join("\n") : "";
  const approvalLines = state.data.approvals
    .map(
      (item) =>
        `- ${item.campaign}: ${item.conditions} / 対象${item.target}件 / 推奨${item.recommended}件 / LP=${item.lp} / 意図=${item.intent}`,
    )
    .join("\n");
  const segmentLines = state.data.segments
    .map(
      (item) =>
        `- ${item.name}: ${item.db} / ${item.industry} / ${item.pref} / 推定${item.estimated}件 / 送信可能見込み${item.sendable}件 / 状態=${item.group}`,
    )
    .join("\n");
  const templateLines = state.data.templates
    .map(
      (item) =>
        `- ${item.name}: 業種=${item.industry} / 訴求=${item.appeal} / 件名=${item.subject} / LP=${item.lp} / 使用${item.count}回 / クリック=${item.click} / 判定=${item.label}`,
    )
    .join("\n");
  const abBodyLines = state.data.abTests
    .filter((item) => item.bodyA || item.bodyB)
    .map(
      (item) =>
        `- ${item.name}\n  件名A=${item.subjectA}\n  本文A=${item.bodyA || "-"}\n  件名B=${item.subjectB}\n  本文B=${item.bodyB || "-"}`,
    )
    .join("\n");
  const resultLines = state.data.results.improvements.map((item) => `- ${item.title}: ${item.text}`).join("\n");

  return `あなたはこのワークスペースのCodexです。以下の実データをもとに、問い合わせフォーム営業の爆速PDCA配信案を改善してください。

# 前提
- 4/30の地方6県配信は完了済みです。
- 今後の予約配信は、既存ツール側のキャンペーン詳細にある「実行タイミング: 日時を予約」を使います。
- この端末のローカル予約ワーカーは二重送信防止のため停止済みです。
- Codexはグループ、テンプレート、キャンペーン作成と改善案作成までを担当し、実送信や予約送信の実行はCodex単体では行いません。
- 既存ツールのテンプレート作成では、メール配信ではなくフォーム配信を選びます。API上は channel=form を正とします。
- テンプレート本文にLP実URLを直書きせず、LP誘導には必ず {{tracking_url}} を使います。
- リダイレクト先LP URLでは、今回は「広告・デザイン向けLP」を選びます。
- 公開管理画面にはクリック企業名・企業IDなどの個社情報を載せず、集計値だけを反映します。
- 次回は単なる10倍ではなく、送信成功1,000件前後と補正クリック50社前後を作って判断ブレを減らすことが目的です。
- フォーム配信を先に行い、失敗・スキップ済みだけをメールで補完します。フォーム配信とメール補完は同時予約せず、メール補完は1アカウント1日100件を初期上限にします。

# 今回の目的
${context.target}

# なぜこの方向にするか
${context.reason}

# 爆速PDCAの運用計画
- タイトル: ${plan?.title || "-"}
- 目的: ${plan?.goal || "-"}
- 実行候補: ${plan?.targetCandidates?.toLocaleString() || "-"}件
- 想定成功: ${plan?.expectedSuccess || "-"}
- 想定クリック: ${plan?.expectedClicks || "-"}
- A/B配分: ${plan?.abAllocation || "-"}
- フォーム主配信設定: ${plan?.primaryFormSettings || "-"}
- メール補完設定: ${plan?.emailFallbackSettings || "-"}

## 配信波
${waveLines}

## 守る条件
${gateLines}

# 現在のLP選択肢
${context.currentLpOptions.map((item) => `- ${item}`).join("\n")}

# 既存配信ツールの確認済み状態
## グループ
${context.existingToolState.groups.map((item) => `- ${item}`).join("\n")}

## テンプレート
${context.existingToolState.templates.map((item) => `- ${item}`).join("\n")}

## キャンペーン
${context.existingToolState.campaigns.map((item) => `- ${item}`).join("\n")}

## LP統計
- ${context.existingToolState.lpStats}

# 次回候補セグメント
${segmentLines}

# 配信済みキャンペーンと補正集計
${approvalLines}

# テンプレート状況
${templateLines}

# 現在のA/B本文案
${abBodyLines}

# 現時点の改善メモ
${resultLines}

# 見落とし防止台帳
- ルール: ${carryover?.rule || "-"}
${carryoverLines}

## 新規配信案を作る前の必須チェック
${carryoverCheckLines}

# Codexに出力してほしいこと
1. 4/30地方6県と累計結果を、送信成功率・トラッキング補正クリック・LP閲覧・LINEクリックの観点で判断してください。
2. 次回3,000候補をどの都道府県・時間帯・A/B配分で分けるかを出してください。
3. フォーム主配信のグループ設定と、フォーム未達メール補完のグループ設定を分け、メール補完は1日100件/アカウント上限を守る分割案で出してください。
4. A/Bどちらを継続するか、または両方継続するかをリスク込みで判断してください。
5. 次回作るグループ名、テンプレート名、キャンペーン名を命名規則に沿って出してください。
6. 必要であれば、この管理画面の data.js や関連ドキュメントを更新してください。`;
}

function showAnalysisPrompt() {
  const prompt = buildAnalysisPrompt();
  showModal({
    title: "Codexへ貼る分析プロンプト",
    lead: "コピーして、このワークスペースのCodexに貼り付ける前提の内容です。",
    body: `
      <p>このプロンプトには、現時点の既存ツール結果、次回対象、LP選択、テンプレート作成ルールを入れています。</p>
      <textarea id="analysisPromptText" class="analysis-prompt" readonly>${escapeHtml(prompt)}</textarea>
      <div class="prompt-actions">
        <button class="primary-button" id="copyAnalysisPrompt" type="button">${icon("improve")}プロンプトをコピー</button>
        <span class="prompt-note">コピー後、Codexに貼り付けて分析・文面作成を進めます。</span>
      </div>
    `,
    confirmText: "完了",
  });
}

function render() {
  const current = viewMeta[state.currentView] || viewMeta.dashboard;
  $("#pageTitle").textContent = current.title;
  $("#pageLead").textContent = current.lead;
  renderNav();

  const viewRenderers = {
    dashboard: renderDashboard,
    "ab-test": renderAbTest,
    approval: renderApproval,
    results: renderResults,
    templates: renderTemplates,
    segments: renderSegments,
  };
  $("#viewRoot").innerHTML = (viewRenderers[state.currentView] || renderDashboard)();
  enhanceResponsiveTables();
}

function navigate(view) {
  state.currentView = view || "dashboard";
  history.replaceState(null, "", `#${state.currentView}`);
  render();
}

function showModal({ title, lead, body, confirmText = "実行する", onConfirm }) {
  state.pendingAction = onConfirm;
  $("#modalTitle").textContent = title;
  $("#modalLead").textContent = lead;
  $("#modalBody").innerHTML = body;
  $("#modalConfirm").textContent = confirmText;
  $("#actionModal").showModal();
}

function enhanceResponsiveTables(root = $("#viewRoot")) {
  root.querySelectorAll("table").forEach((table) => {
    const headers = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent.trim());
    table.classList.add("stacked-table");
    table.querySelectorAll("tbody tr").forEach((row) => {
      Array.from(row.children).forEach((cell, index) => {
        cell.dataset.label = headers[index] || "";
      });
    });
  });
}

function approveCampaign(id) {
  const item = state.data.approvals.find((campaign) => campaign.id === id);
  if (!item) return;
  showModal({
    title: "ツール側で日時予約してください",
    lead: item.campaign,
    body: `
      <p>今後の予約配信は、既存ツール側のキャンペーン詳細にある「実行タイミング: 日時を予約」を使います。この管理画面からローカル予約APIへ新規予約は保存しません。</p>
      <p><strong>対象条件:</strong> ${item.conditions}<br><strong>送信上限:</strong> ${item.recommended}件<br><strong>チャネル:</strong> ${item.deliveryChannel || "フォーム配信"}</p>
    `,
    confirmText: "閉じる",
    onConfirm: async () => {
      render();
    },
  });
}

function sendCampaign(id) {
  const item = state.data.approvals.find((campaign) => campaign.id === id);
  if (!item) return;
  showModal({
    title: "配信実行は既存ツール側で行います",
    lead: "今後は既存ツール側の日時予約を使います。この画面は結果管理と改善判断に専念します。",
    body: `
      <p><strong>${item.campaign}</strong> の送信操作や日時予約は、既存ツールのキャンペーン詳細で行います。</p>
      <p>この画面には、送信後の成功数、失敗、スキップ、補正クリックなどの集計だけを反映します。</p>
    `,
    confirmText: "閉じる",
    onConfirm: () => {
      render();
    },
  });
}

async function simulateSync() {
  state.syncCount += 1;
  state.data.integration.lastSyncedAt = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  render();
}

document.addEventListener("click", (event) => {
  const navButton = event.target.closest("[data-view]");
  if (navButton) {
    navigate(navButton.dataset.view);
    return;
  }

  const approveButton = event.target.closest("[data-approve]");
  if (approveButton) {
    approveCampaign(approveButton.dataset.approve);
    return;
  }

  const sendButton = event.target.closest("[data-send]");
  if (sendButton) {
    sendCampaign(sendButton.dataset.send);
    return;
  }

  const copyPromptButton = event.target.closest("#copyAnalysisPrompt");
  if (copyPromptButton) {
    const promptText = $("#analysisPromptText");
    if (!promptText) return;
    promptText.select();
    const copied = navigator.clipboard
      ? navigator.clipboard.writeText(promptText.value)
      : Promise.reject(new Error("Clipboard API unavailable"));
    copied
      .then(() => {
        copyPromptButton.textContent = "コピー済み";
      })
      .catch(() => {
        document.execCommand("copy");
        copyPromptButton.textContent = "コピー済み";
      });
  }
});

$("#syncButton").addEventListener("click", simulateSync);
$("#analysisButton").addEventListener("click", showAnalysisPrompt);
$("#createButton").addEventListener("click", () => navigate("ab-test"));

$("#actionModal").addEventListener("close", () => {
  if ($("#actionModal").returnValue === "confirm" && typeof state.pendingAction === "function") {
    const result = state.pendingAction();
    if (result && typeof result.catch === "function") {
      result.catch((error) => {
        alert(error.message || "操作に失敗しました。");
      });
    }
  }
  state.pendingAction = null;
});

window.addEventListener("hashchange", () => {
  const next = location.hash.replace("#", "");
  if (next && viewMeta[next]) {
    state.currentView = next;
    render();
  }
});

const initialHash = location.hash.replace("#", "");
state.currentView = viewMeta[initialHash] ? initialHash : "dashboard";
render();
