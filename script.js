const screen = document.querySelector("#screen");
const stepText = document.querySelector("#stepText");
const progressBar = document.querySelector("#progressBar");

const state = {
  need: "",
  step: 0,
  intent: null,
  concern: "",
  directionMood: "",
  decisionMode: "compare",
  compareList: [],
  detailProduct: "",
  customConcernOpen: false,
  customMoodOpen: false,
  showRating: false,
  ratings: {}
};

const stepLabels = [
  "先说想法",
  "确认信息",
  "补充偏好",
  "推荐方向",
  "辅助决策",
  "方向详情"
];

const recommendations = [
  {
    name: "简约德训鞋",
    tag: "Clean",
    visual: "trainer",
    mood: "低调质感",
    reason: "线条干净，放进通勤和约会场景都自然，不会抢走整套搭配的重心。",
    audience: "适合常穿牛仔裤、休闲西裤、纯色上衣，希望看起来清爽但不单薄的用户。",
    drawback: "视觉存在感会更克制，如果想让鞋子成为造型重点，可以再看看复古跑鞋方向。",
    scene: "通勤 / 约会 / 周末出门",
    price: "按你填写的大致范围筛选基础配色和常规材质方向",
    size: "脚背高或宽脚用户，建议多参考真实上脚反馈",
    trust: ["低饱和更耐看", "通勤友好", "看鞋头空间"]
  },
  {
    name: "复古跑鞋",
    tag: "Retro",
    visual: "runner",
    mood: "轻微出彩",
    reason: "层次比基础款更丰富，日常穿搭会多一点精神气，整体仍然比较好驾驭。",
    audience: "适合常穿卫衣、夹克、工装裤和宽松牛仔裤，希望基础穿搭更有细节的用户。",
    drawback: "厚底或拼接较多的方向会更挑场合，正式通勤前建议多看自然光穿搭效果。",
    scene: "通勤休闲 / 约会 / 轻街头",
    price: "建议优先看常规配色方向，避开溢价明显的热门联名思路",
    size: "不同鞋型脚感差异较大，宽脚用户优先看前掌空间",
    trust: ["上脚层次强", "看裤脚比例", "避开高热配色"]
  },
  {
    name: "基础板鞋",
    tag: "Basic",
    visual: "skate",
    mood: "日常耐看",
    reason: "轮廓简洁、裤型兼容度高，适合作为高频穿着的候选方向。",
    audience: "适合第一次买球鞋、偏校园感或日常休闲穿搭的用户。",
    drawback: "长时间步行时需要关注鞋底支撑，部分方向脚感可能偏硬。",
    scene: "日常 / 上课 / 轻通勤",
    price: "在大致范围内优先看稳定基础款，不追逐短期热度",
    size: "建议优先查看鞋头空间和后跟磨脚反馈",
    trust: ["日常高频", "看鞋底支撑", "不挑裤型"]
  }
];

const ratingDimensions = [
  ["understanding", "理解", "有没有听懂"],
  ["relevance", "相关", "方向是否贴近"],
  ["explanation", "说明", "理由是否清楚"],
  ["noFake", "真实", "有没有乱编"],
  ["decision", "帮助", "是否更好选"]
];

function setStep(step) {
  state.step = step;
  if (step < 3) state.showRating = false;
  stepText.textContent = stepLabels[step];
  renderProgress();
  render();
}

function renderProgress() {
  progressBar.innerHTML = stepLabels
    .map((_, index) => `<span class="${index <= state.step ? "active" : ""}"></span>`)
    .join("");
}

function parseNeed(text) {
  const budgetMatch = text.match(/预算\s*([0-9]+)|([0-9]+)\s*以内|([0-9]+)\s*左右/);
  const range = budgetMatch ? `${budgetMatch[1] || budgetMatch[2] || budgetMatch[3]}以内/左右` : "还没有说得很细";
  const occasions = [];

  if (text.includes("通勤") || text.includes("上班")) occasions.push("通勤");
  if (text.includes("约会")) occasions.push("约会");
  if (text.includes("日常") || text.includes("周末")) occasions.push("日常");

  return {
    range,
    category: text.includes("鞋") ? "男生休闲鞋方向" : "潮流单品方向",
    occasion: occasions.length ? occasions.join(" / ") : "日常穿搭",
    audience: text.includes("男") ? "男生用户" : "年轻用户",
    feeling: text.includes("不要太夸张") || text.includes("别太浮夸") ? "低调、不浮夸" : "希望再确认一下"
  };
}

