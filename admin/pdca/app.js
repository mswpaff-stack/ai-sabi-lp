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
  if (/勝ち|OK|作成済み|承認済み/.test(label)) return "ok";
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

function renderSyncBanner() {
  const steps = ["3,000候補設計", "フォーム3波予約", "未達分をメール補完", "翌営業日で判定"];
  const apiLabel = "ツール側予約へ切替済み";
  $("#syncBanner").innerHTML = `
    <div class="next-action-main">
      ${icon("approval")}
      <strong>次にやること:</strong>
      ${steps
        .map(
          (step, index) => `
            <span class="step-inline">
              <span class="step-number">${index + 1}</span>
              ${step}
            </span>
            ${index < steps.length - 1 ? '<span class="step-separator">→</span>' : ""}
          `,
        )
        .join("")}
    </div>
    <span class="label-chip action-chip">${state.data.integration.message}</span>
    <span class="label-chip">${apiLabel}</span>
  `;
}

function renderFlowCard() {
  return `
    <section class="panel flow-card">
      <div class="flow-title">${icon("sync")}次回の推奨フロー</div>
      <div class="flow-steps">
        ${[
          ["フォーム配信", "未送信中心で3波に分散"],
          ["結果反映", "成功・失敗・スキップを確認"],
          ["メール補完", "未達分だけ別枠で予約"],
          ["判定", "A/Bと地域差を見る"],
        ]
          .map(
            (item, index) => `
              <div class="flow-step ${index === 0 ? "active" : ""}">
                <span>${index + 1}</span>
                <strong>${item[0]}</strong>
                <small>${item[1]}</small>
              </div>
              ${index < 3 ? '<span class="flow-arrow">→</span>' : ""}
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderFastPdcaPlan() {
  const plan = state.data.fastPdcaPlan;
  if (!plan) return "";
  return `
    <section class="panel" style="margin-top:16px">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">${icon("line")}${plan.title}</h2>
          <span class="panel-sub">${plan.goal}</span>
        </div>
        <span class="status ${statusClass("設計")}">設計反映済み</span>
      </div>
      <div class="summary-row">
        <div class="summary-cell"><span>実行候補</span><strong>${plan.targetCandidates.toLocaleString()}<small>件</small></strong></div>
        <div class="summary-cell"><span>想定成功</span><strong>${plan.expectedSuccess}</strong></div>
        <div class="summary-cell"><span>想定クリック</span><strong>${plan.expectedClicks}</strong></div>
        <div class="summary-cell"><span>A/B配分</span><strong>65/35<small>目安</small></strong></div>
      </div>
      <table class="fast-plan-table" style="margin-top:16px">
        <thead>
          <tr><th>段階</th><th>タイミング</th><th>チャネル</th><th>目安</th><th>設定</th><th>目的</th></tr>
        </thead>
        <tbody>
          ${plan.waves
            .map(
              (wave) => `
                <tr>
                  <td><strong>${wave.step}</strong></td>
                  <td>${wave.timing}</td>
                  <td>${wave.channel}</td>
                  <td>${wave.volume}</td>
                  <td>${wave.settings}</td>
                  <td>${wave.purpose}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
      <div class="notice" style="margin-top:16px">
        <span><strong>A/B配分</strong><br />${plan.abAllocation}</span>
      </div>
      <div class="notice" style="margin-top:10px">
        <span><strong>フォーム主配信</strong><br />${plan.primaryFormSettings}</span>
      </div>
      <div class="notice" style="margin-top:10px">
        <span><strong>メール補完</strong><br />${plan.emailFallbackSettings}</span>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:14px">
        ${plan.gates.map((gate) => `<span class="label-chip">${gate}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderKpis(metrics) {
  return `
    <section class="grid kpi-grid">
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

function renderDashboard() {
  const dashboard = state.data.dashboard;
  const totals = dashboard.pipeline.reduce(
    (acc, row) => {
      acc.planning += row.planning;
      acc.group += row.group;
      acc.template += row.template;
      acc.campaign += row.campaign;
      acc.waiting += row.waiting;
      acc.analyzing += row.analyzing;
      return acc;
    },
    { planning: 0, group: 0, template: 0, campaign: 0, waiting: 0, analyzing: 0 },
  );

  return `
    ${renderKpis(dashboard.metrics)}
    ${renderFlowCard()}
    ${renderFastPdcaPlan()}
    <section class="grid content-two dashboard-main" style="margin-top:16px">
      <article class="panel">
        <div class="panel-head">
          <h2 class="panel-title">${icon("database")}業種別パイプライン</h2>
          <span class="panel-sub">件数は本日時点のステータス別キャンペーン数です。</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>対象</th><th>企画中</th><th>グループ</th><th>テンプレ</th><th>キャンペーン</th><th>未処理</th><th>分析中</th>
            </tr>
          </thead>
          <tbody>
            ${dashboard.pipeline
              .map(
                (row) => `
                  <tr>
                    <td><span class="row-title">${icon(row.icon)}${row.industry}</span></td>
                    <td>${row.planning}</td><td>${row.group}</td><td>${row.template}</td><td>${row.campaign}</td>
                    <td class="number-warn">${row.waiting}</td><td>${row.analyzing}</td>
                  </tr>
                `,
              )
              .join("")}
            <tr class="total-row">
              <td>合計</td><td>${totals.planning}</td><td>${totals.group}</td><td>${totals.template}</td><td>${totals.campaign}</td><td class="number-warn">${totals.waiting}</td><td>${totals.analyzing}</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="panel">
        <div class="panel-head">
          <h2 class="panel-title">${icon("target")}今日の優先タスク</h2>
        </div>
        <div class="task-list">
          ${dashboard.tasks
            .map(
              (task) => `
                <div class="task">
                  <span class="check"></span>
                  <span><strong>${task.title}</strong><small>${task.detail}</small></span>
                  <span class="task-priority ${priorityClass(task.priority)}">${task.priority}</span>
                  <small>${task.due}</small>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>
    </section>

    <section class="grid content-two" style="margin-top:16px">
      <article class="panel">
        <div class="panel-head">
          <h2 class="panel-title">${icon("improve")}直近結果サマリー</h2>
          <span class="panel-sub">過去7日間</span>
        </div>
        <div class="summary-row">
          ${dashboard.resultSummary
            .map(
              (item) => `
                <div class="summary-cell">
                  <span>${item.label}</span>
                  <strong>${item.value}<small>${item.unit}</small></strong>
                </div>
              `,
            )
            .join("")}
        </div>
        <div class="notice">
          <span><strong>結果から次に変えること</strong><br />クリックは出ているため文面方向は維持し、次回は約3,000件の実行候補を3波に分け、フォーム未達分だけをメールで補完します。</span>
          <button class="ghost-button" data-view="results" type="button">詳細を見る</button>
        </div>
      </article>

      <article class="panel pad">
        <h2 class="panel-title">${icon("warning")}リスク / 注意</h2>
        <div style="margin-top:14px">
          ${dashboard.risks
            .map(
              (risk) => `
                <div class="risk-card">
                  ${icon("warning")}
                  <div>
                    <strong>${risk.title}</strong>
                    <p>${risk.detail}</p>
                  </div>
                  <button class="ghost-button" type="button">${risk.action}</button>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>
    </section>
  `;
}

function renderFilters(labels, buttonLabel = "絞り込む") {
  return `
    <section class="panel filters-panel">
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
    ${renderFilters(["業種", "都道府県", "詳細業種", "LP", "状態"])}
    <section class="grid content-two" style="margin-top:16px">
      <article class="panel">
        <div class="panel-head">
          <h2 class="panel-title">${icon("ab")}テスト設計一覧</h2>
          <button class="primary-button" type="button">${icon("ab")}新規テスト案を作成</button>
        </div>
        <table class="ab-test-table">
          <thead><tr><th>テスト名</th><th>対象</th><th>仮説</th><th>A/B差分</th><th>状態</th></tr></thead>
          <tbody>
            ${state.data.abTests
              .map(
                (test) => `
                  <tr>
                    <td><strong>${test.name}</strong><small>${test.industry}</small></td>
                    <td>${test.segment}</td>
                    <td>${test.hypothesis}</td>
                    <td><strong>A:</strong> ${test.appealA}<br><strong>B:</strong> ${test.appealB}<br><small>${test.success}</small></td>
                    <td><span class="status ${statusClass(test.status)}">${test.status}</span></td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </article>

      <aside class="panel pad">
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
      <div class="memo-grid">
        <div class="memo-item"><h3><span class="memo-step">1</span>作成意図</h3><ul><li>${selected.intent}</li><li>業種特有の課題を具体化する</li></ul></div>
        <div class="memo-item"><h3><span class="memo-step">2</span>期待する反応</h3><ul><li>${selected.reaction}</li><li>最終的に面談・相談を申し込む</li></ul></div>
        <div class="memo-item"><h3><span class="memo-step">3</span>比較したい差分</h3><ul><li>${selected.diff}</li><li>CTAの種類も次回比較候補にする</li></ul></div>
        <div class="memo-item"><h3><span class="memo-step">4</span>結果が悪い場合に変える箇所</h3><ul><li>${selected.improve}</li><li>冒頭・CTA・対象条件を順に見直す</li></ul></div>
      </div>
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
    ${renderKpis(approvalMetrics)}
    <section class="grid content-two" style="margin-top:16px">
      <article class="panel approval-table-panel">
        <div class="panel-head">
          <h2 class="panel-title">${icon("approval")}配信管理キャンペーン</h2>
          <span class="panel-sub">4/30配信済みキャンペーンの結果です。次回予約は既存ツール側の日時予約を使います。</span>
        </div>
        <div class="table-scroll">
          <table class="approval-table">
            <thead><tr><th>キャンペーン名</th><th>業種</th><th>既存ツール側グループ</th><th>対象</th><th>指定</th><th>送信可能</th><th>チャネル</th><th>予約</th><th>状態</th><th>操作</th></tr></thead>
            <tbody>
              ${state.data.approvals
                .map(
                  (item) => `
                    <tr>
                      <td>
                        <strong>${item.campaign}</strong><br>
                        <small>${item.lp}</small><br>
                        <small>予約: ${item.scheduledAt || "-"} / 送信可能: ${item.sendableEstimate ? `${item.sendableEstimate}件` : "-"}</small>
                      </td>
                      <td>${item.industry}</td><td>${item.group}</td><td>${item.target}件</td><td>${item.recommended}件</td><td>${item.sendableEstimate ? `${item.sendableEstimate}件` : "-"}</td>
                      <td>${item.deliveryChannel || "フォーム配信"}</td>
                      <td>${item.scheduledAt || "-"}</td>
                      <td><span class="status ${statusClass(item.userStatus)}">${item.userStatus}</span></td>
                      <td>${
                        String(item.scheduledAt || "").includes("配信済み") || item.userStatus === "送信済み"
                          ? "-"
                          : `<button class="ghost-button" data-approve="${item.id}" type="button">日時設定</button>`
                      }</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </article>

      <aside class="panel pad">
        <h2 class="panel-title">${icon("lock")}結果確認メモ</h2>
        <div class="detail-list" style="margin-top:14px">
          ${state.data.approvals
            .slice(0, 1)
            .map(
              (item) => `
                <div class="detail-box"><strong>文面作成意図</strong><p>${item.intent}</p></div>
                <div class="detail-box"><strong>対象条件</strong><p>${item.conditions}</p></div>
                <div class="detail-box"><strong>除外条件</strong><p>${item.exclusions}</p></div>
                <div class="detail-box"><strong>注意事項</strong><p>${item.caution}</p></div>
              `,
            )
            .join("")}
        </div>
        <div class="notice">
          <span><strong>企業名・IDは公開画面に載せない</strong><br />クリック企業の特定は既存ツール内で行い、この画面では集計値だけを扱います。</span>
        </div>
      </aside>
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
    ${renderFilters(["期間", "業種", "キャンペーン", "テスト", "状態"], "更新")}
    <div style="margin-top:16px">${renderKpis(results.metrics)}</div>
    <section class="grid content-two" style="margin-top:16px">
      <article class="panel">
        <div class="panel-head"><h2 class="panel-title">${icon("results")}A/B比較</h2></div>
        <table>
          <thead><tr><th>テスト</th><th>件名</th><th>冒頭</th><th>CTA</th><th>クリック率</th><th>LINE</th><th>判断</th><th>次回方針</th></tr></thead>
          <tbody>
            ${results.comparisons
              .map(
                (item) => `
                  <tr>
                    <td><strong>${item.test}</strong></td><td>${item.subject}</td><td>${item.intro}</td><td>${item.cta}</td><td>${item.click}</td><td>${item.line}</td>
                    <td><span class="status ${statusClass(item.decision)}">${item.decision}</span></td><td>${item.next}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </article>
      <aside class="panel pad">
        <h2 class="panel-title">${icon("improve")}Codex改善案</h2>
        <div class="detail-list" style="margin-top:14px">
          ${results.improvements.map((item) => `<div class="detail-box"><strong>${item.title}</strong><p>${item.text}</p></div>`).join("")}
        </div>
      </aside>
    </section>

    <section class="grid content-two" style="margin-top:16px">
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
    </section>
  `;
}

function renderTemplates() {
  return `
    ${renderFilters(["業種", "訴求軸", "判定", "LP", "状態"])}
    <section class="grid content-two" style="margin-top:16px">
      <article class="panel">
        <div class="panel-head">
          <h2 class="panel-title">${icon("template")}テンプレートライブラリ</h2>
          <button class="primary-button" type="button">${icon("template")}新規テンプレート案</button>
        </div>
        <table>
          <thead><tr><th>テンプレート名</th><th>業種</th><th>訴求軸</th><th>件名</th><th>使用</th><th>クリック率</th><th>更新</th><th>判定</th></tr></thead>
          <tbody>
            ${state.data.templates
              .map(
                (item) => `
                  <tr>
                    <td><strong>${item.name}</strong><br><small>${item.lp}</small></td><td>${item.industry}</td><td>${item.appeal}</td><td>${item.subject}</td>
                    <td>${item.count}回</td><td>${item.click}</td><td>${item.updated}</td><td><span class="status ${statusClass(item.label)}">${item.label}</span></td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </article>
      <aside class="panel pad">
        <h2 class="panel-title">${icon("target")}文面意図と改善履歴</h2>
        <div class="detail-list" style="margin-top:14px">
          <div class="detail-box"><strong>作成意図</strong><p>広告・デザイン企業に絞り、制作進行・提案文・更新報告の負担を具体化する。</p></div>
          <div class="detail-box"><strong>期待する反応</strong><p>制作現場の文章業務に近いと感じ、本文中の {{tracking_url}} から広告・デザイン向けLPを確認する。</p></div>
          <div class="detail-box"><strong>今回結果</strong><p>静岡Aは35件送信で補正クリック3社、長野Bは23件送信で補正クリック2社。キャンペーン詳細側のクリックは0件のため、トラッキング補正で見る。</p></div>
          <div class="detail-box"><strong>次回変えること</strong><p>文面の方向性は維持し、約3,000候補をフォーム3波に分ける。フォーム未達分はメール補完として別枠で扱う。</p></div>
          <div class="detail-box"><strong>停止する表現</strong><p>システム開発寄り、IT全般向け、大企業向けに見える表現は今回使わない。</p></div>
        </div>
      </aside>
    </section>
  `;
}

function renderSegments() {
  const estimatedTotal = state.data.segments.reduce((sum, item) => sum + item.estimated, 0);
  const sendableTotal = state.data.segments.reduce((sum, item) => sum + item.sendable, 0);
  const createdGroups = state.data.segments.filter((item) => item.group.includes("作成済み")).length;
  const nextTarget = state.data.fastPdcaPlan?.targetCandidates || 3000;
  return `
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
        <div class="table-scroll segment-table-scroll">
          <table class="segment-table">
            <thead><tr><th>セグメント名</th><th>DB</th><th>業種</th><th>都道府県</th><th>推定</th><th>送信可能</th><th>除外理由</th><th>配信順</th><th>既存ツール側</th></tr></thead>
            <tbody>
              ${state.data.segments
                .map(
                  (item) => `
                    <tr>
                      <td><strong>${item.name}</strong></td><td>${item.db}</td><td>${item.industry}</td><td>${renderPrefCell(item.pref)}</td><td>${item.estimated.toLocaleString()}件</td>
                      <td>${item.sendable.toLocaleString()}件</td><td>${item.excluded}</td><td>${item.order}</td><td><span class="status ${statusClass(item.group)}">${item.group}</span></td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </article>
      <aside class="panel pad segment-memo">
        <h2 class="panel-title">${icon("target")}対象選定メモ</h2>
        <div class="detail-list" style="margin-top:18px">
          <div class="detail-box"><strong>なぜこの企業群を選ぶか</strong><p>広告・デザイン向けLPとの課題一致度が、IT・ソフトウェア広めの企業群より高いと判断できるため。</p></div>
          <div class="detail-box"><strong>次回の切り方</strong><p>約3,000候補をフォーム配信3波に分ける。Aを厚めにしつつBも残し、都道府県は重複しない別グループにする。</p></div>
          <div class="detail-box"><strong>メール補完の扱い</strong><p>フォーム配信後、失敗・スキップ済みでメールありの企業だけを別グループ化する。同時予約はせず、1アカウント1日100件を上限にする。</p></div>
          <div class="detail-box"><strong>除外条件チェック</strong><p><span class="label-chip">旧Pending除外</span><span class="label-chip">送信済み除外</span><span class="label-chip">フォーム未達補完</span></p></div>
        </div>
      </aside>
    </section>
  `;
}

function buildAnalysisPrompt() {
  const context = state.data.analysisContext;
  const plan = state.data.fastPdcaPlan;
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
  renderSyncBanner();

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
