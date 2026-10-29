// 八道機關的題目與判定。順序即解謎順序。
// 答案判定一律先 norm()：去空白與標點、全形轉半形、英文轉大寫。

export const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSeGv2FIWReWLzYK60V5G3Kfljpz3_ICWaWc2FVYQtCMY3ukFQ/viewform';

export function norm(s) {
  return String(s ?? '')
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[\s　、，,。.．：:；;「」『』（）()〈〉《》！!？?\-—_／/]/g, '')
    .toUpperCase();
}

export const PUZZLES = [
  {
    id: 'bookcase',
    name: '書櫃',
    title: '第一關｜書櫃的三格抽屜',
    story: '書櫃上有三格抽屜，各刻著一個空格：\n「師者，所以＿＿、＿＿、＿＿也。」',
    type: 'text',
    prompt: '依序填入三個詞（共六個字）',
    placeholder: '例：○○○○○○',
    check: (v) => norm(v) === '傳道受業解惑',
    error: '抽屜打不開。老師的三種工作，各是兩個字。',
    hint: '翻到課文第一段第二句。',
    unlock: '三格抽屜一起彈開，最下層有一把小鑰匙，鑰匙上刻著一座天平。'
  },
  {
    id: 'scale',
    name: '天平',
    title: '第二關｜桌上的天平',
    story:
      '天平一邊刻著「無貴無賤」，另一邊刻著「無長無少」。\n韓愈說，選老師時，這些都不重要。那什麼才重要？',
    type: 'choice',
    prompt: '韓愈選擇老師的唯一標準是什麼？',
    options: ['年紀比我大', '地位比我高', '懂得道理', '名氣比我響亮'],
    check: (v) => v === 2,
    error: '天平晃了一下，又歪回去了。',
    hint: '「無貴無賤，無長無少，＿之所存，師之所存也。」',
    unlock: '天平停在正中間，屏風後面傳來「喀」的一聲。'
  },
  {
    id: 'screen',
    name: '屏風',
    title: '第三關｜屏風上的五個人',
    story:
      '屏風上畫了五種人。只有「以向老師學習為恥」的人，會在屏風上發光。\n請點選所有「恥學於師」的人。',
    type: 'multi',
    prompt: '哪些人「恥學於師」？（可複選）',
    options: ['古之聖人', '今之眾人', '巫醫、樂師、百工之人', '孔子', '士大夫之族'],
    check: (v) => [...v].sort().join() === '1,4',
    error: '屏風沒有反應。人數或人選不對。',
    hint: '一個是「今之＿＿」，一個「群聚而笑之」。',
    unlock: '兩扇屏風亮了起來，光正好照在書案的硯台上。'
  },
  {
    id: 'inkstone',
    name: '硯台',
    title: '第四關｜硯台底下的字條',
    story:
      '硯台底下壓著一張字條，是士大夫不肯拜師的理由：\n「彼與彼年相若也，道相似也。位卑則足＿，官盛則近＿。」',
    type: 'text',
    prompt: '依序填入兩個空格（共兩個字）',
    placeholder: '例：○○',
    check: (v) => norm(v) === '羞諛',
    error: '字條還是看不清楚。第一個字是「丟臉」，第二個字是「拍馬屁」。',
    hint: '兩個字都在「位卑則足」和「官盛則近」後面。',
    unlock: '字條背面寫著：「去看看牆上的四幅畫像。」'
  },
  {
    id: 'portraits',
    name: '畫像',
    title: '第五關｜孔子的四位老師',
    story:
      '牆上掛著四幅畫像：郯子、萇弘、師襄、老聃。\n孔子向他們請教過不同的學問，替每一位配上正確的學問。',
    type: 'match',
    prompt: '每位老師教了孔子什麼？',
    left: ['郯子', '萇弘', '師襄', '老聃'],
    options: ['禮', '樂', '琴', '古代官名'],
    check: (v) => v.join() === '3,1,2,0',
    error: '畫像沒有動。有配錯的。',
    hint: '孔子向老聃「問禮」，向師襄「學琴」；郯子講少皞氏用鳥名當官名。',
    unlock: '四幅畫像同時捲起，露出一個暗格，裡面放著一卷竹簡。'
  },
  {
    id: 'slips',
    name: '竹簡',
    title: '第六關｜四片竹簡上的「師」',
    story: '四片竹簡上都有「師」字，但詞性不一樣。\n點一下可以切換：名詞（N）或動詞（V）。',
    type: 'toggle',
    prompt: '判斷每個「師」的詞性',
    items: ['古之學者必有師', '吾從而師之', '吾師道也', '聖人無常師'],
    states: ['名詞', '動詞'],
    check: (v) => v.join() === '0,1,1,0',
    error: '竹簡沒有亮。有一片判斷錯了。',
    hint: '「師」後面接著受詞或「之」，通常是動詞，意思是「向……學習」。',
    unlock: '竹簡排成一行，指向書案上的信封。'
  },
  {
    id: 'letter',
    name: '信封',
    title: '第七關｜書案上的信封',
    story:
      '信封上寫著：\n「年十七，好古文，六藝經傳皆通習之，不拘於時，學於余。」\n只要說出收信人的名字，信封就會打開。',
    type: 'text',
    prompt: '韓愈寫〈師說〉要送給誰？',
    placeholder: '兩個字',
    check: (v) => ['李蟠', '李氏子蟠'].includes(norm(v)),
    error: '信封沒有開。原文說「李氏子＿」。',
    hint: '課文最後一段第一句。',
    unlock: '信封裡是一把銅鑰匙，可以打開書案上的書匣。'
  },
  {
    id: 'box',
    name: '書匣',
    title: '第八關｜最後的鎖：〈師說〉原稿',
    story:
      '書匣上的鎖刻著全文的結論：\n「是故弟子不必不如師，師不必賢於弟子。聞道有＿＿，術業有＿＿，如是而已。」',
    type: 'text',
    prompt: '依序填入兩個空格（共四個字）',
    placeholder: '例：○○○○',
    check: (v) => norm(v) === '先後專攻',
    error: '書匣還鎖著。第一格講「時間」，第二格講「專長」。',
    hint: '「聖人無常師」那一段的最後一句。',
    unlock: '書匣打開了，〈師說〉原稿就在裡面。書房的門也慢慢打開。'
  }
];

export const PASSWORD = '道之所存，師之所存也。';