function getIntent() {
  return state.intent || parseNeed(state.need);
}

function renderHome() {
  screen.innerHTML = `
    <div class="view">
      <section class="hero-card">
        <p class="eyebrow">Beta / 今日潮流灵感</p>
        <h1>AI潮流导购</h1>
        <p>把你的想法慢慢听清楚，再陪你找到更适合的那一件。</p>
      </section>

      <div class="trust-row">
        <span>潮流眼光</span>
        <span>正品安心</span>
        <span>搭配参考</span>
      </div>

      <div class="input-box">
        <textarea id="needInput" placeholder="例如：预算800以内，想买一双适合通勤和约会的男生休闲鞋，风格不要太夸张">${escapeHtml(state.need)}</textarea>
      </div>

      <div class="quick-grid">
        <button type="button" data-prompt="预算800以内，想买一双适合通勤和约会的男生休闲鞋，风格不要太夸张">通勤约会鞋</button>
        <button type="button" data-prompt="想找一双日常好搭、正品稳、不容易撞款的休闲鞋">日常百搭</button>
        <button type="button" data-prompt="第一次买球鞋，想要好搭、别太难驾驭">第一双球鞋</button>
        <button type="button" data-prompt="宽脚友好一点，别磨脚，风格干净">宽脚友好</button>
      </div>

      <button class="primary-btn" id="startBtn" type="button">开始导购</button>
    </div>
  `;

  const input = document.querySelector("#needInput");
  document.querySelectorAll("[data-prompt]").forEach(button => {
    button.addEventListener("click", () => {
      input.value = button.dataset.prompt;
      input.focus();
    });
  });
  document.querySelector("#startBtn").addEventListener("click", () => {
    const value = input.value.trim();
    if (!value) {
      input.focus();
      input.placeholder = "可以先写下你的真实想法，比如：预算800以内，想买一双适合通勤和约会的男生休闲鞋，风格不要太夸张";
      return;
    }
    state.need = value;
    state.intent = parseNeed(value);
    setStep(1);
  });
}

function renderIntent() {
  const intent = getIntent();

  screen.innerHTML = `
    <div class="view">
      <section class="panel">
        <p class="eyebrow">AI 对话</p>
        <h2>我先听懂你的想法</h2>
        <p>我先把你提到的信息轻轻理顺。如果有不准确的地方，可以在这里改一下。</p>
      </section>
      <section class="intent-form" aria-label="可修改的信息">
        ${fieldCard("range", "大致范围", intent.range, "例如：800以内/左右")}
        ${fieldCard("category", "想看的方向", intent.category, "例如：男生休闲鞋方向")}
        ${fieldCard("occasion", "会出现的场合", intent.occasion, "例如：通勤 / 约会")}
        ${fieldCard("audience", "这次主要给谁选", intent.audience, "例如：自己穿 / 男生朋友 / 通勤使用 / 学生党")}
        ${fieldCard("feeling", "希望保留的感觉", intent.feeling, "例如：低调、不浮夸")}
      </section>
      <section class="guide-summary" aria-label="本轮导购基调">
        <p>本轮先按这个感觉陪你看</p>
        <div>
          ${guideSummary().slice(0, 4).map(item => `<span>${item}</span>`).join("")}
        </div>
      </section>
      <button class="primary-btn" id="confirmIntentBtn" type="button">确认这些信息</button>
    </div>
  `;

  document.querySelector("#confirmIntentBtn").addEventListener("click", () => {
    state.intent = {
      range: readField("range"),
      category: readField("category"),
      occasion: readField("occasion"),
      audience: readField("audience"),
      feeling: readField("feeling")
    };
    setStep(2);
  });
}

function fieldCard(key, label, value, placeholder) {
  return `
    <label class="field-card">
      <span>${label}</span>
      <input id="intent-${key}" type="text" value="${escapeHtml(value)}" placeholder="${placeholder}">
    </label>
  `;
}

function readField(key) {
  return document.querySelector(`#intent-${key}`).value.trim();
}

