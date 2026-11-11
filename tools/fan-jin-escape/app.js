/* 〈范進中舉〉密室逃脫：喚醒新科舉人  v2
 * 依「密室逃脫設計師」專案包改版：
 *   - 四幕結構（開頭／發展／高潮／結尾），對應課文八段
 *   - 每關三層提示（方向 → 作法 → 答案），逐層記錄
 *   - 每關得到一枚字牌，最後在大門用八枚字牌拼出本課主旨（統整關）
 *   - 答錯時給部分回饋（哪一格對了、選對幾個），減少亂猜
 *   - 結局加上收尾回顧四問與出口卡
 * scene3d.js 只用到 FJ.PUZZLES[0..7].obj、tryOpen、finish、toast、registerScene、sceneFailed，
 * 介面維持不變。
 */
(() => {
  "use strict";

  var PASS = "老爺回府了！";
  var SUGGEST_MIN = 40; // 建議時間（分鐘），超過只提醒、不扣分

  var ACTS = [
    { no: "①", name: "開頭", paras: "第 1–2 段", title: "偷考一場賭人生", from: 0, to: 1,
      intro: "范進剛「進學」中了秀才，丈人胡屠戶提著賀禮上門，嘴上道賀，句句是罵。" },
    { no: "②", name: "發展", paras: "第 3–4 段", title: "賣雞的人中舉了", from: 2, to: 3,
      intro: "出榜那日，家裡沒有早飯米，范進抱著老母雞上集去賣，報錄人卻一報、二報、三報地來了。" },
    { no: "③", name: "高潮", paras: "第 5–7 段", title: "一巴掌打醒舉人", from: 4, to: 6,
      intro: "范進喜極而瘋。平日不聞不問的鄰居全來了，還想出一個治瘋的主意：找他最怕的人打一個嘴巴。" },
    { no: "④", name: "結尾", paras: "第 8 段", title: "女婿變成老爺", from: 7, to: 7,
      intro: "范進醒了。回家路上，胡屠戶的嘴臉整個翻了過來。" }
  ];

  var PUZZLES = [
    {
      id: 1, obj: "酒瓶", para: "第一段", src: "課本 p.74｜投影片 p.49–50",
      title: "酒瓶：胡屠戶的「賀禮」",
      story: "茅草棚下擺著一個空酒瓶。范進剛「進學回家」那天，丈人胡屠戶提著賀禮走進來，一邊吃喝一邊數落女婿。",
      type: "fill",
      prompt: "胡屠戶來賀范進中秀才，「手裡拿著一副＿＿和一瓶＿＿」。",
      blanks: [
        { label: "一副＿＿", accept: ["大腸", "一副大腸", "腸", "腸子"] },
        { label: "一瓶＿＿", accept: ["酒", "一瓶酒"] }
      ],
      hints: [
        "答案就在第一段第一句：胡屠戶走進門時，手裡拿的兩樣東西。",
        "原文：「手裡拿著一副＿＿和一瓶＿＿，走了進來。」後面范進還「叫渾家把腸子煮了，燙起酒來」。",
        "答案：一副「大腸」、一瓶「酒」。"
      ],
      explain: "一副大腸和一瓶酒。等范進中舉，他改送「七、八斤肉，四、五千錢」，前倨後恭從賀禮就看得出來。",
      frag: "倨"
    },
    {
      id: 2, obj: "考籃", para: "第二段", src: "課本 p.76–77｜投影片 p.17、p.62、p.144",
      title: "考籃：科舉闖關的身分",
      story: "牆角放著范進瞞著丈人去城裡鄉試時提的考籃。籃底刻著科舉一路往上的身分，順序卻被打亂了。",
      type: "order",
      prompt: "從低到高排出科舉考上後的身分（院試 → 鄉試 → 會試 → 殿試）。點選木牌依序放入。",
      start: "童生",
      tiles: ["舉人", "進士", "秀才", "貢士"],
      answer: ["秀才", "舉人", "貢士", "進士"],
      hints: [
        "從「童生」出發，每考過一級（院試 → 鄉試 → 會試 → 殿試）就換一個身分。",
        "范進第一段「進學」＝考過院試，成了秀才；這次去考鄉試，考上就是舉人。剩下兩個分別屬於會試、殿試。",
        "順序：秀才 → 舉人 → 貢士 → 進士。"
      ],
      explain: "秀才（生員）→ 舉人 → 貢士 → 進士。范進開頭剛是秀才，結尾中了「廣東鄉試第七名亞元」，成為舉人。",
      frag: "前"
    },
    {
      id: 3, obj: "母雞", para: "第三、四段", src: "課本 p.78–79｜投影片 p.75、p.77",
      title: "母雞：插著草標的老母雞",
      story: "院子裡一隻插著草標的老母雞咯咯叫。出榜那天，范進抱著牠到集上，東張西望找人買。",
      type: "choice",
      prompt: "出榜那天，范進為什麼抱著母雞到集上？",
      options: [
        "要把雞送給宗師，答謝他提拔",
        "要拿雞當喜錢，打發報錄人",
        "家裡已經沒有早飯米，要賣這隻雞去「救命」",
        "胡屠戶叫他去賣雞，好還借的盤費"
      ],
      answer: 2,
      hints: [
        "看鄰居來奪雞時，范進怎麼回答對方。",
        "范進說：「你曉得我今日沒有米，要賣這隻雞去＿＿」。家裡「已是餓了兩、三天」。",
        "答案是 (C)：家裡已經沒有早飯米，要賣這隻雞去「救命」"
      ],
      explain: "家裡「已是餓了兩、三天」，放榜當日沒有早飯米，范進只好賣雞「救命」。窮途末路下忽然傳來捷報，對比格外強烈。",
      frag: "涼"
    },
    {
      id: 4, obj: "報帖", para: "第四段", src: "課本 p.79–80｜投影片 p.78–79",
      title: "報帖：升掛在中間的捷報",
      story: "屋子中間，報帖已經升掛起來。范進看了一遍，又念一遍，拍手一笑，往後一跤跌倒。",
      type: "fill",
      prompt: "① 報帖上寫：「高中廣東鄉試第＿名亞元」。② 范進看完報帖喊出的六個字是什麼？",
      blanks: [
        { label: "① 第＿名", accept: ["七", "7", "第七", "第七名"] },
        { label: "② 六個字", accept: ["噫好了我中了"] }
      ],
      hints: [
        "兩個答案都在第四段：報帖上寫的名次，以及范進拍手笑出的那一句話。",
        "報帖：「捷報貴府老爺范諱進，高中廣東鄉試第＿名亞元。」那句話以「噫」開頭、以「我中了」結尾。",
        "答案：① 七　② 噫！好了！我中了！（標點可以不打）"
      ],
      explain: "第七名亞元；「噫！好了！我中了！」說完就「往後一跤跌倒，牙關咬緊，不省人事」。幾十年的辛酸凝成六個字。",
      frag: "世"
    },
    {
      id: 5, obj: "禮籃", para: "第五段", src: "課本 p.81｜投影片 p.86（另見 p.82–84）",
      title: "禮籃：鄰居忽然熱心起來",
      story: "范進瘋了，眾鄰居卻忙著搬桌凳、請報錄人吃酒。門邊堆滿他們拿來的東西。",
      type: "multi",
      prompt: "第五段中，眾鄰居拿來了哪些東西？（全部選對才算過關）",
      options: ["雞蛋", "一副大腸", "白酒", "七、八斤肉", "斗米", "四、五千錢", "兩隻雞"],
      answer: [0, 2, 4, 6],
      hints: [
        "第五段有一句排比：「有拿……來的，有拿……來的，也有……來的」，只看這一句。",
        "「一副大腸」是第一段胡屠戶的賀禮；「肉」和「錢」是第六段胡屠戶的二漢提來的，都不是鄰居送的。",
        "答案：雞蛋、白酒、斗米、兩隻雞。"
      ],
      explain: "雞蛋、白酒、斗米、兩隻雞。和前文「家裡已是餓了兩、三天」對比：雪中送炭者少，錦上添花者多。",
      frag: "炎"
    },
    {
      id: 6, obj: "肉案", para: "第六段", src: "課本 p.83｜投影片 p.92、p.94、p.99",
      title: "肉案：胡屠戶不敢下手",
      story: "鄰居想出辦法：找范進最怕的人打他一個嘴巴。眾人跑到肉案子邊找胡屠戶，他卻作難起來。",
      type: "choice",
      prompt: "眾人推胡屠戶去打范進，他為什麼猶豫為難？",
      options: [
        "他認為女婿中了舉就是天上的星宿，打了要被閻王打一百鐵棍、下十八層地獄",
        "他怕女兒胡氏捨不得，回家跟他吵",
        "他怕報錄人去官府告他打傷舉人老爺",
        "他自知力氣太大，怕一巴掌把范進打死"
      ],
      answer: 0,
      hints: [
        "看胡屠戶「作難道」之後說的那段話：他真正怕的是誰？",
        "「天上的星宿是打不得的。」他還說聽齋公們講，打了星宿會被閻王怎麼處置。",
        "答案是 (A)：他認為女婿中了舉就是天上的星宿，打了要被閻王打一百鐵棍、下十八層地獄"
      ],
      explain: "胡屠戶認為舉人是天上星宿下凡，打了會下十八層地獄。可見他迷信又畏懼權勢，和中舉前的凶狠判若兩人。",
      frag: "後"
    },
    {
      id: 7, obj: "膏藥", para: "第七段", src: "課本 p.85｜投影片 p.104、p.106",
      title: "膏藥：彎不過來的巴掌",
      story: "胡屠戶喝了兩碗酒壯膽，一巴掌打醒了范進。事後他的手隱隱疼起來，連忙向郎中討了膏藥貼著。",
      type: "fill",
      prompt: "胡屠戶看著彎不過來的巴掌，心裡懊惱道：「果然天上＿＿＿是打不得的，而今菩薩計較起來了。」",
      blanks: [{ label: "天上＿＿＿", accept: ["文曲星"] }],
      hints: [
        "胡屠戶在第二段罵范進時就提過：中老爺的人，都是天上的哪一顆星？",
        "第二段：「這些中老爺的，都是天上的＿＿＿。」三個字，是主管文運的星。",
        "答案：文曲星。"
      ],
      explain: "文曲星。凶煞的樣子和內心的害怕形成對比，正是「色厲內荏」；手疼是「一來心虛，二來迷信」。",
      frag: "態"
    },
    {
      id: 8, obj: "衣襟", para: "第八段", src: "課本 p.86–87｜投影片 p.108–110、p.120–125",
      title: "衣襟：前倨後恭",
      story: "范進醒了。回家路上，胡屠戶一路低著頭替女婿扯衣襟。把胡屠戶中舉前、後的表現配成對，就能收齊最後一枚字牌。",
      type: "match",
      prompt: "左邊是范進「中舉前」胡屠戶的表現，替每一項選出「中舉後」的對應表現。",
      rows: [
        { left: "稱呼：「現世寶、窮鬼」", answer: "稱他「賢婿老爺」" },
        { left: "賀禮：一副大腸、一瓶酒", answer: "提著七、八斤肉，四、五千錢" },
        { left: "相貌：「尖嘴猴腮」", answer: "「才學又高，品貌又好」" },
        { left: "態度：「一口啐在臉上」", answer: "低著頭替他扯了幾十回衣襟" }
      ],
      choices: [
        "低著頭替他扯了幾十回衣襟",
        "稱他「賢婿老爺」",
        "「才學又高，品貌又好」",
        "提著七、八斤肉，四、五千錢"
      ],
      hints: [
        "每一列都有一個類別：稱呼、賀禮、相貌、態度。替每一類找「同一類」的中舉後表現。",
        "稱呼看第八段開口叫的「賢婿老爺」；賀禮看第六段二漢提來的東西；相貌看「品貌又好」；剩下的就是態度。",
        "答案：稱呼→賢婿老爺；賀禮→七八斤肉、四五千錢；相貌→才學又高品貌又好；態度→扯衣襟。"
      ],
      explain: "稱呼、賀禮、相貌、態度四項全部翻轉，正是胡屠戶「前倨後恭」的典型。",
      frag: "恭"
    }
  ];

  // 統整關：八枚字牌拼出兩個四字主旨（不在 3D 場景物件裡，於大門觸發）
  var FINAL = {
    id: 9, obj: "大門", para: "全文主旨", src: "投影片 p.110、p.112、p.133–135",
    title: "范家大門：說破眾人的嘴臉",
    story: "大門打開了，門口卻擠著胡屠戶和一群鄰居。要把「老爺」送回府，得先用八關收來的字牌，說破這些人的嘴臉。",
    type: "final",
    prompt: "用八枚字牌拼出本課兩個四字主旨：一個說胡屠戶，一個說鄰居與整個社會。點字牌依序放入格子。",
    rows: [
      { label: "胡屠戶中舉前後", answer: ["前", "倨", "後", "恭"] },
      { label: "鄰居與世人的人情", answer: ["世", "態", "炎", "涼"] }
    ],
    hints: [
      "兩組都是四字詞：一組寫胡屠戶「中舉前」和「中舉後」的轉變，另一組寫整個社會的人情冷暖。",
      "胡屠戶：之前傲慢（倨），之後恭敬（恭）。鄰居：中舉前冷冰冰，中舉後熱烘烘，人情忽冷忽熱。",
      "答案：前倨後恭／世態炎涼。"
    ],
    explain: "前倨後恭寫鄉里小人的趨炎附勢，世態炎涼寫人情的冷暖。再加上科舉對讀書人的摧殘，就是吳敬梓在本課藏的三層諷刺。"
  };

  var ALL = PUZZLES.concat([FINAL]);
  var N = PUZZLES.length; // 8
  var TOTAL = ALL.length; // 9（含大門）
  var HINT_NAMES = ["方向", "作法", "答案"];

  // ---------- 工具 ----------
  function norm(s) {
    return String(s || "").normalize("NFKC")
      .replace(/[\s　]/g, "")
      .replace(/[，。、！？；：「」『』（）()《》〈〉“”‘’"',.!?;:\-—…·・~～]/g, "")
      .toLowerCase();
  }
  function isCorrect(p, a) {
    switch (p.type) {
      case "fill": return p.blanks.every((b, i) => b.accept.map(norm).includes(norm(a[i])));
      case "order": return Array.isArray(a) && a.length === p.answer.length && a.every((x, i) => x === p.answer[i]);
      case "choice": return a === p.answer;
      case "multi": return [...p.answer].sort().join(",") === [...(a || [])].sort().join(",");
      case "match": return p.rows.every((r, i) => a[i] === r.answer);
      case "final": return p.rows.every((r, i) => r.answer.join("") === (a[i] || []).join(""));
    }
    return false;
  }
  // 答錯時的部分回饋：只說「幾格對」，不洩漏是哪個答案
  function diagnose(p, a) {
    switch (p.type) {
      case "fill": {
        if (p.blanks.length < 2) return "";
        var ok = p.blanks.map((b, i) => b.accept.map(norm).includes(norm(a[i])));
        var good = ok.map((v, i) => v ? p.blanks[i].label : null).filter(Boolean);
        return good.length ? "「" + good.join("」「") + "」已經對了，再檢查另一格。" : "兩格都還不對。";
      }
      case "order": {
        var n = a.filter((x, i) => x === p.answer[i]).length;
        return "有 " + n + " 塊木牌放在正確位置。";
      }
      case "multi": {
        var hit = a.filter(x => p.answer.includes(x)).length;
        var bad = a.length - hit;
        return "你選的裡面有 " + hit + " 個正確" + (bad ? "、" + bad + " 個不是鄰居送的" : "") + (hit < p.answer.length ? "，而且還有漏掉的" : "") + "。";
      }
      case "match": {
        var m = p.rows.filter((r, i) => a[i] === r.answer).length;
        return "四組裡有 " + m + " 組配對正確。";
      }
      case "final": {
        var rowsOk = p.rows.filter((r, i) => r.answer.join("") === (a[i] || []).join("")).length;
        return rowsOk ? "其中一組已經對了，再看另一組。" : "兩組都還不對。先想想哪四個字在說胡屠戶。";
      }
    }
    return "";
  }

  var KEY_STATE = "fanjin-escape-v2",
    KEY_STATE_OLD = "fanjin-escape-v1",
    KEY_RESULTS = "fanjin-escape-results-v1",
    KEY_MODE = "fanjin-escape-mode-v1",
    GROUPS = 8,
    $ = id => document.getElementById(id),
    store = {
      get(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
      set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
      del(k) { try { localStorage.removeItem(k); } catch (e) {} }
    };

  function newState(cls, group, mode) {
    return {
      v: 2, cls: cls, group: group, mode: mode, start: Date.now(),
      level: 0, wrong: Array(TOTAL).fill(0), hints: Array(TOTAL).fill(0),
      finished: false, end: null, recorded: false
    };
  }
  function loadState() {
    var s = store.get(KEY_STATE, null);
    if (s && s.v === 2) return s;
    var o = store.get(KEY_STATE_OLD, null); // 舊版進度轉換
    if (o && o.v === 1 && !o.finished) {
      var n = newState(o.cls, o.group, o.mode);
      n.start = o.start; n.level = Math.min(o.level, N);
      o.wrong.forEach((w, i) => { if (i < N) n.wrong[i] = w; });
      o.hints.forEach((h, i) => { if (i < N) n.hints[i] = h ? 1 : 0; });
      store.set(KEY_STATE, n); store.del(KEY_STATE_OLD);
      return n;
    }
    return null;
  }

  var st = loadState(),
    scene = null,
    cur = null,   // 目前開著的機關
    ans = null,   // 目前作答
    lite = false,
    qs = new URLSearchParams(location.search);

  function wantLite() {
    if (qs.get("lite") === "1") return true;
    if (qs.get("lite") === "0") return false;
    return store.get(KEY_MODE, "3d") === "lite";
  }
  function fitH() {
    var h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    document.documentElement.style.setProperty("--appH", h + "px");
  }
  window.addEventListener("resize", fitH);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fitH);
  fitH();

  var pad2 = n => String(n).padStart(2, "0");
  function fmt(ms) { var s = Math.max(0, Math.floor(ms / 1000)); return pad2(Math.floor(s / 60)) + ":" + pad2(s % 60); }
  function elapsed() { return st ? (st.finished ? st.end : Date.now()) - st.start : 0; }
  function save() { if (st) store.set(KEY_STATE, st); }
  function show(id) { $(id).classList.remove("hidden"); }
  function hide(id) { $(id).classList.add("hidden"); }
  var toastT = 0;
  function toast(msg, ms) {
    var t = $("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), ms || 2200);
  }
  function busy() {
    return ["puz", "solved", "act", "help", "menu", "confirm", "start", "end"].some(id => !$(id).classList.contains("hidden"));
  }
  function confirmBox(title, msg, yes) {
    $("cTitle").textContent = title; $("cMsg").textContent = msg; show("confirm");
    $("cYes").onclick = () => { hide("confirm"); yes(); };
    $("cNo").onclick = () => hide("confirm");
  }
  function actOf(i) { return ACTS.find(a => i >= a.from && i <= a.to) || null; }
  function sum(a) { return a.reduce((x, y) => x + y, 0); }
  function hintTotal() { return sum(st.hints); }
  function fragsOwned() { return PUZZLES.slice(0, Math.min(st.level, N)).map(p => p.frag); }

  // ---------- 開始畫面 ----------
  function initStart() {
    var sel = $("grp");
    for (var g = 1; g <= GROUPS; g++) {
      var o = document.createElement("option");
      o.value = String(g); o.textContent = "第 " + g + " 組"; sel.appendChild(o);
    }
    if (st && !st.finished) {
      $("btnResume").classList.remove("hidden");
      $("btnResume").textContent = "繼續上次進度（" + st.cls + " 班第 " + st.group + " 組，" + Math.min(st.level, TOTAL) + " / " + TOTAL + "）";
      $("cls").value = st.cls; sel.value = String(st.group);
    }
    $("btnStart").onclick = () => {
      var cls = $("cls").value.trim(), grp = $("grp").value;
      if (!cls) { $("startErr").textContent = "請先填班級代號（例：101）。"; $("cls").focus(); return; }
      if (!/^[0-9A-Za-z\-一-龥]{1,12}$/.test(cls)) { $("startErr").textContent = "班級代號只能用數字、英文或中文，12 字以內。"; return; }
      if (!grp) { $("startErr").textContent = "請選擇組別。"; $("grp").focus(); return; }
      var go = () => { st = newState(cls, Number(grp), lite ? "lite" : "3d"); save(); enter(true); };
      if (st && !st.finished) {
        confirmBox("要重新開始嗎？", "這台裝置有一份未完成的進度（" + st.cls + " 班第 " + st.group + " 組，" + Math.min(st.level, TOTAL) + " / " + TOTAL + "）。重新開始會把它清掉。", go);
      } else go();
    };
    $("btnResume").onclick = () => enter(false);
    $("toLite").onclick = e => { e.preventDefault(); switchMode(true); };
    $("to3d").onclick = e => { e.preventDefault(); switchMode(false); };
    $("btnCsv").onclick = () => exportResults("csv");
    $("btnJson").onclick = () => exportResults("json");
    $("btnClear").onclick = () => confirmBox("清除本機成績？", "會刪掉這台裝置上全部 " + results().length + " 筆成績，無法復原。請先匯出。", () => {
      store.del(KEY_RESULTS); refreshCount(); toast("已清除本機成績");
    });
    refreshCount(); refreshModeLinks();
  }
  function refreshModeLinks() {
    $("toLite").classList.toggle("hidden", lite);
    $("to3d").classList.toggle("hidden", !lite);
  }
  function switchMode(toLite) {
    store.set(KEY_MODE, toLite ? "lite" : "3d");
    var u = new URL(location.href); u.searchParams.set("lite", toLite ? "1" : "0"); location.href = u.toString();
  }
  function enter(fresh) {
    hide("start"); show("hud");
    if (st.finished) { showEnd(); return; }
    if (lite) { hide("view"); show("lite"); renderLite(); }
    else { hide("lite"); show("view"); show("pad"); show("btnAct"); if (scene) scene.start(); }
    refreshHud();
    if (fresh) showAct(0);
  }

  // ---------- 幕卡 ----------
  function showAct(i, after) {
    var a = ACTS[i];
    $("aNo").textContent = "第" + a.no + "幕　" + a.name + "（" + a.paras + "）";
    $("aTitle").textContent = a.title;
    $("aIntro").textContent = a.intro;
    var objs = PUZZLES.slice(a.from, a.to + 1).map(p => "「" + p.obj + "」").join("、");
    $("aGoal").textContent = "本幕機關：" + objs;
    show("act"); if (scene) scene.pause(true);
    $("aGo").onclick = () => { hide("act"); if (scene && !busy()) scene.pause(false); if (after) after(); };
  }

  // ---------- HUD ----------
  function refreshHud() {
    if (!st) return;
    $("hGroup").textContent = st.cls + " 班 第 " + st.group + " 組";
    $("hProg").textContent = Math.min(st.level, TOTAL);
    $("hTotal").textContent = TOTAL;
    var d = $("diamonds"); d.innerHTML = "";
    for (var i = 0; i < TOTAL; i++) {
      var e = document.createElement("i");
      if (i === N) e.classList.add("gate");
      if (i < st.level) e.classList.add("done"); else if (i === st.level) e.classList.add("cur");
      var a = actOf(i);
      if (a && i === a.from && i > 0) e.classList.add("gap");
      if (i === N) e.classList.add("gap");
      d.appendChild(e);
    }
    var a2 = actOf(st.level);
    $("objective").textContent = st.level < N
      ? "第" + a2.no + "幕｜目標：調查「" + PUZZLES[st.level].obj + "」" + (lite ? "" : "（跟著金色菱形）")
      : "終幕｜目標：走到范家大門，用八枚字牌解開最後的暗語";
    // 字牌行囊
    var bag = $("bag"); bag.innerHTML = "";
    var lab = document.createElement("span"); lab.textContent = "字牌"; bag.appendChild(lab);
    PUZZLES.forEach((p, i) => {
      var b = document.createElement("b");
      b.textContent = i < st.level ? p.frag : "？";
      if (i < st.level) b.className = "got";
      bag.appendChild(b);
    });
    if (scene) scene.setLevel(Math.min(st.level, N));
    if (lite) renderLite();
  }
  setInterval(() => {
    if (!st || $("hud").classList.contains("hidden")) return;
    var ms = elapsed();
    $("hTime").textContent = fmt(ms);
    $("hTimeWrap").classList.toggle("over", ms > SUGGEST_MIN * 60000);
  }, 500);

  // ---------- 機關 ----------
  function tryOpen(i) {
    if (!st || st.finished || busy()) return;
    if (i < st.level) { toast("「" + ALL[i].obj + "」已經解開了"); return; }
    if (i > st.level) { toast("這個機關還鎖著，先去調查「" + ALL[st.level].obj + "」"); return; }
    openPuzzle(ALL[i]);
  }
  function openPuzzle(p) {
    cur = p;
    var i = p.id - 1, a = actOf(i);
    $("pNo").textContent = (a ? "第" + a.no + "幕・" : "終幕・") + "第 " + p.id + " 關｜" + p.para;
    $("pTitle").textContent = p.title;
    $("pStory").textContent = p.story;
    $("pPrompt").textContent = p.prompt;
    $("pSrc").textContent = "翻課本找答案：" + p.src;
    $("pFeedback").textContent = ""; $("pFeedback").className = "feedback";
    renderHints();
    renderBody(p);
    show("puz");
    if (scene) scene.pause(true);
  }
  function renderHints() {
    var p = cur, i = p.id - 1, used = st.hints[i], box = $("pHint");
    box.innerHTML = "";
    for (var k = 0; k < used; k++) {
      var d = document.createElement("div");
      d.className = "hint" + (k === 2 ? " ans" : "");
      var b = document.createElement("b"); b.textContent = "提示 " + (k + 1) + "｜" + HINT_NAMES[k] + "：";
      d.appendChild(b); d.appendChild(document.createTextNode(k === 2 ? p.hints[k].replace(/^答案[：是]\s*/, "") : p.hints[k]));
      box.appendChild(d);
    }
    var btn = $("pHintBtn");
    if (used >= 3) { btn.disabled = true; btn.textContent = "提示已全部打開"; }
    else {
      btn.disabled = false;
      btn.textContent = "💡 看提示 " + (used + 1) + "/3（" + HINT_NAMES[used] + "）";
    }
  }
  function useHint() {
    var p = cur; if (!p) return;
    var i = p.id - 1, used = st.hints[i];
    if (used >= 3) return;
    var open = () => { st.hints[i] = used + 1; save(); renderHints(); };
    if (used === 2) confirmBox("要直接看答案嗎？", "第 3 層提示會直接說出答案，也會記在成績裡。先跟組員再討論一下也可以。", open);
    else open();
  }
  function blurActive() {
    try { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); } catch (e) {}
  }
  function closePuzzle() { blurActive(); hide("puz"); cur = null; if (scene) scene.pause(false); }

  function renderBody(p) {
    var body = $("pBody"); body.innerHTML = "";
    if (p.type === "fill") {
      ans = p.blanks.map(() => "");
      p.blanks.forEach((b, i) => {
        var row = document.createElement("label"); row.className = "fillrow";
        var s = document.createElement("span"); s.textContent = b.label;
        var inp = document.createElement("input"); inp.autocomplete = "off"; inp.dataset.i = i;
        inp.oninput = () => { ans[i] = inp.value; };
        inp.onkeydown = e => { if (e.key === "Enter") submit(); };
        row.append(s, inp); body.appendChild(row);
      });
    } else if (p.type === "choice" || p.type === "multi") {
      ans = p.type === "choice" ? null : [];
      p.options.forEach((txt, i) => {
        var b = document.createElement("button"); b.className = "opt"; b.dataset.i = i;
        b.innerHTML = "<b>(" + "ABCDEFG"[i] + ")</b><span></span>";
        b.querySelector("span").textContent = txt;
        b.onclick = () => {
          if (p.type === "choice") { ans = i; body.querySelectorAll(".opt").forEach(x => x.classList.toggle("sel", x === b)); }
          else { var k = ans.indexOf(i); if (k >= 0) ans.splice(k, 1); else ans.push(i); b.classList.toggle("sel"); }
        };
        body.appendChild(b);
      });
    } else if (p.type === "order") {
      ans = [];
      var slots = document.createElement("div"); slots.className = "slots";
      var tiles = document.createElement("div"); tiles.className = "tiles";
      var draw = () => {
        slots.innerHTML = '<span class="slot fixed">' + p.start + "</span>";
        p.answer.forEach((_, i) => {
          var ar = document.createElement("span"); ar.className = "arrow"; ar.textContent = "→"; slots.appendChild(ar);
          var s = document.createElement("button"); s.className = "slot"; s.textContent = ans[i] || "？";
          s.onclick = () => { if (ans[i]) { ans.splice(i, 1); draw(); } };
          slots.appendChild(s);
        });
        tiles.querySelectorAll(".tile").forEach(t => t.classList.toggle("used", ans.includes(t.dataset.t)));
      };
      p.tiles.forEach(t => {
        var b = document.createElement("button"); b.className = "tile"; b.textContent = t; b.dataset.t = t;
        b.onclick = () => { if (!ans.includes(t) && ans.length < p.answer.length) { ans.push(t); draw(); } };
        tiles.appendChild(b);
      });
      var note = document.createElement("p"); note.className = "note"; note.textContent = "點已放入的格子可以拿回來。";
      body.append(slots, tiles, note); draw();
    } else if (p.type === "match") {
      ans = p.rows.map(() => "");
      p.rows.forEach((r, i) => {
        var row = document.createElement("div"); row.className = "mrow";
        var l = document.createElement("div"); l.textContent = r.left;
        var s = document.createElement("select"); s.dataset.i = i;
        s.innerHTML = '<option value="">中舉後……</option>';
        p.choices.forEach(c => { var o = document.createElement("option"); o.value = c; o.textContent = c; s.appendChild(o); });
        s.onchange = () => { ans[i] = s.value; };
        row.append(l, s); body.appendChild(row);
      });
    } else if (p.type === "final") {
      // 字牌：依取得順序（打散的）排列，玩家依序點入兩列格子
      ans = p.rows.map(() => []);
      var pool = PUZZLES.map(x => x.frag); // 每枚只有一張
      var used = [];
      var rowsEl = document.createElement("div");
      var tilesEl = document.createElement("div"); tilesEl.className = "tiles frag-tiles";
      var redraw = () => {
        rowsEl.innerHTML = "";
        p.rows.forEach((r, ri) => {
          var row = document.createElement("div"); row.className = "frow";
          var lab = document.createElement("span"); lab.className = "flabel"; lab.textContent = r.label;
          var box = document.createElement("div"); box.className = "slots";
          for (var k = 0; k < 4; k++) {
            ((k) => {
              var s = document.createElement("button"); s.className = "slot frag"; s.textContent = ans[ri][k] || "？";
              s.onclick = () => { if (ans[ri][k]) { var ch = ans[ri].splice(k, 1)[0]; used.splice(used.indexOf(ch), 1); redraw(); } };
              box.appendChild(s);
            })(k);
          }
          row.append(lab, box); rowsEl.appendChild(row);
        });
        tilesEl.querySelectorAll(".tile").forEach(t => t.classList.toggle("used", used.includes(t.dataset.t)));
      };
      pool.forEach(ch => {
        var b = document.createElement("button"); b.className = "tile frag"; b.textContent = ch; b.dataset.t = ch;
        b.onclick = () => {
          if (used.includes(ch)) return;
          var ri = ans.findIndex(r => r.length < 4);
          if (ri < 0) return;
          ans[ri].push(ch); used.push(ch); redraw();
        };
        tilesEl.appendChild(b);
      });
      var note2 = document.createElement("p"); note2.className = "note";
      note2.textContent = "字牌會先填第一列，填滿再填第二列；點格子可以把字牌拿回來。";
      body.append(rowsEl, tilesEl, note2); redraw();
    }
  }

  function submit() {
    var p = cur; if (!p) return;
    var i = p.id - 1;
    var empty =
      (p.type === "fill" && ans.some(x => !String(x).trim())) ||
      (p.type === "choice" && ans === null) ||
      (p.type === "multi" && ans.length === 0) ||
      (p.type === "order" && ans.length < p.answer.length) ||
      (p.type === "match" && ans.some(x => !x)) ||
      (p.type === "final" && ans.some(r => r.length < 4));
    var fb = $("pFeedback");
    if (empty) { fb.textContent = "還有空格沒作答喔。"; fb.className = "feedback bad"; return; }
    if (isCorrect(p, ans)) {
      st.level = i + 1; save(); blurActive(); hide("puz"); cur = null;
      var expl = $("sExplain"); expl.textContent = p.explain;
      var fr = $("sFrag");
      if (p.frag) { fr.classList.remove("hidden"); $("sFragCh").textContent = p.frag; $("sFragCount").textContent = st.level + " / " + N; }
      else fr.classList.add("hidden");
      $("sNext").textContent = p.type === "final" ? "送老爺回府" : "繼續探索";
      show("solved");
      if (scene && i < N) scene.solved(i);
      refreshHud();
    } else {
      st.wrong[i]++; save();
      var hintMsg = st.hints[i] < 3 ? "卡住了可以看下一層提示。" : "";
      fb.textContent = "機關沒有動靜……" + diagnose(p, ans) + "（本關答錯 " + st.wrong[i] + " 次）" + hintMsg;
      fb.className = "feedback bad";
      if (scene) scene.wrong();
    }
  }

  function afterSolved() {
    blurActive(); hide("solved"); if (scene) scene.pause(false);
    var lv = st.level;
    if (lv > N) { finishGame(); return; }      // 大門暗語解開
    if (lv === N) {
      if (lite) toast("八枚字牌收齊了！點「范家大門」解開最後的暗語", 3500);
      else { toast("八枚字牌收齊了！走到范家大門，按「走出大門」解開最後的暗語", 4000); if (scene) scene.openGate(); }
      return;
    }
    var prev = actOf(lv - 1), next = actOf(lv);
    if (next && prev !== next) showAct(ACTS.indexOf(next));
    else toast("下一個機關：「" + PUZZLES[lv].obj + "」");
  }

  // 場景或簡易版走到大門時呼叫
  function atGate() {
    if (!st || st.finished || busy()) return;
    if (st.level < N) { toast("還有機關沒解開"); return; }
    if (st.level === N) { openPuzzle(FINAL); return; }
    finishGame();
  }
  function finishGame() {
    if (!st || st.finished || st.level < TOTAL) return;
    st.finished = true; st.end = Date.now(); save(); record(); showEnd();
  }
  function record() {
    if (st.recorded) return;
    var r = results();
    r.push({
      v: 2, class: st.cls, group: st.group, mode: st.mode,
      startedAt: new Date(st.start).toISOString(), finishedAt: new Date(st.end).toISOString(),
      seconds: Math.round((st.end - st.start) / 1000),
      wrongTotal: sum(st.wrong), hintTotal: hintTotal(),
      answersRevealed: st.hints.filter(h => h >= 3).length,
      wrongByLevel: st.wrong.slice(), hintByLevel: st.hints.slice()
    });
    store.set(KEY_RESULTS, r); st.recorded = true; save();
  }
  function showEnd() {
    hide("hud"); hide("pad"); hide("btnAct"); hide("puz"); hide("solved"); hide("act");
    $("eCls").textContent = st.cls;
    $("eGrp").textContent = "第 " + st.group + " 組";
    $("eTime").textContent = fmt(st.end - st.start);
    $("eWrong").textContent = sum(st.wrong) + " 次";
    $("eHint").textContent = hintTotal() + " 層";
    $("ePass").textContent = PASS;
    // 卡最久的一關（答錯＋提示最多）
    var worst = -1, ws = 0;
    st.wrong.forEach((w, i) => { var s = w + st.hints[i]; if (s > ws) { ws = s; worst = i; } });
    $("eStuck").textContent = worst >= 0 ? "你們在「" + ALL[worst].obj + "」（第 " + ALL[worst].id + " 關）花了最多力氣。" : "八關加大門一路順暢，沒有答錯也沒看提示！";
    show("end");
    if (scene) scene.pause(true);
  }
  function restart() {
    store.del(KEY_STATE); st = null;
    location.href = new URL(location.href).toString();
  }

  // ---------- 成績 ----------
  function results() { return store.get(KEY_RESULTS, []); }
  function refreshCount() {
    var n = results().length;
    $("tCount").textContent = n ? "這台裝置共有 " + n + " 筆通關紀錄。" : "這台裝置目前沒有通關紀錄。";
  }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function safe(s) { return String(s).replace(/[^0-9A-Za-z_-]/g, "") || "x"; }
  function stamp() {
    var d = new Date();
    return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + "-" + pad2(d.getHours()) + pad2(d.getMinutes());
  }
  function exportResults(kind) {
    var r = results();
    if (!r.length) { toast("目前沒有成績可以匯出"); return; }
    if (kind === "json") {
      download("fanjin-escape_results_" + stamp() + ".json",
        JSON.stringify({ game: "〈范進中舉〉密室逃脫", exportedAt: new Date().toISOString(), results: r }, null, 2),
        "application/json");
      return;
    }
    var lv = Array.from({ length: TOTAL }, (_, i) => i + 1);
    var head = ["班級", "組別", "版本", "開始時間", "完成時間", "用時(秒)", "用時", "答錯總數", "提示總層數", "直接看答案關數"]
      .concat(lv.map(i => (i === TOTAL ? "大門" : "第" + i + "關") + "答錯"))
      .concat(lv.map(i => (i === TOTAL ? "大門" : "第" + i + "關") + "提示層數"));
    var q = v => { var s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    var pad = (a) => { var x = (a || []).slice(); while (x.length < TOTAL) x.push(""); return x; };
    var rows = r.map(x => [
      x.class, x.group, x.mode === "lite" ? "簡易版" : "3D",
      new Date(x.startedAt).toLocaleString("zh-TW"), new Date(x.finishedAt).toLocaleString("zh-TW"),
      x.seconds, fmt(x.seconds * 1000), x.wrongTotal, x.hintTotal,
      x.answersRevealed != null ? x.answersRevealed : ""
    ].concat(pad(x.wrongByLevel)).concat(pad(x.hintByLevel)));
    var csv = "﻿" + [head].concat(rows).map(r2 => r2.map(q).join(",")).join("\r\n");
    download("fanjin-escape_results_" + stamp() + ".csv", csv, "text/csv;charset=utf-8");
  }
  function scoreCard() {
    var c = document.createElement("canvas"); c.width = 1200; c.height = 760;
    var g = c.getContext("2d"), bg = g.createLinearGradient(0, 0, 0, 760);
    bg.addColorStop(0, "#f9ecd0"); bg.addColorStop(1, "#ead3a0");
    g.fillStyle = bg; g.fillRect(0, 0, 1200, 760);
    g.strokeStyle = "#c99a3a"; g.lineWidth = 14; g.strokeRect(24, 24, 1152, 712);
    g.strokeStyle = "#8a5e10"; g.lineWidth = 3; g.strokeRect(46, 46, 1108, 668);
    g.fillStyle = "#2b1d0e"; g.textAlign = "center";
    var f = '"Microsoft JhengHei","PingFang TC","Noto Sans TC",sans-serif';
    g.font = "bold 64px " + f; g.fillText("〈范進中舉〉密室逃脫", 600, 150);
    g.font = "bold 40px " + f; g.fillStyle = "#b5302a"; g.fillText("老爺回府了！", 600, 215);
    g.fillStyle = "#2b1d0e"; g.font = "38px " + f;
    g.fillText(st.cls + " 班　第 " + st.group + " 組", 600, 300);
    g.fillText("用時 " + fmt(st.end - st.start) + "　答錯 " + sum(st.wrong) + " 次　提示 " + hintTotal() + " 層", 600, 365);
    g.font = "bold 46px " + f; g.fillStyle = "#8a5e10"; g.fillText("前倨後恭　世態炎涼", 600, 440);
    g.font = "28px " + f; g.fillStyle = "#6d5a3d";
    g.fillText("各關答錯：" + st.wrong.join("、") + "　各關提示：" + st.hints.join("、"), 600, 505);
    g.fillText("完成時間：" + new Date(st.end).toLocaleString("zh-TW"), 600, 555);
    g.fillText("通關暗號：" + PASS, 600, 605);
    g.fillStyle = "#b5302a"; g.fillRect(990, 580, 110, 110);
    g.fillStyle = "#fff"; g.font = "bold 64px " + f; g.fillText("中", 1045, 657);
    c.toBlob(b => {
      var a = document.createElement("a"); a.href = URL.createObjectURL(b);
      a.download = "fanjin-escape_scorecard_class-" + safe(st.cls) + "_group-" + st.group + "_" + stamp() + ".png";
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }, "image/png");
  }

  // ---------- 簡易版 ----------
  var ICONS = ["🍶", "🧺", "🐔", "📜", "🥚", "🔪", "🩹", "👘"];
  function renderLite() {
    var root = $("lite"); root.innerHTML = "";
    ACTS.forEach(a => {
      var h = document.createElement("h3"); h.className = "acthead";
      h.textContent = "第" + a.no + "幕　" + a.name + "｜" + a.title;
      root.appendChild(h);
      var yard = document.createElement("div"); yard.className = "yard";
      for (var i = a.from; i <= a.to; i++) {
        ((i) => {
          var p = PUZZLES[i], b = document.createElement("button");
          b.className = "card"; b.dataset.n = i;
          var s = st ? (i < st.level ? "done" : i === st.level ? "cur" : "locked") : "locked";
          b.classList.add(s);
          b.innerHTML = '<span class="ic"></span><span></span><small></small>';
          b.querySelector(".ic").textContent = s === "locked" ? "🔒" : s === "done" ? p.frag : ICONS[i];
          b.children[1].textContent = "第 " + p.id + " 關｜" + p.obj;
          b.children[2].textContent = s === "done" ? "已解開・得到字牌" : s === "cur" ? "點我調查" : "尚未開啟";
          b.onclick = () => tryOpen(i);
          yard.appendChild(b);
        })(i);
      }
      root.appendChild(yard);
    });
    var gy = document.createElement("div"); gy.className = "yard";
    var gate = document.createElement("button");
    var ready = st && st.level >= N;
    gate.className = "card gate" + (ready ? " open" : "");
    gate.textContent = ready ? "🚪 范家大門：用八枚字牌解開最後的暗語" : "🚪 范家大門（收齊八枚字牌才會打開）";
    gate.onclick = () => atGate();
    gy.appendChild(gate); root.appendChild(gy);
  }

  // ---------- 綁定 ----------
  function bind() {
    $("pClose").onclick = closePuzzle;
    $("pSubmit").onclick = submit;
    $("pHintBtn").onclick = useHint;
    $("sNext").onclick = afterSolved;
    $("btnHelp").onclick = () => { show("help"); if (scene) scene.pause(true); };
    $("btnMenu").onclick = () => { show("menu"); if (scene) scene.pause(true); };
    document.querySelectorAll("[data-close]").forEach(b => {
      b.onclick = () => { hide(b.dataset.close); if (scene && !busy()) scene.pause(false); };
    });
    $("mSwitch").onclick = () => { if (st) { st.mode = lite ? "3d" : "lite"; save(); } switchMode(!lite); };
    $("mRestart").onclick = () => { hide("menu"); confirmBox("放棄進度？", "計時、答錯和提示紀錄都會清掉，從第 1 關重來。", restart); };
    $("eCard").onclick = scoreCard;
    $("eRestart").onclick = () => confirmBox("重新開始？", "本組成績已存在這台裝置，重新開始不會刪掉它。", restart);
    window.addEventListener("keydown", e => { if (e.key === "Escape" && !$("puz").classList.contains("hidden")) closePuzzle(); });
  }

  lite = wantLite();
  bind();
  initStart();
  if (lite) hide("view");
  else {
    var sc = document.createElement("script");
    sc.src = "scene3d.js";
    sc.onerror = () => { toast("3D 檔案載入失敗，已改用簡易版", 4000); lite = true; refreshModeLinks(); hide("view"); };
    document.body.appendChild(sc);
  }
  if (st && st.finished) { hide("start"); showEnd(); }

  window.FJ = {
    PUZZLES: PUZZLES,
    FINAL: FINAL,
    ACTS: ACTS,
    get state() { return st; },
    get lite() { return lite; },
    isBusy: busy,
    tryOpen: tryOpen,
    finish: atGate,
    toast: toast,
    registerScene(s) {
      scene = s;
      if (st && !st.finished && $("start").classList.contains("hidden")) {
        scene.start(); scene.setLevel(Math.min(st.level, N));
        if (st.level >= N) scene.openGate();
        if (busy()) scene.pause(true);
      }
    },
    sceneFailed(msg) {
      scene = null; lite = true; refreshModeLinks();
      hide("view"); hide("pad"); hide("btnAct");
      toast(msg || "這台裝置不支援 3D，已改用簡易版", 4000);
      if (st && $("start").classList.contains("hidden")) { show("lite"); renderLite(); refreshHud(); }
    }
  };
})();