function guideSummary() {
  const intent = getIntent();
  const concern = state.concern || "先把不合适的方向轻轻筛掉";
  const mood = state.directionMood || "按舒服的节奏慢慢收窄";

  return [
    `这轮先看「${intent.category}」`,
    `大致范围：${intent.range}`,
    `场合：${intent.occasion}`,
    `基调：${intent.feeling}`,
    `稍后会留意：${concern}`,
    `推荐会偏向：${mood}`
  ];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderQuestions() {
  screen.innerHTML = `
    <div class="view">
      <section class="panel">
        <p class="eyebrow">再补充一点</p>
        <h2>这一步只用来帮你少绕路</h2>
        <p>不用回答得很标准，按你平时会在意的感觉选就好。</p>
      </section>
      <section class="question-card">
        <h3>你更担心哪一点？</h3>
        <div class="choice-group" data-group="concern">
          ${["尺码不合适", "上身不好看", "容易撞款", "价格不稳"].map(option => choiceButton("concern", option)).join("")}
          <button class="${state.customConcernOpen ? "selected" : ""}" type="button" data-custom-open="concern">其他想法</button>
        </div>
        ${state.customConcernOpen ? customChoiceInput("concern", "比如：鞋底太硬 / 配色太亮") : ""}
      </section>
      <section class="question-card">
        <h3>你希望这次推荐更偏向？</h3>
        <div class="choice-group" data-group="directionMood">
          ${["稳妥好搭", "轻微出彩", "低调有质感", "更像日常会穿"].map(option => choiceButton("directionMood", option)).join("")}
          <button class="${state.customMoodOpen ? "selected" : ""}" type="button" data-custom-open="directionMood">其他想法</button>
        </div>
        ${state.customMoodOpen ? customChoiceInput("directionMood", "比如：干净但有点特别 / 更适合约会") : ""}
      </section>
      <button class="primary-btn" id="recommendBtn" type="button" ${state.concern && state.directionMood ? "" : "disabled"}>查看推荐方向</button>
    </div>
  `;

  document.querySelectorAll(".choice-group").forEach(group => {
    group.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button) return;
      if (button.dataset.customOpen) {
        if (button.dataset.customOpen === "concern") state.customConcernOpen = true;
        if (button.dataset.customOpen === "directionMood") state.customMoodOpen = true;
        renderQuestions();
        bindActions();
        return;
      }
      state[group.dataset.group] = button.dataset.value;
      renderQuestions();
      bindActions();
    });
  });

  document.querySelectorAll("[data-custom-save]").forEach(button => {
    button.addEventListener("click", () => saveCustomChoice(button.dataset.customSave));
  });

  document.querySelectorAll(".custom-choice input").forEach(input => {
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") saveCustomChoice(input.id.replace("custom-", ""));
    });
  });
}

function saveCustomChoice(key) {
  const input = document.querySelector(`#custom-${key}`);
  const value = input?.value.trim();
  if (!value) {
    input?.focus();
    return;
  }
  state[key] = value;
  renderQuestions();
  bindActions();
}

function choiceButton(key, value) {
  return `<button class="${state[key] === value ? "selected" : ""}" type="button" data-value="${value}">${value}</button>`;
}

function customChoiceInput(key, placeholder) {
  return `
    <label class="custom-choice">
      <input id="custom-${key}" type="text" value="${escapeHtml(state[key])}" placeholder="${placeholder}">
      <button type="button" data-custom-save="${key}">保存</button>
    </label>
  `;
}

function recommendationContext() {
  return `我会按「${state.directionMood}」来收窄范围，也会把「${state.concern}」放进判断里。`;
}

function normalizedConcern() {
  const text = state.concern;
  if (text.includes("尺码") || text.includes("宽脚") || text.includes("磨脚") || text.includes("脚背") || text.includes("硬")) return "尺码不合适";
  if (text.includes("上身") || text.includes("好看") || text.includes("比例") || text.includes("搭")) return "上身不好看";
  if (text.includes("撞款") || text.includes("小众") || text.includes("一样") || text.includes("辨识")) return "容易撞款";
  if (text.includes("价格") || text.includes("预算") || text.includes("贵") || text.includes("波动")) return "价格不稳";
  return state.concern;
}

function normalizedMood() {
  const text = state.directionMood;
  if (text.includes("稳") || text.includes("好搭") || text.includes("安全")) return "稳妥好搭";
  if (text.includes("特别") || text.includes("出彩") || text.includes("街头") || text.includes("存在感")) return "轻微出彩";
  if (text.includes("低调") || text.includes("质感") || text.includes("干净") || text.includes("简约")) return "低调有质感";
  if (text.includes("日常") || text.includes("通勤") || text.includes("常穿") || text.includes("舒服")) return "更像日常会穿";
  return state.directionMood;
}

function moodAdvice(item) {
  const mood = normalizedMood();
  const advice = {
    "稳妥好搭": `${item.name}会更适合作为衣柜里的稳定项，不需要为它额外改变太多穿衣习惯。`,
    "轻微出彩": `${item.name}可以保留一点存在感，但整体仍然不抢戏。`,
    "低调有质感": `${item.name}适合看材质、线条和配色细节，质感会比热闹更重要。`,
    "更像日常会穿": `${item.name}更适合高频场景，重点看耐看度和脚感反馈。`
  };
  return advice[mood] || `${item.name}可以作为这轮的候选方向。`;
}

function budgetAdvice(item) {
  const range = getIntent().range || "你填写的大致范围";
  if (normalizedConcern() === "价格不稳") {
    return `${range}内建议先看基础配色和常规版本，遇到短期热度明显的方向可以先观察。`;
  }
  return `${range}内优先筛稳定配色、常规材质和评价更完整的方向，不用被单一热度带着走。`;
}

function concernAdvice(item) {
  const concern = normalizedConcern();
  const advice = {
    "尺码不合适": `${item.size}。如果平时介于两个尺码之间，建议优先看宽脚、脚背高和后跟磨脚反馈。`,
    "上身不好看": `${item.drawback} 建议重点看同身高、相近裤型的自然光穿搭图，再决定这个方向适不适合你。`,
    "容易撞款": `${item.drawback} 可以优先看低饱和配色、小众材质或非热门配色方向，整体会更有自己的味道。`,
    "价格不稳": `${item.drawback} 价格情绪比较重的方向不用急，先看区间稳定、反馈完整的款式思路。`
  };
  return advice[concern] || `${item.drawback} 你补充的「${state.concern}」也会放进后续筛选里。`;
}

function sizeAdvice(item) {
  const concern = normalizedConcern();
  if (concern === "尺码不合适") return `${item.size}。这项可以放在下单前第一优先级。`;
  if (concern === "上身不好看") return "尺码除了合脚，也会影响鞋型比例；建议看侧面和俯拍上脚图。";
  return item.size;
}

function rankedRecommendations() {
  const preferred = {
    "稳妥好搭": ["简约德训鞋", "基础板鞋", "复古跑鞋"],
    "轻微出彩": ["复古跑鞋", "简约德训鞋", "基础板鞋"],
    "低调有质感": ["简约德训鞋", "基础板鞋", "复古跑鞋"],
    "更像日常会穿": ["基础板鞋", "简约德训鞋", "复古跑鞋"]
  }[normalizedMood()] || ["简约德训鞋", "复古跑鞋", "基础板鞋"];

  return preferred
    .map((name, index) => ({
      ...recommendations.find(item => item.name === name),
      rank: index + 1,
      rankLabel: index === 0 ? "更贴近本轮想法" : index === 1 ? "可以作为备选" : "适合再比较"
    }))
    .filter(Boolean);
}

function compareRows() {
  const concern = normalizedConcern();
  const mood = normalizedMood();
  const concernTips = {
    "尺码不合适": ["看鞋头和脚背空间", "优先看前掌宽度", "留意后跟磨脚反馈"],
    "上身不好看": ["适合低调比例", "更看裤脚衔接", "不太挑裤型"],
    "容易撞款": ["可选低饱和配色", "避开热门配色", "基础但可换材质"],
    "价格不稳": ["常规方向更稳", "避开短期热度", "基础款波动更小"]
  };
  const tips = concernTips[concern] || ["百搭稳定", "层次更丰富", "简洁好搭"];
  const fitMap = {
    "稳妥好搭": ["首看", "备选", "可作日常备选"],
    "轻微出彩": ["稳一点", "首看", "轻松备选"],
    "低调有质感": ["首看", "看配色", "偏日常"],
    "更像日常会穿": ["通勤友好", "看脚感", "首看"]
  };
  const labels = fitMap[mood] || ["首看", "备选", "备选"];

  return rankedRecommendations().map((item, index) => ({
    name: item.name,
    label: index === 0 ? item.rankLabel : labels[index],
    highlight: item.trust[0],
    concern: tips[index],
    fit: `${getIntent().occasion || item.scene}里，${moodAdvice(item)}`,
    selected: state.compareList.includes(item.name)
  }));
}

function outfitCopy() {
  const intent = getIntent();
  const concern = normalizedConcern();
  const concernLine = {
    "尺码不合适": "鞋子这次先照顾脚感和空间，搭配上不用追求太窄的裤脚，给鞋型留一点余量会更自然。",
    "上身不好看": "优先看整体比例：裤脚不要堆得太重，上衣保持干净，鞋子存在感会更舒服。",
    "容易撞款": "可以把亮点放在材质、袜子或外套层次上，不一定靠热门配色表达风格。",
    "价格不稳": "搭配先围绕稳定基础款展开，后续即使换具体款式，整体思路也不容易浪费。"
  };

  return {
    commute: `${intent.occasion.includes("通勤") ? "通勤里" : "日常里"}可以用直筒牛仔裤或休闲西裤，加干净上衣。鞋子保持低饱和，整体会更清爽。`,
    date: `${intent.occasion.includes("约会") ? "约会时" : "想更有准备感时"}可以加微廓形外套、针织衫或短夹克。细节留一点，不需要堆太满。`,
    reminder: `${concernLine[concern] || `你补充的「${state.concern}」会作为筛选提醒。`}整体保持「${intent.feeling}」，会更贴近你一开始的想法。`
  };
}

function renderRecommendations() {
  const intent = getIntent();
  const cards = rankedRecommendations().map(item => `
    <article class="product-card">
      <button class="product-visual visual-${item.visual}" type="button" data-detail-product="${item.name}" aria-label="查看${item.name}方向详情">
        <div class="visual-top">
          <span class="tag">${item.tag}</span>
          <span class="direction">${item.rankLabel}</span>
        </div>
        <div class="shoe shoe-${item.visual}" aria-hidden="true">
          <span></span>
          <i></i>
          <b></b>
        </div>
      </button>
      <div class="product-body">
        <div class="product-title-row">
          <div>
            <h3>${item.name}</h3>
            <p>${item.mood}</p>
          </div>
          <span>No.${item.rank}</span>
        </div>
        <div class="signal-strip">
          <span>${intent.occasion || item.scene}</span>
          <span>${item.tag}</span>
          <span>正品安心</span>
        </div>
        <div class="trust-points">
          ${item.trust.map(point => `<span>${point}</span>`).join("")}
        </div>
        <div class="content-card">
          <span>为什么适合</span>
          <p>${item.reason} ${recommendationContext()} ${moodAdvice(item)}</p>
        </div>
        <div class="compact-grid">
          <div class="content-card">
            <span>适合人群</span>
            <p>${item.audience}</p>
          </div>
          <div class="content-card">
            <span>需要留意</span>
            <p>${concernAdvice(item)}</p>
          </div>
          <div class="content-card">
            <span>价格区间</span>
            <p>${budgetAdvice(item)}</p>
          </div>
          <div class="content-card">
            <span>尺码风险</span>
            <p>${sizeAdvice(item)}</p>
          </div>
        </div>
        <div class="product-actions">
          <button type="button" data-product-action="real" data-product-name="${item.name}">看实物图</button>
          <button type="button" data-product-action="compare" data-product-name="${item.name}">${state.compareList.includes(item.name) ? "已加入对比" : "加入对比清单"}</button>
          <button type="button" data-product-action="ask" data-product-name="${item.name}">继续追问</button>
        </div>
      </div>
    </article>
  `).join("");

  screen.innerHTML = `
    <div class="view">
      <section class="panel intro-panel">
        <p class="eyebrow">推荐方向</p>
        <h2>我先陪你看这三个方向</h2>
      </section>
      <section class="guide-summary compact" aria-label="本轮推荐依据">
        <p>这轮推荐依据</p>
        <div>
          ${guideSummary().map(item => `<span>${item}</span>`).join("")}
        </div>
      </section>
      <section class="refine-row" aria-label="调整本轮导购">
        <button type="button" data-next="1">调整信息</button>
        <button type="button" data-next="2">换个顾虑</button>
      </section>
      <section class="recommend-track" aria-label="横向推荐卡片">${cards}</section>
      <p class="assistant-note" id="assistantNote">我把更贴近这轮想法的方向放在前面。左右滑动，一次看完整一个方向。</p>
      <section class="follow-up-panel" id="followUpPanel" hidden>
        <div>
          <p>继续问我</p>
          <span id="followUpTarget">围绕当前方向再细看一点</span>
        </div>
        <div class="follow-chip-row">
          <button type="button" data-follow-chip="宽脚是否友好">宽脚是否友好</button>
          <button type="button" data-follow-chip="约会会不会太素">约会会不会太素</button>
          <button type="button" data-follow-chip="怎么避开撞款">怎么避开撞款</button>
        </div>
        <label class="follow-input">
          <input id="followUpInput" type="text" placeholder="也可以自己问一句，比如：通勤会不会太休闲">
          <button type="button" id="followUpBtn">问一下</button>
        </label>
      </section>
      <section class="decision-panel">
        <div>
          <h3>还想再稳一点？</h3>
          <p>可以先横向比较，也可以把场景拆成一套穿搭来看。</p>
        </div>
        <div class="action-row">
          <button class="secondary-btn teal" type="button" data-mode="compare">对比方案</button>
          <button class="secondary-btn" type="button" data-mode="outfit">生成搭配</button>
        </div>
      </section>
      <button class="finish-btn" type="button" data-show-rating>结束导购 / 留下感受</button>
      ${state.showRating ? evaluationHtml() : ""}
    </div>
  `;
}

function renderDecision(mode = state.decisionMode || "compare") {
  state.decisionMode = mode;
  const content = mode === "outfit" ? outfitHtml() : compareHtml();
  screen.innerHTML = `
    <div class="view">
      ${content}
      <section class="decision-panel">
        <div>
          <h3>继续怎么选？</h3>
          <p>你可以回到推荐卡慢慢看，也可以结束这一轮体验。</p>
        </div>
        <div class="action-row">
          <button class="secondary-btn" type="button" data-next="3">返回推荐</button>
          <button class="secondary-btn teal" type="button" data-show-rating>结束导购</button>
        </div>
      </section>
      ${state.showRating ? evaluationHtml() : ""}
    </div>
  `;
}

function renderProductDetail() {
  const item = recommendations.find(product => product.name === state.detailProduct) || rankedRecommendations()[0];
  screen.innerHTML = `
    <div class="view">
      <section class="detail-hero">
        <button class="back-link" type="button" data-next="3">返回推荐</button>
        <div class="product-visual visual-${item.visual}">
          <div class="visual-top">
            <span class="tag">${item.tag}</span>
            <span class="direction">模拟销售页</span>
          </div>
          <div class="shoe shoe-${item.visual}" aria-hidden="true">
            <span></span>
            <i></i>
            <b></b>
          </div>
        </div>
        <div class="detail-title">
          <p class="eyebrow">方向详情</p>
          <h2>${item.name}</h2>
          <span>${item.mood}</span>
        </div>
      </section>
      <section class="detail-grid">
        <article class="content-card"><span>适合场景</span><p>${getIntent().occasion || item.scene}</p></article>
        <article class="content-card"><span>为什么适合</span><p>${item.reason} ${moodAdvice(item)}</p></article>
        <article class="content-card"><span>需要留意</span><p>${concernAdvice(item)}</p></article>
        <article class="content-card"><span>尺码建议</span><p>${sizeAdvice(item)}</p></article>
        <article class="content-card"><span>正品安心</span><p>这里只展示方向判断；具体购买信息请以正式商品页为准。</p></article>
      </section>
      <div class="action-row">
        <button class="secondary-btn teal" type="button" data-product-action="compare" data-product-name="${item.name}">${state.compareList.includes(item.name) ? "已加入对比" : "加入对比清单"}</button>
        <button class="secondary-btn" type="button" data-mode="compare">查看对比</button>
      </div>
    </div>
  `;
}

function compareHtml() {
  const rows = compareRows();
  return `
    <section class="panel">
      <p class="eyebrow">方案对比</p>
      <h2>按你在意的点放在一起看</h2>
      <table class="compare-table">
        <thead>
          <tr>
            <th>方向</th>
            <th>本轮判断</th>
            <th>重点查看</th>
            <th>适合这样选</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr class="${row.selected ? "compare-selected" : ""}">
              <td>${row.name}</td>
              <td><strong>${row.label}</strong><br>${row.highlight}</td>
              <td>${row.concern}</td>
              <td>${row.fit}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function outfitHtml() {
  const copy = outfitCopy();
  return `
    <section class="panel">
      <p class="eyebrow">穿搭方案</p>
      <h2>按你的场景这样搭</h2>
      <div class="outfit-grid">
        <div class="content-card"><span>通勤场景</span><p>${copy.commute}</p></div>
        <div class="content-card"><span>约会场景</span><p>${copy.date}</p></div>
        <div class="content-card"><span>温和提醒</span><p>${copy.reminder}</p></div>
      </div>
    </section>
  `;
}

function evaluationHtml() {
  return `
    <section class="panel rating-panel">
      <p class="eyebrow">用户自评</p>
      <h2>这次推荐有帮到你吗？</h2>
      <p>可选，点一下就好；不评也可以结束。</p>
      <div class="eval-grid">
        ${ratingDimensions.map(([key, title, desc]) => `
          <article class="eval-card">
            <strong>${title}</strong>
            <p>${desc}</p>
            <div class="rate-row" aria-label="${title}评分">
              ${[1, 2, 3, 4, 5].map(score => `
                <button class="${state.ratings[key] === score ? "selected" : ""}" type="button" data-rate-key="${key}" data-rate-score="${score}">${score}</button>
              `).join("")}
            </div>
          </article>
        `).join("")}
      </div>
      <div class="rating-actions">
        <button class="secondary-btn teal" type="button" data-submit-rating>${Object.keys(state.ratings).length ? "提交" : "跳过"}</button>
        <button class="secondary-btn" type="button" data-reset-flow>重新开始</button>
        <span id="ratingTip">${Object.keys(state.ratings).length ? "已记录，还可以调整。" : "跳过也可以。"}</span>
      </div>
    </section>
  `;
}

function actionFeedback(action, name) {
  const messages = {
    real: `${name}方向可以优先看真实上脚和自然光实物图，重点留意鞋头宽度、鞋型比例和裤脚衔接。`,
    compare: `${name}已加入对比清单，可以去“对比方案”里横向查看。`,
    ask: `可以继续围绕${name}追问，比如“宽脚是否友好”“约会会不会太素”“和牛仔裤搭不搭”。`
  };
  return messages[action] || "我会按你的选择继续收窄方向。";
}

function followUpAnswer(name, question) {
  const text = question.trim();
  const item = recommendations.find(product => product.name === name) || rankedRecommendations()[0];
  const base = `${name}这个方向`;

  if (!text) return "可以先写一句你担心的点，我会按方向给你判断。";
  if (text.includes("宽脚") || text.includes("尺码") || text.includes("磨脚")) {
    return `${base}要重点看前掌空间和后跟反馈。结合你这轮的顾虑，尺码信息比外观热度更值得先看。`;
  }
  if (text.includes("约会") || text.includes("素") || text.includes("好看")) {
    return `${base}在约会场景里可以成立，关键是裤型和上衣别太随意。${moodAdvice(item)}`;
  }
  if (text.includes("撞款") || text.includes("小众")) {
    return `${base}可以从低饱和配色、非热门材质和少一点大面积标识的方向里找，存在感会更舒服，也更不容易和别人一样。`;
  }
  if (text.includes("通勤") || text.includes("上班")) {
    return `${base}放到通勤里建议看低饱和配色和干净鞋型，搭休闲西裤或直筒牛仔裤会更稳。`;
  }
  if (text.includes("价格") || text.includes("预算")) {
    return `${base}先别被短期热度带走。按「${getIntent().range}」看稳定配色和反馈完整的方向，会更适合这轮选择。`;
  }
  return `${base}可以继续看，但我会把「${state.concern}」放在前面判断，再按「${state.directionMood}」收窄。`;
}

function render() {
  const views = [renderHome, renderIntent, renderQuestions, renderRecommendations, renderDecision, renderProductDetail];
  views[state.step]();
  bindActions();
}

function bindActions() {
  document.querySelectorAll("[data-next]:not([data-mode])").forEach(button => {
    button.addEventListener("click", () => setStep(Number(button.dataset.next)));
  });

  document.querySelectorAll("[data-mode]").forEach(button => {
    button.addEventListener("click", () => {
      state.step = 4;
      state.decisionMode = button.dataset.mode;
      stepText.textContent = stepLabels[4];
      renderProgress();
      renderDecision(button.dataset.mode);
      bindActions();
    });
  });

  document.querySelectorAll("[data-product-action]").forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.productAction === "compare" && !state.compareList.includes(button.dataset.productName)) {
        state.compareList.push(button.dataset.productName);
      }
      const note = document.querySelector("#assistantNote");
      if (note) note.textContent = actionFeedback(button.dataset.productAction, button.dataset.productName);
      if (button.dataset.productAction === "ask") {
        openFollowUp(button.dataset.productName);
      }
      if (button.dataset.productAction === "compare") render();
    });
  });

  document.querySelectorAll("[data-detail-product]").forEach(button => {
    button.addEventListener("click", () => {
      state.detailProduct = button.dataset.detailProduct;
      setStep(5);
    });
  });

  document.querySelectorAll("[data-follow-chip]").forEach(button => {
    button.addEventListener("click", () => submitFollowUp(button.dataset.followChip));
  });

  const followUpBtn = document.querySelector("#followUpBtn");
  if (followUpBtn) followUpBtn.addEventListener("click", () => submitFollowUp());

  const followUpInput = document.querySelector("#followUpInput");
  if (followUpInput) {
    followUpInput.addEventListener("keydown", event => {
      if (event.key === "Enter") submitFollowUp();
    });
  }

  document.querySelectorAll("[data-show-rating]").forEach(button => {
    button.addEventListener("click", () => {
      state.showRating = true;
      render();
      const ratingPanel = document.querySelector(".rating-panel");
      if (ratingPanel) ratingPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll("[data-reset-flow]").forEach(button => {
    button.addEventListener("click", () => {
      state.need = "";
      state.intent = null;
      state.concern = "";
      state.directionMood = "";
      state.decisionMode = "compare";
      state.compareList = [];
      state.detailProduct = "";
      state.customConcernOpen = false;
      state.customMoodOpen = false;
      state.showRating = false;
      state.ratings = {};
      setStep(0);
    });
  });

  const recommendBtn = document.querySelector("#recommendBtn");
  if (recommendBtn) recommendBtn.addEventListener("click", () => setStep(3));

  document.querySelectorAll("[data-rate-key]").forEach(button => {
    button.addEventListener("click", () => {
      state.ratings[button.dataset.rateKey] = Number(button.dataset.rateScore);
      render();
    });
  });

  document.querySelectorAll("[data-submit-rating]").forEach(button => {
    button.addEventListener("click", () => {
      const tip = document.querySelector("#ratingTip");
      if (tip) {
        tip.textContent = Object.keys(state.ratings).length
          ? "已收到，谢谢。"
          : "好的，本次先结束。";
      }
    });
  });
}

function openFollowUp(name) {
  const panel = document.querySelector("#followUpPanel");
  const target = document.querySelector("#followUpTarget");
  const input = document.querySelector("#followUpInput");
  if (!panel || !target || !input) return;
  panel.hidden = false;
  panel.dataset.productName = name;
  target.textContent = `正在看：${name}`;
  input.value = "";
  input.focus();
}

function submitFollowUp(question) {
  const panel = document.querySelector("#followUpPanel");
  const note = document.querySelector("#assistantNote");
  const input = document.querySelector("#followUpInput");
  const name = panel?.dataset.productName || rankedRecommendations()[0].name;
  const text = question || input?.value || "";
  if (note) note.textContent = followUpAnswer(name, text);
  if (input) input.value = text;
}

setStep(0);
