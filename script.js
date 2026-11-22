/* =========================================================
   SMIT AI — Dual Ocean Glass Loading System
   Banter squares: AI assistant | Progress bar: app/lessons/quizzes
========================================================= */
(() => {
  "use strict";

  const banterMarkup = `
    <div class="smit-banter-loader" aria-hidden="true">
      ${Array.from({ length: 9 }, () => '<span></span>').join("")}
    </div>`;

  const progressMarkup = `
    <div class="smit-progress-loader" aria-hidden="true">
      <div class="smit-loading-text"><span>LOADING</span><span class="smit-loading-dots"><i></i><i></i><i></i></span></div>
      <div class="smit-loading-bar-background"><div class="smit-loading-bar"></div></div>
    </div>`;

  const overlayMarkup = (title, subtitle, loaderMarkup, extraClass = "") => `
    <div class="smit-loading-overlay ${extraClass}" role="status" aria-live="polite">
      <div class="smit-loading-glow"></div>
      ${loaderMarkup}
      <strong>${title}</strong>
      <span>${subtitle}</span>
    </div>`;

  window.SMITLoader = {
    banter: banterMarkup,
    progress: progressMarkup,
    run(label = "در حال آماده‌سازی", subtitle = "لطفاً چند لحظه صبر کن...", duration = 520, target = null, callback = () => {}) {
      const host = target || document.body;
      const isAssistant = Boolean(host && host.classList && host.classList.contains("smit-assistant-panel"));
      const selectedLoader = isAssistant ? banterMarkup : progressMarkup;
      const overlay = document.createElement("div");
      overlay.innerHTML = overlayMarkup(label, subtitle, selectedLoader, isAssistant ? "smit-loading-assistant" : "smit-loading-progress");
      const node = overlay.firstElementChild;

      if (host === document.body) {
        node.classList.add("smit-loading-global");
        document.body.appendChild(node);
      } else {
        host.classList.add("smit-loading-host");
        host.appendChild(node);
      }

      window.setTimeout(() => {
        node.classList.add("is-leaving");
        window.setTimeout(() => {
          node.remove();
          if (!document.querySelector(".smit-loading-overlay")) {
            document.querySelectorAll(".smit-loading-host").forEach(el => el.classList.remove("smit-loading-host"));
          }
          try { callback(); } catch (error) { console.error("SMIT loading callback failed:", error); }
        }, 180);
      }, Math.max(250, duration));
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".smit-startup-screen")) return;
    const splash = document.createElement("div");
    splash.className = "smit-startup-screen";
    splash.innerHTML = `
      <div class="smit-startup-content">
        <div class="smit-startup-logo"><span>S</span><b>SMIT<span>AI</span></b></div>
        ${progressMarkup}
        <strong>SMIT AI</strong>
        <span>YOUR PERSONAL LEARNING SPACE</span>
      </div>`;
    document.body.appendChild(splash);
    window.setTimeout(() => {
      splash.classList.add("is-hidden");
      window.setTimeout(() => splash.remove(), 500);
    }, 1250);
  });
})();

/* Shared learning feedback: centered toast + playful original synthesized sound. */
window.SMITLearningFeedback = window.SMITLearningFeedback || (() => {
  let audioContext;
  function playLaugh() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioContext = audioContext || new Ctx();
      if (audioContext.state === "suspended") audioContext.resume();
      const now = audioContext.currentTime;
      // A short, playful cartoon-like "ha-ha!" made with synthesized tones.
      [[0,520],[0.13,680],[0.27,560],[0.40,760]].forEach(([delay,freq],i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.72, now + delay + 0.095);
        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.12, now + delay + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.11);
        osc.connect(gain); gain.connect(audioContext.destination);
        osc.start(now + delay); osc.stop(now + delay + 0.12);
      });
    } catch (e) { console.debug("Learning sound unavailable", e); }
  }
  function show(points = 5) {
    document.querySelector("#smitLearnFeedback")?.remove();
    const el = document.createElement("div");
    el.id = "smitLearnFeedback";
    el.textContent = `+${points} XP  |  ${points} امتیاز اضافه شد!`;
    Object.assign(el.style, {position:"fixed",top:"22px",left:"50%",transform:"translateX(-50%)",zIndex:"999999",padding:"14px 24px",borderRadius:"16px",background:"linear-gradient(135deg,#171018,#0755a8)",border:"1px solid #48baff",color:"#fff",fontSize:"16px",fontWeight:"800",boxShadow:"0 10px 35px rgba(255,35,90,.35)",textAlign:"center",direction:"rtl",pointerEvents:"none",opacity:"0",transition:"opacity .18s ease"});
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = "1"; });
    window.setTimeout(() => { el.style.opacity = "0"; window.setTimeout(() => el.remove(), 220); }, 1900);
    playLaugh();
  }
  return {show};
})();

/* Shared per-word quiz: two questions, +5 XP only after passing both. */
window.SMITWordQuiz = window.SMITWordQuiz || {
  open({container, word, wordsPool, level, onPass, onBack, itemLabel = "کلمه"}) {
    if (!container || !word) return;
    const clean = wordsPool.filter(w => Array.isArray(w) && w[0] && w[1]);
    const distractors = clean.filter(w => w[0] !== word[0]);
    const pick = (correct, field) => {
      const vals = distractors.map(w => String(w[field])).filter(v => v && v !== String(correct));
      const unique = [...new Set(vals)];
      for (let i = unique.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [unique[i], unique[j]] = [unique[j], unique[i]]; }
      return [String(correct), ...unique.slice(0, 3)].sort(() => Math.random() - .5);
    };
    const q = [
      { title: `مفهوم ${itemLabel} «${word[0]}» چیست؟`, options: pick(word[1], 1), correct: String(word[1]) },
      { title: `کدام ${itemLabel} با مفهوم «${word[1]}» مطابقت دارد؟`, options: pick(word[0], 0), correct: String(word[0]) }
    ];
    let answers = [null, null];
    const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const render = () => {
      container.innerHTML = `<div class="smit-page-header"><span class="smit-tag">${esc(level)} / WORD CHECK</span><h1>آزمون ${esc(itemLabel)}: ${esc(word[0])}</h1><p>برای دریافت ۵ XP باید به هر دو سؤال درست پاسخ بدهی.</p></div>
      ${q.map((item,i)=>`<section class="smit-panel"><p class="smit-muted">سؤال ${i+1} از ۲</p><h2>${esc(item.title)}</h2>${item.options.map((o,j)=>`<button type="button" class="smit-quiz-option ${answers[i]===o?'selected':''}" data-word-answer="${i}" data-word-option="${esc(o)}">${String.fromCharCode(65+j)}. ${esc(o)}</button>`).join('')}</section>`).join('')}
      <div class="smit-panel"><p class="smit-muted">${answers.filter(x=>x!==null).length} از ۲ پاسخ انتخاب شده</p><div class="smit-actions"><button class="smit-btn" id="smitWordSubmit" ${answers.some(x=>x===null)?'disabled':''}>ثبت پاسخ‌ها</button><button class="smit-btn" id="smitWordBack">بازگشت به درس</button></div></div>`;
      container.querySelectorAll('[data-word-answer]').forEach(btn=>btn.addEventListener('click',()=>{answers[Number(btn.dataset.wordAnswer)]=btn.dataset.wordOption;render();}));
      container.querySelector('#smitWordBack')?.addEventListener('click',()=>onBack?.());
      container.querySelector('#smitWordSubmit')?.addEventListener('click',()=>{
        const passed=q.every((item,i)=>answers[i]===item.correct);
        if(passed){ onPass?.(); return; }
        document.querySelector('#smitWordFailOverlay')?.remove();
        const overlay=document.createElement('div');
        overlay.id='smitWordFailOverlay';
        Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'1000000',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',background:'rgba(3,4,10,.82)',backdropFilter:'blur(8px)'});
        const card=document.createElement('div');
        Object.assign(card.style,{width:'min(100%,520px)',maxHeight:'min(85vh,700px)',overflowY:'auto',padding:'28px',borderRadius:'22px',background:'linear-gradient(145deg,#102b49,#090b12)',border:'1px solid rgba(255,49,95,.75)',boxShadow:'0 20px 70px rgba(0,0,0,.65),0 0 35px rgba(255,49,95,.18)',color:'#fff',textAlign:'center',direction:'rtl'});
        card.innerHTML=`<span class="smit-tag">TRY AGAIN</span><h2 style="margin:16px 0;color:#8cddff">این بار قبول نشدی</h2><p style="line-height:1.9">برای گرفتن ۵ XP باید هر دو سؤال را درست جواب بدهی. پاسخ درست:</p><div style="margin:20px 0;padding:14px 18px;border-radius:14px;background:rgba(255,255,255,.05);text-align:right">${q.map((item,i)=>`<p style="margin:10px 0"><strong>${i+1}. ${esc(item.correct)}</strong></p>`).join('')}</div><div class="smit-actions" style="justify-content:center;flex-wrap:wrap"><button type="button" class="smit-btn" id="smitWordRetry">تلاش دوباره</button><button type="button" class="smit-btn" id="smitWordBack">بازگشت به درس</button></div>`;
        overlay.appendChild(card);
        document.body.appendChild(overlay);
        card.querySelector('#smitWordRetry')?.addEventListener('click',()=>{overlay.remove();answers=[null,null];render();});
        card.querySelector('#smitWordBack')?.addEventListener('click',()=>{overlay.remove();onBack?.();});
      });
    };
    render();
  }
};

/* =====================================================
   SMIT AI — English Learning System
   Version 3.1 — Fixed & Improved
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const STORAGE_KEY = "smitAI_english_progress_v1";
  const PASS_MARK = 15;

  // -----------------------------------------------------
  // 1. LESSONS — A1 VOCABULARY
  // Each word: English, Persian, Pronunciation, Example,
  // Persian example, Type
  // -----------------------------------------------------

  const lessons = [
    {
      id: 1,
      title: "Greetings & Introductions",
      faTitle: "سلام و معرفی",
      description: "Learn how to greet people and introduce yourself.",
      faDescription: "یاد بگیر چطور سلام کنی و خودت را معرفی کنی.",
      words: [
        ["hello","سلام","هِلُو","Hello, my name is Alex.","سلام، اسم من الکس است.","interjection"],
        ["goodbye","خداحافظ","گودبای","Goodbye, see you tomorrow.","خداحافظ، فردا می‌بینمت.","interjection"],
        ["good morning","صبح بخیر","گود مورنینگ","Good morning, everyone.","صبح بخیر، همه.","phrase"],
        ["good evening","عصر بخیر","گود ایونینگ","Good evening, Anna.","عصر بخیر، آنا.","phrase"],
        ["please","لطفاً","پلیز","Please sit down.","لطفاً بنشین.","adverb"],
        ["thank you","متشکرم","ثَنک یو","Thank you for your help.","برای کمکت متشکرم.","phrase"],
        ["sorry","متأسفم / ببخشید","ساری","Sorry, I am late.","ببخشید، دیر کردم.","adjective"],
        ["yes","بله","یِس","Yes, I understand.","بله، متوجه می‌شوم.","adverb"],
        ["no","نه","نو","No, I am not tired.","نه، خسته نیستم.","adverb"],
        ["name","نام / اسم","نِیم","What is your name?","اسم تو چیست؟","noun"],
        ["friend","دوست","فِرِند","He is my friend.","او دوست من است.","noun"],
        ["people","مردم / افراد","پیپِل","Many people are here.","افراد زیادی اینجا هستند.","noun"],
        ["man","مرد","مَن","That man is a teacher.","آن مرد معلم است.","noun"],
        ["woman","زن","وومِن","The woman is a doctor.","آن زن پزشک است.","noun"],
        ["boy","پسر","بوی","The boy is happy.","آن پسر خوشحال است.","noun"],
        ["girl","دختر","گِرل","The girl is my sister.","آن دختر خواهر من است.","noun"],
        ["I","من","آی","I am a student.","من دانش‌آموز هستم.","pronoun"],
        ["you","تو / شما","یو","You are very kind.","تو خیلی مهربانی.","pronoun"],
        ["he","او (مذکر)","هی","He is my brother.","او برادر من است.","pronoun"],
        ["she","او (مونث)","شی","She is a student.","او دانش‌آموز است.","pronoun"]
      ]
    },
    {
      id: 2,
      title: "Family & Home",
      faTitle: "خانواده و خانه",
      description: "Learn family members and things around your home.",
      faDescription: "اعضای خانواده و وسایل خانه را یاد بگیر.",
      words: [
        ["family","خانواده","فَمِلی","My family is small.","خانواده من کوچک است.","noun"],
        ["mother","مادر","مادِر","My mother is kind.","مادرم مهربان است.","noun"],
        ["father","پدر","فادِر","My father is at work.","پدرم سر کار است.","noun"],
        ["brother","برادر","برادِر","I have one brother.","من یک برادر دارم.","noun"],
        ["sister","خواهر","سیستِر","My sister is young.","خواهرم جوان است.","noun"],
        ["parents","والدین","پِرِنتس","My parents are at home.","والدینم در خانه هستند.","noun"],
        ["house","خانه","هاوس","This is my house.","این خانه من است.","noun"],
        ["room","اتاق","روم","My room is clean.","اتاق من تمیز است.","noun"],
        ["kitchen","آشپزخانه","کیچِن","The kitchen is big.","آشپزخانه بزرگ است.","noun"],
        ["bedroom","اتاق خواب","بِدروم","My bedroom is small.","اتاق خوابم کوچک است.","noun"],
        ["door","در","دور","Open the door, please.","لطفاً در را باز کن.","noun"],
        ["window","پنجره","ویندو","The window is open.","پنجره باز است.","noun"],
        ["table","میز","تِیبِل","The book is on the table.","کتاب روی میز است.","noun"],
        ["chair","صندلی","چِر","This chair is comfortable.","این صندلی راحت است.","noun"],
        ["bed","تخت","بِد","My bed is new.","تختم جدید است.","noun"],
        ["book","کتاب","بوک","I have a book.","من یک کتاب دارم.","noun"],
        ["computer","کامپیوتر","کامپیوتِر","My computer is new.","کامپیوتر من جدید است.","noun"],
        ["phone","تلفن / گوشی","فون","This is my phone.","این گوشی من است.","noun"],
        ["big","بزرگ","بیگ","It is a big house.","این یک خانه بزرگ است.","adjective"],
        ["small","کوچک","اِسمال","I have a small room.","من یک اتاق کوچک دارم.","adjective"]
      ]
    },
    {
      id: 3,
      title: "Daily Life & Time",
      faTitle: "زندگی روزمره و زمان",
      description: "Talk about your daily routine and the time.",
      faDescription: "درباره برنامه روزانه و زمان صحبت کن.",
      words: [
        ["day","روز","دِی","Have a nice day.","روز خوبی داشته باشی.","noun"],
        ["night","شب","نایت","Good night, everyone.","شب بخیر، همه.","noun"],
        ["morning","صبح","مورنینگ","I study in the morning.","من صبح درس می‌خوانم.","noun"],
        ["afternoon","بعدازظهر","اَفتِرنون","I work in the afternoon.","من بعدازظهر کار می‌کنم.","noun"],
        ["today","امروز","تودِی","I am busy today.","من امروز سرم شلوغ است.","adverb"],
        ["tomorrow","فردا","تومارو","See you tomorrow.","فردا می‌بینمت.","adverb"],
        ["yesterday","دیروز","یِستِردِی","I was at home yesterday.","دیروز خانه بودم.","adverb"],
        ["time","زمان / وقت","تایم","What time is it?","ساعت چند است؟","noun"],
        ["work","کار کردن / کار","وِرک","I work every day.","من هر روز کار می‌کنم.","verb/noun"],
        ["study","درس خواندن","اِستادی","I study English.","من انگلیسی می‌خوانم.","verb"],
        ["learn","یاد گرفتن","لِرن","I learn new words.","من کلمات جدید یاد می‌گیرم.","verb"],
        ["eat","خوردن","ایت","I eat breakfast.","من صبحانه می‌خورم.","verb"],
        ["drink","نوشیدن","درینک","I drink water.","من آب می‌نوشم.","verb"],
        ["sleep","خوابیدن","اِسلیپ","I sleep at night.","من شب می‌خوابم.","verb"],
        ["wake up","بیدار شدن","وِیک آپ","I wake up at seven.","من ساعت هفت بیدار می‌شوم.","phrasal verb"],
        ["go","رفتن","گو","I go to school.","من به مدرسه می‌روم.","verb"],
        ["come","آمدن","کام","Come here, please.","لطفاً بیا اینجا.","verb"],
        ["happy","خوشحال","هَپی","I am happy today.","من امروز خوشحالم.","adjective"],
        ["tired","خسته","تایِرد","I am tired now.","من الان خسته‌ام.","adjective"],
        ["busy","مشغول","بیزی","She is busy today.","او امروز مشغول است.","adjective"]
      ]
    },
    {
      id: 4,
      title: "Food, Shopping & Places",
      faTitle: "غذا، خرید و مکان‌ها",
      description: "Learn useful words for food, shopping and places.",
      faDescription: "کلمات کاربردی غذا، خرید و مکان‌ها را یاد بگیر.",
      words: [
        ["food","غذا","فود","I like this food.","من این غذا را دوست دارم.","noun"],
        ["water","آب","واتِر","I need some water.","من کمی آب لازم دارم.","noun"],
        ["bread","نان","بِرِد","I eat bread for breakfast.","برای صبحانه نان می‌خورم.","noun"],
        ["milk","شیر","میلک","The milk is cold.","شیر سرد است.","noun"],
        ["apple","سیب","اَپِل","I have an apple.","من یک سیب دارم.","noun"],
        ["rice","برنج","رایس","We eat rice for lunch.","ما برای ناهار برنج می‌خوریم.","noun"],
        ["coffee","قهوه","کافی","I drink coffee.","من قهوه می‌نوشم.","noun"],
        ["tea","چای","تی","Would you like some tea?","کمی چای میل داری؟","noun"],
        ["shop","مغازه / فروشگاه","شاپ","The shop is open.","فروشگاه باز است.","noun"],
        ["market","بازار","مارکِت","I go to the market.","من به بازار می‌روم.","noun"],
        ["money","پول","مانی","I need some money.","من کمی پول لازم دارم.","noun"],
        ["price","قیمت","پرایس","What is the price?","قیمت چقدر است؟","noun"],
        ["buy","خریدن","بای","I want to buy a book.","می‌خواهم یک کتاب بخرم.","verb"],
        ["city","شهر","سیتی","This city is beautiful.","این شهر زیباست.","noun"],
        ["street","خیابان","اِستریت","My house is on this street.","خانه من در این خیابان است.","noun"],
        ["school","مدرسه","اِسکول","The school is near my house.","مدرسه نزدیک خانه من است.","noun"],
        ["hospital","بیمارستان","هاسپیتِل","The hospital is big.","بیمارستان بزرگ است.","noun"],
        ["restaurant","رستوران","رِستورانت","We are at a restaurant.","ما در یک رستوران هستیم.","noun"],
        ["near","نزدیک","نیر","The shop is near here.","فروشگاه نزدیک اینجاست.","preposition/adjective"],
        ["beautiful","زیبا","بیوتیفُل","This city is beautiful.","این شهر زیباست.","adjective"]
      ]
    }
  ];

  // -----------------------------------------------------
  // 2. PHRASES
  // -----------------------------------------------------

  const phrases = [
    ["How are you?","حالت چطوره؟"],
    ["I am fine, thank you.","خوبم، متشکرم."],
    ["What is your name?","اسم تو چیست؟"],
    ["My name is Alex.","اسم من الکس است."],
    ["Where are you from?","اهل کجا هستی؟"],
    ["I am from Iran.","من اهل ایران هستم."],
    ["Nice to meet you.","از آشنایی با تو خوشحالم."],
    ["Can you help me?","می‌توانی به من کمک کنی؟"],
    ["I don't understand.","متوجه نمی‌شوم."],
    ["Please speak slowly.","لطفاً آهسته صحبت کن."],
    ["How much is it?","قیمتش چقدر است؟"],
    ["Where is the bathroom?","دستشویی کجاست؟"],
    ["I would like some water.","کمی آب می‌خواهم."],
    ["See you later.","بعداً می‌بینمت."],
    ["Have a nice day!","روز خوبی داشته باشی!"],
    ["I am learning English.","من در حال یادگیری انگلیسی هستم."]
  ];

      // -----------------------------------------------------
    // 3. GRAMMAR
    // -----------------------------------------------------

    const grammar = [
      {
        title: "Lesson 1 — Verb To Be",
        faTitle: "درس ۱ — فعل To Be",
        explanation: "Use am, is and are to talk about people and things.",
        faExplanation: "از am، is و are برای معرفی افراد و بیان وضعیت استفاده می‌کنیم.",
        rules: [
          ["I","am","I am a student.","من دانش‌آموز هستم."],
          ["He / She / It","is","She is happy.","او خوشحال است."],
          ["You / We / They","are","They are friends.","آن‌ها دوست هستند."]
        ]
      },
      {
        title: "Lesson 2 — Subject Pronouns",
        faTitle: "درس ۲ — ضمایر فاعلی",
        explanation: "Subject pronouns replace names or nouns.",
        faExplanation: "ضمایر فاعلی به جای اسم افراد یا اشیا استفاده می‌شوند.",
        rules: [
          ["I","من","I am Alex.","من الکس هستم."],
          ["You","تو / شما","You are kind.","تو مهربان هستی."],
          ["He / She","او","He is a teacher.","او معلم است."],
          ["It","آن / این","It is a book.","آن یک کتاب است."],
          ["We / They","ما / آن‌ها","We are students.","ما دانش‌آموز هستیم."]
        ]
      },
      {
        title: "Lesson 3 — A / An",
        faTitle: "درس ۳ — حروف تعریف A و An",
        explanation: "Use a or an before a singular countable noun.",
        faExplanation: "قبل از اسم مفرد قابل‌شمارش از a یا an استفاده می‌کنیم.",
        rules: [
          ["A","قبل از صدای صامت","a book","یک کتاب"],
          ["An","قبل از صدای مصوت","an apple","یک سیب"],
          ["A","مثال دیگر","a computer","یک کامپیوتر"],
          ["An","مثال دیگر","an egg","یک تخم‌مرغ"]
        ]
      },
      {
        title: "Lesson 4 — Negative Sentences",
        faTitle: "درس ۴ — جملات منفی",
        explanation: "Add not after am, is or are to make a negative sentence.",
        faExplanation: "برای منفی کردن جمله، not را بعد از am، is یا are قرار می‌دهیم.",
        rules: [
          ["I am not","من نیستم","I am not tired.","من خسته نیستم."],
          ["He is not","او نیست","He is not busy.","او مشغول نیست."],
          ["She is not","او نیست","She is not a teacher.","او معلم نیست."],
          ["They are not","آن‌ها نیستند","They are not here.","آن‌ها اینجا نیستند."]
        ]
      }
    ];

    // -----------------------------------------------------
    // 4. QUIZ — 20 QUESTIONS
    // -----------------------------------------------------

    const quizQuestions = [
      {q:"What does 'Hello' mean?",options:["خداحافظ","سلام","متشکرم","ببخشید"],answer:1},
      {q:"What is the English word for 'مادر'?",options:["Father","Sister","Mother","Brother"],answer:2},
      {q:"Choose the correct sentence.",options:["I is happy.","I are happy.","I am happy.","I be happy."],answer:2},
      {q:"What does 'Beautiful' mean?",options:["بزرگ","زیبا","کوچک","خسته"],answer:1},
      {q:"Complete: She ___ a student.",options:["am","are","is","be"],answer:2},
      {q:"What is the meaning of 'Book'?",options:["میز","کتاب","صندلی","اتاق"],answer:1},
      {q:"What does 'Tomorrow' mean?",options:["دیروز","امروز","فردا","شب"],answer:2},
      {q:"Choose the correct article: ___ apple.",options:["A","An","Are","Is"],answer:1},
      {q:"What is the English word for 'آب'?",options:["Milk","Bread","Water","Rice"],answer:2},
      {q:"Complete: They ___ friends.",options:["am","is","are","be"],answer:2},
      {q:"What does 'Wake up' mean?",options:["خوابیدن","بیدار شدن","خوردن","رفتن"],answer:1},
      {q:"Choose the correct negative sentence.",options:["I not am tired.","I am not tired.","I are not tired.","I is not tired."],answer:1},
      {q:"What is the English word for 'خواهر'?",options:["Brother","Father","Sister","Mother"],answer:2},
      {q:"What does 'Price' mean?",options:["پول","قیمت","فروشگاه","خیابان"],answer:1},
      {q:"Complete: He ___ my friend.",options:["am","are","is","not"],answer:2},
      {q:"What does 'Thank you' mean?",options:["لطفاً","متشکرم","ببخشید","خداحافظ"],answer:1},
      {q:"Choose the correct sentence.",options:["She are happy.","She am happy.","She is happy.","She be happy."],answer:2},
      {q:"What is the English word for 'بیمارستان'?",options:["School","Restaurant","Hospital","Market"],answer:2},
      {q:"Complete: This is ___ computer.",options:["an","a","are","am"],answer:1},
      {q:"What does 'I am learning English' mean?",options:["من انگلیسی تدریس می‌کنم.","من انگلیسی را دوست ندارم.","من در حال یادگیری انگلیسی هستم.","من انگلیسی صحبت نمی‌کنم."],answer:2}
    ];

    // -----------------------------------------------------
    // 5. PROGRESS STORAGE
    // -----------------------------------------------------

    const defaults = {
      xp: 0,
      learned: [],
      bestQuiz: 0,
      completedLessons: [],
      levelResults: {},
      unlockedLevels: ["A1"],
      quizPassed: false,
      quizRewarded: false
    };

    function loadProgress() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

        return {
          ...defaults,
          ...saved,
          learned: Array.isArray(saved.learned) ? saved.learned : [],
          completedLessons: Array.isArray(saved.completedLessons) ? saved.completedLessons : [],
          unlockedLevels: Array.isArray(saved.unlockedLevels) ? saved.unlockedLevels : ["A1"],
          levelResults: saved.levelResults && typeof saved.levelResults === "object"
            ? saved.levelResults
            : {}
        };
      } catch (error) {
        console.warn("Progress could not be loaded:", error);
        return {...defaults};
      }
    }

    let progress = loadProgress();

    function saveProgress() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.warn("Progress could not be saved:", error);
        toast("ذخیره پیشرفت در مرورگر ممکن نشد.");
      }

      updateDashboardStats();
    }

    function updateDashboardStats() {
      document.querySelectorAll("#xpValue,.xp-value,[data-xp]").forEach(el => {
        el.textContent = progress.xp;
      });

      document.querySelectorAll("#learnedValue,.learned-value,[data-learned]").forEach(el => {
        el.textContent = progress.learned.length;
      });
    }

    // -----------------------------------------------------
    // 6. PAGE ELEMENTS
    // -----------------------------------------------------

    const main = document.querySelector(".main-content") ||
                 document.querySelector("main");

    if (!main) {
      console.error("SMIT AI: Main content area was not found.");
      return;
    }

    let dynamicPage = document.getElementById("dynamicPage");

    if (!dynamicPage) {
      dynamicPage = document.createElement("section");
      dynamicPage.id = "dynamicPage";

      const topbar = main.querySelector(".topbar");

      if (topbar && topbar.parentNode === main) {
        topbar.insertAdjacentElement("afterend", dynamicPage);
      } else {
        main.appendChild(dynamicPage);
      }
    }

    // -----------------------------------------------------
    // 7. PAGE STYLES
    // -----------------------------------------------------

    if (!document.getElementById("smit-v3-styles")) {
      const style = document.createElement("style");
      style.id = "smit-v3-styles";

      style.textContent = `
        #dynamicPage {
          width:100%;
          padding:24px 0;
          color:var(--text,#f5f5f5);
        }
        .smit-page-header { margin-bottom:25px; }
        .smit-page-header h1 { font-size:clamp(23px,4vw,32px); margin:0 0 10px; }
        .smit-page-header p,.smit-muted { color:#aaa; line-height:1.9; }
        .smit-panel,.smit-lesson-card,.smit-word-card,.smit-level-card {
          background:rgba(255,255,255,.035);
          border:1px solid rgba(255,55,75,.18);
          border-radius:16px;
          padding:18px;
          margin-bottom:16px;

          backdrop-filter:blur(12px);
        }
        .smit-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; margin:18px 0; }
        .smit-level-row,.smit-tabs,.smit-actions { display:flex; gap:10px; flex-wrap:wrap; margin:16px 0; }
        .smit-level-card { flex:1 1 120px; min-width:100px; }
        .smit-level-card.locked { opacity:.45; }
        .smit-btn,.smit-tab {
          border:1px solid rgba(255,55,75,.35);
          background:rgba(255,40,65,.1);
          color:white;
          border-radius:10px;
          padding:11px 16px;
          cursor:pointer;
          font:inherit;
          transition:.2s ease;
        }
        .smit-btn:hover,.smit-tab:hover,.smit-tab.active {
          background:rgba(255,40,65,.25);
          border-color:#48baff;
          transform:translateY(-1px);
        }
        .smit-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }
        .smit-word-card { display:flex; flex-direction:column; gap:8px; }
        .smit-vocab-tools { display:grid; grid-template-columns:minmax(0,2fr) minmax(150px,1fr); gap:10px; margin:16px 0; }
        .smit-vocab-tools input,.smit-vocab-tools select { width:100%; min-width:0; box-sizing:border-box; padding:12px 14px; color:#fff; background:rgba(255,255,255,.06); border:1px solid rgba(255,55,75,.3); border-radius:10px; font:inherit; }
        .smit-vocab-tools input::placeholder { color:#aaa; }
        .smit-vocab-tools select option { color:#111; }
        .smit-filter-count { color:#aaa; font-size:13px; margin:8px 0 14px; }
        .smit-word-card[hidden] { display:none !important; }
        @media(max-width:520px) { .smit-vocab-tools { grid-template-columns:1fr; } }
        .smit-word-card h3 { color:#48baff; font-size:21px; margin:0; }
        .smit-word-card p { margin:0; line-height:1.8; }
        .smit-muted { font-size:13px; }
        .smit-progress-track { height:8px; border-radius:20px; background:rgba(255,255,255,.1); overflow:hidden; margin:12px 0; }
        .smit-progress-fill { height:100%; background:#48baff; transition:width .3s; }
        .smit-quiz-option { display:block; width:100%; text-align:right; padding:13px; margin:9px 0; border:1px solid #b9c7c1; border-radius:10px; color:#111111!important; background:#ffffff; cursor:pointer; font:inherit; transition:background .18s,border-color .18s; }
        .smit-quiz-option:hover { border-color:#159447; background:#effbf2; color:#111111!important; }
        .smit-quiz-option.selected { border-color:#159447; background:#baf2c8; color:#000000!important; }
        .smit-quiz-option.correct { border-color:#159447; background:#baf2c8; color:#000000!important; }
        .smit-quiz-option.wrong { border-color:#b42318; background:#ffe1df; color:#111111!important; }
        .smit-tag { display:inline-block; padding:5px 9px; border-radius:20px; background:rgba(255,55,75,.12); color:#b8edff; font-size:12px; margin:3px; }
        .smit-example { border-right:3px solid #48baff; padding:8px 12px; margin:10px 0; background:rgba(255,255,255,.025); line-height:1.9; }
        .smit-toast {
          position:fixed; bottom:25px; left:25px; z-index:99999;
          background:#191919; color:white; border:1px solid #48baff;
          border-radius:10px; padding:13px 18px; box-shadow:0 5px 25px #0006;
        }
        .smit-lesson-complete { color:#35d69a; font-size:13px; }
        @media(max-width:600px) {
          #dynamicPage { padding:15px 0; }
          .smit-panel { padding:14px; }
          .smit-grid { grid-template-columns:1fr; }
        }
      `;

      document.head.appendChild(style);
    }

    // -----------------------------------------------------
    // 8. HELPERS
    // -----------------------------------------------------

    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, char => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
      })[char]);
    }

    function toast(message) {
      document.querySelector(".smit-toast")?.remove();

      const element = document.createElement("div");
      element.className = "smit-toast";
      element.textContent = message;
      document.body.appendChild(element);

      setTimeout(() => element.remove(), 2600);
    }

    function speak(text, language = "en-US") {
      if (!("speechSynthesis" in window)) {
        toast("مرورگر شما از پخش صوتی پشتیبانی نمی‌کند.");
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.85;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    }

    function renderHeader(title, description) {
      return `
        <div class="smit-page-header">
          <span class="smit-tag">SMIT AI / ENGLISH A1</span>
          <h1>${title}</h1>
          <p>${description}</p>
        </div>
      `;
    }

    function setPage(html) {
      dynamicPage.dataset.smitA1Home = "false";
      dynamicPage.innerHTML = html;
      dynamicPage.scrollIntoView({behavior:"smooth",block:"start"});
    }

    // -----------------------------------------------------
    // 9. ENGLISH HOME
    // -----------------------------------------------------

    function renderEnglishHome() {
      const learnedCount = progress.learned.length;
      const totalWords = lessons.reduce((sum, lesson) => sum + lesson.words.length, 0);
      const percent = Math.min(100, Math.round(learnedCount / totalWords * 100));

      const lessonCards = lessons.map(lesson => {
        const completed = progress.completedLessons.includes(lesson.id);

        return `
          <article class="smit-lesson-card">
            <span class="smit-tag">LESSON ${lesson.id}</span>
            <h3>${escapeHTML(lesson.faTitle)}</h3>
            <p class="smit-muted">${escapeHTML(lesson.description)}</p>
            <p class="smit-muted">${lesson.words.length} vocabulary words</p>
            ${completed ? '<p class="smit-lesson-complete">✓ Completed</p>' : ""}
            <button class="smit-btn" data-open-lesson="${lesson.id}">شروع درس / Start lesson</button>
          </article>
        `;
      }).join("");

      const levels = ["A1","A2","B1","B2","C1","C2"];

      setPage(`
        ${renderHeader("آموزش زبان انگلیسی | English Learning","از سطح مبتدی شروع کن و قدم‌به‌قدم پیش برو.")}
        <div class="smit-panel">
          <h2>مسیر یادگیری / Learning Path</h2>
          <div class="smit-level-row">
            ${levels.map((level,index) => {
              const unlocked = progress.unlockedLevels.includes(level);
              return `
                <div class="smit-level-card ${unlocked ? "" : "locked"}">
                  <h3>${level}</h3>
                  <p class="smit-muted">${index === 0 ? "Beginner" : "Coming Soon"}</p>
                  <span class="smit-tag">${unlocked ? "Unlocked" : "Locked"}</span>
                </div>
              `;
            }).join("")}
          </div>
          <p class="smit-muted">محتوای کامل سطح A1 در این نسخه آماده است. سطوح بعدی هنوز در حال آماده‌سازی هستند.</p>
        </div>

        <div class="smit-panel">
          <h2>پیشرفت من / My Progress</h2>
          <div class="smit-grid">
            <div><h2>${progress.xp}</h2><p class="smit-muted">XP Points</p></div>
            <div><h2>${learnedCount}</h2><p class="smit-muted">Learned Words</p></div>
            <div><h2>${progress.completedLessons.length}/4</h2><p class="smit-muted">Completed Lessons</p></div>
            <div><h2>${progress.bestQuiz}/20</h2><p class="smit-muted">Best A1 Quiz</p></div>
          </div>
          <div class="smit-progress-track"><div class="smit-progress-fill" style="width:${percent}%"></div></div>
          <p class="smit-muted">${percent}% از واژگان این دوره را یاد گرفته‌ای.</p>
        </div>

        <div class="smit-panel">
          <h2>درس‌های سطح A1 / A1 Lessons</h2>
          <div class="smit-grid">${lessonCards}</div>
        </div>

        <div class="smit-grid">
          <article class="smit-lesson-card">
            <h3>عبارت‌های روزمره / Daily Phrases</h3>
            <p class="smit-muted">عبارت‌های کاربردی انگلیسی را تمرین کن.</p>
            <button class="smit-btn" data-page="phrases">مشاهده عبارت‌ها</button>
          </article>
          <article class="smit-lesson-card">
            <h3>گرامر / Grammar</h3>
            <p class="smit-muted">چهار مبحث پایه گرامر سطح A1.</p>
            <button class="smit-btn" data-page="grammar">شروع گرامر</button>
          </article>
          <article class="smit-lesson-card">
            <h3>آزمون نهایی / Final Test</h3>
            <p class="smit-muted">۲۰ سؤال برای سنجش یادگیری سطح A1.</p>
            <button class="smit-btn" data-page="quiz">شروع آزمون</button>
          </article>
        </div>
      `);
      dynamicPage.dataset.smitA1Home = "true";
    }

    // -----------------------------------------------------
    // 10. LESSON PAGE
    // -----------------------------------------------------
    function renderLesson(lessonId) {
      const lesson = lessons.find(item => item.id === Number(lessonId));
      if (!lesson) return;
      const cards = lesson.words.map((word,index) => {
        const learned = progress.learned.includes(word[0]);
        const searchText = `${word[0]} ${word[1]}`.toLowerCase();
        return `
          <article class="smit-word-card" data-word-card data-learned="${learned}" data-search-text="${escapeHTML(searchText)}">
            <div><h3>${escapeHTML(word[0])}</h3><span class="smit-tag">${escapeHTML(word[5])}</span></div>
            <p><strong>معنی:</strong> ${escapeHTML(word[1])}</p><p><strong>تلفظ راهنما:</strong> ${escapeHTML(word[2])}</p>
            <div class="smit-example"><strong>${escapeHTML(word[3])}</strong><br><span class="smit-muted">${escapeHTML(word[4])}</span></div>
            <div class="smit-actions">
              <button class="smit-btn" data-speak="${index}" data-lesson="${lesson.id}">🔊 Listen</button>
              <button class="smit-btn" data-learn="${index}" data-lesson="${lesson.id}" ${learned ? "disabled" : ""}>${learned ? "✓ Learned" : "Mark as learned"}</button>
            </div>
          </article>`;
      }).join("");
      const completed = progress.completedLessons.includes(lesson.id);
      const learnedCount = lesson.words.filter(word => progress.learned.includes(word[0])).length;
      setPage(`
        ${renderHeader(`Lesson ${lesson.id}: ${lesson.faTitle}`,lesson.description)}
        <div class="smit-panel">
          <p>${escapeHTML(lesson.faDescription)}</p><p class="smit-muted">برای شنیدن تلفظ روی Listen بزن. پس از یادگیری هر کلمه، آن را علامت بزن.</p>
          <p class="smit-filter-count">پیشرفت این درس: <strong>${learnedCount}</strong> از ${lesson.words.length} کلمه</p>
          <div class="smit-actions">
            <button class="smit-btn" data-page="english">← بازگشت به دوره</button>
            <button class="smit-btn" data-complete-lesson="${lesson.id}" ${completed ? "disabled" : ""}>${completed ? "✓ درس تکمیل شده" : "تکمیل این درس"}</button>
          </div>
        </div>
        <div class="smit-vocab-tools">
          <input type="search" data-vocab-search placeholder="جست‌وجو به فارسی یا انگلیسی / Search..." aria-label="Search vocabulary">
          <select data-vocab-filter><option value="all">همه کلمات / All</option><option value="learned">یادگرفته‌شده / Learned</option><option value="not-learned">یادنگرفته / Not learned</option></select>
        </div>
        <p class="smit-filter-count" data-vocab-result-count>نمایش ${lesson.words.length} کلمه</p>
        <div class="smit-grid">${cards}</div>`);
    }

    // 11. PHRASES
    // -----------------------------------------------------

    function renderPhrases() {
      setPage(`
        ${renderHeader("عبارت‌های روزمره / Daily Phrases","عبارت‌ها را گوش کن، بخوان و تکرار کن.")}
        <div class="smit-panel"><button class="smit-btn" data-page="english">← بازگشت</button></div>
        <div class="smit-grid">
          ${phrases.map((phrase,index) => `
            <article class="smit-word-card">
              <h3>${escapeHTML(phrase[0])}</h3>
              <p>${escapeHTML(phrase[1])}</p>
              <button class="smit-btn" data-speak-phrase="${index}">🔊 Listen</button>
            </article>
          `).join("")}
        </div>
      `);
    }

    // -----------------------------------------------------
    // 12. GRAMMAR
    // -----------------------------------------------------

    function renderGrammar() {
      setPage(`
        ${renderHeader("گرامر انگلیسی / English Grammar","چهار مبحث پایه را با مثال‌های ساده یاد بگیر.")}
        <div class="smit-panel"><button class="smit-btn" data-page="english">← بازگشت</button></div>
        ${grammar.map((item,index) => `
          <article class="smit-panel">
            <span class="smit-tag">GRAMMAR ${index + 1}</span>
            <h2>${escapeHTML(item.faTitle)}</h2>
            <p>${escapeHTML(item.explanation)}</p>
            <p class="smit-muted">${escapeHTML(item.faExplanation)}</p>
            ${item.rules.map(rule => `
              <div class="smit-example">
                <strong>${escapeHTML(rule[0])} — ${escapeHTML(rule[1])}</strong><br>
                ${escapeHTML(rule[2])}<br>
                <span class="smit-muted">${escapeHTML(rule[3])}</span><br>
                <button class="smit-btn" data-speak-text="${escapeHTML(rule[2])}">🔊</button>
              </div>
            `).join("")}
          </article>
        `).join("")}
      `);
    }

    // -----------------------------------------------------
    // 13. QUIZ
    // -----------------------------------------------------

    let quizState = {current:0,answers:[]};

    function renderQuiz() {
      quizState = {current:0,answers:[]};

      setPage(`
        ${renderHeader("آزمون نهایی A1 / A1 Final Test","۲۰ سؤال چهارگزینه‌ای؛ برای قبولی باید حداقل ۱۵ پاسخ درست داشته باشی.")}
        <div class="smit-panel">
          <p>زمان آزاد است. با دقت به سؤال‌ها پاسخ بده.</p>
          <p class="smit-muted">Passing score: 15 / 20</p>
          <button class="smit-btn" id="startQuizBtn">شروع آزمون / Start Test</button>
          <button class="smit-btn" data-page="english">بازگشت</button>
        </div>
        <div id="quizArea"></div>
      `);

      document.getElementById("startQuizBtn")?.addEventListener("click",showQuizQuestion);
    }

    function showQuizQuestion() {
      const area = document.getElementById("quizArea");
      if (!area) return;

      const index = quizState.current;
      const question = quizQuestions[index];
      if (!question) return;

      area.innerHTML = `
        <div class="smit-panel">
          <div class="smit-progress-track">
            <div class="smit-progress-fill" style="width:${((index + 1) / quizQuestions.length) * 100}%"></div>
          </div>
          <p class="smit-muted">Question ${index + 1} of ${quizQuestions.length}</p>
          <h2>${escapeHTML(question.q)}</h2>
          ${question.options.map((option,optionIndex) => `
            <button class="smit-quiz-option ${quizState.answers[index] === optionIndex ? "selected" : ""}" data-answer="${optionIndex}">
              ${String.fromCharCode(65 + optionIndex)}. ${escapeHTML(option)}
            </button>
          `).join("")}
          <div class="smit-actions">
            <button class="smit-btn" id="previousQuestion" ${index === 0 ? "disabled" : ""}>قبلی / Previous</button>
            <button class="smit-btn" id="nextQuestion">${index === quizQuestions.length - 1 ? "پایان آزمون / Finish" : "بعدی / Next"}</button>
          </div>
        </div>
      `;

      area.querySelectorAll("[data-answer]").forEach(button => {
        button.addEventListener("click",() => {
          quizState.answers[index] = Number(button.dataset.answer);
          showQuizQuestion();
        });
      });

      document.getElementById("previousQuestion")?.addEventListener("click",() => {
        if (quizState.current > 0) {
          quizState.current--;
          showQuizQuestion();
        }
      });

      document.getElementById("nextQuestion")?.addEventListener("click",() => {
        if (quizState.current < quizQuestions.length - 1) {
          quizState.current++;
          showQuizQuestion();
        } else {
          window.SMITLoader.run("در حال بررسی پاسخ‌ها", "نتیجه آزمون A1 در حال محاسبه است...", 520, dynamicPage, finishQuiz);
        }
      });
    }

    function finishQuiz() {
      const unanswered = quizQuestions.reduce((count,question,index) => {
        return count + (quizState.answers[index] === undefined ? 1 : 0);
      },0);

      if (unanswered > 0 && !confirm(`${unanswered} سؤال بدون پاسخ داری. آیا می‌خواهی آزمون را تمام کنی؟`)) {
        return;
      }

      const score = quizQuestions.reduce((total,question,index) => {
        return total + (quizState.answers[index] === question.answer ? 1 : 0);
      },0);

      const passed = score >= PASS_MARK;
      const previousBest = Number(progress.bestQuiz) || 0;
      const newRecord = score > previousBest;

      progress.bestQuiz = Math.max(previousBest,score);

      progress.levelResults.A1 = {
        latestScore:score,
        bestScore:progress.bestQuiz,
        passed:Boolean(progress.levelResults.A1?.passed || passed)
      };

      if (passed) {
        progress.quizPassed = true;
        if (!progress.unlockedLevels.includes("A2")) {
          progress.unlockedLevels.push("A2");
        }
      }

      // 50 XP for each new personal best
      if (newRecord) progress.xp += 50;

      saveProgress();
      showQuizResult(score,passed);
    }

    function showQuizResult(score,passed) {
      const area = document.getElementById("quizArea");
      if (!area) return;

      area.innerHTML = `
        <div class="smit-panel smit-exam-result ${passed ? "is-passed" : "is-failed"}">
          <span class="smit-tag">A1 · FINAL EXAM RESULT</span>
          <div class="smit-result-symbol">${passed ? "✓" : "↻"}</div>
          <h1>${score} / 20</h1>
          <p class="smit-result-percent">${Math.round(score / 20 * 100)}% SCORE</p>
          <h2>${passed ? "Congratulations! 🎉" : "Keep Going — You Can Do It!"}</h2>
          <p>${passed
            ? "You have successfully completed the A1 level. A2 is now unlocked."
            : `You need at least ${PASS_MARK} correct answers to pass. Review your lessons and try again.`
          }</p>
          <p class="smit-muted">Best Score: ${progress.bestQuiz} / 20</p>
          <p class="smit-muted">Experience Points: ${progress.xp} XP</p>
          <div class="smit-actions">
            ${passed ? '<button class="smit-btn smit-certificate-btn" data-smit-certificate="A1" data-score="'+score+'" data-total="20">Get Certificate</button>' : ""}
            <button class="smit-btn" id="retryQuiz">Try Again</button>
            <button class="smit-btn" data-page="english">Back to Course</button>
          </div>
        </div>
      `;

      document.getElementById("retryQuiz")?.addEventListener("click",renderQuiz);
    }

    // -----------------------------------------------------
    // 14. OTHER PAGES
    // -----------------------------------------------------


    // -----------------------------------------------------
    // SMIT TOOLS — Ocean Glass tool center
    // -----------------------------------------------------
    const smitTools = [
      {id:"calculator",icon:"＋",fa:"ماشین‌حساب",en:"Advanced Calculator",desc:"محاسبات روزمره و علمی"},
      {id:"translator",icon:"文",fa:"مترجم و دیکشنری",en:"Language Tools",desc:"ترجمه و معنی واژه‌ها"},
      {id:"json",icon:"{}",fa:"JSON Formatter",en:"Developer Tool",desc:"مرتب‌سازی و اعتبارسنجی JSON"},
      {id:"converter",icon:"⇄",fa:"مبدل واحدها",en:"Unit Converter",desc:"تبدیل سریع واحدهای پرکاربرد"},
      {id:"counter",icon:"Aa",fa:"شمارشگر کلمات",en:"Word Counter",desc:"شمارش کلمه، حرف و جمله"},
      {id:"color",icon:"◉",fa:"Color Picker",en:"Color Studio",desc:"انتخاب رنگ و کدهای رنگی"},
      {id:"qr",icon:"▦",fa:"QR Generator",en:"QR Code Maker",desc:"ساخت QR از متن یا لینک"},
      {id:"notes",icon:"✎",fa:"یادداشت سریع",en:"Quick Notes",desc:"یادداشت‌های ذخیره‌شده در مرورگر"},
      {id:"voice",icon:"♫",fa:"استودیوی صدا",en:"Voice Studio",desc:"تبدیل متن به گفتار و گفتار به متن"}
    ];
    const toolEsc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const toolHeader = (title, subtitle) => `
      <div class="smit-tools-subhead">
        <button type="button" class="smit-tools-back" data-tools-back>← <span>بازگشت به ابزارها</span></button>
        <div class="smit-tools-crumb">SMIT AI <i>/</i> TOOLS CENTER</div>
      </div>
      <header class="smit-tools-pagehead"><span class="smit-tag">SMIT TOOLS_</span><h1>${title}</h1><p>${subtitle}</p></header>`;
    function renderToolsHome() {
      setPage(`
        <section class="smit-tools-home" aria-label="SMIT Tools Center">
          <div class="smit-tools-title-row">
            <div><div class="smit-tools-eyebrow">SMIT AI / DIGITAL WORKSPACE</div><h1>SMIT TOOLS<span>_</span></h1><p>Your personal digital toolbox</p></div>
            <div class="smit-tools-count"><b>09</b><span>TOOLS</span></div>
          </div>
          <div class="smit-tools-search-row"><div class="smit-uiverse-search smit-tools-uiverse"><span class="us-grid"></span><span class="us-glow"></span><span class="us-border"></span><span class="us-white"></span><span class="us-dark"></span><span class="us-icon">⌕</span><input id="smitToolsSearch" type="search" placeholder="جست‌وجوی ابزار موردنظر..." autocomplete="off"><kbd>⌘ K</kbd></div></div>
          <div class="smit-tools-grid" id="smitToolsGrid">
            ${smitTools.map((t,i)=>`<button type="button" class="container smit-tool-card" data-tool-open="${t.id}" style="--tool-index:${i}">
              <span class="palette"><span class="color"><span class="smit-tool-icon">${t.icon}</span><span class="smit-tool-open">OPEN ↗</span></span></span>
              <span class="smit-tool-card-body"><b>${t.fa}</b><small>${t.en}</small><i>${t.desc}</i></span>
            </button>`).join("")}
            <div class="smit-tools-no-results" hidden>ابزاری با این نام پیدا نشد.</div>
          </div>
          <footer class="smit-tools-footer"><span>SMIT AI · TOOLS CENTER</span><span>BUILT TO MAKE YOUR WORK EASIER</span></footer>
        </section>`);
      const search = document.getElementById("smitToolsSearch");
      search?.addEventListener("input", () => {
        const q = search.value.trim().toLocaleLowerCase();
        let shown = 0;
        dynamicPage.querySelectorAll("[data-tool-open]").forEach(card => {
          const item = smitTools.find(t=>t.id===card.dataset.toolOpen);
          const match = !q || `${item.fa} ${item.en} ${item.desc}`.toLocaleLowerCase().includes(q);
          card.hidden = !match; if(match) shown++;
        });
        const empty=dynamicPage.querySelector(".smit-tools-no-results"); if(empty) empty.hidden=shown!==0;
      });
      search?.addEventListener("keydown", e => { if(e.key==="Escape") {search.value="";search.dispatchEvent(new Event("input"));} });
      if(window.__smitToolsSearchShortcut) document.removeEventListener("keydown",window.__smitToolsSearchShortcut);
      window.__smitToolsSearchShortcut = event => {
        if((event.ctrlKey || event.metaKey) && event.key.toLowerCase()==="k" && document.getElementById("smitToolsSearch")){
          event.preventDefault();
          document.getElementById("smitToolsSearch")?.focus();
        }
      };
      document.addEventListener("keydown",window.__smitToolsSearchShortcut);
    }
    function renderTool(toolId) {
      const tool=smitTools.find(t=>t.id===toolId); if(!tool)return renderToolsHome();
      const shell=(body)=>setPage(`<section class="smit-tool-workspace">${toolHeader(tool.fa,tool.desc)}<div class="smit-tool-panel">${body}</div></section>`);
      if(toolId==="calculator"){
        const calcButtons=["sin","cos","tan","√","x²","log","ln","π","e","^","(",")","AC","⌫","%","÷","7","8","9","×","4","5","6","−","1","2","3","+","±","0",".","="];
        shell(`<div class="smit-tool-label">ADVANCED SCIENTIFIC CALCULATOR / رادیان</div><div class="smit-calc"><div class="smit-calc-display"><small id="smitCalcHistory">آماده محاسبه</small><output id="smitCalcOutput" aria-live="polite">0</output></div><div class="smit-calc-keys">${calcButtons.map(k=>`<button type="button" data-calc="${k}" class="${k==="="? "is-equal":(["÷","×","−","+","%","^"].includes(k)?"is-operator":"")}">${k}</button>`).join("")}</div></div><p class="smit-tool-hint">توابع مثلثاتی بر حسب رادیان هستند. از پرانتز برای عبارت‌های پیچیده استفاده کن. / Trigonometric functions use radians.</p>`);
        let expr="",fresh=true; const out=document.getElementById("smitCalcOutput"),hist=document.getElementById("smitCalcHistory");
        const paint=()=>{out.textContent=expr||"0";};
        const calculate=()=>{try{
          const s=expr.replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-").replace(/%/g,"/100").replace(/π/g,"pi");
          if(!s||!/^[0-9a-z+\-*/^().\s]+$/i.test(s))throw Error();
          const tokens=s.match(/sin|cos|tan|sqrt|log|ln|pi|e|(?:\d+\.?\d*|\.\d+)|[()+\-*/^]/gi)||[];let p=0;
          function atom(){const x=tokens[p++];if(x==="("){const v=sum();if(tokens[p++]!==")")throw Error();return v;}if(x==="-"||x==="+")return (x==="-"?-1:1)*atom();if(x==="pi")return Math.PI;if(x==="e")return Math.E;
            if(["sin","cos","tan","sqrt","log","ln"].includes(x)){if(tokens[p++]!=="(")throw Error();const n=sum();if(tokens[p++]!==")")throw Error();return ({sin:Math.sin,cos:Math.cos,tan:Math.tan,sqrt:Math.sqrt,log:Math.log10,ln:Math.log})[x](n);}
            if(!x||! /^(?:\d+\.?\d*|\.\d+)$/.test(x))throw Error();return Number(x);}
          function power(){let v=atom();if(tokens[p]==="^"){p++;v=Math.pow(v,power());}return v;}
          function product(){let v=power();while(tokens[p]==="*"||tokens[p]==="/"){const op=tokens[p++],r=power();v=op==="*"?v*r:v/r;}return v;}
          function sum(){let v=product();while(tokens[p]==="+"||tokens[p]==="-"){const op=tokens[p++],r=product();v=op==="+"?v+r:v-r;}return v;}
          const v=sum();if(p!==tokens.length||!Number.isFinite(v))throw Error();hist.textContent=expr+" =";expr=String(Number(v.toPrecision(12)));paint();fresh=true;
        }catch{out.textContent="خطا";}};
        const pressCalc = k => {if(k==="AC"){expr="";hist.textContent="آماده محاسبه";fresh=true;}else if(k==="⌫"){expr=expr.slice(0,-1);fresh=false;}else if(k==="="){calculate();return;}else if(k==="±"){expr=expr.startsWith("-")?expr.slice(1):"-"+expr;fresh=false;}else{if(fresh&&/^[0-9.πe]$/.test(k))expr="";const additions={sin:"sin(",cos:"cos(",tan:"tan(","√":"sqrt(","x²":"^2",log:"log(",ln:"ln(",π:"pi"};expr+=(additions[k]??k);fresh=false;}paint();};
        dynamicPage.querySelectorAll("[data-calc]").forEach(b=>b.addEventListener("click",()=>pressCalc(b.dataset.calc)));
        const calcKeys = event => {if(!document.getElementById("smitCalcOutput") || event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;const map={"Enter":"=","=":"=","Backspace":"⌫","Escape":"AC","*":"×","/":"÷","-":"−"};const k=map[event.key]||event.key;if(/^[0-9.]$/.test(k)||["+","−","×","÷","%","=","⌫","AC"].includes(k)){event.preventDefault();pressCalc(k);}};
        if(window.__smitCalcKeyHandler)document.removeEventListener("keydown",window.__smitCalcKeyHandler);
        window.__smitCalcKeyHandler=calcKeys;
        document.addEventListener("keydown",calcKeys);
        return;
      }
      if(toolId==="voice"){
        const voiceLanguages=[
          ["fa-IR","فارسی"],["en-US","English (US)"],["en-GB","English (UK)"],["tr-TR","Türkçe"],["ar-SA","العربية"],["de-DE","Deutsch"],["fr-FR","Français"],["es-ES","Español"],["it-IT","Italiano"],["pt-BR","Português"],["ru-RU","Русский"],["hi-IN","हिन्दी"],["ur-PK","اردو"],["zh-CN","中文"],["ja-JP","日本語"],["ko-KR","한국어"],["nl-NL","Nederlands"],["sv-SE","Svenska"],["pl-PL","Polski"],["id-ID","Bahasa Indonesia"]
        ];
        const langOptions=voiceLanguages.map(([v,n])=>`<option value="${v}">${n}</option>`).join("");
        shell(`<style>
          .smit-voice{display:grid;gap:18px}.smit-voice-intro{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px;border:1px solid rgba(22,139,255,.2);border-radius:15px;background:linear-gradient(110deg,rgba(22,139,255,.12),rgba(7,23,42,.4))}.smit-voice-intro h2{font-size:18px;margin:5px 0}.smit-voice-intro p,.smit-voice-note{color:#9bb1c7;font-size:11px;line-height:1.9}.smit-voice-mark{width:52px;height:52px;flex:0 0 52px;border-radius:15px;display:grid;place-items:center;background:rgba(22,139,255,.13);border:1px solid rgba(140,221,255,.25);font-size:25px;color:#8cddff}.smit-voice-tabs{display:grid;grid-template-columns:1fr 1fr;gap:10px}.smit-voice-tab{padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.035);color:#dceafa;text-align:right;cursor:pointer}.smit-voice-tab strong{display:block;font-size:13px}.smit-voice-tab small{display:block;color:#8ca5be;margin-top:5px}.smit-voice-tab.active{border-color:rgba(22,139,255,.55);background:rgba(22,139,255,.12)}.smit-voice-pane{display:none}.smit-voice-pane.active{display:grid;gap:13px}.smit-voice-label{display:block;color:#c9d9e9;font-size:11px;margin-bottom:7px}.smit-voice select,.smit-voice textarea{width:100%;min-width:0;padding:12px 14px;border-radius:10px;border:1px solid rgba(140,221,255,.2);background:rgba(4,17,32,.7);color:#f4f8fc;font:inherit;font-size:12px}.smit-voice select option{color:#111}.smit-voice textarea{resize:vertical;line-height:2}.smit-voice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.smit-voice-range{padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(255,255,255,.025)}.smit-voice-range input{width:100%;accent-color:#168bff}.smit-voice-range small{display:flex;justify-content:space-between;color:#9bb1c7;font-size:10px}.smit-voice-actions{display:flex;flex-wrap:wrap;gap:9px}.smit-voice-actions button{flex:1;min-width:120px}.smit-voice-status{padding:11px 13px;border-radius:9px;background:rgba(255,255,255,.04);color:#a9bfd5;font-size:11px;line-height:1.8;min-height:42px}.smit-voice-status[data-kind="error"]{color:#ff9ca8;border:1px solid rgba(255,90,110,.25)}.smit-voice-status[data-kind="ok"]{color:#8fe2b6}.smit-voice-result{min-height:150px}.smit-voice-mic{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.smit-voice-mic .smit-tool-primary{min-width:170px}.smit-voice-mic-indicator{width:9px;height:9px;border-radius:50%;background:#77899b;display:inline-block}.smit-voice-mic-indicator.live{background:#ff5268;box-shadow:0 0 12px #ff5268;animation:smitVoicePulse 1s infinite}@keyframes smitVoicePulse{50%{opacity:.35;transform:scale(.75)}}
          @media(max-width:600px){.smit-voice-grid{grid-template-columns:1fr}.smit-voice-intro{align-items:flex-start}.smit-voice-tab{padding:11px}}
        </style>
        <div class="smit-voice">
          <div class="smit-voice-intro"><div><div class="smit-tool-label">SMIT AI / BROWSER VOICE ENGINE</div><h2>Voice Studio</h2><p>تبدیل متن به گفتار و تبدیل گفتار زنده به متن، با قابلیت‌های داخلی مرورگر.</p></div><div class="smit-voice-mark">♫</div></div>
          <div class="smit-voice-tabs"><button type="button" class="smit-voice-tab active" data-voice-tab="tts"><strong>متن به گفتار</strong><small>TEXT → SPEECH</small></button><button type="button" class="smit-voice-tab" data-voice-tab="stt"><strong>گفتار به متن</strong><small>SPEECH → TEXT</small></button></div>
          <section class="smit-voice-pane active" data-voice-pane="tts">
            <label><span class="smit-voice-label">متن موردنظر</span><textarea id="smitVoiceText" rows="6" maxlength="12000" placeholder="متن فارسی یا انگلیسی خود را اینجا بنویس..."></textarea></label>
            <div class="smit-voice-grid"><label><span class="smit-voice-label">صدای انگلیسی</span><select id="smitVoiceName"><option value="">انتخاب خودکار صدای انگلیسی</option></select></label><label><span class="smit-voice-label">صدای فارسی</span><select id="smitVoiceNameFa"><option value="">انتخاب خودکار صدای فارسی</option></select></label></div>
            <p class="smit-voice-note">زبان هر بخش از متن به‌صورت خودکار تشخیص داده می‌شود؛ برای متن ترکیبی، صدای انگلیسی و فارسی جداگانه استفاده خواهد شد.</p>
            <div class="smit-voice-grid"><div class="smit-voice-range"><small><span>سرعت گفتار</span><b id="smitVoiceRateValue">1.0×</b></small><input id="smitVoiceRate" type="range" min="0.5" max="2" step="0.1" value="1"></div><div class="smit-voice-range"><small><span>زیر و بمی صدا</span><b id="smitVoicePitchValue">1.0</b></small><input id="smitVoicePitch" type="range" min="0" max="2" step="0.1" value="1"></div></div>
            <div class="smit-voice-actions"><button type="button" class="smit-tool-primary" id="smitVoiceSpeak">▶ پخش متن دوزبانه</button><button type="button" class="smit-tool-primary" id="smitVoiceDownloadAudio">⬇ تبدیل و دانلود صدا</button><button type="button" class="smit-tool-secondary" id="smitVoicePause">مکث</button><button type="button" class="smit-tool-secondary" id="smitVoiceStop">توقف</button></div>
            <div class="smit-voice-status" id="smitVoiceTtsStatus" aria-live="polite">آماده تبدیل متن. بخش‌های فارسی و انگلیسی به‌ترتیب متن خوانده می‌شوند.</div>
            <p class="smit-voice-note">برای دانلود، در پنجره اشتراک‌گذاری مرورگر گزینه همین تب (Chrome Tab / Edge Tab) را انتخاب کن و «Share tab audio» را فعال کن. فایل با فرمت WebM/Opus و نرخ هدف 192 kbps ذخیره می‌شود. ضبط صدای تب به پشتیبانی مرورگر وابسته است.</p>
          </section>
          <section class="smit-voice-pane" data-voice-pane="stt">
            <div class="smit-voice-grid"><label><span class="smit-voice-label">زبان تشخیص گفتار</span><select id="smitSpeechLang">${langOptions}</select></label><div><span class="smit-voice-label">وضعیت میکروفون</span><div class="smit-voice-status"><i class="smit-voice-mic-indicator" id="smitMicIndicator"></i> <span id="smitMicState">خاموش</span></div></div></div>
            <div class="smit-voice-mic"><button type="button" class="smit-tool-primary" id="smitSpeechStart">● شروع ضبط و تبدیل</button><button type="button" class="smit-tool-secondary" id="smitSpeechStop" disabled>توقف</button><button type="button" class="smit-tool-secondary" id="smitSpeechClear">پاک کردن متن</button></div>
            <label><span class="smit-voice-label">متن تشخیص‌داده‌شده</span><textarea id="smitSpeechResult" class="smit-voice-result" rows="8" placeholder="پس از اجازه دسترسی به میکروفون، صحبت کن..."></textarea></label>
            <div class="smit-voice-actions"><button type="button" class="smit-tool-primary" id="smitSpeechCopy">کپی متن</button><button type="button" class="smit-tool-secondary" id="smitSpeechDownload">دانلود TXT</button></div>
            <div class="smit-voice-status" id="smitSpeechStatus" aria-live="polite">برای شروع، روی دکمه شروع ضبط بزن و اجازه دسترسی میکروفون را بده.</div>
            <p class="smit-voice-note">محدودیت نسخه مرورگر: تشخیص گفتار از میکروفون زنده استفاده می‌کند. تبدیل مستقیم فایل MP3/WAV/M4A به متن و عملکرد آفلاین در همه مرورگرها تضمین نمی‌شود. برای امنیت میکروفون، صفحه را از HTTPS یا localhost باز کن و از Chrome یا Edge به‌روز استفاده کن.</p>
          </section>
        </div>`);
        const $=id=>document.getElementById(id);
        const tabs=dynamicPage.querySelectorAll('[data-voice-tab]'),panes=dynamicPage.querySelectorAll('[data-voice-pane]');
        tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(x=>x.classList.toggle('active',x===tab));panes.forEach(p=>p.classList.toggle('active',p.dataset.voicePane===tab.dataset.voiceTab));}));
        const ttsStatus=$('smitVoiceTtsStatus'),voiceSelectEn=$('smitVoiceName'),voiceSelectFa=$('smitVoiceNameFa');
        const synth=window.speechSynthesis;
        let availableVoices=[],ttsRunToken=0,activeRecorder=null,activeCaptureStream=null,recordedChunks=[];
        function voicesFor(prefix){return availableVoices.map((v,i)=>({v,i})).filter(x=>x.v.lang.toLowerCase().startsWith(prefix));}
        function fillVoiceSelect(select,prefix,placeholder){
          const old=select.value;const items=voicesFor(prefix);
          select.innerHTML=`<option value="">${placeholder}</option>`+items.map(({v,i})=>`<option value="${i}">${toolEsc(v.name)} — ${toolEsc(v.lang)}${v.default?' (پیش‌فرض)':''}</option>`).join('');
          if(old&&items.some(x=>String(x.i)===old))select.value=old;
        }
        function loadVoices(){
          if(!synth)return;availableVoices=synth.getVoices()||[];
          fillVoiceSelect(voiceSelectEn,'en','انتخاب خودکار صدای انگلیسی');
          fillVoiceSelect(voiceSelectFa,'fa','انتخاب خودکار صدای فارسی');
          const en=voicesFor('en').length,fa=voicesFor('fa').length;
          const hint=fa?'صدای فارسی و انگلیسی در دسترس است.': 'صدای فارسی در فهرست مرورگر پیدا نشد؛ برای خواندن فارسی باید صدای فارسی در ویندوز/مرورگر نصب یا فعال باشد.';
          if(!synth)ttsStatus.textContent='مرورگر از تبدیل متن به گفتار پشتیبانی نمی‌کند.';
          else ttsStatus.textContent=`صداهای شناسایی‌شده: انگلیسی ${en}، فارسی ${fa}. ${hint}`;
        }
        loadVoices();if(synth){synth.addEventListener?.('voiceschanged',loadVoices);setTimeout(loadVoices,500);setTimeout(loadVoices,1400);}
        $('smitVoiceRate').addEventListener('input',e=>$('smitVoiceRateValue').textContent=Number(e.target.value).toFixed(1)+'×');
        $('smitVoicePitch').addEventListener('input',e=>$('smitVoicePitchValue').textContent=Number(e.target.value).toFixed(1));

        // Split text by writing system, retaining every character and original order.
        // Neutral characters (spaces, punctuation, numbers) stay with the current segment.
        function detectScript(ch){
          if(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u.test(ch))return 'fa';
          if(/[A-Za-z\u00C0-\u024F]/u.test(ch))return 'en';
          return 'neutral';
        }
        function splitMixedText(value){
          const chars=Array.from(value.replace(/\r\n?/g,'\n'));const out=[];let current='',kind='';
          for(const ch of chars){const next=detectScript(ch);let target=next==='neutral'?(kind||'en'):next;
            if(current&&target!==kind){out.push({text:current,kind});current='';}
            if(!current)kind=target;current+=ch;
          }
          if(current)out.push({text:current,kind});
          return out.map(x=>({...x,text:x.text.trim()})).filter(x=>x.text);
        }
        function splitLongSegment(segment){
          const limit=220;if(segment.text.length<=limit)return [segment];
          const pieces=[];let rest=segment.text;
          while(rest.length>limit){let cut=rest.lastIndexOf(' ',limit);if(cut<Math.floor(limit*.55))cut=rest.lastIndexOf('。',limit);if(cut<Math.floor(limit*.55))cut=rest.lastIndexOf('.',limit);if(cut<Math.floor(limit*.55))cut=limit;pieces.push({text:rest.slice(0,cut).trim(),kind:segment.kind});rest=rest.slice(cut).trim();}
          if(rest)pieces.push({text:rest,kind:segment.kind});return pieces;
        }
        function chooseVoice(kind){
          const prefix=kind==='fa'?'fa':'en';const selected=kind==='fa'?voiceSelectFa.value:voiceSelectEn.value;
          if(selected!==''&&availableVoices[Number(selected)]&&availableVoices[Number(selected)].lang.toLowerCase().startsWith(prefix))return availableVoices[Number(selected)];
          const exact=kind==='fa'?['fa-ir','fa']:['en-us','en-gb','en-au','en-ca','en'];
          for(const lang of exact){const found=availableVoices.find(v=>v.lang.toLowerCase()===lang);if(found)return found;}
          return availableVoices.find(v=>v.lang.toLowerCase().startsWith(prefix))||null;
        }
        function makeSpeechQueue(){
          const raw=$('smitVoiceText').value;if(!raw.trim())return [];
          return splitMixedText(raw).flatMap(splitLongSegment);
        }
        function stopCaptureTracks(){if(activeCaptureStream){activeCaptureStream.getTracks().forEach(t=>{try{t.stop();}catch{}});activeCaptureStream=null;}}
        function finishAudioRecording(){
          if(activeRecorder&&activeRecorder.state!=='inactive'){try{activeRecorder.stop();}catch{}}
          else stopCaptureTracks();
        }
        function startSpeechQueue(queue,{recording=false}={}){
          if(!queue.length){ttsStatus.textContent='متنی برای خواندن وجود ندارد.';ttsStatus.dataset.kind='error';finishAudioRecording();return;}
          if(!synth||!window.SpeechSynthesisUtterance){ttsStatus.textContent='قابلیت تبدیل متن به گفتار در این مرورگر در دسترس نیست.';ttsStatus.dataset.kind='error';finishAudioRecording();return;}
          const token=++ttsRunToken;synth.cancel();let index=0;
          const rate=Number($('smitVoiceRate').value),pitch=Number($('smitVoicePitch').value);
          const next=()=>{
            if(token!==ttsRunToken)return;
            if(index>=queue.length){ttsStatus.textContent=recording?'خواندن تمام شد؛ فایل صوتی در حال آماده‌سازی است.':'خواندن تمام متن به پایان رسید.';ttsStatus.dataset.kind='ok';if(recording)setTimeout(finishAudioRecording,500);return;}
            const part=queue[index++],utterance=new SpeechSynthesisUtterance(part.text);
            utterance.lang=part.kind==='fa'?'fa-IR':'en-US';utterance.rate=rate;utterance.pitch=pitch;
            const voice=chooseVoice(part.kind);if(voice)utterance.voice=voice;
            utterance.onstart=()=>{ttsStatus.textContent=`در حال خواندن بخش ${index} از ${queue.length} (${part.kind==='fa'?'فارسی':'English'})…`;ttsStatus.dataset.kind='ok';};
            utterance.onend=()=>{if(token===ttsRunToken)setTimeout(next,90);};
            utterance.onerror=e=>{if(token!==ttsRunToken)return;if(e.error==='canceled'||e.error==='interrupted')return;ttsStatus.textContent=`خطا در خواندن بخش ${index}: ${e.error||'نامشخص'}`;ttsStatus.dataset.kind='error';if(recording)finishAudioRecording();};
            synth.speak(utterance);
          };
          next();
        }
        $('smitVoiceSpeak').onclick=()=>{const queue=makeSpeechQueue();if(!queue.length){ttsStatus.textContent='ابتدا متن را وارد کن.';ttsStatus.dataset.kind='error';return;}startSpeechQueue(queue);};
        $('smitVoiceDownloadAudio').onclick=async()=>{
          const queue=makeSpeechQueue();if(!queue.length){ttsStatus.textContent='ابتدا متن را وارد کن.';ttsStatus.dataset.kind='error';return;}
          if(!navigator.mediaDevices?.getDisplayMedia||!window.MediaRecorder){ttsStatus.textContent='ضبط صدای تب در این مرورگر پشتیبانی نمی‌شود. از Chrome یا Edge به‌روز استفاده کن.';ttsStatus.dataset.kind='error';return;}
          if(activeRecorder&&activeRecorder.state!=='inactive'){ttsStatus.textContent='یک ضبط صوتی در حال انجام است.';return;}
          try{
            ttsStatus.textContent='در پنجره بعدی همین تب را انتخاب کن و گزینه Share tab audio را فعال کن…';ttsStatus.dataset.kind='';
            const capture=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
            const audioTracks=capture.getAudioTracks();
            if(!audioTracks.length){capture.getTracks().forEach(t=>t.stop());ttsStatus.textContent='صدای تب دریافت نشد. در پنجره اشتراک‌گذاری، Chrome Tab یا Edge Tab و گزینه Share tab audio را انتخاب کن.';ttsStatus.dataset.kind='error';return;}
            activeCaptureStream=capture;recordedChunks=[];
            const audioOnly=new MediaStream(audioTracks);
            const mimeCandidates=['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'];
            const mimeType=mimeCandidates.find(type=>MediaRecorder.isTypeSupported?.(type))||'';
            activeRecorder=new MediaRecorder(audioOnly,mimeType?{mimeType,audioBitsPerSecond:192000}:{audioBitsPerSecond:192000});
            activeRecorder.ondataavailable=e=>{if(e.data&&e.data.size)recordedChunks.push(e.data);};
            activeRecorder.onerror=()=>{ttsStatus.textContent='هنگام ضبط صدای تب خطا رخ داد.';ttsStatus.dataset.kind='error';stopCaptureTracks();};
            activeRecorder.onstop=()=>{
              const type=activeRecorder?.mimeType||recordedChunks[0]?.type||'audio/webm';
              if(recordedChunks.length){const blob=new Blob(recordedChunks,{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='SMIT-AI-Voice-Studio.'+(type.includes('ogg')?'ogg':'webm');document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);ttsStatus.textContent=`فایل صوتی آماده شد (${(blob.size/1024/1024).toFixed(2)} MB). فرمت: ${type.includes('ogg')?'OGG/Opus':'WebM/Opus'}.`;ttsStatus.dataset.kind='ok';}
              else{ttsStatus.textContent='فایل صوتی خالی بود؛ مطمئن شو صدای همین تب برای ضبط فعال شده است.';ttsStatus.dataset.kind='error';}
              stopCaptureTracks();activeRecorder=null;recordedChunks=[];
            };
            activeRecorder.start(250);
            startSpeechQueue(queue,{recording:true});
          }catch(error){stopCaptureTracks();if(error?.name==='NotAllowedError'){ttsStatus.textContent='اشتراک‌گذاری تب لغو شد. برای دانلود صدا باید اشتراک‌گذاری تب و صدای آن را تأیید کنی.';}else{ttsStatus.textContent='شروع ضبط ممکن نشد: '+(error?.message||'خطای نامشخص');}ttsStatus.dataset.kind='error';}
        };
        $('smitVoicePause').onclick=()=>{if(!synth)return;if(synth.speaking&&!synth.paused){synth.pause();ttsStatus.textContent='پخش مکث شد.';}else if(synth.paused){synth.resume();ttsStatus.textContent='ادامه پخش…';}};
        $('smitVoiceStop').onclick=()=>{ttsRunToken++;synth?.cancel();finishAudioRecording();ttsStatus.textContent='پخش متوقف شد.';};
        const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
        const speechStatus=$('smitSpeechStatus'),start=$('smitSpeechStart'),stop=$('smitSpeechStop'),result=$('smitSpeechResult'),indicator=$('smitMicIndicator'),micState=$('smitMicState');
        let recognition=null,finalTranscript='';
        if(!SpeechRecognition){start.disabled=true;start.title='Speech Recognition در این مرورگر پشتیبانی نمی‌شود';speechStatus.textContent='این مرورگر API تشخیص گفتار را پشتیبانی نمی‌کند. از آخرین نسخه Chrome یا Edge استفاده کن.';speechStatus.dataset.kind='error';}
        function setListening(on){start.disabled=on;stop.disabled=!on;indicator.classList.toggle('live',on);micState.textContent=on?'در حال شنیدن…':'خاموش';}
        if(SpeechRecognition){recognition=new SpeechRecognition();recognition.continuous=true;recognition.interimResults=true;recognition.maxAlternatives=1;
          recognition.onstart=()=>{setListening(true);speechStatus.textContent='میکروفون فعال است؛ واضح و نزدیک میکروفون صحبت کن.';speechStatus.dataset.kind='ok';};
          recognition.onresult=event=>{let interim='';for(let i=event.resultIndex;i<event.results.length;i++){const transcript=event.results[i][0].transcript;if(event.results[i].isFinal)finalTranscript+=transcript+' ';else interim+=transcript;}result.value=finalTranscript+interim;};
          recognition.onerror=event=>{speechStatus.textContent=event.error==='not-allowed'?'دسترسی میکروفون رد شد. مجوز سایت را در نوار آدرس مرورگر فعال کن.':'خطای تشخیص گفتار: '+event.error;speechStatus.dataset.kind='error';};
          recognition.onend=()=>{setListening(false);if(speechStatus.dataset.kind!=='error')speechStatus.textContent='تشخیص گفتار متوقف شد. متن باقی مانده و قابل ویرایش است.';};
          start.onclick=()=>{try{recognition.lang=$('smitSpeechLang').value;finalTranscript=result.value.trim()?(result.value.trim()+' '):'';recognition.start();}catch(e){speechStatus.textContent='میکروفون در حال استفاده است یا شروع مجدد ممکن نیست. چند لحظه صبر کن.';speechStatus.dataset.kind='error';}};
          stop.onclick=()=>{recognition.stop();};
          $('smitSpeechLang').onchange=()=>{if(start.disabled){recognition.stop();setTimeout(()=>{try{recognition.lang=$('smitSpeechLang').value;recognition.start();}catch{}} ,250);}};
        }
        $('smitSpeechClear').onclick=()=>{finalTranscript='';result.value='';speechStatus.textContent='متن پاک شد.';speechStatus.dataset.kind='';};
        $('smitSpeechCopy').onclick=async()=>{if(!result.value.trim()){speechStatus.textContent='متنی برای کپی وجود ندارد.';return;}try{await navigator.clipboard.writeText(result.value);speechStatus.textContent='متن کپی شد.';speechStatus.dataset.kind='ok';}catch{result.select();speechStatus.textContent='متن انتخاب شد؛ با Ctrl+C کپی کن.';}};
        $('smitSpeechDownload').onclick=()=>{const text=result.value.trim();if(!text){speechStatus.textContent='ابتدا گفتار را به متن تبدیل کن.';return;}const blob=new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='smit-voice-transcription.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
        return;
      }
      if(toolId==="translator"){
        const languages=[
          ["fa","فارسی"],["en","English"],["tr","Türkçe"],["ar","العربية"],["de","Deutsch"],
          ["fr","Français"],["es","Español"],["it","Italiano"],["pt","Português"],["ru","Русский"],
          ["zh-CN","中文 (简体)"],["zh-TW","中文 (繁體)"],["ja","日本語"],["ko","한국어"],["hi","हिन्दी"],
          ["ur","اردو"],["bn","বাংলা"],["id","Bahasa Indonesia"],["ms","Bahasa Melayu"],["th","ไทย"],
          ["vi","Tiếng Việt"],["tl","Filipino"],["nl","Nederlands"],["sv","Svenska"],["no","Norsk"],
          ["da","Dansk"],["fi","Suomi"],["pl","Polski"],["cs","Čeština"],["sk","Slovenčina"],
          ["hu","Magyar"],["ro","Română"],["bg","Български"],["el","Ελληνικά"],["uk","Українська"],
          ["he","עברית"],["sw","Kiswahili"],["af","Afrikaans"],["sr","Српски"],["hr","Hrvatski"],
          ["bs","Bosanski"],["sl","Slovenščina"],["lt","Lietuvių"],["lv","Latviešu"],["et","Eesti"],
          ["ka","ქართული"],["hy","Հայերեն"],["az","Azərbaycanca"],["kk","Қазақша"],["uz","Oʻzbekcha"]
        ];
        const optionHTML=languages.map(([code,name])=>`<option value="${code}">${name}</option>`).join("");
        shell(`<div class="smit-tool-label">LANGUAGE TOOLS / 50 LANGUAGES</div>
          <div class="smit-language-row"><select id="smitTranslateFrom" aria-label="زبان مبدأ"><option value="auto">تشخیص خودکار زبان</option>${optionHTML}</select>
          <button type="button" id="smitTranslateSwap" class="smit-tool-secondary" title="جابه‌جایی زبان‌ها">⇄</button>
          <select id="smitTranslateTo" aria-label="زبان مقصد">${optionHTML}</select></div>
          <textarea id="smitTranslateInput" class="smit-tool-textarea" rows="5" placeholder="متن یا کلمه موردنظرت را بنویس..."></textarea>
          <div class="smit-tool-actions"><button type="button" class="smit-tool-primary" id="smitTranslateGo">ترجمه متن</button>
          <button type="button" class="smit-tool-secondary" id="smitDictionaryGo">جست‌وجوی معنی واژه</button></div>
          <div class="smit-tool-result" id="smitTranslateResult" aria-live="polite">نتیجه ترجمه یا معنی واژه اینجا نمایش داده می‌شود.</div>
          <p class="smit-tool-hint">ترجمه آنلاین با چند سرویس جایگزین انجام می‌شود. برای ترجمه به اینترنت نیاز است؛ واژه‌نامه آفلاین هم برای واژه‌های پایه فعال است.</p>`);
        const input=document.getElementById("smitTranslateInput"),result=document.getElementById("smitTranslateResult"),from=document.getElementById("smitTranslateFrom"),to=document.getElementById("smitTranslateTo"),translateButton=document.getElementById("smitTranslateGo"),dictionaryButton=document.getElementById("smitDictionaryGo");
        to.value="en";
        const dict={"hello":"سلام","world":"جهان","learn":"یاد گرفتن","study":"مطالعه کردن","computer":"کامپیوتر","friend":"دوست","good morning":"صبح بخیر","thank you":"متشکرم","سلام":"hello","دوست":"friend","کتاب":"book","کامپیوتر":"computer","خسته":"tired","خوب":"good","merhaba":"سلام","teşekkürler":"متشکرم","bonjour":"سلام","hola":"سلام","guten tag":"روز بخیر","ありがとう":"متشکرم"};
        const setBusy=busy=>{translateButton.disabled=busy;dictionaryButton.disabled=busy;translateButton.textContent=busy?"در حال ترجمه...":"ترجمه متن";};
        const googleTranslate=async(q,source,target)=>{
          const params=new URLSearchParams({client:"gtx",sl:source==="auto"?"auto":source,tl:target,dt:"t",q});
          const response=await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`,{method:"GET",mode:"cors",cache:"no-store"});
          if(!response.ok)throw new Error(`Google ${response.status}`);
          const data=await response.json();
          const translated=Array.isArray(data?.[0])?data[0].map(part=>part?.[0]||"").join(""):"";
          if(!translated.trim())throw new Error("Empty Google response");
          return translated;
        };
        const splitForMyMemory=value=>{
          const words=value.match(/[^\s]+\s*/gu)||[value],chunks=[];let chunk="";
          for(const word of words){
            if(new TextEncoder().encode(chunk+word).length>450&&chunk){chunks.push(chunk);chunk="";}
            if(new TextEncoder().encode(word).length>450){let part="";for(const char of Array.from(word)){if(new TextEncoder().encode(part+char).length>450){chunks.push(part);part="";}part+=char;}chunk+=part;}
            else chunk+=word;
          }
          if(chunk)chunks.push(chunk);return chunks;
        };
        const myMemoryTranslate=async(q,source,target)=>{
          const chunks=splitForMyMemory(q),translated=[];
          for(const chunk of chunks){
            const params=new URLSearchParams({q:chunk,langpair:`${source==="auto"?"autodetect":source}|${target}`});
            const response=await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`,{method:"GET",mode:"cors",cache:"no-store"});
            if(!response.ok)throw new Error(`MyMemory ${response.status}`);
            const data=await response.json();
            if(Number(data?.responseStatus)!==200||!data?.responseData?.translatedText)throw new Error(data?.responseDetails||"MyMemory unavailable");
            translated.push(data.responseData.translatedText);
          }
          return translated.join("");
        };
        const translateWithFallback=async(q,source,target)=>{
          if(source===target)return q;
          const providers=[googleTranslate,myMemoryTranslate],errors=[];
          for(const provider of providers){
            try{return await provider(q,source,target);}catch(error){errors.push(error);}
          }
          throw new Error(errors.map(error=>error?.message||"service unavailable").join("; "));
        };
        document.getElementById("smitTranslateSwap").onclick=()=>{
          if(from.value==="auto"){result.textContent="برای جابه‌جایی، ابتدا زبان مبدأ را از فهرست انتخاب کن.";return;}
          const oldFrom=from.value;from.value=to.value;to.value=oldFrom;
        };
        const runTranslation=async(dictionaryMode=false)=>{
          const q=input.value.trim();if(!q){result.textContent="اول متن یا واژه را وارد کن.";return;}
          if(dictionaryMode&&q.length>120){result.textContent="برای جست‌وجوی واژه، متن کوتاه‌تری وارد کن.";return;}
          setBusy(true);result.textContent="در حال جست‌وجو و ترجمه با سرویس‌های جایگزین...";
          try{
            const translated=await translateWithFallback(q,from.value,to.value);
            result.textContent=translated;
          }catch(error){
            const local=dict[q.toLocaleLowerCase()]||dict[q];
            if(dictionaryMode&&local){result.textContent=`${local}\n\n(نتیجه از واژه‌نامه آفلاین)`;}
            else result.textContent="در حال حاضر سرویس‌های آنلاین ترجمه پاسخ‌گو نیستند. اتصال اینترنت را بررسی کن و چند لحظه بعد دوباره امتحان کن. اگر واژه‌ای پرکاربرد باشد، جست‌وجوی آفلاین هم می‌تواند کمک کند.";
          }finally{setBusy(false);}
        };
        translateButton.onclick=()=>runTranslation(false);
        dictionaryButton.onclick=()=>runTranslation(true);
        return;
      }
      if(toolId==="json"){
        shell(`<div class="smit-tool-label">DEVELOPER TOOL / JSON</div><textarea id="smitJsonInput" class="smit-tool-textarea smit-code-area" rows="10" spellcheck="false" placeholder='{"name":"SMIT","active":true}'></textarea><div class="smit-tool-actions"><button class="smit-tool-primary" id="smitJsonFormat">Format JSON</button><button class="smit-tool-secondary" id="smitJsonMinify">Minify</button><button class="smit-tool-secondary" id="smitJsonCopy">Copy</button><button class="smit-tool-secondary" id="smitJsonClear">Clear</button></div><div class="smit-tool-result" id="smitJsonStatus">JSON خود را وارد کن.</div>`);
        const input=document.getElementById("smitJsonInput"),status=document.getElementById("smitJsonStatus");
        const run=min=>{try{const value=JSON.parse(input.value);input.value=JSON.stringify(value,null,min?0:2);status.textContent="✓ JSON معتبر است.";}catch(e){status.textContent="خطای JSON: "+e.message;}};
        document.getElementById("smitJsonFormat").onclick=()=>run(false);document.getElementById("smitJsonMinify").onclick=()=>run(true);document.getElementById("smitJsonCopy").onclick=async()=>{try{await navigator.clipboard.writeText(input.value);status.textContent="کد کپی شد.";}catch{status.textContent="کپی خودکار در این مرورگر در دسترس نیست."}};document.getElementById("smitJsonClear").onclick=()=>{input.value="";status.textContent="پاک شد.";};
        return;
      }
      if(toolId==="converter"){
        shell(`<div class="smit-tool-label">UNIT CONVERTER</div><div class="smit-convert-controls"><select id="smitUnitType"><option value="length">طول</option><option value="weight">وزن</option><option value="temperature">دما</option><option value="time">زمان</option><option value="data">حجم داده</option></select><input id="smitUnitValue" type="number" value="1" step="any"><select id="smitUnitFrom"></select><span>→</span><select id="smitUnitTo"></select></div><div class="smit-tool-result smit-convert-result"><small>نتیجه تبدیل</small><output id="smitUnitResult">100</output></div>`);
        const sets={length:{m:1,km:1000,cm:.01,mm:.001,mi:1609.344,ft:.3048},weight:{kg:1,g:.001,mg:.000001,lb:.45359237},time:{sec:1,min:60,hour:3600,day:86400},data:{B:1,KB:1024,MB:1048576,GB:1073741824}};
        const labels={m:"متر",km:"کیلومتر",cm:"سانتی‌متر",mm:"میلی‌متر",mi:"مایل",ft:"فوت",kg:"کیلوگرم",g:"گرم",mg:"میلی‌گرم",lb:"پوند",sec:"ثانیه",min:"دقیقه",hour:"ساعت",day:"روز",B:"Byte",KB:"KB",MB:"MB",GB:"GB",c:"°C",f:"°F",k:"K"};
        const type=document.getElementById("smitUnitType"),value=document.getElementById("smitUnitValue"),a=document.getElementById("smitUnitFrom"),b=document.getElementById("smitUnitTo"),out=document.getElementById("smitUnitResult");
        function options(){let keys=type.value==="temperature"?["c","f","k"]:Object.keys(sets[type.value]);a.innerHTML=b.innerHTML=keys.map(k=>`<option value="${k}">${labels[k]}</option>`).join("");b.selectedIndex=1;convert();}
        function convert(){let n=Number(value.value);if(!Number.isFinite(n)){out.textContent="—";return;}let r;if(type.value==="temperature"){let c=a.value==="c"?n:a.value==="f"?(n-32)*5/9:n-273.15;r=b.value==="c"?c:b.value==="f"?c*9/5+32:c+273.15;}else r=n*sets[type.value][a.value]/sets[type.value][b.value];out.textContent=Number(r.toPrecision(10)).toLocaleString("en-US");}
        [type,value,a,b].forEach(el=>el.addEventListener("input",()=>{if(el===type)options();else convert();}));options();return;
      }
      if(toolId==="counter"){
        shell(`<div class="smit-tool-label">WORD COUNTER</div><textarea id="smitCounterInput" class="smit-tool-textarea" rows="9" placeholder="متن خود را اینجا وارد کن..."></textarea><div class="smit-counter-grid"><div><b id="smitCountWords">0</b><span>کلمه</span></div><div><b id="smitCountChars">0</b><span>کاراکتر</span></div><div><b id="smitCountNoSpace">0</b><span>بدون فاصله</span></div><div><b id="smitCountSentences">0</b><span>جمله</span></div></div><button class="smit-tool-secondary" id="smitCounterClear">پاک کردن متن</button>`);
        const input=document.getElementById("smitCounterInput");const update=()=>{const v=input.value.trim();document.getElementById("smitCountWords").textContent=v?v.split(/\s+/).length:0;document.getElementById("smitCountChars").textContent=input.value.length;document.getElementById("smitCountNoSpace").textContent=input.value.replace(/\s/g,"").length;document.getElementById("smitCountSentences").textContent=(v.match(/[.!؟?۔]+/g)||[]).length;};input.addEventListener("input",update);document.getElementById("smitCounterClear").onclick=()=>{input.value="";update();};return;
      }
      if(toolId==="color"){
        shell(`<div class="smit-tool-label">COLOR STUDIO</div><div class="smit-color-layout"><input type="color" id="smitColorInput" value="#168bff"><div><h2 id="smitColorHex">#168BFF</h2><p>رنگ انتخابی</p></div></div><div class="smit-color-values"><label>HEX<input id="smitHexValue" value="#168bff"></label><label>RGB<input id="smitRgbValue" readonly></label></div><button class="smit-tool-primary" id="smitColorCopy">کپی کد HEX</button><div class="smit-color-preview" id="smitColorPreview"></div>`);
        const picker=document.getElementById("smitColorInput"),hex=document.getElementById("smitHexValue"),rgb=document.getElementById("smitRgbValue"),preview=document.getElementById("smitColorPreview");function setColor(v){if(!/^#[0-9a-f]{6}$/i.test(v))return;picker.value=v;hex.value=v;document.getElementById("smitColorHex").textContent=v.toUpperCase();const n=parseInt(v.slice(1),16);rgb.value=`${n>>16}, ${n>>8&255}, ${n&255}`;preview.style.background=v;}picker.oninput=()=>setColor(picker.value);hex.onchange=()=>setColor(hex.value);document.getElementById("smitColorCopy").onclick=async()=>{try{await navigator.clipboard.writeText(hex.value);document.getElementById("smitColorCopy").textContent="کپی شد ✓";}catch{hex.select();}};setColor(picker.value);return;
      }
      if(toolId==="qr"){
        shell(`<div class="smit-tool-label">QR CODE MAKER</div><textarea id="smitQrInput" class="smit-tool-textarea" rows="3" placeholder="متن یا لینک موردنظر را وارد کن..."></textarea><div class="smit-tool-actions"><button class="smit-tool-primary" id="smitQrMake">ساخت QR Code</button><button class="smit-tool-secondary" id="smitQrDownload" disabled>دانلود تصویر</button></div><div class="smit-qr-preview" id="smitQrPreview">پیش‌نمایش QR Code</div><p class="smit-tool-hint">برای ساخت تصویر QR از سرویس آنلاین استفاده می‌شود؛ متن ورودی برای تولید تصویر به آن سرویس ارسال خواهد شد.</p>`);
        let imageUrl="";const preview=document.getElementById("smitQrPreview"),download=document.getElementById("smitQrDownload");document.getElementById("smitQrMake").onclick=()=>{const value=document.getElementById("smitQrInput").value.trim();if(!value){preview.textContent="ابتدا متن یا لینک را وارد کن.";return;}imageUrl=`https://api.qrserver.com/v1/create-qr-code/?size=260x260&format=png&data=${encodeURIComponent(value)}`;preview.innerHTML=`<img alt="Generated QR code" src="${imageUrl}">`;download.disabled=false;};download.onclick=async()=>{if(!imageUrl)return;try{const res=await fetch(imageUrl);const blob=await res.blob();const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="smit-qr-code.png";a.click();URL.revokeObjectURL(a.href);}catch{window.open(imageUrl,"_blank","noopener");}};return;
      }
      if(toolId==="notes"){
        shell(`<div class="smit-tool-label">QUICK NOTES / SAVED LOCALLY</div><input id="smitNoteTitle" class="smit-tool-input" maxlength="90" placeholder="عنوان یادداشت"><textarea id="smitNoteBody" class="smit-tool-textarea" rows="6" placeholder="یادداشتت را اینجا بنویس..."></textarea><div class="smit-tool-actions"><button class="smit-tool-primary" id="smitNoteSave">ذخیره یادداشت</button><button class="smit-tool-secondary" id="smitNoteClear">یادداشت جدید</button></div><div class="smit-notes-list" id="smitNotesList"></div>`);
        const KEY="smit_ai_quick_notes_v1",title=document.getElementById("smitNoteTitle"),body=document.getElementById("smitNoteBody"),list=document.getElementById("smitNotesList");let notes=[];try{notes=JSON.parse(localStorage.getItem(KEY)||"[]");if(!Array.isArray(notes))notes=[];}catch{notes=[];}let editing=null;
        function draw(){list.innerHTML=notes.map(n=>`<article class="smit-note-item"><button type="button" data-note-edit="${n.id}"><b>${toolEsc(n.title||"بدون عنوان")}</b><small>${toolEsc((n.body||"").slice(0,100))}</small></button><button type="button" class="smit-note-delete" data-note-delete="${n.id}" aria-label="حذف یادداشت">×</button></article>`).join("")||'<p class="smit-tool-hint">هنوز یادداشتی ذخیره نکرده‌ای.</p>';}
        document.getElementById("smitNoteSave").onclick=()=>{if(!title.value.trim()&&!body.value.trim())return;const item={id:editing||Date.now(),title:title.value.trim(),body:body.value.trim(),updatedAt:Date.now()};const i=notes.findIndex(n=>n.id===item.id);if(i>=0)notes[i]=item;else notes.unshift(item);localStorage.setItem(KEY,JSON.stringify(notes));editing=null;title.value="";body.value="";draw();};
        document.getElementById("smitNoteClear").onclick=()=>{editing=null;title.value="";body.value="";};
        list.onclick=e=>{const del=e.target.closest("[data-note-delete]"),edit=e.target.closest("[data-note-edit]");if(del){notes=notes.filter(n=>String(n.id)!==del.dataset.noteDelete);localStorage.setItem(KEY,JSON.stringify(notes));draw();}if(edit){const n=notes.find(x=>String(x.id)===edit.dataset.noteEdit);if(n){editing=n.id;title.value=n.title;body.value=n.body;title.focus();}}};draw();return;
      }
    }

    const otherPages = {
      coding:["برنامه‌نویسی / Coding","مسیر یادگیری Python و برنامه‌نویسی در این بخش قرار می‌گیرد."],
      assistant:["دستیار هوشمند / AI Assistant","بخش دستیار هوشمند در حال آماده‌سازی است."],
      tools:["ابزارها / Tools","ابزارهای کاربردی SMIT AI در این بخش قرار می‌گیرند."]
    };

    function renderOtherPage(page) {
      const item = otherPages[page];
      if (!item) return;
      if (page === "tools") return renderToolsHome();
      if (page === "assistant") {
        const configKey = "smit_gemini_user_config_v1";
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem(configKey) || "{}"); } catch { saved = {}; }
        const safeEmail = String(saved.email || "").replace(/[&<>"']/g, "");
        const hasKey = Boolean(saved.apiKey && String(saved.apiKey).trim());
        setPage(`
          ${renderHeader("دستیار هوشمند / AI Assistant","اتصال مستقیم به Gemini با کلید API شخصی؛ کلید هر کاربر در مرورگر خودش ذخیره می‌شود.")}
          <section class="smit-panel smit-assistant-panel">
            <div class="smit-assistant-heading"><span class="smit-tag">SMIT AI CORE · GEMINI</span><span class="smit-online-dot"></span><span class="smit-muted" id="smitAssistantStatus">${hasKey ? "کلید در این مرورگر ذخیره شده" : "ابتدا اتصال شخصی خودت را تنظیم کن"}</span></div>
            <div class="smit-assistant-welcome"><h2>چطور می‌تونم کمکت کنم؟</h2><p class="smit-muted">از برنامه‌نویسی و علوم تا زبان، ریاضی و پرسش‌های عمومی. پاسخ‌ها ممکن است خطا داشته باشند.</p></div>
            <div class="smit-ai-uiverse-card card"><section class="smit-ai-setup form card2">
              <h3>تنظیم حساب و کلید API شخصی</h3>
              <p>هر بازدیدکننده باید ایمیل و کلید Gemini خودش را وارد کند. این اطلاعات فقط در همین مرورگر ذخیره می‌شوند و برای کاربران دیگر قابل مشاهده نیستند.</p>
              <label for="smitAssistantEmail">ایمیل شما</label>
              <div class="field"><span class="input-icon" aria-hidden="true">✉</span><input class="input-field" id="smitAssistantEmail" type="email" autocomplete="email" maxlength="180" placeholder="name@example.com" value="${safeEmail}"></div>
              <label for="smitAssistantKey">Gemini API Key</label>
              <div class="field smit-ai-key-row"><span class="input-icon" aria-hidden="true">⌑</span><input class="input-field" id="smitAssistantKey" type="password" autocomplete="off" spellcheck="false" placeholder="کلید API خودت را اینجا وارد کن"><button type="button" class="button1" id="smitToggleKey">نمایش</button></div>
              <div class="smit-ai-setup-actions btn"><button type="button" class="button2" id="smitSaveGemini">ذخیره و اتصال</button><button type="button" class="button1" id="smitTestGemini">بررسی اتصال</button><button type="button" class="button3" id="smitClearGemini">پاک کردن اطلاعات</button></div>
              <small class="smit-ai-privacy">کلید به سرور SMIT ارسال نمی‌شود؛ مرورگر آن را مستقیماً در درخواست Gemini استفاده می‌کند. دسترسی به این کامپیوتر/مرورگر می‌تواند به اطلاعات ذخیره‌شده دسترسی بدهد؛ روی دستگاه مشترک ذخیره نکن.</small>
              <p class="smit-ai-get-key">کلید نداری؟ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">دریافت کلید از Google AI Studio ↗</a></p>
            </section></div>
            <form id="smitAssistantForm" class="smit-assistant-form">
              <textarea id="smitAssistantInput" rows="3" required maxlength="6000" placeholder="سؤالت رو اینجا بنویس..."></textarea>
              <button class="smit-btn" type="submit">ارسال سؤال <span>↗</span></button>
            </form>
            <div id="smitAssistantReply" class="smit-assistant-reply" aria-live="polite">${hasKey ? "اتصال آماده است؛ برای شروع یک سؤال بپرس یا ابتدا دکمه بررسی اتصال را بزن." : "برای استفاده از دستیار، ایمیل و کلید API شخصی خودت را وارد و ذخیره کن."}</div>
          </section>
        `);
        const $ = id => document.getElementById(id);
        const emailInput = $("smitAssistantEmail"), keyInput = $("smitAssistantKey"), reply = $("smitAssistantReply"), status = $("smitAssistantStatus");
        const readConfig = () => { try { return JSON.parse(localStorage.getItem(configKey) || "{}"); } catch { return {}; } };
        const saveConfig = () => {
          const email = emailInput.value.trim(), apiKey = keyInput.value.trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = "ایمیل معتبر وارد کن."; emailInput.focus(); return false; }
          if (apiKey.length < 20) { status.textContent = "کلید API معتبر وارد کن."; keyInput.focus(); return false; }
          localStorage.setItem(configKey, JSON.stringify({ email, apiKey, savedAt: Date.now() }));
          status.textContent = "اطلاعات در همین مرورگر ذخیره شد.";
          return true;
        };
        const getApiError = data => data?.error?.message || "پاسخ نامشخصی از سرویس دریافت شد.";
        const apiRequest = async (contents, maxOutputTokens=1200) => {
          const cfg = readConfig();
          if (!cfg.apiKey) throw new Error("ابتدا ایمیل و کلید API خودت را ذخیره کن.");
          const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
            method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": cfg.apiKey },
            body: JSON.stringify({ system_instruction: { parts: [{ text: "You are SMIT AI, a helpful, careful, multilingual assistant. Answer the user's question accurately and clearly in the language they used. Explain step by step when useful. Do not invent facts, sources, or certainty. If information may be current or uncertain, say so. Use readable Markdown." }] }, contents, generationConfig: { temperature: 0.6, maxOutputTokens } })
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(getApiError(data) || `خطای سرویس (${response.status})`);
          const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("\n").trim();
          if (!text) throw new Error("پاسخ متنی از Gemini دریافت نشد. ممکن است درخواست توسط فیلتر ایمنی متوقف شده باشد.");
          return text;
        };
        $("smitToggleKey").onclick = () => { const show = keyInput.type === "password"; keyInput.type = show ? "text" : "password"; $("smitToggleKey").textContent = show ? "پنهان" : "نمایش"; };
        $("smitSaveGemini").onclick = () => { if (saveConfig()) { keyInput.value = ""; reply.textContent = "اطلاعات ذخیره شد. برای تأیید کلید، روی «بررسی اتصال» بزن."; } };
        $("smitTestGemini").onclick = async () => {
          if (keyInput.value.trim() && !saveConfig()) return;
          const cfg = readConfig(); if (!cfg.apiKey) { status.textContent = "ابتدا کلید API را وارد و ذخیره کن."; return; }
          status.textContent = "در حال بررسی کلید..."; $("smitTestGemini").disabled = true;
          try {
            const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models", { headers: { "x-goog-api-key": cfg.apiKey } });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(getApiError(data));
            status.textContent = "کلید پذیرفته شد؛ اتصال API برقرار است.";
            reply.textContent = "اتصال API تأیید شد. حالا می‌توانی سؤال بپرسی.";
          } catch (err) { status.textContent = "بررسی اتصال ناموفق بود."; reply.textContent = "خطا: " + err.message; }
          finally { $("smitTestGemini").disabled = false; }
        };
        $("smitClearGemini").onclick = () => { localStorage.removeItem(configKey); emailInput.value = ""; keyInput.value = ""; status.textContent = "اطلاعات این مرورگر پاک شد."; reply.textContent = "برای استفاده، ایمیل و کلید API شخصی خودت را دوباره وارد کن."; };
        const form = $("smitAssistantForm");
        form?.addEventListener("submit", async event => {
          event.preventDefault();
          const question = $("smitAssistantInput").value.trim();
          if (!question) return;
          if (!readConfig().apiKey) { reply.textContent = "ابتدا ایمیل و کلید API شخصی خودت را در بخش تنظیمات وارد و ذخیره کن."; return; }
          const history = window.__SMIT_GEMINI_HISTORY || [];
          history.push({ role: "user", parts: [{ text: question }] });
          reply.innerHTML = `<div class="smit-assistant-user-message"><b>سؤال تو</b><p>${escapeHTML(question)}</p></div><p class="smit-assistant-notice">در حال دریافت پاسخ از Gemini…</p>`;
          $("smitAssistantInput").value = "";
          const send = form.querySelector('button[type="submit"]'); send.disabled = true;
          try {
            const answer = await apiRequest(history);
            history.push({ role: "model", parts: [{ text: answer }] });
            window.__SMIT_GEMINI_HISTORY = history.slice(-12);
            reply.innerHTML = `<div class="smit-assistant-user-message"><b>سؤال تو</b><p>${escapeHTML(question)}</p></div><div class="smit-assistant-answer"><b>پاسخ SMIT AI</b><div>${escapeHTML(answer).replace(/\n/g, "<br>")}</div></div>`;
          } catch (err) {
            history.pop();
            reply.innerHTML = `<div class="smit-assistant-user-message"><b>سؤال تو</b><p>${escapeHTML(question)}</p></div><p class="smit-assistant-notice">${escapeHTML(err.message)}<br>سهمیه رایگان، دسترسی مدل یا تنظیمات کلید حساب گوگل را بررسی کن.</p>`;
          } finally { send.disabled = false; }
        });
        return;
      }
      setPage(`
        ${renderHeader(item[0],item[1])}
        <div class="smit-panel">
          <span class="smit-tag">COMING SOON</span>
          <h2>به‌زودی / Coming Soon</h2>
          <p>${escapeHTML(item[1])}</p>
          <button class="smit-btn" data-page="english">رفتن به آموزش انگلیسی</button>
        </div>
      `);
    }

        // -----------------------------------------------------
    // 15. NAVIGATION
    // -----------------------------------------------------

    function normalizePage(value) {
      const text = String(value || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g," ");

      const aliases = {
        home:"home",
        خانه:"home",
        english:"english",
        "آموزش انگلیسی":"english",
        "زبان انگلیسی":"english",
        turkish:"turkish",
        "ترکی":"turkish",
        "ترکی استانبولی":"turkish",
        coding:"coding",
        programming:"coding",
        "برنامه‌نویسی":"coding",
        "برنامه نویسی":"coding",
        quizzes:"quiz",
        quiz:"quiz",
        "آزمون":"quiz",
        "آزمون‌ها":"quiz",
        assistant:"assistant",
        "ai assistant":"assistant",
        "دستیار":"assistant",
        tools:"tools",
        "ابزارها":"tools",
        planner:"planner",
        "برنامه‌ریز":"planner",
        "study room":"study-room",
        "اتاق مطالعه":"study-room",
        achievements:"achievements",
        "دستاوردها":"achievements",
        phrases:"phrases",
        "عبارت‌ها":"phrases",
        grammar:"grammar",
        "گرامر":"grammar"
      };

      return aliases[text] || text;
    }

    function navigate(page) {
      page = normalizePage(page);
      // Legacy links to retired placeholder pages return safely to the dashboard.
      if (["turkish","planner","achievements"].includes(page)) page = "home";

      if (page === "home") {
        dynamicPage.innerHTML = "";

        const dashboard = main.querySelector(
          ".dashboard-content,.dashboard,.welcome-section"
        );

        dashboard?.scrollIntoView({behavior:"auto",block:"start"});
        return;
      }

      if (page === "study-room" && window.SMITStudyRoom) return window.SMITStudyRoom.open();
      if (page === "english") return window.SMITEnglishComplete?.open() || renderEnglishHome();
      if (page === "phrases") return renderPhrases();
      if (page === "grammar") return renderGrammar();
      if (page === "quiz") return window.SMITLoader.run("در حال آماده‌سازی آزمون", "سؤال‌های آزمون در حال بارگذاری هستند...", 420, dynamicPage, renderQuiz);

      if (otherPages[page]) return renderOtherPage(page);

      console.warn("Unknown SMIT AI page:",page);
    }

    // Public bridge for the outer SPA router and additive page modules.
    window.SMITNavigate = navigate;

    // Sidebar links: supports common HTML menu structures.
    document.addEventListener("click",event => {
      const navItem = event.target.closest(
        ".nav-item,.nav-link,[data-page],a[href^='#']"
      );

      if (!navItem || dynamicPage.contains(navItem)) return;

      const href = navItem.getAttribute("href") || "";
      const rawPage =
        navItem.getAttribute("data-page") ||
        (href.startsWith("#") ? href.slice(1) : "") ||
        navItem.textContent.trim();

      const page = normalizePage(rawPage);

      const allowed = [
        "home","english","turkish","coding","quiz",
        "assistant","tools","planner","study-room","achievements"
      ];

      if (!allowed.includes(page)) return;

      event.preventDefault();
      navigate(page);

      document.querySelectorAll(".nav-item,.nav-link").forEach(item => {
        item.classList.remove("active");
      });

      navItem.classList.add("active");
    });

    // -----------------------------------------------------
    // 16. DYNAMIC PAGE BUTTONS
    // -----------------------------------------------------

    dynamicPage.addEventListener("click",event => {
      const toolBack = event.target.closest("[data-tools-back]");
      if (toolBack) { renderToolsHome(); return; }
      const toolOpen = event.target.closest("[data-tool-open]");
      if (toolOpen) { renderTool(toolOpen.dataset.toolOpen); return; }
      const pageButton = event.target.closest("[data-page]");

      if (pageButton) {
        navigate(pageButton.dataset.page);
        return;
      }

      const lessonButton = event.target.closest("[data-open-lesson]");

      if (lessonButton) {
        window.SMITLoader.run("در حال باز کردن درس", "محتوای درس A1 در حال آماده‌سازی است...", 420, dynamicPage, () => renderLesson(lessonButton.dataset.openLesson));
        return;
      }

      const speakButton = event.target.closest("[data-speak]");

      if (speakButton) {
        const lesson = lessons.find(item => item.id === Number(speakButton.dataset.lesson));
        const word = lesson?.words[Number(speakButton.dataset.speak)];
        if (word) speak(word[0]);
        return;
      }

      const learnButton = event.target.closest("[data-learn]");

      if (learnButton) {
        const lesson = lessons.find(item => item.id === Number(learnButton.dataset.lesson));
        const word = lesson?.words[Number(learnButton.dataset.learn)];

        if (lesson && word && !progress.learned.includes(word[0])) {
          window.SMITWordQuiz.open({container:dynamicPage,word,wordsPool:lessons.flatMap(item=>item.words),level:"A1",
            onPass:()=>{ if (!progress.learned.includes(word[0])) { progress.learned.push(word[0]); progress.xp += 5; saveProgress(); window.SMITLearningFeedback.show(5); } renderLesson(lesson.id); },
            onBack:()=>renderLesson(lesson.id)
          });
        }
        return;
      }

      const completeButton = event.target.closest("[data-complete-lesson]");

      if (completeButton) {
        const id = Number(completeButton.dataset.completeLesson);

        if (!progress.completedLessons.includes(id)) {
          progress.completedLessons.push(id);
          progress.xp += 20;
          saveProgress();
          toast("درس تکمیل شد! ۲۰ XP گرفتی.");
        }

        renderLesson(id);
        return;
      }

      const phraseButton = event.target.closest("[data-speak-phrase]");

      if (phraseButton) {
        const phrase = phrases[Number(phraseButton.dataset.speakPhrase)];
        if (phrase) speak(phrase[0]);
        return;
      }

      const textButton = event.target.closest("[data-speak-text]");

      if (textButton) {
        speak(textButton.dataset.speakText);
      }
    });

    // -----------------------------------------------------
    function applyA1VocabularyFilters() {
      const search = dynamicPage.querySelector("[data-vocab-search]");
      const filter = dynamicPage.querySelector("[data-vocab-filter]");
      if (!search || !filter) return;
      const query = search.value.trim().toLocaleLowerCase(), mode = filter.value;
      const cards = [...dynamicPage.querySelectorAll("[data-word-card]")];
      let visible = 0;
      cards.forEach(card => {
        const textMatch = (card.dataset.searchText || "").toLocaleLowerCase().includes(query);
        const learned = card.dataset.learned === "true";
        const filterMatch = mode === "all" || (mode === "learned" && learned) || (mode === "not-learned" && !learned);
        card.hidden = !(textMatch && filterMatch);
        if (!card.hidden) visible++;
      });
      const count = dynamicPage.querySelector("[data-vocab-result-count]");
      if (count) count.textContent = `نمایش ${visible} کلمه از ${cards.length}`;
    }
    dynamicPage.addEventListener("input",e => { if (e.target.matches("[data-vocab-search]")) applyA1VocabularyFilters(); });
    dynamicPage.addEventListener("change",e => { if (e.target.matches("[data-vocab-filter]")) applyA1VocabularyFilters(); });

    // 17. PUBLIC ACCESS FOR TESTING
    // -----------------------------------------------------

    window.SMIT_AI = {
      lessons,
      phrases,
      grammar,
      quizQuestions,
      getProgress:() => ({...progress}),
      openEnglish:renderEnglishHome,
      navigate
    };

    // -----------------------------------------------------
    // 18. LANGUAGE BUTTON
    // -----------------------------------------------------

    const languageButton = document.getElementById("languageBtn");

    if (languageButton) {
      languageButton.addEventListener("click",() => {
        const current = languageButton.textContent.trim();

        if (current.includes("FA")) {
          languageButton.textContent = "EN";
          toast("English interface option selected.");
        } else {
          languageButton.textContent = "FA / EN";
          toast("رابط فارسی و انگلیسی فعال است.");
        }
      });
    }

    // -----------------------------------------------------
    // 19. START BUTTON
    // -----------------------------------------------------

    document.querySelectorAll(".primary-button").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        navigate("english");
      });
    });

    // -----------------------------------------------------
    // 20. INITIAL SETUP
    // -----------------------------------------------------

    updateDashboardStats();

    console.log("SMIT AI English Learning System v3.1 loaded.");
  });

/* =====================================================
   SMIT AI — A2 ENGLISH EXPANSION
   Adds A2 without replacing existing A1 data
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const A2_KEY = "smitAI_english_A2_progress_v1";
  const A2_PASS = 15;

  const a2Lessons = [
    {
      id: 1,
      title: "Travel & Transportation",
      faTitle: "سفر و حمل‌ونقل",
      words: [
        ["airport","فرودگاه","اِرپورت","We arrived at the airport.","ما به فرودگاه رسیدیم."],
        ["ticket","بلیط","تیکِت","I bought a ticket.","من یک بلیط خریدم."],
        ["passport","گذرنامه","پَسپورت","Where is my passport?","گذرنامه من کجاست؟"],
        ["luggage","چمدان و بار","لاگِج","My luggage is heavy.","بار من سنگین است."],
        ["journey","سفر","جِرنی","The journey was long.","سفر طولانی بود."],
        ["station","ایستگاه","اِستِیشن","The station is near here.","ایستگاه نزدیک اینجاست."],
        ["platform","سکو","پِلَتفورم","The train is at platform two.","قطار در سکوی دو است."],
        ["flight","پرواز","فلایت","Our flight is late.","پرواز ما تأخیر دارد."],
        ["arrive","رسیدن","اَرایو","We arrive at six.","ما ساعت شش می‌رسیم."],
        ["depart","حرکت کردن","دیپارت","The bus departs soon.","اتوبوس به‌زودی حرکت می‌کند."],
        ["travel","سفر کردن","تِرَوِل","I love to travel.","من عاشق سفر کردن هستم."],
        ["abroad","خارج از کشور","اَبراد","She lives abroad.","او خارج از کشور زندگی می‌کند."],
        ["map","نقشه","مَپ","Look at the map.","به نقشه نگاه کن."],
        ["hotel","هتل","هوتِل","We stayed at a hotel.","ما در هتل اقامت کردیم."],
        ["reservation","رزرو","رِزِروِیشن","I have a reservation.","من رزرو دارم."],
        ["passenger","مسافر","پَسِنجِر","The passengers are waiting.","مسافران منتظر هستند."],
        ["traffic","ترافیک","تِرَفیک","There is a lot of traffic.","ترافیک زیادی وجود دارد."],
        ["underground","مترو","آندِرگرَوند","I take the underground.","من با مترو می‌روم."],
        ["return","برگشتن","ریتِرن","When will you return?","چه زمانی برمی‌گردی؟"],
        ["direction","جهت و مسیر","دایرِکشن","Can you show me the direction?","می‌توانی مسیر را به من نشان بدهی؟"]
      ]
    },
    {
      id: 2,
      title: "Health & Feelings",
      faTitle: "سلامتی و احساسات",
      words: [
        ["healthy","سالم","هِـلثی","I want to stay healthy.","می‌خواهم سالم بمانم."],
        ["ill","بیمار","ایل","He is ill today.","او امروز بیمار است."],
        ["headache","سردرد","هِدِیک","I have a headache.","من سردرد دارم."],
        ["stomachache","دل‌درد","اِستامَکِیک","She has a stomachache.","او دل‌درد دارد."],
        ["medicine","دارو","مِدیسِن","Take your medicine.","دارویت را مصرف کن."],
        ["appointment","قرار ملاقات","اَپوینتمِنت","I have a doctor's appointment.","من وقت دکتر دارم."],
        ["exercise","ورزش","اِکسِرسایز","Exercise is important.","ورزش مهم است."],
        ["relax","استراحت کردن","ریلَکس","You should relax.","باید استراحت کنی."],
        ["comfortable","راحت","کامفِرتِبِل","This chair is comfortable.","این صندلی راحت است."],
        ["worried","نگران","وُرید","I am worried about him.","من نگران او هستم."],
        ["excited","هیجان‌زده","اِکسایتِد","I am excited about the trip.","برای سفر هیجان‌زده‌ام."],
        ["nervous","مضطرب","نِروِس","She feels nervous.","او احساس اضطراب می‌کند."],
        ["lonely","تنها","لونلی","He feels lonely.","او احساس تنهایی می‌کند."],
        ["angry","عصبانی","اَنگری","Why are you angry?","چرا عصبانی هستی؟"],
        ["surprised","متعجب","سِرپرایزد","I was surprised.","من متعجب شدم."],
        ["careful","مراقب","کِرفُل","Be careful!","مراقب باش!"],
        ["dangerous","خطرناک","دِینجِرِس","That road is dangerous.","آن جاده خطرناک است."],
        ["advice","توصیه","اَدوایس","Can you give me advice?","می‌توانی به من توصیه‌ای بکنی؟"],
        ["symptom","علامت بیماری","سیمپتِم","What are your symptoms?","علائم بیماری تو چیست؟"],
        ["temperature","دما / تب","تِمپِرِچِر","I have a high temperature.","من تب دارم."]
      ]
    },
    {
      id: 3,
      title: "Work & Education",
      faTitle: "کار و تحصیلات",
      words: [
        ["career","مسیر شغلی","کَریِر","I want a good career.","من یک مسیر شغلی خوب می‌خواهم."],
        ["experience","تجربه","اِکسپیریِنس","I have work experience.","من تجربه کاری دارم."],
        ["skill","مهارت","اِسکیل","Programming is a useful skill.","برنامه‌نویسی مهارت مفیدی است."],
        ["improve","بهبود دادن","ایمپروو","I want to improve my English.","می‌خواهم انگلیسی‌ام را بهتر کنم."],
        ["interview","مصاحبه","اینتِرویو","I have a job interview.","من مصاحبه کاری دارم."],
        ["salary","حقوق","سَلِری","The salary is good.","حقوق خوب است."],
        ["colleague","همکار","کالیگ","My colleague is friendly.","همکارم خوش‌برخورد است."],
        ["manager","مدیر","مَنِجِر","The manager is busy.","مدیر مشغول است."],
        ["meeting","جلسه","میتینگ","We have a meeting today.","ما امروز جلسه داریم."],
        ["project","پروژه","پراجِکت","This project is important.","این پروژه مهم است."],
        ["deadline","مهلت نهایی","دِدلاین","The deadline is tomorrow.","مهلت نهایی فرداست."],
        ["apply","درخواست دادن","اَپلای","I want to apply for this job.","می‌خواهم برای این شغل درخواست بدهم."],
        ["customer","مشتری","کاستِمِر","The customer needs help.","مشتری به کمک نیاز دارد."],
        ["company","شرکت","کامپِنی","She works for a company.","او برای یک شرکت کار می‌کند."],
        ["training","آموزش","تِرِینینگ","The training starts Monday.","آموزش دوشنبه شروع می‌شود."],
        ["subject","موضوع / درس","سابجِکت","English is my favorite subject.","انگلیسی درس مورد علاقه من است."],
        ["degree","مدرک تحصیلی","دیگری","He has a computer degree.","او مدرک کامپیوتر دارد."],
        ["homework","تکلیف","هوم‌وِرک","I finished my homework.","من تکالیفم را تمام کردم."],
        ["successful","موفق","ساکسِسفُل","She is a successful programmer.","او برنامه‌نویس موفقی است."],
        ["future","آینده","فیوچِر","I am planning my future.","من برای آینده‌ام برنامه‌ریزی می‌کنم."]
      ]
    },
    {
      id: 4,
      title: "Technology & Communication",
      faTitle: "فناوری و ارتباطات",
      words: [
        ["website","وب‌سایت","وِبسایت","I have a personal website.","من یک وب‌سایت شخصی دارم."],
        ["download","دانلود کردن","داونلود","Download the file.","فایل را دانلود کن."],
        ["upload","آپلود کردن","آپلود","Upload your photo.","عکست را آپلود کن."],
        ["password","رمز عبور","پَسوِرد","Change your password.","رمز عبورت را تغییر بده."],
        ["account","حساب کاربری","اَکاونت","I created an account.","من یک حساب کاربری ساختم."],
        ["message","پیام","مِسِج","Send me a message.","برایم پیام بفرست."],
        ["conversation","مکالمه","کانْوِرسِیشن","We had a long conversation.","ما مکالمه طولانی داشتیم."],
        ["information","اطلاعات","اینفِرمِیشن","I need more information.","من به اطلاعات بیشتری نیاز دارم."],
        ["online","آنلاین","آنلاین","I study online.","من آنلاین درس می‌خوانم."],
        ["offline","آفلاین","آفلاین","The computer is offline.","کامپیوتر آفلاین است."],
        ["connection","اتصال","کِنِکشن","The internet connection is slow.","اتصال اینترنت کند است."],
        ["screen","صفحه‌نمایش","اِسکرین","Look at the screen.","به صفحه‌نمایش نگاه کن."],
        ["keyboard","صفحه‌کلید","کیبورد","My keyboard is new.","صفحه‌کلید من جدید است."],
        ["software","نرم‌افزار","سافت‌وِر","This software is useful.","این نرم‌افزار مفید است."],
        ["hardware","سخت‌افزار","هاردوِر","Computer hardware is interesting.","سخت‌افزار کامپیوتر جالب است."],
        ["search","جست‌وجو کردن","سِرچ","Search for the answer.","دنبال پاسخ بگرد."],
        ["share","به اشتراک گذاشتن","شِر","Share this link with me.","این لینک را با من به اشتراک بگذار."],
        ["update","به‌روزرسانی","آپدِیت","Update the application.","برنامه را به‌روزرسانی کن."],
        ["device","دستگاه","دیوایس","This device is expensive.","این دستگاه گران است."],
        ["website address","آدرس وب‌سایت","وِبسایت اَدرِس","What is your website address?","آدرس وب‌سایتت چیست؟"]
      ]
    }
  ];

  const a2Phrases = [
    ["Could you help me, please?","ممکن است لطفاً به من کمک کنی؟"],
    ["I am looking for the station.","من دنبال ایستگاه می‌گردم."],
    ["How long does the journey take?","این سفر چقدر طول می‌کشد؟"],
    ["I would like to book a room.","می‌خواهم یک اتاق رزرو کنم."],
    ["I don't feel very well.","حالم خیلی خوب نیست."],
    ["You should see a doctor.","بهتر است به پزشک مراجعه کنی."],
    ["I am looking forward to it.","بی‌صبرانه منتظرش هستم."],
    ["What do you recommend?","چه چیزی پیشنهاد می‌کنی؟"],
    ["I agree with you.","با تو موافقم."],
    ["I don't agree with that.","با آن موافق نیستم."],
    ["Could you repeat that?","ممکن است آن را تکرار کنی؟"],
    ["I have an important meeting.","من جلسه مهمی دارم."],
    ["I am interested in programming.","من به برنامه‌نویسی علاقه‌مندم."],
    ["It depends on the situation.","به شرایط بستگی دارد."],
    ["Let me think about it.","اجازه بده درباره‌اش فکر کنم."],
    ["I have to finish this project.","باید این پروژه را تمام کنم."]
  ];

  const a2Grammar = [
    {
      title:"Past Simple",
      faTitle:"گذشته ساده",
      explanation:"Use the past simple for finished actions in the past.",
      faExplanation:"برای کارهایی که در گذشته تمام شده‌اند از گذشته ساده استفاده می‌کنیم.",
      rules:[
        ["I worked","من کار کردم","I worked yesterday.","من دیروز کار کردم."],
        ["She visited","او بازدید کرد","She visited her friend.","او به دیدن دوستش رفت."],
        ["They went","آن‌ها رفتند","They went to school.","آن‌ها به مدرسه رفتند."]
      ]
    },
    {
      title:"Future with Going to",
      faTitle:"آینده با Going to",
      explanation:"Use am/is/are going to for plans and intentions.",
      faExplanation:"برای برنامه‌ها و قصد انجام کار در آینده از این ساختار استفاده می‌کنیم.",
      rules:[
        ["I am going to study","قرار است درس بخوانم","I am going to study tonight.","امشب قرار است درس بخوانم."],
        ["She is going to travel","او قصد سفر دارد","She is going to travel tomorrow.","او فردا قصد سفر دارد."],
        ["They are going to work","آن‌ها قرار است کار کنند","They are going to work.","آن‌ها قرار است کار کنند."]
      ]
    },
    {
      title:"Comparatives",
      faTitle:"صفات مقایسه‌ای",
      explanation:"Use comparative adjectives to compare two things.",
      faExplanation:"برای مقایسه دو چیز از صفات مقایسه‌ای استفاده می‌کنیم.",
      rules:[
        ["taller than","بلندتر از","Ali is taller than Reza.","علی از رضا بلندتر است."],
        ["more expensive than","گران‌تر از","This phone is more expensive than that one.","این گوشی از آن یکی گران‌تر است."],
        ["better than","بهتر از","English is better than before.","انگلیسی بهتر از قبل است."]
      ]
    },
    {
      title:"Modal Verbs: Should / Must / Have to",
      faTitle:"افعال کمکی Should و Must و Have to",
      explanation:"Use these words for advice and obligation.",
      faExplanation:"برای توصیه و اجبار از این ساختارها استفاده می‌کنیم.",
      rules:[
        ["should","بهتر است","You should study.","بهتر است درس بخوانی."],
        ["must","باید","You must wear a seatbelt.","باید کمربند ایمنی ببندی."],
        ["have to","مجبور بودن / باید","I have to work today.","امروز باید کار کنم."]
      ]
    }
  ];

  const a2Questions = [
    {q:"What does 'Airport' mean?",options:["هتل","فرودگاه","ایستگاه","بیمارستان"],answer:1},
    {q:"What is the English word for 'گذرنامه'?",options:["Ticket","Passport","Luggage","Map"],answer:1},
    {q:"Complete: I ___ yesterday.",options:["work","worked","working","works"],answer:1},
    {q:"What does 'Healthy' mean?",options:["بیمار","خسته","سالم","عصبانی"],answer:2},
    {q:"Choose the correct sentence.",options:["She go yesterday.","She goes yesterday.","She went yesterday.","She going yesterday."],answer:2},
    {q:"What does 'Salary' mean?",options:["حقوق","مهارت","جلسه","شرکت"],answer:0},
    {q:"Complete: I am going ___ study.",options:["at","to","for","on"],answer:1},
    {q:"What does 'Password' mean?",options:["حساب","پیام","رمز عبور","اطلاعات"],answer:2},
    {q:"Choose the correct comparative.",options:["more tall","taller","tallest than","most tall"],answer:1},
    {q:"What does 'Journey' mean?",options:["سفر","پرواز","مقصد","بلیط"],answer:0},
    {q:"Complete: You ___ see a doctor.",options:["should","are","does","is"],answer:0},
    {q:"What does 'Improve' mean?",options:["فراموش کردن","بهبود دادن","سفر کردن","منتظر ماندن"],answer:1},
    {q:"Choose the correct sentence.",options:["He have to work.","He has to work.","He having to work.","He have working."],answer:1},
    {q:"What does 'Connection' mean?",options:["اتصال","صفحه","دستگاه","رمز"],answer:0},
    {q:"Complete: They ___ to London last year.",options:["go","goes","went","going"],answer:2},
    {q:"What does 'Nervous' mean?",options:["هیجان‌زده","مضطرب","خوشحال","سالم"],answer:1},
    {q:"Choose the correct future sentence.",options:["I going study.","I am going to study.","I am go study.","I going to studying."],answer:1},
    {q:"What does 'Colleague' mean?",options:["مشتری","مدیر","همکار","مسافر"],answer:2},
    {q:"Complete: This phone is ___ than mine.",options:["expensive","more expensive","most expensive","expensiver"],answer:1},
    {q:"What does 'Information' mean?",options:["اطلاعات","ارتباط","نرم‌افزار","صفحه‌کلید"],answer:0}
  ];

  const defaults = {
    xp:0,
    learned:[],
    completedLessons:[],
    bestQuiz:0,
    latestScore:0,
    quizPassed:false
  };

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(A2_KEY) || "{}");
      return {
        ...defaults,
        ...data,
        learned:Array.isArray(data.learned) ? data.learned : [],
        completedLessons:Array.isArray(data.completedLessons) ? data.completedLessons : [],
        bestQuiz:Number(data.bestQuiz) || 0,
        latestScore:Number(data.latestScore) || 0
      };
    } catch {
      return {...defaults};
    }
  }

  let progress = load();

  function save() {
    try {
      localStorage.setItem(A2_KEY,JSON.stringify(progress));
    } catch(error) {
      console.error("A2 progress save failed:",error);
    }
  }

  const main = document.querySelector(".main-content") || document.querySelector("main");
  if (!main) return;

  let page = document.getElementById("dynamicPage");

  if (!page) {
    page = document.createElement("section");
    page.id = "dynamicPage";
    main.appendChild(page);
  }

  function escape(value) {
    return String(value).replace(/[&<>"']/g,c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    })[c]);
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      alert("مرورگر از پخش صوتی پشتیبانی نمی‌کند.");
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
  }

  function header(title,description) {
    return `
      <div class="smit-page-header">
        <span class="smit-tag">SMIT AI / ENGLISH A2</span>
        <h1>${title}</h1>
        <p>${description}</p>
      </div>
    `;
  }

  function set(html) {
    page.dataset.smitA1Home = "false";
    page.innerHTML = html;
    page.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function renderLesson(id) {
    const lesson = a2Lessons.find(item => item.id === Number(id));
    if (!lesson) return;
    const learnedCount = lesson.words.filter(w => progress.learned.includes(w[0])).length;
    const cards = lesson.words.map((word,index) => {
      const learned = progress.learned.includes(word[0]);
      return `<article class="smit-word-card" data-a2-word-card data-learned="${learned}" data-search-text="${escape(`${word[0]} ${word[1]}`.toLowerCase())}">
        <h3>${escape(word[0])}</h3><p><strong>معنی:</strong> ${escape(word[1])}</p><p><strong>تلفظ:</strong> ${escape(word[2])}</p>
        <div class="smit-example"><strong>${escape(word[3])}</strong><br><span class="smit-muted">${escape(word[4])}</span></div>
        <div class="smit-actions">
          <button class="smit-btn" data-a2-speak="${index}" data-a2-id="${lesson.id}">🔊 Listen</button>
          <button class="smit-btn" data-a2-learn="${index}" data-a2-id="${lesson.id}" ${learned ? "disabled" : ""}>${learned ? "✓ Learned" : "Mark as learned"}</button>
        </div></article>`;
    }).join("");
    set(`${header(`درس ${lesson.id} — ${lesson.faTitle}`,lesson.title)}
      <div class="smit-panel"><p class="smit-filter-count">پیشرفت این درس: <strong>${learnedCount}</strong> از ${lesson.words.length} کلمه</p>
        <p class="smit-muted">برای شنیدن تلفظ Listen را بزن و پس از یادگیری، کلمه را علامت بزن.</p>
        <div class="smit-actions"><button class="smit-btn" data-a2-page="home">بازگشت به A2</button>
        <button class="smit-btn" data-a2-complete="${lesson.id}" ${progress.completedLessons.includes(Number(id)) ? "disabled" : ""}>تکمیل درس / Complete Lesson</button></div></div>
      <div class="smit-vocab-tools"><input type="search" data-a2-vocab-search placeholder="جست‌وجو به فارسی یا انگلیسی / Search...">
      <select data-a2-vocab-filter><option value="all">همه کلمات / All</option><option value="learned">یادگرفته‌شده / Learned</option><option value="not-learned">یادنگرفته / Not learned</option></select></div>
      <p class="smit-filter-count" data-a2-vocab-result-count>نمایش ${lesson.words.length} کلمه</p><div class="smit-grid">${cards}</div>`);
  }

  function applyA2VocabularyFilters() {
    const search = page.querySelector("[data-a2-vocab-search]"), filter = page.querySelector("[data-a2-vocab-filter]");
    if (!search || !filter) return;
    const query = search.value.trim().toLocaleLowerCase(), mode = filter.value;
    const cards = [...page.querySelectorAll("[data-a2-word-card]")]; let visible = 0;
    cards.forEach(card => {
      const textMatch = (card.dataset.searchText || "").toLocaleLowerCase().includes(query);
      const learned = card.dataset.learned === "true";
      const filterMatch = mode === "all" || (mode === "learned" && learned) || (mode === "not-learned" && !learned);
      card.hidden = !(textMatch && filterMatch); if (!card.hidden) visible++;
    });
    const count = page.querySelector("[data-a2-vocab-result-count]");
    if (count) count.textContent = `نمایش ${visible} کلمه از ${cards.length}`;
  }

  function renderHome() {
    const total = a2Lessons.reduce((n,l) => n + l.words.length,0);
    const percent = Math.round(progress.learned.length / total * 100);

    set(`
      ${header("سطح A2 | Elementary","سطح مقدماتی انگلیسی را یک مرحله بالاتر ببر.")}
      <div class="smit-panel">
        <h2>پیشرفت من / My A2 Progress</h2>
        <div class="smit-grid">
          <div><h2>${progress.xp}</h2><p class="smit-muted">A2 XP</p></div>
          <div><h2>${progress.learned.length}/${total}</h2><p class="smit-muted">Learned Words</p></div>
          <div><h2>${progress.completedLessons.length}/4</h2><p class="smit-muted">Completed Lessons</p></div>
          <div><h2>${progress.bestQuiz}/20</h2><p class="smit-muted">Best A2 Quiz</p></div>
        </div>
        <div class="smit-progress-track"><div class="smit-progress-fill" style="width:${percent}%"></div></div>
        <p class="smit-muted">${percent}% تکمیل شده</p>
      </div>
      <div class="smit-panel">
        <h2>درس‌های A2 / A2 Lessons</h2>
        <div class="smit-grid">
          ${a2Lessons.map(l => `
            <article class="smit-lesson-card">
              <span class="smit-tag">LESSON ${l.id}</span>
              <h3>${escape(l.faTitle)}</h3>
              <p class="smit-muted">${escape(l.title)}</p>
              <p class="smit-muted">${l.words.length} vocabulary words</p>
              <button class="smit-btn" data-a2-lesson="${l.id}">شروع درس / Start</button>
            </article>
          `).join("")}
        </div>
      </div>
      <div class="smit-grid">
        <article class="smit-lesson-card">
          <h3>عبارت‌های روزمره / Phrases</h3>
          <button class="smit-btn" data-a2-page="phrases">مشاهده عبارت‌ها</button>
        </article>
        <article class="smit-lesson-card">
          <h3>گرامر / Grammar</h3>
          <button class="smit-btn" data-a2-page="grammar">آموزش گرامر</button>
        </article>
        <article class="smit-lesson-card">
          <h3>آزمون A2 / Final Test</h3>
          <button class="smit-btn" data-a2-page="quiz">شروع آزمون</button>
        </article>
      </div>
      <button class="smit-btn" data-a2-page="back">بازگشت به A1</button>
    `);
  }


  function renderPhrases() {
    set(`
      ${header("عبارت‌های A2 / A2 Phrases","عبارت‌های کاربردی را تمرین کن.")}
      <div class="smit-panel"><button class="smit-btn" data-a2-page="home">بازگشت</button></div>
      <div class="smit-grid">
        ${a2Phrases.map((p,i) => `
          <article class="smit-word-card">
            <h3>${escape(p[0])}</h3>
            <p>${escape(p[1])}</p>
            <button class="smit-btn" data-a2-phrase="${i}">🔊 Listen</button>
          </article>
        `).join("")}
      </div>
    `);
  }

  function renderGrammar() {
    set(`
      ${header("گرامر A2 / A2 Grammar","چهار مبحث مهم سطح A2 را یاد بگیر.")}
      <div class="smit-panel"><button class="smit-btn" data-a2-page="home">بازگشت</button></div>
      ${a2Grammar.map((g,i) => `
        <article class="smit-panel">
          <span class="smit-tag">GRAMMAR ${i+1}</span>
          <h2>${escape(g.faTitle)}</h2>
          <p>${escape(g.explanation)}</p>
          <p class="smit-muted">${escape(g.faExplanation)}</p>
          ${g.rules.map(r => `
            <div class="smit-example">
              <strong>${escape(r[0])} — ${escape(r[1])}</strong><br>
              ${escape(r[2])}<br>
              <span class="smit-muted">${escape(r[3])}</span><br>
              <button class="smit-btn" data-a2-speak-text="${escape(r[2])}">🔊</button>
            </div>
          `).join("")}
        </article>
      `).join("")}
    `);
  }

  let quiz = {index:0,answers:[]};

  function renderQuiz() {
    quiz = {index:0,answers:[]};
    set(`
      ${header("آزمون نهایی A2 / A2 Final Test","۲۰ سؤال؛ حدنصاب قبولی ۱۵ پاسخ درست است.")}
      <div class="smit-panel">
        <p>Passing score: 15 / 20</p>
        <button class="smit-btn" id="a2StartQuiz">شروع آزمون / Start Test</button>
        <button class="smit-btn" data-a2-page="home">بازگشت</button>
      </div>
      <div id="a2QuizArea"></div>
    `);
    document.getElementById("a2StartQuiz")?.addEventListener("click",showQuestion);
  }

  function showQuestion() {
    const area = document.getElementById("a2QuizArea");
    const q = a2Questions[quiz.index];
    if (!area || !q) return;

    area.innerHTML = `
      <div class="smit-panel">
        <div class="smit-progress-track">
          <div class="smit-progress-fill" style="width:${(quiz.index+1)/a2Questions.length*100}%"></div>
        </div>
        <p class="smit-muted">Question ${quiz.index+1} of ${a2Questions.length}</p>
        <h2>${escape(q.q)}</h2>
        ${q.options.map((o,i) => `
          <button class="smit-quiz-option ${quiz.answers[quiz.index] === i ? "selected" : ""}" data-a2-answer="${i}">
            ${String.fromCharCode(65+i)}. ${escape(o)}
          </button>
        `).join("")}
        <div class="smit-actions">
          <button class="smit-btn" id="a2Previous" ${quiz.index===0 ? "disabled" : ""}>قبلی</button>
          <button class="smit-btn" id="a2Next">${quiz.index===a2Questions.length-1 ? "پایان آزمون" : "سؤال بعدی"}</button>
        </div>
      </div>
    `;

    area.querySelectorAll("[data-a2-answer]").forEach(btn => {
      btn.addEventListener("click",() => {
        quiz.answers[quiz.index] = Number(btn.dataset.a2Answer);
        showQuestion();
      });
    });

    document.getElementById("a2Previous")?.addEventListener("click",() => {
      if (quiz.index > 0) {
        quiz.index--;
        showQuestion();
      }
    });

    document.getElementById("a2Next")?.addEventListener("click",() => {
      if (quiz.index < a2Questions.length - 1) {
        quiz.index++;
        showQuestion();
      } else {
        window.SMITLoader.run("در حال بررسی پاسخ‌ها", "نتیجه آزمون A2 در حال محاسبه است...", 520, page, finishQuiz);
      }
    });
  }

  function finishQuiz() {
    const unanswered = a2Questions.filter((q,i) => quiz.answers[i] === undefined).length;
    if (unanswered && !confirm(`${unanswered} سؤال بی‌پاسخ داری. آزمون تمام شود؟`)) return;
    const score = a2Questions.reduce((n,q,i) => n + (quiz.answers[i] === q.answer ? 1 : 0),0);
    const passed = score >= A2_PASS, previousBest = Number(progress.bestQuiz) || 0;
    const newRecord = score > previousBest;
    progress.latestScore = score;
    progress.bestQuiz = Math.max(previousBest,score);
    progress.quizPassed = Boolean(progress.quizPassed || passed);
    if (newRecord) progress.xp += 50;
    save();
    try {
      const old = JSON.parse(localStorage.getItem("smitAI_english_progress_v1") || "{}");
      const unlocked = Array.isArray(old.unlockedLevels) ? old.unlockedLevels : ["A1"];
      if (passed && !unlocked.includes("B1")) unlocked.push("B1");
      const results = old.levelResults && typeof old.levelResults === "object" ? old.levelResults : {};
      const prev = results.A2 && typeof results.A2 === "object" ? results.A2 : {};
      localStorage.setItem("smitAI_english_progress_v1",JSON.stringify({
        ...old, unlockedLevels:unlocked,
        levelResults:{...results,A2:{...prev,latestScore:score,bestScore:Math.max(Number(prev.bestScore)||0,progress.bestQuiz),passed:Boolean(prev.passed||passed)}}
      }));
    } catch(error) { console.warn("Could not update A1 level unlock:",error); }
    const area = document.getElementById("a2QuizArea");
    if (!area) return;
    area.innerHTML = `<div class="smit-panel smit-exam-result ${passed ? "is-passed" : "is-failed"}"><span class="smit-tag">A2 · FINAL EXAM RESULT</span>
      <div class="smit-result-symbol">${passed ? "✓" : "↻"}</div>
      <h1>${score} / ${a2Questions.length}</h1><p class="smit-result-percent">${Math.round(score/a2Questions.length*100)}% SCORE</p>
      <h2>${passed ? "Congratulations! 🎉" : "Keep Going — You Can Do It!"}</h2>
      <p>${passed ? "You have successfully completed the A2 level. B1 is now unlocked." : "You need at least 15 correct answers to pass. Review your lessons and try again."}</p>
      <p class="smit-muted">Best Score: ${progress.bestQuiz}/${a2Questions.length}</p><p class="smit-muted">Experience Points: ${progress.xp} XP</p>
      <div class="smit-actions">${passed ? '<button class="smit-btn smit-certificate-btn" data-smit-certificate="A2" data-score="'+score+'" data-total="'+a2Questions.length+'">Get Certificate</button>' : ""}
      <button class="smit-btn" id="a2Retry">Try Again</button><button class="smit-btn" data-a2-page="home">Back to A2</button></div></div>`;
    document.getElementById("a2Retry")?.addEventListener("click",renderQuiz);
  }

  function navigateA2(target) {
    if (target === "home") return renderHome();
    if (target === "phrases") return renderPhrases();
    if (target === "grammar") return renderGrammar();
    if (target === "quiz") return window.SMITLoader.run("در حال آماده‌سازی آزمون", "سؤال‌های سطح A2 بارگذاری می‌شوند...", 420, page, renderQuiz);
    if (target === "back") {
      if (window.SMIT_AI?.openEnglish) window.SMIT_AI.openEnglish();
      return;
    }
  }

  page.addEventListener("input",event => {
    if (event.target.matches("[data-a2-vocab-search]")) applyA2VocabularyFilters();
  });
  page.addEventListener("change",event => {
    if (event.target.matches("[data-a2-vocab-filter]")) applyA2VocabularyFilters();
  });

  page.addEventListener("click",event => {
    const lessonBtn = event.target.closest("[data-a2-lesson]");
    if (lessonBtn) {
      window.SMITLoader.run("در حال باز کردن درس", "محتوای درس A2 در حال آماده‌سازی است...", 420, page, () => renderLesson(lessonBtn.dataset.a2Lesson));
      return;
    }

    const navBtn = event.target.closest("[data-a2-page]");
    if (navBtn) {
      navigateA2(navBtn.dataset.a2Page);
      return;
    }

    const speakBtn = event.target.closest("[data-a2-speak]");
    if (speakBtn) {
      const lesson = a2Lessons.find(l => l.id === Number(speakBtn.dataset.a2Id));
      const word = lesson?.words[Number(speakBtn.dataset.a2Speak)];
      if (word) speak(word[0]);
      return;
    }

    const learnBtn = event.target.closest("[data-a2-learn]");
    if (learnBtn) {
      const lesson = a2Lessons.find(l => l.id === Number(learnBtn.dataset.a2Id));
      const word = lesson?.words[Number(learnBtn.dataset.a2Learn)];

      if (word && !progress.learned.includes(word[0])) {
        window.SMITWordQuiz.open({container:page,word,wordsPool:a2Lessons.flatMap(item=>item.words),level:"A2",
          onPass:()=>{ if (!progress.learned.includes(word[0])) { progress.learned.push(word[0]); progress.xp += 5; save(); window.SMITLearningFeedback.show(5); } renderLesson(lesson.id); },
          onBack:()=>renderLesson(lesson.id)
        });
      }
      return;
    }

    const completeBtn = event.target.closest("[data-a2-complete]");
    if (completeBtn) {
      const id = Number(completeBtn.dataset.a2Complete);

      if (!progress.completedLessons.includes(id)) {
        progress.completedLessons.push(id);
        progress.xp += 20;
        save();
        alert("درس تکمیل شد! ۲۰ XP گرفتی.");
      }
      renderLesson(id);
      return;
    }

    const phraseBtn = event.target.closest("[data-a2-phrase]");
    if (phraseBtn) {
      const phrase = a2Phrases[Number(phraseBtn.dataset.a2Phrase)];
      if (phrase) speak(phrase[0]);
      return;
    }

    const textBtn = event.target.closest("[data-a2-speak-text]");
    if (textBtn) {
      speak(textBtn.dataset.a2SpeakText);
    }
  });

  // Add an A2 entry to the existing A1 page.
  function addA2Entry() {
    if (page.dataset.smitA1Home !== "true") {
      page.querySelector("#smitA2Entry")?.remove();
      return;
    }
    const tag = page.querySelector(".smit-page-header");
    if (!tag || page.querySelector("#smitA2Entry")) return;

    const entry = document.createElement("div");
    entry.id = "smitA2Entry";
    entry.className = "smit-panel";
    entry.innerHTML = `
      <span class="smit-tag">NEXT LEVEL</span>
      <h2>سطح A2 / Elementary</h2>
      <p class="smit-muted">۸۰ لغت جدید، گرامر، عبارت‌ها و آزمون مستقل</p>
      <button class="smit-btn" id="openSmitA2">ورود به سطح A2 / Open A2</button>
    `;

    tag.insertAdjacentElement("afterend",entry);

    document.getElementById("openSmitA2").addEventListener("click",() => {
      let unlocked = false;

      try {
        const a1 = JSON.parse(localStorage.getItem("smitAI_english_progress_v1") || "{}");
        unlocked = Boolean(a1.quizPassed) ||
          (Array.isArray(a1.unlockedLevels) && a1.unlockedLevels.includes("A2"));
      } catch(error) {}

      if (!unlocked) {
        alert("برای ورود به A2 ابتدا باید آزمون A1 را با حداقل ۱۵ پاسخ درست قبول شوی.");
        return;
      }

      renderHome();
    });
  }

  const observer = new MutationObserver(() => {
    if (page.dataset.smitA1Home === "true") addA2Entry();
    else page.querySelector("#smitA2Entry")?.remove();
  });

  observer.observe(page,{childList:true,subtree:true});

  window.SMIT_AI_A2 = {
    lessons:a2Lessons,
    phrases:a2Phrases,
    grammar:a2Grammar,
    questions:a2Questions,
    getProgress:() => ({...progress}),
    open:renderHome
  };

  console.log("SMIT AI A2 Expansion loaded.");
});


/* =========================================================
   SMIT AI — English B1 Expansion
   Independent module; preserves existing A1 and A2 modules.
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const page = document.getElementById("dynamicPage");
  if (!page || window.SMIT_AI_B1) return;

  const STORAGE_KEY = "smitAI_english_B1_progress_v1";
  const lessons = [{id:1,title:"Learning and Progress",faTitle:"یادگیری و پیشرفت",words:[["achieve","دست یافتن"],["approach","رویکرد"],["attend","شرکت کردن"],["benefit","فایده"],["challenge","چالش"],["confident","بااعتمادبه‌نفس"],["consider","در نظر گرفتن"],["contribute","مشارکت کردن"],["develop","توسعه دادن"],["effective","موثر"],["encourage","تشویق کردن"],["environment","محیط"],["experience","تجربه"],["improve","بهبود دادن"],["opportunity","فرصت"],["participate","مشارکت کردن"],["prepare","آماده شدن"],["require","نیاز داشتن"],["responsible","مسئول"],["solution","راه‌حل"]]},{id:2,title:"Travel and Services",faTitle:"سفر و خدمات",words:[["although","اگرچه"],["appointment","قرار ملاقات"],["available","در دسترس"],["cancel","لغو کردن"],["complain","شکایت کردن"],["convenient","مناسب و راحت"],["customer","مشتری"],["delay","تاخیر"],["delivery","تحویل"],["departure","حرکت"],["destination","مقصد"],["facility","امکانات"],["issue","مسئله"],["manage","مدیریت کردن"],["recommend","توصیه کردن"],["refund","بازپرداخت"],["reservation","رزرو"],["schedule","برنامه زمانی"],["service","خدمات"],["usual","معمول"]]},{id:3,title:"People and Relationships",faTitle:"افراد و روابط",words:[["advice","توصیه"],["argue","بحث کردن"],["behavior","رفتار"],["colleague","همکار"],["communicate","ارتباط برقرار کردن"],["decision","تصمیم"],["disagree","مخالف بودن"],["discussion","گفت‌وگو"],["emotional","احساسی"],["forgive","بخشیدن"],["friendship","دوستی"],["honest","صادق"],["impression","برداشت"],["influence","تاثیر گذاشتن"],["mention","اشاره کردن"],["personality","شخصیت"],["relationship","رابطه"],["respect","احترام گذاشتن"],["support","حمایت کردن"],["trust","اعتماد"]]},{id:4,title:"Work and Career",faTitle:"کار و شغل",words:[["application","درخواست"],["career","مسیر شغلی"],["deadline","مهلت نهایی"],["department","بخش"],["employer","کارفرما"],["employment","استخدام"],["goal","هدف"],["interview","مصاحبه"],["knowledge","دانش"],["opinion","نظر"],["performance","عملکرد"],["professional","حرفه‌ای"],["project","پروژه"],["qualification","صلاحیت"],["salary","حقوق"],["skill","مهارت"],["task","وظیفه"],["teamwork","کار گروهی"],["training","آموزش"],["workplace","محل کار"]]}];
  const phrases = [["I am looking forward to it.","بی‌صبرانه منتظرش هستم."],["It depends on the situation.","به شرایط بستگی دارد."],["As far as I know, ...","تا جایی که می‌دانم، ..."],["That sounds like a good idea.","به نظر ایده خوبی می‌آید."],["Could you give me a hand?","می‌توانی کمکم کنی؟"],["I didn't mean to do that.","قصدم این نبود که آن کار را انجام بدهم."],["Would you mind waiting a moment?","ممکن است یک لحظه صبر کنید؟"],["I'm afraid I can't make it.","متاسفانه نمی‌توانم بیایم."],["The sooner, the better.","هرچه زودتر، بهتر."],["I have run out of time.","وقتم تمام شده است."],["From my point of view, ...","از دیدگاه من، ..."],["I completely agree with you.","کاملاً با تو موافقم."],["We need to come up with a solution.","باید یک راه‌حل پیدا کنیم."],["Please keep me informed.","لطفاً من را در جریان بگذار."],["I'm used to working under pressure.","به کار کردن تحت فشار عادت دارم."],["It was worth the effort.","ارزش تلاش را داشت."]];
  const grammar = [["Present Perfect vs. Past Simple","حال کامل برای تجربه یا نتیجه مرتبط با اکنون و گذشته ساده برای زمان تمام‌شده به‌کار می‌رود.","I have visited Shiraz twice. / I visited Shiraz last year."],["First Conditional","برای موقعیت‌های واقعی و محتمل آینده: If + present simple, will + verb.","If I finish early, I will call you."],["Passive Voice (Present/Past)","در مجهول، تمرکز روی عمل یا دریافت‌کننده است: be + past participle.","The emails are sent every morning. / The car was repaired yesterday."],["Relative Clauses","برای توضیح اسم از who (افراد)، which (اشیا) و that استفاده می‌کنیم.","The woman who works here is helpful. / This is the book that I bought."]];
  const questions = [{"q":"She has ____ finished her homework.","options":["yet","already","ever","since"],"answer":1,"explanation":"Already در جمله مثبت برای کاری که انجام شده به‌کار می‌رود."},{"q":"I ____ to London in 2022.","options":["have gone","go","went","was going"],"answer":2,"explanation":"زمان مشخص و تمام‌شده در گذشته، گذشته ساده می‌خواهد."},{"q":"If it rains, we ____ at home.","options":["stay","stayed","will stay","would stay"],"answer":2,"explanation":"شرطی نوع اول: If + حال ساده، will + فعل."},{"q":"The office ____ every day.","options":["cleans","is cleaned","cleaned","is cleaning"],"answer":1,"explanation":"مجهول حال ساده: am/is/are + قسمت سوم فعل."},{"q":"The man ____ called you is my manager.","options":["which","where","who","when"],"answer":2,"explanation":"برای اشاره به انسان از who استفاده می‌کنیم."},{"q":"I am interested ____ learning languages.","options":["on","at","in","for"],"answer":2,"explanation":"ترکیب درست: interested in."},{"q":"You ____ wear a seat belt. It's the law.","options":["might","must","could","would"],"answer":1,"explanation":"Must برای الزام قوی استفاده می‌شود."},{"q":"This test is ____ than the last one.","options":["easy","easier","easiest","more easy"],"answer":1,"explanation":"صفت کوتاه در حالت مقایسه‌ای معمولاً er می‌گیرد."},{"q":"We have lived here ____ five years.","options":["since","for","during","from"],"answer":1,"explanation":"For همراه با مدت زمان می‌آید."},{"q":"She asked me where I ____.","options":["live","lived","do live","am living"],"answer":1,"explanation":"در نقل قول غیرمستقیم معمولاً زمان یک مرحله به گذشته برمی‌گردد."},{"q":"I look forward to ____ you.","options":["meet","meeting","met","meets"],"answer":1,"explanation":"بعد از look forward to از اسم یا فعل ing استفاده می‌شود."},{"q":"The train was delayed ____ heavy rain.","options":["because","because of","although","despite of"],"answer":1,"explanation":"Because of قبل از اسم یا عبارت اسمی می‌آید."},{"q":"You should ____ your application before Friday.","options":["submit","submits","submitted","submitting"],"answer":0,"explanation":"بعد از should شکل ساده فعل می‌آید."},{"q":"I have never ____ sushi.","options":["eat","ate","eaten","eating"],"answer":2,"explanation":"حال کامل با have/has + قسمت سوم فعل ساخته می‌شود."},{"q":"The project ____ by our team last month.","options":["completed","was completed","is completing","has complete"],"answer":1,"explanation":"گذشته مجهول: was/were + قسمت سوم فعل."},{"q":"Although he was tired, he ____ working.","options":["continued","continue","continuing","continues"],"answer":0,"explanation":"ساختار گذشته ساده برای ادامه دادن در گذشته."},{"q":"Could you tell me ____ the nearest bank is?","options":["what","where","which","who"],"answer":1,"explanation":"برای پرسیدن مکان از where استفاده می‌شود."},{"q":"I ____ drive when I was sixteen.","options":["can","could","must","should"],"answer":1,"explanation":"Could توانایی در گذشته را بیان می‌کند."},{"q":"There isn't ____ information on the website.","options":["many","a few","much","several"],"answer":2,"explanation":"Information غیرقابل‌شمارش است؛ much به‌کار می‌رود."},{"q":"By the time we arrived, the film ____.","options":["starts","has started","had started","will start"],"answer":2,"explanation":"Past perfect برای عملی که پیش از عمل دیگری در گذشته رخ داده است."}];

  const defaults = {xp:0, learned:[], completedLessons:[], bestQuiz:0, quizPassed:false, quizRewarded:false};
  let progress = load();
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {...defaults,...saved,
        learned:Array.isArray(saved.learned)?saved.learned:[],
        completedLessons:Array.isArray(saved.completedLessons)?saved.completedLessons:[]};
    } catch (_) { return {...defaults}; }
  }
  function save() { localStorage.setItem(STORAGE_KEY,JSON.stringify(progress)); }
  function esc(value) {
    return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function speak(value) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      alert("قابلیت تلفظ در این مرورگر در دسترس نیست."); return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = "en-US"; utterance.rate = 0.86;
    speechSynthesis.speak(utterance);
  }
  function isUnlocked() {
    try {
      const a1 = JSON.parse(localStorage.getItem("smitAI_english_progress_v1") || "{}");
      const a2 = JSON.parse(localStorage.getItem("smitAI_english_A2_progress_v1") || "{}");
      return (Array.isArray(a1.unlockedLevels) && a1.unlockedLevels.includes("B1")) || a2.quizPassed === true;
    } catch (_) { return false; }
  }
  function header(title,desc) {
    return `<div class="smit-page-header"><span class="smit-tag">SMIT AI / ENGLISH B1</span><h1>${title}</h1><p>${desc}</p></div>`;
  }
  function set(html) {
    page.dataset.smitA1Home = "false";
    page.innerHTML = html;
    page.scrollIntoView({behavior:"smooth",block:"start"});
  }
  function nav() {
    return `<div class="smit-level-row">
      <button class="smit-btn" data-b1-page="home">خانه / Home</button>
      <button class="smit-btn" data-b1-page="phrases">عبارت‌ها / Phrases</button>
      <button class="smit-btn" data-b1-page="grammar">گرامر / Grammar</button>
      <button class="smit-btn" data-b1-page="quiz">آزمون / Quiz</button>
      <button class="smit-btn" data-b1-page="back">بازگشت به A2</button>
    </div>`;
  }
  function renderHome() {
    if (!isUnlocked()) { alert("برای ورود به B1 ابتدا باید آزمون A2 را با حداقل ۱۵ پاسخ درست قبول شوی."); return; }
    const total=lessons.reduce((n,l)=>n+l.words.length,0);
    const percent=Math.round(progress.learned.length/total*100);
    set(`${header("سطح B1 | Intermediate","در این سطح واژگان و مهارت‌های کاربردی انگلیسی را تقویت کن.")}
      <div class="smit-panel"><h2>پیشرفت من / My B1 Progress</h2>
        <div class="smit-grid">
          <div><h2>${progress.xp}</h2><p class="smit-muted">B1 XP</p></div>
          <div><h2>${progress.learned.length}/${total}</h2><p class="smit-muted">Learned Words</p></div>
          <div><h2>${progress.completedLessons.length}/4</h2><p class="smit-muted">Completed Lessons</p></div>
          <div><h2>${progress.bestQuiz}/20</h2><p class="smit-muted">Best Quiz</p></div>
        </div>
        <div class="smit-progress-track"><div class="smit-progress-fill" style="width:${percent}%"></div></div>
        <p class="smit-muted">${percent}% تکمیل واژگان</p>
      </div>
      <div class="smit-panel"><h2>درس‌های B1 / B1 Lessons</h2><div class="smit-grid">
        ${lessons.map(l=>`<article class="smit-lesson-card"><span class="smit-tag">LESSON ${l.id}</span><h3>${esc(l.faTitle)}</h3><p class="smit-muted">${esc(l.title)}</p><p class="smit-muted">20 vocabulary words</p><button class="smit-btn" data-b1-lesson="${l.id}">شروع درس / Start</button></article>`).join("")}
      </div></div>${nav()}`);
  }
  function renderLesson(id) {
    const lesson=lessons.find(l=>l.id===Number(id)); if(!lesson) return;
    const cards=lesson.words.map((w,i)=>{
      const learned=progress.learned.includes(w[0]);
      return `<article class="smit-word-card"><h3>${esc(w[0])}</h3><p>${esc(w[1])}</p>
        <div class="smit-actions"><button class="smit-btn" data-b1-speak="${i}" data-b1-id="${lesson.id}">🔊 تلفظ</button>
        <button class="smit-btn" data-b1-learn="${i}" data-b1-id="${lesson.id}" ${learned?"disabled":""}>${learned?"یادگرفته شد ✓":"یاد گرفتم +5 XP"}</button></div></article>`;
    }).join("");
    set(`${header(`درس ${lesson.id}: ${esc(lesson.faTitle)}`,esc(lesson.title))}${nav()}
      <div class="smit-panel"><h2>واژگان / Vocabulary</h2><div class="smit-grid">${cards}</div>
      <button class="smit-btn" data-b1-complete="${lesson.id}">${progress.completedLessons.includes(lesson.id)?"درس تکمیل شده ✓":"تکمیل درس +20 XP"}</button></div>`);
  }
  function renderPhrases() {
    set(`${header("عبارت‌های کاربردی B1","عبارت‌ها را بخوان و برای شنیدن تلفظ روی دکمه کلیک کن.")}${nav()}
      <div class="smit-grid">${phrases.map((p,i)=>`<article class="smit-word-card"><h3>${esc(p[0])}</h3><p>${esc(p[1])}</p><button class="smit-btn" data-b1-phrase="${i}">🔊 تلفظ</button></article>`).join("")}</div>`);
  }
  function renderGrammar() {
    set(`${header("گرامر B1 / B1 Grammar","چهار مبحث گرامری این سطح را همراه با مثال مرور کن.")}${nav()}
      <div class="smit-grid">${grammar.map(g=>`<article class="smit-panel"><h2>${esc(g[0])}</h2><p>${esc(g[1])}</p><p class="smit-muted">Example: ${esc(g[2])}</p></article>`).join("")}</div>`);
  }
  function renderQuiz() {
    set(`${header("آزمون B1 / B1 Quiz","۲۰ سؤال چهارگزینه‌ای؛ برای قبولی حداقل ۱۵ پاسخ درست لازم است.")}${nav()}
      <div class="smit-panel" id="b1QuizArea"><form id="b1QuizForm">
      ${questions.map((q,i)=>`<section class="smit-word-card"><h3>${i+1}. ${esc(q.q)}</h3>
        ${q.options.map((o,j)=>`<label style="display:block;margin:9px 0"><input type="radio" name="b1q${i}" value="${j}" required> ${esc(o)}</label>`).join("")}
      </section>`).join("")}<button class="smit-btn" type="submit">ثبت پاسخ‌ها / Submit</button></form></div>`);
    document.getElementById("b1QuizForm")?.addEventListener("submit",e=>{
      e.preventDefault(); let score=0;
      questions.forEach((q,i)=>{const chosen=document.querySelector(`input[name="b1q${i}"]:checked`);if(chosen&&Number(chosen.value)===q.answer)score++;});
      window.SMITLoader.run("در حال بررسی پاسخ‌ها", "نتیجه آزمون B1 در حال محاسبه است...", 520, page, () => finishQuiz(score));
    });
  }
  function finishQuiz(score) {
    const passed=score>=15, previous=progress.bestQuiz;
    progress.bestQuiz=Math.max(previous,score);
    if(passed&&!progress.quizRewarded){progress.xp+=100;progress.quizRewarded=true;}
    progress.quizPassed=progress.quizPassed||passed; save();
    if(passed) {
      try {
        const a1=JSON.parse(localStorage.getItem("smitAI_english_progress_v1")||"{}");
        a1.unlockedLevels=Array.isArray(a1.unlockedLevels)?a1.unlockedLevels:[];
        if(!a1.unlockedLevels.includes("B2"))a1.unlockedLevels.push("B2");
        localStorage.setItem("smitAI_english_progress_v1",JSON.stringify(a1));
      } catch(err) { console.warn("Could not save B2 unlock",err); }
    }
    const area=document.getElementById("b1QuizArea"); if(!area)return;
    area.innerHTML=`<div class="smit-panel smit-exam-result ${passed ? "is-passed" : "is-failed"}"><span class="smit-tag">B1 · FINAL EXAM RESULT</span>
      <div class="smit-result-symbol">${passed ? "✓" : "↻"}</div><h1>${score} / 20</h1>
      <p class="smit-result-percent">${Math.round(score/20*100)}% SCORE</p>
      <h2>${passed?"Congratulations! 🎉":"Keep Going — You Can Do It!"}</h2>
      <p>${passed?"You have successfully completed the B1 level. B2 access has been recorded; B2 course content is not yet available.":"You need at least 15 correct answers to pass. You can review the lessons and try again."}</p>
      <p class="smit-muted">Best Score: ${progress.bestQuiz}/20 | Experience Points: ${progress.xp} XP</p>
      <div class="smit-actions">${passed?'<button class="smit-btn smit-certificate-btn" data-smit-certificate="B1" data-score="'+score+'" data-total="20">Get Certificate</button>':""}
      <button class="smit-btn" id="b1Retry">Try Again</button><button class="smit-btn" data-b1-page="home">Back to B1</button></div>
      <details class="smit-answer-review"><summary>Review Correct Answers</summary><div style="margin-top:18px">${questions.map((q,i)=>`<p><b>${i+1}. ${esc(q.q)}</b><br>Correct answer: ${esc(q.options[q.answer])}<br><span class="smit-muted">${esc(q.explanation)}</span></p>`).join("")}</div></details>
    </div>`;
    document.getElementById("b1Retry")?.addEventListener("click",renderQuiz);
  }

  page.addEventListener("click",event=>{
    const lessonBtn=event.target.closest("[data-b1-lesson]");
    if(lessonBtn){window.SMITLoader.run("در حال باز کردن درس", "محتوای درس B1 در حال آماده‌سازی است...", 420, page, () => renderLesson(lessonBtn.dataset.b1Lesson));return;}
    const navBtn=event.target.closest("[data-b1-page]");
    if(navBtn){
      const target=navBtn.dataset.b1Page;
      if(target==="home")renderHome();
      else if(target==="phrases")renderPhrases();
      else if(target==="grammar")renderGrammar();
      else if(target==="quiz")window.SMITLoader.run("در حال آماده‌سازی آزمون", "سؤال‌های سطح B1 بارگذاری می‌شوند...", 420, page, renderQuiz);
      else if(target==="back")window.SMIT_AI_A2?.open();
      return;
    }
    const speakBtn=event.target.closest("[data-b1-speak]");
    if(speakBtn){const l=lessons.find(x=>x.id===Number(speakBtn.dataset.b1Id));if(l)speak(l.words[Number(speakBtn.dataset.b1Speak)][0]);return;}
    const learnBtn=event.target.closest("[data-b1-learn]");
    if(learnBtn){
      const l=lessons.find(x=>x.id===Number(learnBtn.dataset.b1Id)),w=l?.words[Number(learnBtn.dataset.b1Learn)];
      if(w&&!progress.learned.includes(w[0])){
        window.SMITWordQuiz.open({container:page,word:w,wordsPool:lessons.flatMap(item=>item.words),level:"B1",
          onPass:()=>{if(!progress.learned.includes(w[0])){progress.learned.push(w[0]);progress.xp+=5;save();window.SMITLearningFeedback.show(5);}renderLesson(l.id);},
          onBack:()=>renderLesson(l.id)
        });
      }
      return;
    }
    const completeBtn=event.target.closest("[data-b1-complete]");
    if(completeBtn){const id=Number(completeBtn.dataset.b1Complete);if(!progress.completedLessons.includes(id)){progress.completedLessons.push(id);progress.xp+=20;save();}renderLesson(id);return;}
    const phraseBtn=event.target.closest("[data-b1-phrase]");
    if(phraseBtn){speak(phrases[Number(phraseBtn.dataset.b1Phrase)][0]);}
  });

  function addB1Entry() {
    const isA2Home = page.querySelector(".smit-page-header") &&
      page.querySelector(".smit-page-header .smit-tag")?.textContent.includes("ENGLISH A2") &&
      page.innerHTML.includes("درس‌های A2 / A2 Lessons");
    if(!isA2Home){page.querySelector("#smitB1Entry")?.remove();return;}
    if(page.querySelector("#smitB1Entry"))return;
    const entry=document.createElement("div");entry.id="smitB1Entry";entry.className="smit-panel";
    entry.innerHTML=`<span class="smit-tag">NEXT LEVEL</span><h2>سطح B1 / Intermediate</h2>
      <p class="smit-muted">۸۰ لغت، ۱۶ عبارت، ۴ مبحث گرامر و آزمون مستقل</p>
      <button class="smit-btn" id="openSmitB1">ورود به سطح B1 / Open B1</button>`;
    page.querySelector(".smit-page-header").insertAdjacentElement("afterend",entry);
    document.getElementById("openSmitB1")?.addEventListener("click",renderHome);
  }
  const observer=new MutationObserver(addB1Entry);
  observer.observe(page,{childList:true,subtree:true});
  addB1Entry();

  window.SMIT_AI_B1={lessons,phrases,grammar,questions,getProgress:()=>({...progress,learned:[...progress.learned],completedLessons:[...progress.completedLessons]}),open:renderHome};
  console.log("SMIT AI B1 Expansion loaded.");
});

// Expand/collapse the Connect With Me section in the sidebar.
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("connectToggle");
  const links = document.getElementById("connectLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    links.hidden = isOpen;
  });
});


// SMIT AI theme switch: unchecked = current Ocean Glass; checked = deeper dark.
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("smitThemeToggle");
  if (!toggle) return;

  const STORAGE_KEY = "smitAI_color_theme_v1";
  const root = document.documentElement;

  const applyTheme = (theme) => {
    const deepDark = theme === "deep-dark";
    if (deepDark) root.setAttribute("data-smit-theme", "deep-dark");
    else root.removeAttribute("data-smit-theme");
    toggle.checked = deepDark;
    toggle.setAttribute("aria-checked", String(deepDark));
    toggle.setAttribute("aria-label", deepDark ? "Dark mode enabled" : "Current Ocean Glass mode");
  };

  let savedTheme = "ocean-glass";
  try {
    savedTheme = localStorage.getItem(STORAGE_KEY) || "ocean-glass";
  } catch (error) {
    console.warn("SMIT AI theme preference could not be read.", error);
  }
  applyTheme(savedTheme);

  toggle.addEventListener("change", () => {
    const theme = toggle.checked ? "deep-dark" : "ocean-glass";
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn("SMIT AI theme preference could not be saved.", error);
    }
  });
});


/* =========================================================
   SMIT AI — STUDY ROOM
   Personal library, unlimited stopwatch, sessions, calendar,
   analytics, daily goal, progress notes and floating timer.
   All data is stored locally in this browser.
========================================================= */
(() => {
  "use strict";
  const KEY = "smitAI_study_room_v1";
  const $ = (s, root=document) => root.querySelector(s);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const pad = n => String(n).padStart(2,"0");
  const fmt = ms => {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };
  const dayKey = date => {
    const d = new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };
  const dateLabel = key => new Date(`${key}T12:00:00`).toLocaleDateString("fa-IR", {
    weekday:"long", year:"numeric", month:"long", day:"numeric"
  });
  const today = () => dayKey(Date.now());
  const initial = () => ({books:[], sessions:[], goalMinutes:180, active:null, lastBookId:null});
  let state = load();
  let tick = null;
  let currentBookId = null;

  function load(){
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "null");
      return parsed && Array.isArray(parsed.books) && Array.isArray(parsed.sessions)
        ? {...initial(), ...parsed} : initial();
    } catch { return initial(); }
  }
  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch(err){ console.warn("Study Room storage unavailable", err); }
    renderFloating();
    updateDashboardStats();
  }
  function uid(){ return `${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`; }
  function bookById(id){ return state.books.find(b => b.id === id); }
  function elapsed(active){
    if(!active) return 0;
    return (active.elapsedMs || 0) + (active.running && active.startedAt ? Date.now()-active.startedAt : 0);
  }
  function totalForBook(id){
    return state.sessions.filter(s=>s.bookId===id).reduce((sum,s)=>sum+s.durationMs,0);
  }
  function totalToday(){
    return state.sessions.filter(s=>s.date===today()).reduce((sum,s)=>sum+s.durationMs,0)
      + (state.active && state.active.date===today() ? elapsed(state.active) : 0);
  }
  function updateDashboardStats(){
    const total = totalToday();
    const target = state.goalMinutes*60000;
    document.querySelectorAll(".stat-card").forEach(card=>{
      const label=card.textContent||"";
      if(label.includes("STUDY TIME") || label.includes("زمان یادگیری")){
        const h=Math.floor(total/3600000), m=Math.floor((total%3600000)/60000);
        const value=card.querySelector("h3");
        if(value) value.innerHTML=`${h.toString().padStart(2,"0")} <small>ساعت / Hours</small>`;
        const note=card.querySelector(".stat-note");
        if(note) note.textContent=`${Math.min(100,Math.round(total/Math.max(1,target)*100))}% از هدف روزانه / Daily goal`;
      }
    });
  }

  function start(bookId){
    if(state.active && state.active.running) return;
    if(!bookById(bookId)) return;
    const now=Date.now();
    if(state.active && state.active.bookId===bookId){
      state.active.running=true; state.active.startedAt=now;
    } else {
      if(state.active) return;
      state.active={id:uid(),bookId,startedAt:now,sessionStartedAt:now,elapsedMs:0,running:true,date:today()};
    }
    state.lastBookId=bookId;
    save(); startTicker(); render();
  }
  function pause(){
    if(!state.active || !state.active.running) return;
    state.active.elapsedMs=elapsed(state.active);
    state.active.running=false;
    state.active.startedAt=null;
    save(); stopTicker(); render();
  }
  function finish(){
    if(!state.active) return;
    const duration=elapsed(state.active);
    if(duration<1000){
      state.active=null; save(); stopTicker(); render();
      return;
    }
    const book=bookById(state.active.bookId);
    if(!book){state.active=null;save();stopTicker();render();return;}
    const note=$("#srFinishNote")?.value.trim() || state.active.note || "";
    const page=$("#srFinishPage")?.value.trim() || state.active.lastPage || book.lastPage || "";
    const end=Date.now();
    state.sessions.push({
      id:uid(),bookId:book.id,bookName:book.name,durationMs:duration,
      date:state.active.date || dayKey(end),startedAt:state.active.sessionStartedAt || state.active.startedAt || end,
      endedAt:end,note,lastPage:page
    });
    book.lastPage=page;
    book.updatedAt=end;
    state.active=null;
    save(); stopTicker(); render();
  }
  function startTicker(){
    stopTicker();
    tick=window.setInterval(()=>{
      renderFloating();
      const clock=$("#srClock");
      if(clock && state.active) clock.textContent=fmt(elapsed(state.active));
      const elapsedNode=$("#srElapsedInline");
      if(elapsedNode && state.active) elapsedNode.textContent=fmt(elapsed(state.active));
      updateDashboardStats();
    },1000);
  }
  function stopTicker(){ if(tick){clearInterval(tick);tick=null;} }

  function open(){
    const page=$("#dynamicPage");
    if(!page) return;
    page.innerHTML=`<section class="sr-shell" id="smitStudyRoom"></section>`;
    render();
    if(state.active?.running) startTicker();
    renderFloating();
  }
  function renderHeader(){
    const active=state.active, book=active?bookById(active.bookId):null;
    return `<header class="sr-header">
      <div><span class="sr-kicker">SMIT AI / PERSONAL PRODUCTIVITY</span>
      <h1>اتاق مطالعه <small>/ Study Room</small></h1>
      <p>کتابخانه، زمان‌سنج و گزارش پیشرفتت در یک مکان / Your personal study space</p></div>
      <div class="sr-header-stat"><b>${state.books.length}</b><span>منابع من / My Resources</span></div>
    </header>
    ${active?`<div class="sr-live-banner"><span class="sr-pulse"></span>
      <span>جلسه فعال / Active session: <b>${esc(book?.name||"")}</b></span>
      <strong id="srElapsedInline">${fmt(elapsed(active))}</strong></div>`:""}`;
  }
  function renderAchievements(){
    const totalMs = state.sessions.reduce((sum, session) => sum + (Number(session.durationMs) || 0), 0)
      + (state.active ? elapsed(state.active) : 0);
    const studyDays = new Set(state.sessions.map(session => session.date).filter(Boolean));
    if (state.active?.date) studyDays.add(state.active.date);
    let profile = {};
    try { profile = JSON.parse(localStorage.getItem("smit_space_owner_data_v1") || "{}"); } catch { profile = {}; }
    const goals = Array.isArray(profile.goals) ? profile.goals : [];
    const projects = Array.isArray(profile.projects) ? profile.projects : [];
    const journal = Array.isArray(profile.journal) ? profile.journal : [];
    const doneGoals = goals.filter(goal => goal && goal.done).length;
    const items = [
      ["◷", "اولین قدم", "ثبت اولین جلسه مطالعه", state.sessions.length >= 1],
      ["✦", "پشتکار", "ثبت ۵ جلسه مطالعه", state.sessions.length >= 5],
      ["⌛", "۱۰ ساعت تمرکز", "رسیدن به ۱۰ ساعت مطالعه", totalMs >= 10 * 60 * 60 * 1000],
      ["▤", "کتابخانه‌ساز", "ثبت ۳ منبع مطالعاتی", state.books.length >= 3],
      ["◎", "هدف‌گذار", "ثبت اولین هدف شخصی", goals.length >= 1],
      ["✓", "هدف‌محور", "تکمیل اولین هدف", doneGoals >= 1],
      ["◇", "سازنده", "ثبت اولین پروژه", projects.length >= 1],
      ["▧", "اهل بازنگری", "ثبت ۵ یادداشت شخصی", journal.length >= 5]
    ];
    const earned = items.filter(item => item[3]).length;
    return `<section class="sr-panel sr-achievements-panel">
      <div class="sr-panel-title"><div><h2>دستاوردها و رکوردها / Achievements</h2><span>همه نشان‌ها در اتاق مطالعه جمع شده‌اند / Your milestones in one place</span></div><strong class="sr-achievement-count">${earned} / ${items.length}</strong></div>
      <div class="sr-achievements-grid">${items.map(([icon,title,description,unlocked]) => `<article class="sr-achievement ${unlocked?"is-earned":""}"><span>${icon}</span><div><b>${title}</b><small>${description}</small></div><i>${unlocked?"✓":"قفل"}</i></article>`).join("")}</div>
      <div class="sr-achievement-footnote">روزهای مطالعه ثبت‌شده: <b>${studyDays.size}</b> · مجموع زمان مطالعه: <b>${fmt(totalMs)}</b> · اهداف تکمیل‌شده: <b>${doneGoals}</b></div>
    </section>`;
  }

  function render(){
    const root=$("#smitStudyRoom");
    if(!root) return;
    const active=state.active, activeBook=active?bookById(active.bookId):null;
    const todayMs=totalToday(), goalMs=state.goalMinutes*60000;
    const nowDate=new Date(), weekStart=new Date(nowDate.getFullYear(),nowDate.getMonth(),nowDate.getDate()-((nowDate.getDay()+6)%7));
    const monthStart=new Date(nowDate.getFullYear(),nowDate.getMonth(),1);
    const weekMs=state.sessions.filter(s=>new Date(`${s.date}T12:00:00`)>=weekStart).reduce((a,s)=>a+s.durationMs,0)+(state.active&&new Date(`${state.active.date}T12:00:00`)>=weekStart?elapsed(state.active):0);
    const monthMs=state.sessions.filter(s=>new Date(`${s.date}T12:00:00`)>=monthStart).reduce((a,s)=>a+s.durationMs,0)+(state.active&&new Date(`${state.active.date}T12:00:00`)>=monthStart?elapsed(state.active):0);
    const progress=Math.min(100,Math.round(todayMs/Math.max(goalMs,1)*100));
    root.innerHTML=`
      ${renderHeader()}
      <div class="sr-summary-grid">
        <article class="sr-stat"><span>امروز مطالعه کردی / Studied Today</span><b>${fmt(todayMs)}</b><small>${(todayMs/3600000).toFixed(1)} ساعت / hours</small></article>
        <article class="sr-stat"><span>هدف روزانه / Daily Goal</span><b>${state.goalMinutes} <i>دقیقه / min</i></b><div class="sr-progress"><span style="width:${progress}%"></span></div><small>${progress}% تکمیل شده / completed</small></article>
        <article class="sr-stat"><span>این هفته / This Week</span><b>${fmt(weekMs)}</b><small>مجموع مطالعه هفتگی / Weekly study time</small></article>
        <article class="sr-stat"><span>این ماه / This Month</span><b>${fmt(monthMs)}</b><small>مجموع مطالعه ماهانه / Monthly study time</small></article>
      </div>
      <div class="sr-toolbar">
        <div><h2>کتابخانه من <small>/ My Library</small></h2><p>هر تعداد کتاب، جزوه یا دوره خواستی اضافه کن / Add as many resources as you need</p></div>
        <div class="sr-toolbar-actions"><button class="sr-btn sr-secondary" data-sr-action="goal">هدف روزانه / Daily Goal</button>
        <button class="sr-btn sr-primary" data-sr-action="add-book">＋ افزودن منبع / Add Resource</button></div>
      </div>
      ${state.books.length?`<div class="sr-search-wrap"><div class="smit-uiverse-search sr-uiverse-search"><span class="us-grid"></span><span class="us-glow"></span><span class="us-border"></span><span class="us-white"></span><span class="us-dark"></span><span class="us-icon">⌕</span><input id="srLibrarySearch" type="search" placeholder="جست‌وجوی کتاب، جزوه یا دوره..." autocomplete="off"></div><small>SEARCH YOUR LIBRARY</small></div>`:""}
      <div class="sr-library" id="srLibrary">${state.books.length?state.books.map(bookCard).join(""):`
        <div class="sr-empty"><span>▤</span><b>هنوز منبعی اضافه نکردی / Your library is empty</b><p>اولین کتاب یا دوره‌ات را اضافه کن / Add your first book or course</p><button class="sr-btn sr-primary sr-add-first-resource" data-sr-action="add-book"><span class="sr-add-plus" aria-hidden="true">+</span><span>افزودن اولین منبع / Add First Resource</span></button></div>`}</div>
      ${active?renderActivePanel(active,activeBook):""}
      <div class="sr-lower-grid">
        <section class="sr-panel"><div class="sr-panel-title"><h2>تقویم مطالعه / Study Calendar</h2><span>۳۰ روز اخیر / Last 30 days</span></div>${renderCalendar()}</section>
        <section class="sr-panel"><div class="sr-panel-title"><h2>آمار منابع / Resource Analytics</h2><span>بر اساس زمان / By time</span></div>${renderBookStats()}</section>
      </div>
      ${renderAchievements()}
      <section class="sr-panel sr-history"><div class="sr-panel-title"><h2>تاریخچه مطالعه / Study History</h2><span>${state.sessions.length} جلسه / sessions</span></div>${renderHistory()}</section>
    `;
    bindFormActions();
  }
  function bookCard(book){
    const active=state.active?.bookId===book.id;
    return `<article class="sr-book ${active?"is-active":""}">
      <div class="sr-book-top"><span class="sr-book-icon">${iconFor(book.category)}</span>
      <button class="sr-more" data-sr-action="edit-book" data-id="${book.id}" aria-label="Edit resource">•••</button></div>
      <span class="sr-category">${esc(book.category)} / ${esc(book.categoryEn)}</span>
      <h3>${esc(book.name)}</h3><p>${esc(book.description||"منبع مطالعاتی / Study resource")}</p>
      <div class="sr-book-progress"><span>آخرین صفحه / Last page</span><b>${esc(book.lastPage||"—")}</b></div>
      <div class="sr-book-total"><b>${fmt(totalForBook(book.id))}</b><span>زمان مطالعه / Study time</span></div>
      <div class="sr-book-actions">
        <button type="button" class="sr-timer-toggle ${active && state.active.running?"is-running":""}" data-sr-action="toggle-timer" data-id="${book.id}" title="شروع، توقف یا ادامه مطالعه" ${state.active && !active?"disabled":""}>
          <span class="sr-timer-toggle-icon" aria-hidden="true"><i></i><i></i><i></i></span>
          <span>${active?(state.active.running?"توقف موقت / Pause":"ادامه مطالعه / Resume"):"شروع مطالعه / Start Studying"}</span>
        </button>
        <button class="sr-btn sr-ghost" data-sr-action="open-book" data-id="${book.id}">جزئیات / Details</button>
      </div>
    </article>`;
  }
  function iconFor(cat){return ({کتاب:"▤",دوره:"⌘",جزوه:"▧",زبان:"文",تمرین:"✎",سایر:"◇"})[cat]||"▤";}
  function renderActivePanel(active,book){
    return `<section class="sr-active-panel" id="srActivePanel">
      <div><span class="sr-kicker">FOCUS SESSION / جلسه مطالعه</span><h2>${esc(book?.name||"مطالعه")}</h2><p>تایمر نامحدود؛ هر وقت خواستی متوقف یا تمامش کن / Unlimited timer — pause or finish whenever you want</p></div>
      <div class="sr-clock" id="srClock">${fmt(elapsed(active))}</div>
      <div class="sr-session-fields">
        <label>صفحه یا درس فعلی / Current page or lesson<input id="srFinishPage" value="${esc(active.lastPage??book?.lastPage??"")}" placeholder="مثلاً صفحه ۴۵ / e.g. Page 45"></label>
        <label>یادداشت جلسه / Session note<textarea id="srFinishNote" rows="2" placeholder="چه چیزی یاد گرفتی؟ / What did you learn?">${esc(active.note||"")}</textarea></label>
      </div>
      <div class="sr-controls">
        <button type="button" class="sr-timer-toggle sr-timer-toggle-large ${active.running?"is-running":""}" data-sr-action="toggle-timer" data-id="${active.bookId}" title="توقف یا ادامه تایمر / Pause or resume">
          <span class="sr-timer-toggle-icon" aria-hidden="true"><i></i><i></i><i></i></span>
          <span>${active.running?"توقف موقت / Pause":"ادامه مطالعه / Resume"}</span>
        </button>
        <button class="sr-btn sr-danger" data-sr-action="finish">■ پایان و ذخیره / Finish & Save</button>
      </div>
      <small class="sr-hint">با پایان جلسه، مدت مطالعه و تاریخ آن ذخیره می‌شود. / Finishing saves the duration and date.</small>
    </section>`;
  }
  function renderCalendar(){
    const now=new Date(), days=[];
    for(let i=29;i>=0;i--){
      const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i);
      const key=dayKey(d), ms=state.sessions.filter(s=>s.date===key).reduce((a,s)=>a+s.durationMs,0)
        +(state.active&&state.active.date===key?elapsed(state.active):0);
      days.push({key,ms,d});
    }
    const max=Math.max(3600000,...days.map(x=>x.ms));
    return `<div class="sr-calendar">${days.map(x=>`<div class="sr-day ${x.ms?"has-study":""}" title="${esc(dateLabel(x.key))}: ${fmt(x.ms)}">
      <span>${x.d.toLocaleDateString("fa-IR",{day:"numeric"})}</span><i style="height:${x.ms?Math.max(8,Math.round(x.ms/max*34)):3}px"></i>
      <small>${x.d.toLocaleDateString("en-US",{weekday:"narrow"})}</small></div>`).join("")}</div>
      <div class="sr-calendar-legend"><i></i> روزهای دارای مطالعه / Study days</div>`;
  }
  function renderBookStats(){
    const entries=state.books.map(b=>({name:b.name,ms:totalForBook(b.id)})).sort((a,b)=>b.ms-a.ms);
    const max=Math.max(1,...entries.map(x=>x.ms));
    return entries.length?`<div class="sr-bars">${entries.map(x=>`<div class="sr-bar-row"><span title="${esc(x.name)}">${esc(x.name)}</span><div><i style="width:${Math.round(x.ms/max*100)}%"></i></div><b>${fmt(x.ms)}</b></div>`).join("")}</div>`:`<p class="sr-empty-inline">بعد از ثبت مطالعه، آمار اینجا نمایش داده می‌شود. / Analytics will appear after your first session.</p>`;
  }
  function renderHistory(){
    if(!state.sessions.length) return `<div class="sr-empty-inline">هنوز جلسه‌ای ذخیره نشده است. / No study sessions saved yet.</div>`;
    const sessions=[...state.sessions].sort((a,b)=>b.endedAt-a.endedAt);
    const grouped={};
    sessions.forEach(s=>(grouped[s.date]??=[]).push(s));
    return Object.entries(grouped).map(([date,items])=>`<div class="sr-history-day"><h3>${esc(dateLabel(date))}</h3>
      ${items.map(s=>`<article class="sr-history-item"><div><b>${esc(s.bookName)}</b><small>${new Date(s.startedAt).toLocaleTimeString("fa-IR",{hour:"2-digit",minute:"2-digit"})} — ${new Date(s.endedAt).toLocaleTimeString("fa-IR",{hour:"2-digit",minute:"2-digit"})}</small>${s.note?`<p>${esc(s.note)}</p>`:""}</div>
      <div><strong>${fmt(s.durationMs)}</strong><small>${s.lastPage?`صفحه / Page: ${esc(s.lastPage)}`:""}</small></div>
      <button class="sr-delete-session" data-sr-action="delete-session" data-id="${s.id}" title="Delete session">×</button></article>`).join("")}</div>`).join("");
  }
  function bindFormActions(){
    const root=$("#smitStudyRoom"); if(!root)return;
    const pageInput=$("#srFinishPage"),noteInput=$("#srFinishNote");
    pageInput?.addEventListener("input",()=>{if(!state.active)return;state.active.lastPage=pageInput.value;const book=bookById(state.active.bookId);if(book){book.lastPage=pageInput.value;book.updatedAt=Date.now();}save();});
    noteInput?.addEventListener("input",()=>{if(!state.active)return;state.active.note=noteInput.value;save();});
    const librarySearch=$("#srLibrarySearch");
    librarySearch?.addEventListener("input",()=>{
      const q=librarySearch.value.trim().toLocaleLowerCase();
      let visible=0;
      root.querySelectorAll("#srLibrary .sr-book").forEach(card=>{const match=card.textContent.toLocaleLowerCase().includes(q);card.hidden=!match;if(match)visible++;});
      let empty=root.querySelector(".sr-library-no-match");
      if(!empty){empty=document.createElement("p");empty.className="sr-empty-inline sr-library-no-match";empty.textContent="موردی با این جست‌وجو پیدا نشد.";root.querySelector("#srLibrary")?.after(empty);}
      empty.hidden=!q||visible>0;
    });
    root.querySelectorAll("[data-sr-action]").forEach(btn=>btn.addEventListener("click",()=>{
      const action=btn.dataset.srAction,id=btn.dataset.id;
      if(action==="add-book") showBookForm();
      if(action==="goal") showGoalForm();
      if(action==="edit-book") showBookForm(bookById(id));
      if(action==="start") start(id);
      if(action==="toggle-timer"){
        if(state.active && state.active.bookId===id){ state.active.running ? pause() : start(id); }
        else if(!state.active) start(id);
      }
      if(action==="pause") pause();
      if(action==="resume") start(state.active?.bookId);
      if(action==="finish") finish();
      if(action==="open-active") $("#srActivePanel")?.scrollIntoView({behavior:"smooth"});
      if(action==="open-book") showBookDetails(id);
      if(action==="delete-session" && confirm("این جلسه حذف شود؟ / Delete this session?")){
        state.sessions=state.sessions.filter(s=>s.id!==id);save();render();
      }
    }));
  }
  function showGoalForm(){
    const overlay=document.createElement("div");overlay.className="sr-modal-backdrop";
    overlay.innerHTML=`<form class="sr-modal" id="srGoalForm"><button type="button" class="sr-modal-close" data-close>×</button>
      <span class="sr-kicker">DAILY TARGET</span><h2>تنظیم هدف روزانه / Set Daily Goal</h2>
      <label>چند دقیقه در روز مطالعه می‌کنی؟ / How many minutes per day?
        <input name="minutes" type="number" min="1" max="1440" required value="${state.goalMinutes}">
      </label>
      <div class="sr-modal-actions"><button class="sr-btn sr-primary" type="submit">ذخیره هدف / Save Goal</button><button class="sr-btn sr-ghost" type="button" data-close>انصراف / Cancel</button></div>
    </form>`;
    document.body.appendChild(overlay);
    overlay.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>overlay.remove()));
    overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.remove();});
    overlay.querySelector("form").addEventListener("submit",e=>{
      e.preventDefault();const minutes=Number(new FormData(e.currentTarget).get("minutes"));
      if(!Number.isFinite(minutes)||minutes<1||minutes>1440)return;
      state.goalMinutes=Math.round(minutes);save();overlay.remove();render();
    });
  }

  function showBookForm(book=null){
    const root=$("#smitStudyRoom");
    const overlay=document.createElement("div");overlay.className="sr-modal-backdrop";
    overlay.innerHTML=`<form class="sr-modal" id="srBookForm"><button type="button" class="sr-modal-close" data-close>×</button>
      <span class="sr-kicker">RESOURCE MANAGER</span><h2>${book?"ویرایش منبع / Edit Resource":"افزودن منبع / Add Resource"}</h2>
      <label>نام کتاب یا آموزش / Book or course name<input name="name" required maxlength="90" value="${esc(book?.name||"")}" placeholder="مثلاً ریاضی ۱ / e.g. Mathematics 1"></label>
      <label>دسته‌بندی / Category<select name="category"><option ${book?.category==="کتاب"?"selected":""}>کتاب</option><option ${book?.category==="دوره"?"selected":""}>دوره</option><option ${book?.category==="جزوه"?"selected":""}>جزوه</option><option ${book?.category==="زبان"?"selected":""}>زبان</option><option ${book?.category==="تمرین"?"selected":""}>تمرین</option><option ${book?.category==="سایر"?"selected":""}>سایر</option></select></label>
      <label>توضیحات / Description<input name="description" maxlength="160" value="${esc(book?.description||"")}" placeholder="اختیاری / Optional"></label>
      <label>آخرین صفحه یا درس / Last page or lesson<input name="lastPage" value="${esc(book?.lastPage||"")}" placeholder="مثلاً فصل ۲، صفحه ۳۰ / Chapter 2, page 30"></label>
      <div class="sr-modal-actions"><button class="sr-btn sr-primary" type="submit">ذخیره / Save</button>${book?`<button class="sr-btn sr-danger" type="button" data-delete-book="${book.id}">حذف منبع / Delete</button>`:""}<button class="sr-btn sr-ghost" type="button" data-close>انصراف / Cancel</button></div>
    </form>`;
    document.body.appendChild(overlay);
    overlay.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>overlay.remove()));
    overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.remove();});
    overlay.querySelector("[data-delete-book]")?.addEventListener("click",()=>{
      if(state.active?.bookId===book.id){alert("ابتدا جلسه فعال را تمام کن. / Finish the active session first.");return;}
      if(confirm("این منبع و جلسات مرتبط حذف شوند؟ / Delete this resource and its sessions?")){
        state.books=state.books.filter(b=>b.id!==book.id);state.sessions=state.sessions.filter(s=>s.bookId!==book.id);
        save();overlay.remove();render();
      }
    });
    overlay.querySelector("form").addEventListener("submit",e=>{
      e.preventDefault();const data=new FormData(e.currentTarget);
      const category=String(data.get("category"));
      const categoryEn=({کتاب:"Book",دوره:"Course",جزوه:"Notes",زبان:"Language",تمرین:"Practice",سایر:"Other"})[category];
      const record={name:String(data.get("name")).trim(),category,categoryEn,description:String(data.get("description")).trim(),lastPage:String(data.get("lastPage")).trim(),updatedAt:Date.now()};
      if(book)Object.assign(book,record);else state.books.push({id:uid(),...record,createdAt:Date.now()});
      save();overlay.remove();render();
    });
  }
  function showBookDetails(id){
    const book=bookById(id);if(!book)return;
    const records=state.sessions.filter(s=>s.bookId===id).sort((a,b)=>b.endedAt-a.endedAt);
    const root=$("#smitStudyRoom");
    const detail=document.createElement("div");detail.className="sr-detail";
    detail.innerHTML=`<div class="sr-panel-title"><h2>${esc(book.name)} / Resource Details</h2><button class="sr-btn sr-ghost" data-back>بازگشت / Back</button></div>
      <div class="sr-detail-grid"><div><span>مجموع مطالعه / Total time</span><b>${fmt(totalForBook(id))}</b></div><div><span>آخرین پیشرفت / Last progress</span><b>${esc(book.lastPage||"—")}</b></div><div><span>تعداد جلسات / Sessions</span><b>${records.length}</b></div></div>
      <h3>جلسات این منبع / Resource Sessions</h3>${records.length?records.map(s=>`<div class="sr-history-item"><div><b>${esc(dateLabel(s.date))}</b><small>${s.note?esc(s.note):"—"}</small></div><strong>${fmt(s.durationMs)}</strong></div>`).join(""):`<p class="sr-empty-inline">هنوز جلسه‌ای ثبت نشده / No sessions yet</p>`}`;
    root.prepend(detail);
    detail.querySelector("[data-back]").addEventListener("click",()=>detail.remove());
  }

  function renderFloating(){
    let el=$("#srFloatingTimer");
    if(!state.active){ el?.remove(); return; }
    const book=bookById(state.active.bookId);
    if(!el){
      el=document.createElement("div"); el.id="srFloatingTimer";
      el.innerHTML=`<span class="sr-float-dot"></span><div class="sr-float-info"><small>STUDY ROOM / اتاق مطالعه</small><b class="sr-float-book"></b><strong class="sr-float-clock">00:00:00</strong></div>
        <button type="button" data-float="toggle" title="Pause or resume">Ⅱ</button>
        <button type="button" data-float="finish" title="Finish">■</button>`;
      document.body.appendChild(el);
      el.querySelector('[data-float="toggle"]').addEventListener("click",()=>state.active?.running?pause():start(state.active?.bookId));
      el.querySelector('[data-float="finish"]').addEventListener("click",()=>{
        if(!state.active) return;
        if(confirm("جلسه مطالعه را تمام و ذخیره می‌کنی؟ / Finish and save this session?")){
          if($("#smitStudyRoom")) finish();
          else {
            const duration=elapsed(state.active),b=bookById(state.active.bookId),now=Date.now();
            if(b&&duration>1000)state.sessions.push({id:uid(),bookId:b.id,bookName:b.name,durationMs:duration,date:state.active.date||dayKey(now),startedAt:state.active.sessionStartedAt||state.active.startedAt||now,endedAt:now,note:"",lastPage:b.lastPage||""});
            state.active=null;save();stopTicker();renderFloating();
          }
        }
      });
    }
    const name=el.querySelector(".sr-float-book");
    const clock=el.querySelector(".sr-float-clock");
    const toggle=el.querySelector('[data-float="toggle"]');
    if(name) name.textContent=book?.name||"مطالعه";
    if(clock) clock.textContent=fmt(elapsed(state.active));
    if(toggle){ toggle.textContent=state.active.running?"Ⅱ":"▶"; toggle.title=state.active.running?"Pause":"Resume"; }
  }
  document.addEventListener("visibilitychange",()=>{if(state.active?.running)save();});
  window.addEventListener("beforeunload",()=>save());
  window.SMITStudyRoom={open,getState:()=>JSON.parse(JSON.stringify(state))};
  document.addEventListener("DOMContentLoaded",()=>{
    renderFloating();updateDashboardStats();
    if(state.active?.running)startTicker();
    const nav=document.querySelector('[data-page="study-room"]');
    if(nav && !nav.querySelector(".sr-nav-en"))nav.setAttribute("aria-label","اتاق مطالعه / Study Room");
  });
})();


/* =========================================================
   SMIT AI — Personal Dashboard modules
   Calendar, live news, and global information widgets.
   ========================================================= */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const faDigits = (value) => String(value).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
  const latinDigits = (value) => String(value).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  const pad = n => String(n).padStart(2, "0");
  const monthNames = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
  const weekNames = ["ش","ی","د","س","چ","پ","ج"];
  const storage = {
    get(key, fallback=null) { try { const v=localStorage.getItem(key); return v===null?fallback:JSON.parse(v); } catch (_) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } }
  };

  // Jalali/Gregorian conversion (integer arithmetic; no external dependency).
  function g2j(gy, gm, gd) {
    const gdm=[0,31,59,90,120,151,181,212,243,273,304,334];
    let gy2=gm>2?gy+1:gy;
    let days=355666+365*gy+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)+gd+gdm[gm-1];
    let jy=-1595+33*Math.floor(days/12053); days%=12053;
    jy+=4*Math.floor(days/1461); days%=1461;
    if(days>365){jy+=Math.floor((days-1)/365);days=(days-1)%365;}
    let jm, jd;
    if(days<186){jm=1+Math.floor(days/31);jd=1+days%31;}
    else {jm=7+Math.floor((days-186)/30);jd=1+(days-186)%30;}
    return [jy,jm,jd];
  }
  function j2g(jy,jm,jd) {
    jy+=1595;
    let days=-355668+365*jy+Math.floor(jy/33)*8+Math.floor(((jy%33)+3)/4)+jd;
    if(jm<7) days+=(jm-1)*31; else days+=186+(jm-7)*30;
    let gy=400*Math.floor(days/146097); days%=146097;
    if(days>36524){gy+=100*Math.floor(--days/36524);days%=36524;if(days>=365)days++;}
    gy+=4*Math.floor(days/1461);days%=1461;
    if(days>365){gy+=Math.floor((days-1)/365);days=(days-1)%365;}
    let gd=days+1, sal_a=[0,31,(gy%4===0&&gy%100!==0)||gy%400===0?29:28,31,30,31,30,31,31,30,31,30,31], gm=1;
    while(gm<=12&&gd>sal_a[gm]){gd-=sal_a[gm];gm++;}
    return [gy,gm,gd];
  }
  function validJalali(y,m,d){const yearDays=(Date.UTC(...j2g(y+1,1,1).map((v,i)=>i===1?v-1:v))-Date.UTC(...j2g(y,1,1).map((v,i)=>i===1?v-1:v)))/86400000;return Number.isInteger(y)&&Number.isInteger(m)&&Number.isInteger(d)&&y>1200&&y<1600&&m>=1&&m<=12&&d>=1&&d<=(m<=6?31:m<=11?30:(yearDays===366?30:29));}
  function parseDate(v){const nums=latinDigits(v).trim().split(/[\/\-.\s]+/).map(Number);return nums.length===3&&nums.every(Number.isFinite)?nums:null;}
  function dateString(a){return `${a[0]}/${pad(a[1])}/${pad(a[2])}`;}
  const nowDate = new Date();
  let viewJ = g2j(nowDate.getFullYear(),nowDate.getMonth()+1,nowDate.getDate());
  let selectedJ = [...viewJ];

  function updateClock(){
    const d=new Date();
    if($("smitLiveClock")) $("smitLiveClock").textContent=d.toLocaleTimeString("en-GB",{hour12:true,hour:"2-digit",minute:"2-digit",second:"2-digit"});
    if($("smitClockMeta")) $("smitClockMeta").textContent=d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}).toUpperCase();
    const j=g2j(d.getFullYear(),d.getMonth()+1,d.getDate());
    if($("smitTodayJalali")) $("smitTodayJalali").textContent=faDigits(dateString(j));
    if($("smitTodayGregorian")) $("smitTodayGregorian").textContent=dateString([d.getFullYear(),d.getMonth()+1,d.getDate()]);
  }
  function renderCalendar(){
    const grid=$("smitCalendarGrid"); if(!grid)return;
    $("smitCalendarMonth").textContent=`${monthNames[viewJ[1]-1]} ${faDigits(viewJ[0])}`;
    grid.innerHTML=weekNames.map(w=>`<span class="smit-weekday">${w}</span>`).join("");
    const first=j2g(viewJ[0],viewJ[1],1);
    const weekday=(new Date(first[0],first[1]-1,first[2]).getDay()+1)%7;
    const next=viewJ[1]===12?j2g(viewJ[0]+1,1,1):j2g(viewJ[0],viewJ[1]+1,1);
    const days=Math.round((Date.UTC(next[0],next[1]-1,next[2])-Date.UTC(first[0],first[1]-1,first[2]))/86400000);
    for(let i=0;i<weekday;i++) grid.insertAdjacentHTML("beforeend",'<span class="smit-calendar-empty"></span>');
    for(let day=1;day<=days;day++){
      const isToday=viewJ[0]===g2j(nowDate.getFullYear(),nowDate.getMonth()+1,nowDate.getDate())[0]&&viewJ[1]===g2j(nowDate.getFullYear(),nowDate.getMonth()+1,nowDate.getDate())[1]&&day===g2j(nowDate.getFullYear(),nowDate.getMonth()+1,nowDate.getDate())[2];
      const isSelected=selectedJ[0]===viewJ[0]&&selectedJ[1]===viewJ[1]&&selectedJ[2]===day;
      grid.insertAdjacentHTML("beforeend",`<button type="button" class="smit-calendar-day ${isToday?'today':''} ${isSelected?'selected':''}" data-jday="${day}" aria-label="${viewJ[0]}/${viewJ[1]}/${day}">${faDigits(day)}</button>`);
    }
  }
  function setMonth(delta){viewJ[1]+=delta;if(viewJ[1]<1){viewJ[1]=12;viewJ[0]--;}if(viewJ[1]>12){viewJ[1]=1;viewJ[0]++;}renderCalendar();}
  $("smitPrevMonth")?.addEventListener("click",()=>setMonth(-1));
  $("smitNextMonth")?.addEventListener("click",()=>setMonth(1));
  $("smitCalendarToday")?.addEventListener("click",()=>{const d=new Date();viewJ=g2j(d.getFullYear(),d.getMonth()+1,d.getDate());selectedJ=[...viewJ];renderCalendar();});
  $("smitCalendarGrid")?.addEventListener("click",e=>{const b=e.target.closest("[data-jday]");if(!b)return;selectedJ=[viewJ[0],viewJ[1],Number(b.dataset.jday)];const g=j2g(...selectedJ);$("smitJalaliInput").value=faDigits(dateString(selectedJ));$("smitGregorianInput").value=dateString(g);$("smitConvertMessage").textContent="تاریخ انتخاب‌شده از تقویم";renderCalendar();});
  $("smitJalaliInput")?.addEventListener("change",e=>{const a=parseDate(e.target.value);if(!a||!validJalali(...a)){$("smitConvertMessage").textContent="تاریخ شمسی معتبر نیست.";return;}const g=j2g(...a);$("smitGregorianInput").value=dateString(g);$("smitConvertMessage").textContent="تبدیل شمسی به میلادی انجام شد.";});
  $("smitGregorianInput")?.addEventListener("change",e=>{const a=parseDate(e.target.value);if(!a||a[1]<1||a[1]>12||a[2]<1||a[2]>new Date(a[0],a[1],0).getDate()){$("smitConvertMessage").textContent="تاریخ میلادی معتبر نیست.";return;}const j=g2j(...a);$("smitJalaliInput").value=faDigits(dateString(j));$("smitConvertMessage").textContent="تبدیل میلادی به شمسی انجام شد.";});
  updateClock();renderCalendar();window.setInterval(updateClock,1000);

  // News are sourced from live RSS feeds via rss2json. No local/demo headlines.
  const feeds={
    iran:"https://news.google.com/rss/search?q=Iran&hl=fa&gl=IR&ceid=IR:fa",
    world:"https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
    economy:"https://news.google.com/rss/search?q=world+economy+OR+markets&hl=en-US&gl=US&ceid=US:en",
    tech:"https://news.google.com/rss/search?q=AI+OR+technology&hl=en-US&gl=US&ceid=US:en",
    sports:"https://news.google.com/rss/search?q=international+sports&hl=en-US&gl=US&ceid=US:en",
    science:"https://news.google.com/rss/search?q=science+research&hl=en-US&gl=US&ceid=US:en"
  };
  let newsItems=[],activeNews="all";
  const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function renderNews(){
    const list=$("smitNewsList");if(!list)return;
    const items=activeNews==="all"?newsItems:newsItems.filter(n=>n.category===activeNews);
    list.innerHTML=items.length?items.slice(0,12).map(n=>`<a class="smit-news-item" href="${escapeHTML(n.link)}" target="_blank" rel="noopener noreferrer"><span class="smit-news-source">${escapeHTML(n.source||"Google News")} · ${escapeHTML(n.date||"")}</span><strong>${escapeHTML(n.title)}</strong><span class="smit-news-open">مشاهده خبر اصلی ↗</span></a>`).join(""):'<div class="smit-news-empty">اخباری برای این دسته در دسترس نیست.</div>';
  }
  async function loadNews(){
    const status=$("smitNewsStatus");if(!status)return;
    status.textContent="در حال دریافت خبرهای تازه...";
    $("smitNewsRefresh").disabled=true;
    try{
      const categories=["iran","world","economy","tech","sports","science"];
      const results=await Promise.all(categories.map(async category=>{
        const url="https://api.rss2json.com/v1/api.json?rss_url="+encodeURIComponent(feeds[category]);
        const response=await fetch(url,{cache:"no-store"});
        if(!response.ok)throw new Error("News service unavailable");
        const data=await response.json();
        if(data.status!=="ok"||!Array.isArray(data.items))throw new Error("Invalid feed");
        return data.items.map(item=>({category,title:item.title,link:item.link,source:item.author||item.source||"Google News",timestamp:item.pubDate?new Date(item.pubDate).getTime():0,date:item.pubDate?new Date(item.pubDate).toLocaleString("fa-IR"):""})).filter(n=>n.title&&/^https?:\/\//i.test(n.link));
      }));
      newsItems=results.flat().sort((a,b)=>b.timestamp-a.timestamp);
      if(!newsItems.length)throw new Error("No news");
      status.textContent=`${faDigits(newsItems.length)} خبر دریافت شد · منابع زنده · ${new Date().toLocaleTimeString("fa-IR")}`;
      renderNews();
    }catch(error){
      newsItems=[];renderNews();
      status.textContent="اخبار در دسترس نیست";
    }finally{$("smitNewsRefresh").disabled=false;}
  }
  document.querySelectorAll("[data-news-category]").forEach(btn=>btn.addEventListener("click",()=>{activeNews=btn.dataset.newsCategory;document.querySelectorAll("[data-news-category]").forEach(b=>b.classList.toggle("active",b===btn));renderNews();}));
  $("smitNewsRefresh")?.addEventListener("click",loadNews);
  loadNews();

  // Compact expandable profile folder in the sidebar.
  const profileToggle=$("profileNavToggle");

  // Profile identity is stored locally on this device/browser.
  const profileKey="smitAI_profile_v1";let profileData=storage.get(profileKey,{name:"",bio:"",avatar:""});
  const profileName=$("smitProfileName"),profileBio=$("smitProfileBio"),profileAvatar=$("smitProfileAvatar"),profileAvatarLabel=document.querySelector(".smit-profile-avatar");
  function renderProfile(){if(profileName)profileName.value=profileData.name||"";if(profileBio)profileBio.value=profileData.bio||"";if(profileData.avatar&&profileAvatar){profileAvatar.src=profileData.avatar;profileAvatarLabel?.classList.add("has-image");}else profileAvatarLabel?.classList.remove("has-image");}
  $("smitProfileSave")?.addEventListener("click",()=>{profileData.name=profileName?.value.trim()||"";profileData.bio=profileBio?.value.trim()||"";const ok=storage.set(profileKey,profileData);$("smitProfileSave").textContent=ok?"ذخیره شد ✓":"خطا در ذخیره";window.setTimeout(()=>{if($("smitProfileSave"))$("smitProfileSave").textContent="ذخیره پروفایل";},1600);});
  $("smitProfileAvatarUpload")?.addEventListener("change",e=>{const file=e.target.files?.[0];if(!file||!file.type.startsWith("image/"))return;const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,480/Math.max(img.width,img.height)),canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);profileData.avatar=canvas.toDataURL("image/jpeg",.76);renderProfile();storage.set(profileKey,profileData);};img.src=reader.result;};reader.readAsDataURL(file);});
  renderProfile();

})();



(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const main = document.querySelector(".main-content");
  if (!main) return;
  // The main navigation container is created by the earlier DOMContentLoaded
  // initializer, so refresh this reference when routing starts rather than
  // permanently capturing null during script evaluation.
  let dynamicPage = $("dynamicPage");
  const homeTopbar = main.querySelector(".topbar");
  const profileRoot = $("my-profile");
  const originalProfileParent = profileRoot?.parentNode;
  const originalProfileNext = profileRoot?.nextSibling;
  const routeIds = ["home","english","turkish","quiz","assistant","tools","planner","study-room","profile"];
  let activeRoute = "home";

  function setMainMode(route) {
    dynamicPage = dynamicPage || $("dynamicPage");
    activeRoute = route;
    main.classList.toggle("smit-subpage-active", route !== "home");
    [...main.children].forEach(el => {
      if (el === homeTopbar || el === dynamicPage) return;
      el.classList.toggle("smit-page-hidden", route !== "home");
    });
    if (dynamicPage) dynamicPage.classList.toggle("smit-page-hidden", route === "home");
    document.querySelectorAll(".sidebar .nav-item").forEach(el => {
      const p = el.dataset.page || (el.getAttribute("href") || "").replace(/^#/,"");
      el.classList.toggle("active", p === route || (route.startsWith("my-") && p === "profile"));
    });
  }
  // SMIT ADMIN — Supabase Auth + private cloud data
  const SUPABASE_URL = "https://zbmhknkjyaloubfabcns.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_cVGVrxVTGk_uP9k0o3Rv4A_L75h3311";
  const ADMIN_SECTION = "smit_admin";
  const ADMIN_SESSION_KEY = "smit_admin_session_v1";
  let adminState = null;
  let adminBusy = false;

  // The former profile entry is replaced by a floating SMIT ADMIN launcher.
  const oldProfileToggle = $("profileNavToggle");
  const oldProfileGroup = oldProfileToggle?.closest(".profile-nav-group, .nav-group, .nav-group-container, .sidebar-group");
  if (oldProfileGroup) oldProfileGroup.remove();
  else oldProfileToggle?.closest(".nav-item, li")?.remove();
  profileRoot?.remove();

  if (!document.getElementById("smit-admin-styles")) {
    const style = document.createElement("style");
    style.id = "smit-admin-styles";
    style.textContent = `
      #smitAdminLauncher{position:fixed;right:24px;bottom:22px;z-index:999990;border:1px solid rgba(255,55,85,.65);border-radius:14px;padding:13px 20px;background:linear-gradient(135deg,#1b1018,#080b14);color:#fff;font-size:13px;font-weight:800;line-height:1.2;font-family:inherit;letter-spacing:1.5px;box-shadow:0 8px 30px #0008,0 0 22px #ff315522;cursor:pointer}
      #smitAdminLauncher:hover{transform:translateY(-2px);border-color:#ff526f;box-shadow:0 10px 35px #000a,0 0 28px #ff315544}
      .smit-admin-wrap{min-height:75vh;display:grid;grid-template-columns:235px minmax(0,1fr);gap:20px;color:#f5f5f7}
      .smit-admin-side,.smit-admin-panel{background:rgba(12,15,25,.92);border:1px solid rgba(255,55,85,.2);border-radius:18px;padding:20px}
      .smit-admin-side{display:flex;flex-direction:column;gap:8px}
      .smit-admin-brand{font-size:21px;font-weight:900;letter-spacing:2px;margin:4px 0 20px;color:#fff}
      .smit-admin-brand span{color:#ff4266}
      .smit-admin-nav{display:grid;gap:7px}
      .smit-admin-nav button,.smit-admin-action{font:inherit;color:#ddd;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:11px;text-align:left;cursor:pointer}
      .smit-admin-nav button.active,.smit-admin-nav button:hover,.smit-admin-action:hover{background:rgba(255,45,80,.14);border-color:#b83250;color:#fff}
      .smit-admin-main{min-width:0}
      .smit-admin-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}
      .smit-admin-head h1{font-size:clamp(23px,3vw,32px);margin:0}
      .smit-admin-kicker{font-size:10px;letter-spacing:2px;color:#ff6680}
      .smit-admin-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:12px;margin:16px 0}
      .smit-admin-stat{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);padding:17px;border-radius:13px}
      .smit-admin-stat b{display:block;font-size:27px;margin:7px 0}
      .smit-admin-muted{color:#9ca3b2;font-size:13px;line-height:1.8}
      .smit-admin-form{display:flex;gap:9px;flex-wrap:wrap;margin:14px 0}
      .smit-admin-form input,.smit-admin-form textarea,.smit-admin-field input,.smit-admin-field textarea{min-width:0;flex:1;background:#111724;color:#fff;border:1px solid #343b4a;border-radius:9px;padding:11px;font:inherit}
      .smit-admin-primary{background:linear-gradient(120deg,#8e1d39,#d22e54)!important;border:0!important;color:#fff!important;border-radius:9px;padding:11px 15px;cursor:pointer;font:inherit}
      .smit-admin-danger{background:transparent;border:1px solid #743044;color:#ff8ba0;border-radius:8px;padding:6px 10px;cursor:pointer}
      .smit-admin-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #ffffff12}
      .smit-admin-row:last-child{border:0}
      .smit-admin-auth{max-width:480px;margin:6vh auto;padding:30px;background:#0c101b;border:1px solid #713047;border-radius:20px;box-shadow:0 20px 70px #0008}
      .smit-admin-auth h1{margin:8px 0 10px}
      .smit-admin-auth label{display:grid;gap:7px;margin:14px 0;color:#c8cbd4;font-size:13px}
      .smit-admin-auth input{width:100%;box-sizing:border-box;background:#111724;color:#fff;border:1px solid #343b4a;border-radius:9px;padding:12px;font:inherit}
      .smit-admin-message{color:#ff91a5;min-height:24px;font-size:13px}
      .smit-admin-empty{padding:18px;color:#9299a8;text-align:center}
      @media(max-width:720px){.smit-admin-wrap{grid-template-columns:1fr}.smit-admin-side{padding:14px}.smit-admin-nav{grid-template-columns:repeat(2,minmax(0,1fr))}.smit-admin-head{align-items:flex-start;flex-direction:column}#smitAdminLauncher{right:12px;bottom:12px}}
    `;
    document.head.appendChild(style);
  }

  if (!$("smitAdminLauncher")) {
    const launcher = document.createElement("button");
    launcher.id = "smitAdminLauncher";
    launcher.type = "button";
    launcher.textContent = "✦  SMIT ADMIN";
    launcher.addEventListener("click", () => routeTo("profile"));
    document.body.appendChild(launcher);
  }

  const adminDefaults = {
    ownerName: "SMIT", tasks: [], projects: [], habits: [], notes: [],
    finances: [], privateItems: [], progress: 0
  };
  const adminEsc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function adminSession() {
    try { return JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY) || "null"); } catch { return null; }
  }
  function setAdminSession(value) {
    if (value) sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
  async function adminRequest(path, options = {}, token = null) {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      ...options,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        ...(token ? {Authorization:`Bearer ${token}`} : {}),
        ...(options.headers || {})
      }
    });
    const raw = await response.text();
    let body = null;
    try { body = raw ? JSON.parse(raw) : null; } catch { body = raw; }
    if (!response.ok) throw new Error(body?.msg || body?.message || body?.error_description || body?.error || `خطای سرور (${response.status})`);
    return body;
  }
  async function adminRefreshSession() {
    const session = adminSession();
    if (!session?.refresh_token) return null;
    try {
      const fresh = await adminRequest("/auth/v1/token?grant_type=refresh_token", {
        method:"POST", body:JSON.stringify({refresh_token:session.refresh_token})
      });
      setAdminSession(fresh);
      return fresh;
    } catch { setAdminSession(null); return null; }
  }
  async function adminLoadData(session) {
    const rows = await adminRequest(`/rest/v1/admin_data?section=eq.${encodeURIComponent(ADMIN_SECTION)}&select=data`, {method:"GET"}, session.access_token);
    return {...adminDefaults, ...(Array.isArray(rows) && rows[0]?.data ? rows[0].data : {})};
  }
  async function adminSaveData() {
    const session = adminSession();
    if (!session?.access_token || !adminState) return;
    const payload = {user_id:session.user.id,section:ADMIN_SECTION,data:adminState,updated_at:new Date().toISOString()};
    try {
      await adminRequest("/rest/v1/admin_data?on_conflict=user_id%2Csection", {
        method:"POST", headers:{Prefer:"resolution=merge-duplicates,return=minimal"}, body:JSON.stringify(payload)
      }, session.access_token);
    } catch (error) {
      const refreshed = await adminRefreshSession();
      if (!refreshed) { toast("نشست ورود منقضی شده؛ دوباره وارد شو."); return; }
      payload.user_id = refreshed.user.id;
      await adminRequest("/rest/v1/admin_data?on_conflict=user_id%2Csection", {
        method:"POST", headers:{Prefer:"resolution=merge-duplicates,return=minimal"}, body:JSON.stringify(payload)
      }, refreshed.access_token);
    }
  }
  const adminPages = [
    ["overview","⌂","Dashboard"],["tasks","✓","Task Manager"],["projects","◇","Project Hub"],
    ["habits","↗","Time & Habits"],["notes","▤","Knowledge Vault"],["finances","＄","Finance Tracker"],
    ["private","◆","Private Vault"],["settings","⚙","Settings"]
  ];
  function adminLoginView(message = "") {
    dynamicPage.innerHTML = `<section class="smit-admin-auth"><div class="smit-admin-brand">SMIT<span> ADMIN</span></div><span class="smit-admin-kicker">PRIVATE OWNER ACCESS</span><h1>ورود به فضای اختصاصی</h1><p class="smit-admin-muted">برای ورود از ایمیل و رمز عبوری استفاده کن که در بخش Authentication پروژه Supabase ساخته‌ای.</p><form id="smitAdminLogin"><label>ایمیل<input id="smitAdminEmail" type="email" required autocomplete="username" placeholder="ایمیل حساب Supabase"></label><label>رمز عبور<input id="smitAdminPassword" type="password" required autocomplete="current-password" placeholder="رمز عبور"></label><button class="smit-admin-primary" type="submit">ورود امن به SMIT ADMIN ↗</button><p class="smit-admin-message" id="smitAdminMessage">${adminEsc(message)}</p></form><p class="smit-admin-muted">ورود و دسترسی اطلاعات توسط Supabase Auth و سیاست‌های RLS کنترل می‌شود.</p></section>`;
    dynamicPage.querySelector("#smitAdminLogin")?.addEventListener("submit", async event => {
      event.preventDefault();
      if (adminBusy) return;
      adminBusy = true;
      const msg = $("smitAdminMessage");
      const button = dynamicPage.querySelector('button[type="submit"]');
      button.disabled = true; msg.textContent = "در حال بررسی اطلاعات ورود...";
      try {
        const session = await adminRequest("/auth/v1/token?grant_type=password", {
          method:"POST", body:JSON.stringify({email:$("smitAdminEmail").value.trim(),password:$("smitAdminPassword").value})
        });
        setAdminSession(session);
        adminState = await adminLoadData(session);
        showProfile("overview");
      } catch (error) {
        msg.textContent = /email not confirmed/i.test(error.message)
          ? "ایمیل حساب هنوز تأیید نشده است. در Supabase → Authentication → Users کاربر را تأیید کن."
          : `ورود ناموفق بود: ${error.message}`;
      } finally { adminBusy = false; if (button.isConnected) button.disabled = false; }
    });
  }
  function showProfile(route) {
    dynamicPage = dynamicPage || $("dynamicPage");
    if (!dynamicPage) return;
    setMainMode("profile");
    const session = adminSession();
    if (!session?.access_token) { adminLoginView(); return; }
    if (!adminState) {
      dynamicPage.innerHTML = '<div class="smit-admin-empty">در حال دریافت اطلاعات خصوصی از Supabase...</div>';
      adminLoadData(session).then(data => { adminState=data; showProfile(route); }).catch(async error => {
        const refreshed=await adminRefreshSession();
        if(refreshed){adminState=await adminLoadData(refreshed);showProfile(route);}
        else {setAdminSession(null);adminLoginView(error.message);}
      });
      return;
    }
    const active = adminPages.some(p=>p[0]===route) ? route : "overview";
    const d = adminState;
    const countDone = d.tasks.filter(x=>x.done).length;
    const list = (items, type, empty) => items.length ? items.map((item,index)=>`<div class="smit-admin-row"><span>${type==="notes"||type==="private"?adminEsc(item.text):adminEsc(item.title||item.name||item.text||"—")}</span><button class="smit-admin-danger" data-admin-delete="${type}" data-index="${index}">حذف</button></div>`).join("") : `<div class="smit-admin-empty">${empty}</div>`;
    let body = "";
    if(active==="overview") body = `<div class="smit-admin-grid"><div class="smit-admin-stat"><span class="smit-admin-muted">TASKS</span><b>${d.tasks.length}</b><small>کل کارها</small></div><div class="smit-admin-stat"><span class="smit-admin-muted">COMPLETED</span><b>${countDone}</b><small>کارهای انجام‌شده</small></div><div class="smit-admin-stat"><span class="smit-admin-muted">PROJECTS</span><b>${d.projects.length}</b><small>پروژه‌ها</small></div><div class="smit-admin-stat"><span class="smit-admin-muted">PRIVATE NOTES</span><b>${d.notes.length+d.privateItems.length}</b><small>یادداشت‌ها</small></div></div><section class="smit-admin-panel"><h2>اتاق فرمان شخصی</h2><p class="smit-admin-muted">اطلاعات این فضا به حساب کاربری تو در Supabase متصل است و بین دستگاه‌ها قابل دسترسی خواهد بود.</p><p>سلام ${adminEsc(d.ownerName||"SMIT")}، به SMIT ADMIN خوش آمدی.</p></section>`;
    if(active==="tasks") body = `<section class="smit-admin-panel"><h2>Task Manager</h2><form class="smit-admin-form" id="adminAddTask"><input id="adminItemInput" required maxlength="160" placeholder="کار جدید..."><button class="smit-admin-primary">افزودن کار</button></form>${list(d.tasks,"tasks","هنوز کاری ثبت نشده است.")}</section>`;
    if(active==="projects") body = `<section class="smit-admin-panel"><h2>Project Hub</h2><form class="smit-admin-form" id="adminAddProject"><input id="adminItemInput" required maxlength="160" placeholder="نام پروژه..."><button class="smit-admin-primary">افزودن پروژه</button></form>${list(d.projects,"projects","پروژه‌ای ثبت نشده است.")}</section>`;
    if(active==="habits") body = `<section class="smit-admin-panel"><h2>Time & Habits</h2><form class="smit-admin-form" id="adminAddHabit"><input id="adminItemInput" required maxlength="120" placeholder="عادت یا برنامه روزانه..."><button class="smit-admin-primary">افزودن</button></form>${list(d.habits,"habits","هنوز عادتی ثبت نشده است.")}</section>`;
    if(active==="notes") body = `<section class="smit-admin-panel"><h2>Knowledge Vault</h2><form class="smit-admin-form" id="adminAddNote"><textarea id="adminItemInput" required maxlength="5000" placeholder="یادداشت یا دانسته جدید..."></textarea><button class="smit-admin-primary">ذخیره یادداشت</button></form>${list(d.notes,"notes","دفتر دانش خالی است.")}</section>`;
    if(active==="finances") body = `<section class="smit-admin-panel"><h2>Finance Tracker</h2><form class="smit-admin-form" id="adminAddFinance"><input id="adminItemInput" required maxlength="160" placeholder="عنوان هزینه/درآمد"><input id="adminAmount" type="number" min="0" required placeholder="مبلغ"><select id="adminKind"><option value="expense">هزینه</option><option value="income">درآمد</option></select><button class="smit-admin-primary">ثبت</button></form>${list(d.finances,"finances","تراکنشی ثبت نشده است.")}</section>`;
    if(active==="private") body = `<section class="smit-admin-panel"><h2>Private Vault</h2><p class="smit-admin-muted">برای نگهداری یادداشت‌های شخصی غیرحساس؛ رمزها و کلیدهای دسترسی را اینجا ذخیره نکن.</p><form class="smit-admin-form" id="adminAddPrivate"><textarea id="adminItemInput" required maxlength="5000" placeholder="یادداشت خصوصی..."></textarea><button class="smit-admin-primary">ذخیره</button></form>${list(d.privateItems,"private","مورد خصوصی ثبت نشده است.")}</section>`;
    if(active==="settings") body = `<section class="smit-admin-panel"><h2>Settings</h2><label class="smit-admin-field">نام نمایشی<input id="adminOwnerName" maxlength="40" value="${adminEsc(d.ownerName||"SMIT")}"></label><button class="smit-admin-primary" id="adminSaveName">ذخیره نام</button><hr><p class="smit-admin-muted">اطلاعات شخصی با RLS به شناسه حساب واردشده محدود شده است.</p><button class="smit-admin-action" id="adminExport">دریافت نسخه پشتیبان JSON</button><button class="smit-admin-action" id="adminLogout">خروج از حساب</button></section>`;
    dynamicPage.innerHTML = `<section class="smit-admin-wrap"><aside class="smit-admin-side"><div class="smit-admin-brand">SMIT<span> ADMIN</span></div><span class="smit-admin-kicker">PERSONAL COMMAND CENTER</span><nav class="smit-admin-nav">${adminPages.map(([id,icon,label])=>`<button type="button" data-admin-page="${id}" class="${id===active?"active":""}">${icon} &nbsp; ${label}</button>`).join("")}</nav><button class="smit-admin-action" id="adminBackHome">← بازگشت به SMIT AI</button></aside><div class="smit-admin-main"><header class="smit-admin-head"><div><span class="smit-admin-kicker">PRIVATE WORKSPACE / OWNER</span><h1>${adminPages.find(p=>p[0]===active)[2]}</h1></div><span class="smit-admin-muted">● CONNECTED</span></header>${body}</div></section>`;
    dynamicPage.querySelectorAll("[data-admin-page]").forEach(button=>button.addEventListener("click",()=>showProfile(button.dataset.adminPage)));
    dynamicPage.querySelector("#adminBackHome")?.addEventListener("click",()=>routeTo("home"));
    dynamicPage.querySelector("#adminLogout")?.addEventListener("click",()=>{setAdminSession(null);adminState=null;adminLoginView();});
    dynamicPage.querySelector("#adminSaveName")?.addEventListener("click",async()=>{d.ownerName=$("adminOwnerName").value.trim()||"SMIT";await adminSaveData();showProfile("settings");});
    dynamicPage.querySelector("#adminExport")?.addEventListener("click",()=>{const blob=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="smit-admin-backup.json";a.click();URL.revokeObjectURL(url);});
    dynamicPage.querySelectorAll("[data-admin-delete]").forEach(button=>button.addEventListener("click",async()=>{const arr=d[button.dataset.adminDelete];arr.splice(Number(button.dataset.index),1);await adminSaveData();showProfile(active);}));
    const addForms = {adminAddTask:["tasks","title"],adminAddProject:["projects","title"],adminAddHabit:["habits","title"],adminAddNote:["notes","text"],adminAddPrivate:["privateItems","text"],adminAddFinance:["finances","title"]};
    Object.entries(addForms).forEach(([formId,[key,field]])=>dynamicPage.querySelector(`#${formId}`)?.addEventListener("submit",async event=>{
      event.preventDefault();const value=$("adminItemInput")?.value.trim();if(!value)return;
      const item={ [field]:value, createdAt:new Date().toISOString() };
      if(key==="finances"){item.amount=Number($("adminAmount").value);item.kind=$("adminKind").value;}
      d[key].push(item);await adminSaveData();showProfile(active);
    }));
  }
  function restoreProfile() {
    // The old profile panel is intentionally replaced by the SMIT ADMIN launcher.
  }
  function legacyNavigate(route) {
    const link = document.querySelector(`.sidebar [data-page="${route}"]`) ||
      document.querySelector(`.sidebar a[href="#${route}"]`);
    if (link) {
      link.__smitInternalRoute = true;
      link.click();
      delete link.__smitInternalRoute;
    }
  }
  function routeTo(route, push=true) {
    if (!route) route = "home";
    if (route === "my-profile" || route.startsWith("my-")) { route = "profile"; }
    if (!routeIds.includes(route)) route = "home";
    if (push) history.pushState({smitRoute:route},"","#"+route);
    if (route === "profile") {
      restoreProfile();
      showProfile(route);
      return;
    }
    restoreProfile();
    if (route === "home") {
      setMainMode("home");
      if (dynamicPage) dynamicPage.innerHTML = "";
      if (window.SMITNavigate) window.SMITNavigate("home"); else legacyNavigate("home");
    } else {
      setMainMode(route);
      if (window.SMITNavigate) window.SMITNavigate(route); else legacyNavigate(route);
    }
  }

  document.addEventListener("click", event => {
    const internalOrigin = event.target.closest("a,button");
    if (internalOrigin?.__smitInternalRoute) return;
    const profileToggle = null;
    const nav = event.target.closest(".sidebar .nav-item, .sidebar .brand");
    const target = nav;
    if (!target) return;
    if (target.matches(".brand")) { event.preventDefault(); event.stopImmediatePropagation(); routeTo("home"); return; }
    const route = target.dataset.page || (target.getAttribute("href") || "").replace(/^#/,"");
    if (!routeIds.includes(route)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    history.pushState({smitRoute:route},"","#"+route);
    restoreProfile();
    setMainMode(route);
    if (window.SMITNavigate) window.SMITNavigate(route);
    else if (route === "home") { if(dynamicPage)dynamicPage.innerHTML=""; }
    else legacyNavigate(route);
  }, true);

  window.addEventListener("popstate", () => routeTo(location.hash.slice(1) || "home", false));
  window.addEventListener("hashchange", () => {
    const route = location.hash.slice(1) || "home";
    if (route !== activeRoute) routeTo(route, false);
  });
  const initial = location.hash.slice(1) || "home";
  if (initial === "profile" || initial === "my-profile") {
    setTimeout(() => routeTo(initial, false), 0);
  } else if (routeIds.includes(initial) && initial !== "home") {
    setTimeout(() => { setMainMode(initial); if(window.SMITNavigate)window.SMITNavigate(initial);else legacyNavigate(initial); }, 0);
  } else {
    setMainMode("home");
  }

  // Currency rates: only render values returned by the live reference-rate service.
  const fxBox=$("smitFxRates"), fxUpdated=$("smitFxUpdated"), fxRefresh=$("smitFxRefresh");
  const fxSymbols=[["USD","دلار آمریکا"],["EUR","یورو"],["GBP","پوند"],["TRY","لیر ترکیه"],["AED","درهم امارات"],["JPY","ین ژاپن"],["CHF","فرانک سوئیس"],["CAD","دلار کانادا"],["AUD","دلار استرالیا"],["IRR","ریال ایران"]];
  async function loadFx(){
    if(!fxBox)return;
    fxRefresh && (fxRefresh.disabled=true);
    fxBox.innerHTML='<p class="smit-live-status">در حال دریافت نرخ مرجع جهانی...</p>';
    try{
      const response=await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP,TRY,AED,JPY,CHF,CAD,AUD",{cache:"no-store"});
      if(!response.ok)throw new Error("FX service unavailable");
      const data=await response.json();
      if(!data.rates || !data.date)throw new Error("No FX data");
      const rows=fxSymbols.filter(([code])=>code==="USD"||Number.isFinite(data.rates[code]));
      fxBox.innerHTML=rows.map(([code,label])=>`<div class="smit-fx-rate"><b>${code}</b><strong>${(code==="USD"?1:data.rates[code]).toLocaleString("en-US",{maximumFractionDigits:4})}</strong><small>${label} · به‌ازای ۱ USD</small></div>`).join("");
      fxUpdated.textContent=`آخرین داده: ${data.date} · دریافت: ${new Date().toLocaleTimeString("fa-IR")}`;
    }catch(err){
      fxBox.innerHTML='<div class="smit-global-live-error">در حال حاضر دریافت نرخ ارز ممکن نیست. برای جلوگیری از نمایش اطلاعات نادرست، نرخ قبلی یا ساختگی نشان داده نمی‌شود.</div>';
      if(fxUpdated)fxUpdated.textContent="بروزرسانی ناموفق · سرویس در دسترس نیست";
    }finally{if(fxRefresh)fxRefresh.disabled=false;}
  }
  fxRefresh?.addEventListener("click",loadFx);
  loadFx();

  // Open-Meteo current weather and geocoding.
  const weatherDetail=$("smitWeatherDetail"), weatherUpdated=$("smitWeatherUpdated"), weatherStatus=$("smitWeatherStatus");
  const weatherCodes={0:"آسمان صاف",1:"عمدتاً صاف",2:"نیمه‌ابری",3:"ابری",45:"مه",48:"مه یخ‌زده",51:"نم‌نم باران",53:"باران ریز",55:"باران ریز شدید",61:"باران",63:"باران متوسط",65:"باران شدید",71:"برف",73:"برف متوسط",75:"برف شدید",80:"رگبار",81:"رگبار متوسط",82:"رگبار شدید",95:"رعدوبرق",96:"رعدوبرق و تگرگ",99:"رعدوبرق شدید"};
  let activeCountryTimezone="UTC";
  function updateCountryClock(timezone=activeCountryTimezone){
    activeCountryTimezone=timezone||"UTC";
    const timeNode=$("smitCountryClockTime"),dateNode=$("smitCountryClockDate");
    if(!timeNode||!dateNode)return;
    try{
      const now=new Date();
      timeNode.textContent=new Intl.DateTimeFormat("en-GB-u-ca-gregory-nu-latn",{timeZone:activeCountryTimezone,hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).format(now);
      dateNode.textContent=new Intl.DateTimeFormat("en-GB-u-ca-gregory-nu-latn",{timeZone:activeCountryTimezone,weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(now);
    }catch(error){timeNode.textContent="Unavailable";dateNode.textContent="Timezone data unavailable";}
  }
  window.setInterval(()=>updateCountryClock(),1000);
  async function weatherForPlace(name, lat, lon, country=""){
    if(!weatherDetail)return;
    weatherDetail.querySelector("h3").textContent=name;
    weatherStatus.textContent="در حال دریافت داده زنده از Open-Meteo...";
    try{
      const url=`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
      const response=await fetch(url,{cache:"no-store"});
      if(!response.ok)throw new Error("Weather unavailable");
      const data=await response.json(), c=data.current;
      if(!c || !Number.isFinite(c.temperature_2m))throw new Error("Missing current weather");
      const condition=weatherCodes[c.weather_code]||"وضعیت نامشخص";
      const timezone=String(data.timezone||"UTC");
      weatherDetail.innerHTML=`<span class="smit-kicker">LIVE WEATHER · ${String(country||"").toUpperCase()}</span><h3>${name}</h3><div class="smit-weather-condition">${condition} ${c.is_day?"☀":"☾"}</div><div class="smit-weather-metrics"><div class="smit-weather-metric"><small>دما</small><strong>${Math.round(c.temperature_2m)}°C</strong></div><div class="smit-weather-metric"><small>دمای احساسی</small><strong>${Math.round(c.apparent_temperature)}°C</strong></div><div class="smit-weather-metric"><small>رطوبت</small><strong>${c.relative_humidity_2m}%</strong></div><div class="smit-weather-metric"><small>سرعت باد</small><strong>${c.wind_speed_10m} km/h</strong></div></div><div class="smit-country-clock" data-timezone="${timezone}"><div><span class="smit-kicker">LOCAL TIME · GREGORIAN</span><strong class="smit-country-clock-time" id="smitCountryClockTime">--:--:--</strong><small class="smit-country-clock-date" id="smitCountryClockDate">Loading local date…</small></div><span class="smit-country-timezone">${timezone}</span></div><p class="smit-weather-status">بارش: ${c.precipitation} mm · منطقه زمانی: ${timezone}</p>`;
      updateCountryClock(timezone);
      weatherStatus.textContent="داده زنده با موفقیت دریافت شد.";
      weatherUpdated.textContent=`آخرین دریافت: ${new Date().toLocaleTimeString("fa-IR")} · ${c.time||""}`;
    }catch(err){
      weatherStatus.textContent="اطلاعات آب‌وهوا در دسترس نیست؛ سرویس پاسخ معتبر نداد.";
      weatherUpdated.textContent="دریافت ناموفق";
      weatherDetail.querySelector("h3").textContent=name;
      weatherDetail.querySelector("p")?.remove();
      const error=document.createElement("div");error.className="smit-global-live-error";error.textContent="در حال حاضر امکان دریافت وضعیت زنده این منطقه وجود ندارد. داده تخمینی یا ساختگی نمایش داده نمی‌شود.";weatherDetail.appendChild(error);
    }
  }
  async function geocodeAndWeather(query){
    const q=String(query||"").trim();if(!q)return;
    weatherStatus && (weatherStatus.textContent="در حال جست‌وجوی مکان...");
    try{
      const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=fa&format=json`,{cache:"no-store"});
      if(!r.ok)throw new Error("Geocoding unavailable");
      const d=await r.json(), place=d.results?.[0];if(!place)throw new Error("Place not found");
      await weatherForPlace([place.name,place.admin1,place.country].filter(Boolean).join(" · "),place.latitude,place.longitude,place.country);
    }catch(e){if(weatherStatus)weatherStatus.textContent="مکان پیدا نشد یا سرویس جست‌وجو در دسترس نیست.";}
  }
  $("smitWeatherSearchBtn")?.addEventListener("click",()=>geocodeAndWeather($("smitWeatherSearch")?.value));
  $("smitWeatherSearch")?.addEventListener("keydown",e=>{if(e.key==="Enter")geocodeAndWeather(e.currentTarget.value);});

  // True interactive 3D globe with clickable country polygons.
  async function loadGlobe(){
    const host=$("smitEarthGlobe");if(!host)return;
    try{
      await new Promise((resolve,reject)=>{
        if(window.Globe)return resolve();
        const s=document.createElement("script");s.src="https://unpkg.com/globe.gl";s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
      });
      const geoResponse=await fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson",{cache:"force-cache"});
      if(!geoResponse.ok)throw new Error("Country map unavailable");
      const geo=await geoResponse.json();
      const features=(geo.features||[]).filter(f=>f.geometry&&f.properties);
      const globe=window.Globe()(host)
        .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
        .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
        .backgroundColor("rgba(0,0,0,0)")
        .showAtmosphere(true).atmosphereColor("#55bfff").atmosphereAltitude(0.18)
        .polygonsData(features)
        .polygonCapColor(()=> "rgba(43,153,210,0.10)")
        .polygonSideColor(()=> "rgba(46,153,215,0.08)")
        .polygonStrokeColor(()=> "rgba(125,207,255,0.45)")
        .polygonAltitude(0.006)
        .onPolygonClick(feature=>{
          const p=feature.properties||{}, geom=feature.geometry;
          const name=p.ADMIN||p.NAME||p.NAME_EN||"Selected region";
          let lon=Number(p.LABEL_X),lat=Number(p.LABEL_Y);
          if(!Number.isFinite(lon)||!Number.isFinite(lat)){
            const ring=geom.type==="Polygon"?geom.coordinates[0]:geom.coordinates?.[0]?.[0];
            if(!ring?.length)return;
            const xs=ring.map(v=>v[0]),ys=ring.map(v=>v[1]);
            lon=(Math.min(...xs)+Math.max(...xs))/2;lat=(Math.min(...ys)+Math.max(...ys))/2;
          }
          globe.pointOfView({lat,lng:lon,altitude:1.65},700);
          weatherForPlace(name,lat,lon,p.ADMIN||"");
        });
      const controls=globe.controls();controls.autoRotate=true;controls.autoRotateSpeed=0.45;controls.enableDamping=true;
      globe.pointOfView({lat:22,lng:18,altitude:2.25},0);
      window.addEventListener("resize",()=>globe.width(host.clientWidth).height(host.clientHeight));
      setTimeout(()=>globe.width(host.clientWidth).height(host.clientHeight),250);
    }catch(err){
      host.innerHTML='<div class="smit-global-live-error">کره سه‌بعدی یا نقشه کشورها بارگذاری نشد. اتصال CDN و سرویس نقشه را بررسی کن؛ در این وضعیت نقشه ثابت یا تعاملیِ جعلی نمایش داده نمی‌شود.</div>';
    }
  }
  loadGlobe();
})();


/* SMIT AI — Complete English path A1–C2 (24 lesson curriculum) */
(() => {
  "use strict";
  const KEY = "smitAI_english_complete_v2";
  const levels = [
    {id:"A1",name:"Beginner",fa:"مبتدی",desc:"ساخت پایه‌های زبان، معرفی خود و نیازهای روزمره"},
    {id:"A2",name:"Elementary",fa:"پایه",desc:"تعامل در سفر، خرید، سلامت و تجربه‌های ساده"},
    {id:"B1",name:"Intermediate",fa:"متوسط",desc:"ارتباط مستقل، کار، فناوری و بیان نظر"},
    {id:"B2",name:"Upper-Intermediate",fa:"متوسط رو به پیشرفته",desc:"بحث دقیق، نوشتار منسجم و زبان حرفه‌ای"},
    {id:"C1",name:"Advanced",fa:"پیشرفته",desc:"زبان آکادمیک، انتزاعی و حرفه‌ای با دقت بالا"},
    {id:"C2",name:"Proficiency",fa:"تسلط پیشرفته",desc:"ظرافت معنایی، سبک، استدلال و تسلط نزدیک به بومی"}
  ];
  // Each lesson: title, grammar rule, example, Persian example, 6 vocabulary items, 2 useful phrases.
  const raw = {
A1:[
["Greetings & Introductions","فعل be در جمله‌های مثبت و منفی","I am Smit. / She isn't a teacher.","من اسمیت هستم. / او معلم نیست.",[["hello","سلام","Hello, my name is Sara."],["name","نام","What is your name?"],["friend","دوست","Ali is my friend."],["student","دانش‌آموز","I am a student."],["country","کشور","Iran is my country."],["welcome","خوش آمدی","Welcome to our class."]],[["Nice to meet you.","از آشنایی با شما خوشحالم."],["Where are you from?","اهل کجا هستی؟"]]],
["Family & People","ضمیرهای فاعلی و صفات ملکی؛ I/my, he/his, they/their","This is my sister. Her name is Mina.","این خواهر من است. اسم او میناست.",[["mother","مادر","My mother is kind."],["father","پدر","His father is a driver."],["sister","خواهر","I have one sister."],["brother","برادر","My brother is tall."],["parents","والدین","My parents are at home."],["family","خانواده","We are a small family."]],[["How many brothers do you have?","چند برادر داری؟"],["This is my family.","این خانواده من است."]]],
["Food & Daily Needs","اسم‌های قابل‌شمارش و غیرقابل‌شمارش؛ a/an و some/any","I'd like an apple and some water.","یک سیب و مقداری آب می‌خواهم.",[["bread","نان","I eat bread for breakfast."],["water","آب","Please drink some water."],["apple","سیب","She has an apple."],["rice","برنج","We cook rice for dinner."],["milk","شیر","There is some milk."],["menu","منو","Can I see the menu?"]],[["I'd like a cup of tea.","یک فنجان چای می‌خواهم."],["How much is it?","قیمتش چقدر است؟"]]],
["Places & Simple Routines","حال ساده؛ سوم‌شخص مفرد و قیدهای تکرار","He works every day. I usually study at night.","او هر روز کار می‌کند. من معمولاً شب‌ها درس می‌خوانم.",[["work","کار کردن","I work in a shop."],["study","درس خواندن","They study English."],["usually","معمولاً","I usually wake up early."],["always","همیشه","She always smiles."],["station","ایستگاه","The station is near here."],["hospital","بیمارستان","The hospital is big."]],[["What time do you get up?","چه ساعتی بیدار می‌شوی؟"],["I go to work by bus.","با اتوبوس به محل کار می‌روم."]]]
],
A2:[
["Travel & Transport","گذشته ساده؛ افعال باقاعده و بی‌قاعده","We visited Ankara and took a train.","ما از آنکارا دیدن کردیم و قطار سوار شدیم.",[["journey","سفر","The journey was long."],["luggage","چمدان و بار","My luggage is heavy."],["platform","سکوی قطار","The train leaves from platform two."],["booking","رزرو","I made a hotel booking."],["abroad","خارج از کشور","She wants to study abroad."],["delay","تأخیر","The flight has a delay."]],[["How can I get to the airport?","چطور می‌توانم به فرودگاه بروم؟"],["I'd like to check in.","می‌خواهم پذیرش پرواز را انجام دهم."]]],
["Health & Lifestyle","should / shouldn't برای توصیه و have to برای الزام","You should rest, and you have to take this medicine.","باید استراحت کنی و لازم است این دارو را مصرف کنی.",[["appointment","وقت ملاقات","I have a doctor's appointment."],["symptom","نشانه بیماری","A fever is a common symptom."],["healthy","سالم","Walking keeps you healthy."],["exercise","ورزش","I exercise three times a week."],["medicine","دارو","Take your medicine after food."],["headache","سردرد","I have a headache."]],[["I've got a sore throat.","گلودرد دارم."],["You should get some rest.","بهتر است کمی استراحت کنی."]]],
["Work & Education","حال استمراری در برابر حال ساده","I usually work at home, but today I am studying at the library.","معمولاً در خانه کار می‌کنم، اما امروز در کتابخانه درس می‌خوانم.",[["colleague","همکار","My colleague is helpful."],["deadline","مهلت نهایی","The deadline is Friday."],["meeting","جلسه","We have a meeting at ten."],["skill","مهارت","English is an important skill."],["course","دوره آموزشی","I am taking an online course."],["experience","تجربه","She has work experience."]],[["Could you explain that again?","ممکن است دوباره توضیح بدهید؟"],["I'm responsible for this task.","مسئول این وظیفه من هستم."]]],
["Experiences & Plans","حال کامل با ever/never و going to برای برنامه","I have never flown, but I'm going to travel next year.","تا حالا پرواز نکرده‌ام، اما قصد دارم سال بعد سفر کنم.",[["experience","تجربه","It was an amazing experience."],["recently","اخیراً","I have recently moved."],["already","قبلاً / همین حالا","She has already finished."],["yet","هنوز","Have you eaten yet?"],["plan","برنامه","We have a plan."],["opportunity","فرصت","This is a great opportunity."]],[["Have you ever been to Italy?","تا به حال ایتالیا بوده‌ای؟"],["I'm planning to improve my English.","برنامه دارم انگلیسی‌ام را بهتر کنم."]]]
],
B1:[
["Communication & Opinions","افعال گزارشی و ساختارهای بیان نظر؛ I think / I believe / In my view","She explained that the meeting had changed.","او توضیح داد که جلسه تغییر کرده بود.",[["viewpoint","دیدگاه","Everyone has a different viewpoint."],["convince","متقاعد کردن","Facts can convince people."],["claim","ادعا کردن","He claims that it is true."],["evidence","مدرک","We need more evidence."],["suggest","پیشنهاد دادن","I suggest taking a break."],["attitude","نگرش","A positive attitude helps."]],[["As far as I'm concerned, ...","تا جایی که به من مربوط است..."],["I see your point, but ...","منظورت را می‌فهمم، اما..."]]],
["Technology & Digital Life","حال کامل استمراری و for/since","I've been learning Python for six months.","شش ماه است که پایتون یاد می‌گیرم.",[["device","دستگاه","This device saves time."],["privacy","حریم خصوصی","Online privacy matters."],["reliable","قابل اعتماد","Use a reliable source."],["update","به‌روزرسانی","The app needs an update."],["access","دسترسی","I can't access the file."],["efficient","کارآمد","This is an efficient method."]],[["The system is temporarily unavailable.","سامانه موقتاً در دسترس نیست."],["Make sure you back up your files.","حتماً از فایل‌هایت نسخه پشتیبان بگیر."]]],
["Environment & Society","جملات شرطی نوع اول و دوم","If cities improve public transport, pollution will decrease.","اگر شهرها حمل‌ونقل عمومی را بهتر کنند، آلودگی کاهش می‌یابد.",[["pollution","آلودگی","Air pollution is dangerous."],["resource","منبع","Water is a vital resource."],["reduce","کاهش دادن","We should reduce waste."],["sustainable","پایدار","We need sustainable energy."],["community","جامعه محلی","The community worked together."],["impact","تأثیر","The policy had a big impact."]],[["It would be better if we ...","اگر ما ...، بهتر می‌شد."],["One possible solution is ...","یک راه‌حل ممکن این است که..."]]],
["Goals & Problem Solving","مصدر و gerund پس از فعل‌ها؛ decide to / avoid doing","She decided to apply and avoided making excuses.","او تصمیم گرفت درخواست بدهد و از بهانه آوردن دوری کرد.",[["achieve","دستیابی پیدا کردن","You can achieve your goals."],["obstacle","مانع","Lack of time is an obstacle."],["approach","رویکرد","Try a different approach."],["improve","بهبود دادن","Practice will improve your skills."],["require","نیاز داشتن","This job requires patience."],["solution","راه‌حل","We found a solution."]],[["Let's break the problem into steps.","بیایید مسئله را به چند مرحله تقسیم کنیم."],["I'm working towards a long-term goal.","برای رسیدن به یک هدف بلندمدت تلاش می‌کنم."]]]
],
B2:[
["Academic Discussion & Argument","وارونگی تأکیدی پس از عباراتی مانند Not only / Rarely","Not only did the plan save money, but it also improved quality.","این برنامه نه‌تنها هزینه را کاهش داد، بلکه کیفیت را نیز بهتر کرد.",[["assumption","فرض","The argument is based on a false assumption."],["counterargument","استدلال مخالف","Consider the strongest counterargument."],["substantial","قابل‌توجه","There is substantial evidence."],["justify","توجیه کردن","How can we justify this decision?"],["perspective","دیدگاه","Consider another perspective."],["implication","پیامد ضمنی","The implications are serious."]],[["There is strong evidence to suggest that ...","شواهد محکمی وجود دارد که نشان می‌دهد..."],["I would challenge the assumption that ...","من این فرض را به چالش می‌کشم که..."]]],
["Business & Negotiation","شرطی سوم و mixed conditionals","If we had invested earlier, we would be leading the market now.","اگر زودتر سرمایه‌گذاری کرده بودیم، اکنون پیشتاز بازار بودیم.",[["negotiate","مذاکره کردن","They negotiated a new contract."],["revenue","درآمد","Revenue increased this year."],["stakeholder","ذی‌نفع","Every stakeholder was consulted."],["proposal","پیشنهاد رسمی","We reviewed your proposal."],["feasible","امکان‌پذیر","The deadline is feasible."],["allocate","اختصاص دادن","Allocate resources carefully."]],[["What room do we have for negotiation?","برای مذاکره چه فضایی داریم؟"],["Let's agree on the key terms first.","ابتدا درباره شروط اصلی توافق کنیم."]]],
["Media & Critical Thinking","جملات موصولی پیشرفته و reduced relative clauses","The report published yesterday raises several questions.","گزارشی که دیروز منتشر شد چندین پرسش مطرح می‌کند.",[["misleading","گمراه‌کننده","The headline is misleading."],["bias","سوگیری","We should recognize media bias."],["verify","راستی‌آزمایی کردن","Always verify the source."],["credible","معتبر","Is the source credible?"],["interpret","تفسیر کردن","People interpret data differently."],["context","زمینه","Context changes the meaning."]],[["The information needs to be verified.","این اطلاعات باید راستی‌آزمایی شود."],["That conclusion doesn't necessarily follow.","آن نتیجه لزوماً از این مقدمات به دست نمی‌آید."]]],
["Advanced Writing & Emphasis","پیونددهنده‌های تضاد و امتیازدهی؛ although / whereas / notwithstanding","Although the method is costly, it is highly effective.","اگرچه این روش پرهزینه است، بسیار مؤثر است.",[["coherent","منسجم","Write a coherent argument."],["concise","مختصر و مفید","Keep the summary concise."],["whereas","درحالی‌که","Sales rose, whereas costs fell."],["nevertheless","بااین‌حال","Nevertheless, we continued."],["emphasize","تأکید کردن","The author emphasizes safety."],["consequently","درنتیجه","Consequently, the plan changed."]],[["Having said that, ...","با وجود این، ..."],["The main point I wish to emphasize is ...","نکته اصلی که می‌خواهم بر آن تأکید کنم این است که..."]]]
],
C1:[
["Abstract Ideas & Nuance","ساختارهای وجهی گذشته برای نقد و احتمال؛ might have / should have","The outcome might have been different under other conditions.","نتیجه ممکن بود در شرایط دیگری متفاوت باشد.",[["subtle","ظریف و نامحسوس","There is a subtle difference."],["ambiguous","دوپهلو","The wording is ambiguous."],["inherent","ذاتی","Risk is inherent in the process."],["notion","مفهوم","The notion is widely debated."],["underlying","زیربنایی","We must address underlying causes."],["nuance","ظرافت معنایی","Translation often loses nuance."]],[["The distinction is more subtle than it first appears.","این تمایز ظریف‌تر از چیزی است که در ابتدا به نظر می‌رسد."],["It would be premature to conclude that ...","نتیجه‌گیری درباره ... هنوز زود است."]]],
["Research & Evidence","وجه مجهول پیشرفته و reporting structures","The findings are believed to have been replicated.","باور بر این است که یافته‌ها تکرار شده‌اند.",[["methodology","روش‌شناسی","The methodology is clearly described."],["correlation","همبستگی","Correlation does not prove causation."],["empirical","تجربی و مبتنی بر مشاهده","The claim needs empirical support."],["replicate","تکرار کردن","Other teams replicated the study."],["validity","اعتبار","We questioned the validity of the test."],["constraint","محدودیت","Time is a major constraint."]],[["The data appears to indicate that ...","به نظر می‌رسد داده‌ها نشان می‌دهند که..."],["This interpretation should be treated with caution.","با این تفسیر باید با احتیاط برخورد کرد."]]],
["Leadership & Influence","وارونگی رسمی و cleft sentences برای تأکید","What matters most is how the team responds.","آنچه بیش از همه اهمیت دارد، نحوه واکنش تیم است.",[["articulate","شیوا بیان کردن","She articulated the vision clearly."],["delegate","واگذار کردن","Good leaders delegate effectively."],["consensus","اجماع","The team reached a consensus."],["accountability","پاسخ‌گویی","Accountability builds trust."],["resilient","تاب‌آور","A resilient team adapts quickly."],["initiative","ابتکار عمل","He showed great initiative."]],[["I would like to draw your attention to ...","می‌خواهم توجه شما را به ... جلب کنم."],["The responsibility ultimately rests with ...","مسئولیت در نهایت بر عهده ... است."]]],
["Rhetoric & Persuasion","concession، hedging و ساختارهای پیچیده برای استدلال","Admittedly, the proposal is ambitious; nonetheless, it is achievable.","البته این پیشنهاد بلندپروازانه است؛ بااین‌حال دست‌یافتنی است.",[["concede","پذیرفتن بخشی از نظر مخالف","I concede that the cost is high."],["plausible","باورپذیر","That is a plausible explanation."],["compelling","قانع‌کننده","She made a compelling case."],["undermine","تضعیف کردن","The error undermines the argument."],["premise","مقدمه استدلال","The premise is questionable."],["reinforce","تقویت کردن","Examples reinforce the point."]],[["To some extent, that is true; however, ...","تا حدی درست است؛ بااین‌حال..."],["I take the point, but it overlooks ...","این نکته را می‌پذیرم، اما ... را نادیده می‌گیرد."]]]
],
C2:[
["Precision & Idiomatic Language","وجه‌نمایی ظریف و inversion در سبک رسمی و ادبی","Little did we realise how decisive that moment would be.","اصلاً تصور نمی‌کردیم آن لحظه تا این اندازه سرنوشت‌ساز باشد.",[["meticulous","بسیار دقیق","The editor was meticulous."],["ostensibly","ظاهراً","The policy was ostensibly temporary."],["pervasive","فراگیر","The influence is pervasive."],["quintessential","نمونه کامل و شاخص","It is a quintessential example."],["fleeting","گذرا","It was a fleeting opportunity."],["unprecedented","بی‌سابقه","The change was unprecedented."]],[["That is, in essence, beside the point.","در اصل، این موضوع ربطی به اصل بحث ندارد."],["I wouldn't go so far as to say that ...","تا آنجا پیش نمی‌روم که بگویم..."]]],
["Literary Meaning & Register","جابه‌جایی سبک، حذف و ساختارهای موازی","Had it not been for her insight, the project might have failed.","اگر بینش او نبود، ممکن بود پروژه شکست بخورد.",[["connotation","بار معنایی ضمنی","The word carries a negative connotation."],["register","سطح و سبک زبانی","Choose the right register."],["allusion","اشاره غیرمستقیم","The poem contains a historical allusion."],["irony","طنز کنایه‌آمیز","The irony was unmistakable."],["eloquent","شیوا و فصیح","He gave an eloquent response."],["succinct","بسیار موجز","Her reply was succinct."]],[["The wording is deliberately understated.","انتخاب واژگان عمداً کم‌اغراق است."],["There is more to this than meets the eye.","ماجرا پیچیده‌تر از چیزی است که در نگاه اول به نظر می‌رسد."]]],
["Diplomacy & Professional Mastery","جملات شرطی معکوس و درخواست‌های بسیار مؤدبانه","Were you to reconsider, we could explore an alternative.","اگر مایل به تجدیدنظر باشید، می‌توانیم گزینه دیگری را بررسی کنیم.",[["discretion","صلاحدید و اختیار","Use your discretion."],["reciprocal","متقابل","The agreement is reciprocal."],["contentious","بحث‌برانگیز","It remains a contentious issue."],["accommodate","در نظر گرفتن و سازگار شدن","We can accommodate your request."],["provisional","موقت و مشروط","This is a provisional arrangement."],["unequivocal","صریح و بی‌ابهام","We need an unequivocal answer."]],[["Would it be unreasonable to suggest that ...?","آیا بی‌منطق است اگر پیشنهاد کنیم که...؟"],["I appreciate the constraints you are working under.","محدودیت‌هایی را که با آن‌ها روبه‌رو هستید درک می‌کنم."]]],
["Synthesis & Fluent Expression","ساختارهای ترکیبی پیشرفته و انسجام متن در سطح گفتمان","What the evidence points to, taken as a whole, is a systemic issue.","آنچه شواهد در مجموع نشان می‌دهند، یک مسئله ساختاری است.",[["synthesis","ترکیب و جمع‌بندی","The essay offers a synthesis of ideas."],["discrepancy","ناهمخوانی","There is a discrepancy in the figures."],["salient","برجسته و مهم","Focus on the salient points."],["exhaustive","جامع و کامل","The review was exhaustive."],["intrinsic","ذاتی","Curiosity is intrinsic to learning."],["discern","تشخیص دادن ظریف","It is difficult to discern the difference."]],[["Taken together, these factors suggest that ...","اگر این عوامل را کنار هم بگذاریم، نشان می‌دهند که..."],["The broader implications are difficult to overstate.","اهمیت پیامدهای گسترده‌تر را به‌سختی می‌توان بیش از حد دانست."]]]
]};
  const grammarNotes = {
    A1:["فعل be برای معرفی، نام، شغل و وضعیت به کار می‌رود. در منفی، not بعد از am/is/are می‌آید.","ضمیر فاعلی جای نام شخص یا چیز می‌نشیند؛ صفت ملکی قبل از اسم می‌آید و مالکیت را نشان می‌دهد.","اسم قابل‌شمارش مفرد معمولاً به a/an نیاز دارد؛ some در جمله مثبت و any بیشتر در پرسش و منفی استفاده می‌شود.","حال ساده برای عادت و واقعیت است. برای he/she/it معمولاً به فعل s یا es اضافه می‌کنیم؛ قید تکرار اغلب قبل از فعل اصلی می‌آید."],
    A2:["گذشته ساده برای رویداد تمام‌شده در گذشته است. فعل‌های باقاعده معمولاً ed می‌گیرند و فعل‌های بی‌قاعده شکل ویژه دارند.","should برای توصیه، shouldn't برای منع یا توصیه منفی و have to برای الزام و ضرورت استفاده می‌شود.","حال ساده عادت و برنامه ثابت را بیان می‌کند؛ حال استمراری برای کاری است که اکنون یا در بازه موقت در جریان است.","حال کامل با have/has + قسمت سوم فعل، تجربه یا نتیجه مرتبط با اکنون را بیان می‌کند. going to برای قصد و برنامه آینده است."],
    B1:["در نقل قول غیرمستقیم، گفته شخص را بدون نقل مستقیم بازگو می‌کنیم؛ با فعل گزارشی در گذشته، زمان جمله ممکن است یک مرحله به عقب برگردد.","حال کامل استمراری با have/has been + فعل ing ساخته می‌شود و بر مدت یا تداوم فعالیتی تا زمان حال تأکید می‌کند. for مدت و since نقطه شروع است.","شرطی نوع اول برای احتمال واقعی آینده و شرطی نوع دوم برای فرض غیرواقعی یا بعید در حال و آینده است.","بعد از بعضی فعل‌ها مصدر با to می‌آید (decide to do) و بعد از برخی دیگر gerund یا ing (avoid doing). ترکیب فعل را باید همراه آن یاد گرفت."],
    B2:["در وارونگی تأکیدی، پس از عبارت‌های منفی یا محدودکننده مانند Not only و Rarely، فعل کمکی پیش از فاعل می‌آید.","شرطی سوم درباره گذشته‌ای خلاف واقع است؛ mixed conditional پیامد اکنونی یک شرط فرضی در گذشته را بیان می‌کند.","جمله موصولی اطلاعاتی درباره اسم می‌دهد. در reduced relative clause گاهی ضمیر موصولی و فعل کمکی حذف می‌شوند و عبارت کوتاه‌تر می‌شود.","although و even though تضاد را نشان می‌دهند؛ whereas دو موضوع را مقایسه می‌کند و nevertheless نتیجه‌ای برخلاف انتظار را معرفی می‌کند."],
    C1:["might have + قسمت سوم برای احتمال درباره گذشته و should have برای انتقاد یا بیان کاری که بهتر بود در گذشته انجام می‌شد به کار می‌رود.","در ساختار مجهول گزارشی مانند is believed to، گوینده ادعا را به منبع یا باور عمومی نسبت می‌دهد و تمرکز را از فاعل برمی‌دارد.","cleft sentence با ساختارهایی مثل What matters is... بخش مهم جمله را برجسته می‌کند. وارونگی رسمی نیز برای تأکید یا سبک رسمی استفاده می‌شود.","hedging با عباراتی مانند may, appears to و to some extent قطعیت ادعا را کنترل می‌کند؛ concession بخشی از نظر مخالف را می‌پذیرد و سپس پاسخ می‌دهد."],
    C2:["وارونگی با عباراتی مانند Little did we know ساختاری ادبی و تأکیدی است؛ پس از عبارت منفی، فعل کمکی قبل از فاعل می‌آید.","در سبک پیشرفته، حذف بخش قابل‌پیش‌بینی و موازی‌سازی ساختارها متن را موجز و آهنگین می‌کند؛ register باید با مخاطب و موقعیت هماهنگ باشد.","در شرطی معکوس رسمی، if حذف می‌شود و فعل کمکی به ابتدای جمله می‌آید: Were you to... یا Had it not been for... .","در synthesis ایده‌ها و شواهد چند منبع را در یک استدلال منسجم ترکیب می‌کنیم؛ پیونددهنده‌ها رابطه منطقی بخش‌ها را روشن می‌کنند."]
  };
  const lessons = [];
  levels.forEach((level, li) => raw[level.id].forEach((r, idx) => lessons.push({
    id:`${level.id}-${idx+1}`, level:level.id, levelIndex:li, number:idx+1, title:r[0], grammar:r[1], grammarExplanation:grammarNotes[level.id][idx], rule:r[2], ruleFa:r[3],
    words:r[4].map(w=>({en:w[0],fa:w[1],example:w[2]})), phrases:r[5]
  })));
  // Expanded curriculum: exactly 25 vocabulary items and 18 grammar points per lesson.
  const extraVocabulary = {"A1-1": [["goodbye", "خداحافظ"], ["surname", "نام خانوادگی"], ["nickname", "لقب"], ["age", "سن"], ["address", "نشانی"], ["phone", "تلفن"], ["email", "ایمیل"], ["language", "زبان"], ["city", "شهر"], ["nationality", "ملیت"], ["afternoon", "بعدازظهر"], ["classmate", "هم‌کلاسی"], ["teacher", "معلم"], ["office", "دفتر"], ["job", "شغل"], ["address book", "دفترچه نشانی"], ["detail", "جزئیات"], ["example", "مثال"], ["purpose", "هدف"]], "A1-2": [["grandmother", "مادربزرگ"], ["grandfather", "پدربزرگ"], ["aunt", "عمه / خاله"], ["uncle", "عمو / دایی"], ["cousin", "پسرعمو / دخترعمو و..."], ["daughter", "دختر"], ["son", "پسر"], ["husband", "شوهر"], ["wife", "همسر"], ["child", "کودک"], ["children", "بچه‌ها"], ["relative", "خویشاوند"], ["kind", "مهربان"], ["friendly", "خوش‌برخورد"], ["young", "جوان"], ["old", "پیر"], ["tall", "قدبلند"], ["short", "قدکوتاه"], ["person", "شخص"]], "A1-3": [["cheese", "پنیر"], ["egg", "تخم‌مرغ"], ["chicken", "مرغ"], ["meat", "گوشت"], ["vegetable", "سبزی"], ["fruit", "میوه"], ["banana", "موز"], ["orange", "پرتقال"], ["potato", "سیب‌زمینی"], ["tomato", "گوجه‌فرنگی"], ["sugar", "شکر"], ["salt", "نمک"], ["coffee", "قهوه"], ["tea", "چای"], ["breakfast", "صبحانه"], ["lunch", "ناهار"], ["dinner", "شام"], ["hungry", "گرسنه"], ["thirsty", "تشنه"]], "A1-4": [["home", "خانه"], ["house", "خانه"], ["room", "اتاق"], ["kitchen", "آشپزخانه"], ["bedroom", "اتاق خواب"], ["bathroom", "حمام"], ["school", "مدرسه"], ["library", "کتابخانه"], ["bank", "بانک"], ["park", "پارک"], ["shop", "مغازه"], ["market", "بازار"], ["street", "خیابان"], ["bus stop", "ایستگاه اتوبوس"], ["early", "زود"], ["late", "دیر"], ["weekend", "آخر هفته"], ["detail", "جزئیات"], ["example", "مثال"]], "A2-1": [["ticket", "بلیت"], ["passport", "گذرنامه"], ["suitcase", "چمدان"], ["departure", "حرکت"], ["arrival", "ورود"], ["destination", "مقصد"], ["boarding pass", "کارت پرواز"], ["customs", "گمرک"], ["reservation", "رزرو"], ["tourist", "گردشگر"], ["guidebook", "راهنمای سفر"], ["map", "نقشه"], ["subway", "مترو"], ["underground", "قطار زیرزمینی"], ["fare", "کرایه"], ["route", "مسیر"], ["traffic", "ترافیک"], ["accommodation", "محل اقامت"], ["sightseeing", "بازدید از جاهای دیدنی"]], "A2-2": [["diet", "رژیم غذایی"], ["pain", "درد"], ["fever", "تب"], ["cough", "سرفه"], ["flu", "آنفلوآنزا"], ["clinic", "درمانگاه"], ["doctor", "پزشک"], ["patient", "بیمار"], ["treatment", "درمان"], ["habit", "عادت"], ["sleep", "خواب"], ["relax", "آرام شدن"], ["stress", "استرس"], ["energy", "انرژی"], ["prescription", "نسخه"], ["pharmacy", "داروخانه"], ["recovery", "بهبودی"], ["concept", "مفهوم"], ["pattern", "الگو"]], "A2-3": [["employee", "کارمند"], ["employer", "کارفرما"], ["manager", "مدیر"], ["salary", "حقوق"], ["career", "مسیر شغلی"], ["interview", "مصاحبه"], ["application", "درخواست"], ["degree", "مدرک دانشگاهی"], ["training", "آموزش"], ["subject", "موضوع درسی"], ["homework", "تکلیف"], ["exam", "امتحان"], ["result", "نتیجه"], ["grade", "نمره"], ["schedule", "برنامه زمانی"], ["project", "پروژه"], ["team", "تیم"], ["presentation", "ارائه"], ["certificate", "گواهی"]], "A2-4": [["ever", "تا به حال"], ["never", "هرگز"], ["recent", "اخیر"], ["since", "از زمانی که"], ["for", "به مدت"], ["memory", "خاطره"], ["achievement", "دستاورد"], ["challenge", "چالش"], ["decision", "تصمیم"], ["future", "آینده"], ["intention", "قصد"], ["goal", "هدف"], ["hope", "امید"], ["dream", "رویا"], ["possibility", "احتمال"], ["chance", "شانس / فرصت"], ["detail", "جزئیات"], ["example", "مثال"], ["concept", "مفهوم"]], "B1-1": [["argument", "استدلال"], ["opinion", "نظر"], ["reason", "دلیل"], ["persuade", "قانع کردن"], ["disagree", "مخالف بودن"], ["debate", "بحث"], ["respond", "پاسخ دادن"], ["explain", "توضیح دادن"], ["emphasise", "تأکید کردن"], ["recommend", "توصیه کردن"], ["consider", "در نظر گرفتن"], ["assess", "ارزیابی کردن"], ["support", "حمایت کردن"], ["oppose", "مخالفت کردن"], ["interpretation", "تفسیر"], ["conclusion", "نتیجه‌گیری"], ["discussion", "گفت‌وگو"], ["expression", "بیان"], ["point of view", "دیدگاه"]], "B1-2": [["software", "نرم‌افزار"], ["hardware", "سخت‌افزار"], ["network", "شبکه"], ["database", "پایگاه داده"], ["password", "گذرواژه"], ["security", "امنیت"], ["cybercrime", "جرم سایبری"], ["download", "بارگیری"], ["upload", "بارگذاری"], ["platform", "سکو / پلتفرم"], ["browser", "مرورگر"], ["feature", "ویژگی"], ["bug", "ایراد نرم‌افزاری"], ["developer", "توسعه‌دهنده"], ["programming", "برنامه‌نویسی"], ["automation", "خودکارسازی"], ["storage", "فضای ذخیره‌سازی"], ["connection", "اتصال"], ["notification", "اعلان"]], "B1-3": [["climate", "اقلیم"], ["global warming", "گرمایش جهانی"], ["emission", "انتشار آلاینده"], ["recycling", "بازیافت"], ["wildlife", "حیات وحش"], ["habitat", "زیستگاه"], ["deforestation", "جنگل‌زدایی"], ["conservation", "حفاظت"], ["renewable", "تجدیدپذیر"], ["solar power", "انرژی خورشیدی"], ["wind power", "انرژی بادی"], ["drought", "خشکسالی"], ["flood", "سیل"], ["waste", "زباله"], ["plastic", "پلاستیک"], ["urban", "شهری"], ["rural", "روستایی"], ["inequality", "نابرابری"], ["volunteer", "داوطلب"]], "B1-4": [["priority", "اولویت"], ["strategy", "راهبرد"], ["milestone", "مرحله مهم"], ["motivation", "انگیزه"], ["discipline", "نظم"], ["commitment", "تعهد"], ["feedback", "بازخورد"], ["performance", "عملکرد"], ["deadline", "مهلت نهایی"], ["manage", "مدیریت کردن"], ["cope", "کنار آمدن"], ["overcome", "غلبه کردن"], ["attempt", "تلاش"], ["failure", "شکست"], ["success", "موفقیت"], ["alternative", "جایگزین"], ["outcome", "پیامد"], ["detail", "جزئیات"], ["concept", "مفهوم"]], "B2-1": [["thesis", "پایان‌نامه / گزاره اصلی"], ["logic", "منطق"], ["rebuttal", "پاسخ نقض‌کننده"], ["nuance", "ظرافت معنایی"], ["coherent", "منسجم"], ["subjective", "ذهنی"], ["concede", "پذیرفتن بخشی از نظر"], ["refute", "رد کردن"], ["elaborate", "بسط دادن"], ["rationale", "منطق پشت تصمیم"], ["correlation", "همبستگی"], ["causation", "رابطه علت و معلول"], ["distinction", "تمایز"], ["criterion", "معیار"], ["consensus", "اجماع"], ["detail", "جزئیات"], ["example", "مثال"], ["purpose", "هدف"], ["method", "روش"]], "B2-2": [["profit margin", "حاشیه سود"], ["investment", "سرمایه‌گذاری"], ["merger", "ادغام شرکت‌ها"], ["acquisition", "تملک"], ["budget", "بودجه"], ["forecast", "پیش‌بینی"], ["expenditure", "هزینه"], ["asset", "دارایی"], ["liability", "بدهی"], ["competitor", "رقیب"], ["market share", "سهم بازار"], ["client", "مشتری"], ["supplier", "تأمین‌کننده"], ["bargain", "چانه‌زنی"], ["compromise", "مصالحه"], ["incentive", "مشوق"], ["contract", "قرارداد"], ["clause", "بند قرارداد"], ["compliance", "انطباق"]], "B2-3": [["journalism", "روزنامه‌نگاری"], ["editorial", "سرمقاله"], ["source", "منبع"], ["footage", "تصاویر ضبط‌شده"], ["broadcast", "پخش"], ["rumour", "شایعه"], ["fabricate", "جعل کردن"], ["plausible", "باورپذیر"], ["distort", "تحریف کردن"], ["manipulate", "دست‌کاری کردن"], ["agenda", "دستورکار"], ["narrative", "روایت"], ["headline", "تیتر"], ["circulation", "تیراژ"], ["audience", "مخاطب"], ["coverage", "پوشش خبری"], ["disclose", "افشا کردن"], ["fact-check", "راستی‌آزمایی"], ["reputation", "اعتبار"]], "B2-4": [["implementation", "اجرا"], ["efficiency", "بهره‌وری"], ["requirement", "الزام"], ["consequence", "پیامد"], ["assessment", "ارزیابی"], ["framework", "چارچوب"], ["procedure", "رویه"], ["indicator", "شاخص"], ["evidence-based", "مبتنی بر شواهد"], ["feasibility", "امکان‌پذیری"], ["constraint", "محدودیت"], ["refine", "اصلاح دقیق"], ["monitor", "نظارت کردن"], ["evaluate", "سنجیدن"], ["adapt", "سازگار شدن"], ["implement", "پیاده‌سازی کردن"], ["sustain", "حفظ کردن"], ["detail", "جزئیات"], ["example", "مثال"]], "C1-1": [["assumption", "پیش‌فرض"], ["inference", "استنباط"], ["implication", "دلالت"], ["proposition", "گزاره"], ["paradox", "تناقض‌نما"], ["hypothesis", "فرضیه"], ["deduction", "استنتاج قیاسی"], ["induction", "استنتاج استقرایی"], ["fallacy", "مغالطه"], ["inconsistency", "ناسازگاری"], ["corroborate", "تأیید با شواهد"], ["substantiate", "مستند کردن"], ["plausibility", "باورپذیری"], ["qualification", "قید و شرط"], ["reservation", "ملاحظه"], ["conjecture", "حدس مبتنی بر قرائن"], ["detail", "جزئیات"], ["example", "مثال"], ["purpose", "هدف"]], "C1-2": [["literature review", "مرور پیشینه"], ["researcher", "پژوهشگر"], ["theoretical", "نظری"], ["variable", "متغیر"], ["sample size", "حجم نمونه"], ["dataset", "مجموعه داده"], ["reliability", "پایایی"], ["peer review", "داوری همتا"], ["citation", "ارجاع"], ["publication", "انتشار"], ["abstract", "چکیده"], ["findings", "یافته‌ها"], ["method", "روش"], ["analysis", "تحلیل"], ["detail", "جزئیات"], ["example", "مثال"], ["concept", "مفهوم"], ["pattern", "الگو"], ["practice", "تمرین"]], "C1-3": [["mitigate", "کاهش دادن اثر"], ["exacerbate", "تشدید کردن"], ["prevalent", "رایج"], ["underlying", "زیربنایی"], ["systemic", "سیستمی"], ["disparity", "تفاوت ناعادلانه"], ["intervention", "مداخله"], ["infrastructure", "زیرساخت"], ["resilience", "تاب‌آوری"], ["governance", "حکمرانی"], ["transparency", "شفافیت"], ["equity", "عدالت"], ["marginalised", "به‌حاشیه‌رانده‌شده"], ["allocation", "تخصیص"], ["incentivise", "ایجاد انگیزه کردن"], ["long-term", "بلندمدت"], ["unintended", "ناخواسته"], ["trade-off", "موازنه"], ["concept", "مفهوم"]], "C1-4": [["articulate", "بیان شیوا کردن"], ["eloquence", "فصاحت"], ["concise", "موجز"], ["register", "سبک زبانی"], ["idiomatic", "اصطلاحی"], ["collocation", "هم‌آیی واژگانی"], ["subtlety", "ظرافت"], ["emphasis", "تأکید"], ["cohesion", "انسجام"], ["coherence", "پیوستگی معنایی"], ["transition", "گذار"], ["rhetorical", "بلاغی"], ["persuasive", "متقاعدکننده"], ["diplomatic", "دیپلماتیک"], ["tactful", "باملاحظه"], ["overstatement", "اغراق"], ["precision", "دقت"], ["detail", "جزئیات"], ["example", "مثال"]], "C2-1": [["epistemic", "معرفت‌شناختی"], ["ontological", "هستی‌شناختی"], ["presupposition", "پیش‌انگاشت"], ["hermeneutic", "تفسیری"], ["contingency", "وابستگی به شرایط"], ["ineffable", "توصیف‌ناپذیر"], ["incommensurable", "قیاس‌ناپذیر"], ["dialectic", "جدل فکری"], ["juxtaposition", "هم‌نشانی"], ["intertextuality", "بینامتنیت"], ["metacognition", "فراشناخت"], ["reductionism", "تقلیل‌گرایی"], ["relativism", "نسبی‌گرایی"], ["determinism", "جبرگرایی"], ["subjectivity", "ذهنیت"], ["objectivity", "عینیت"], ["abstraction", "انتزاع"], ["paradigm", "الگوواره"], ["detail", "جزئیات"]], "C2-2": [["polysemy", "چندمعنایی"], ["homonymy", "هم‌نامی"], ["denotation", "معنای صریح"], ["metonymy", "مجاز مرسل"], ["synecdoche", "مجاز جزء و کل"], ["litotes", "کم‌گویی تأکیدی"], ["zeugma", "اشتراک دستوری"], ["anaphora", "تکرار آغازین"], ["chiasmus", "تقاطع ساختاری"], ["asyndeton", "حذف حروف ربط"], ["polysyndeton", "تکرار حروف ربط"], ["parataxis", "هم‌پایگی"], ["hypotaxis", "وابستگی نحوی"], ["ellipsis", "حذف"], ["inversion", "وارونگی"], ["parallelism", "موازات ساختاری"], ["euphony", "خوش‌آهنگی"], ["dissonance", "ناهم‌آوایی"], ["detail", "جزئیات"]], "C2-3": [["pragmatics", "کاربردشناسی"], ["implicature", "معنای تلویحی"], ["deference", "احترام زبانی"], ["face-threatening", "تهدیدکننده وجهه"], ["mitigation", "تلطیف بیان"], ["presuppose", "پیش‌فرض گرفتن"], ["entailment", "استلزام معنایی"], ["speech act", "کنش گفتاری"], ["turn-taking", "نوبت‌گیری در گفتگو"], ["register shift", "تغییر سبک زبانی"], ["politeness", "ادب زبانی"], ["irony", "کنایه"], ["sarcasm", "طعنه"], ["euphemism", "حسن تعبیر"], ["hedging", "احتیاط در بیان"], ["stance", "موضع گفتمانی"], ["discourse marker", "نشانگر گفتمان"], ["nuance", "ظرافت معنایی"], ["detail", "جزئیات"]], "C2-4": [["convergence", "همگرایی"], ["divergence", "واگرایی"], ["extrinsic", "بیرونی"], ["reconcile", "آشتی دادن / سازگار کردن"], ["qualify", "مقید کردن"], ["substantiate", "مستند کردن"], ["extrapolate", "برون‌یابی کردن"], ["correlate", "مرتبط کردن"], ["synthesize", "ترکیب کردن"], ["differentiate", "تمایز قائل شدن"], ["contextualise", "در بافت قرار دادن"], ["reframe", "بازصورت‌بندی کردن"], ["consolidate", "یکپارچه کردن"], ["concept", "مفهوم"], ["pattern", "الگو"], ["practice", "تمرین"], ["purpose", "هدف"], ["method", "روش"], ["detail", "جزئیات"]]};
  const grammarBank = {"A1": [["ساختار جمله ساده (فاعل + فعل + مفعول)", "ترتیب پایه جمله خبری در انگلیسی معمولاً فاعل، فعل و سپس مفعول یا مکمل است."], ["سؤال‌های Yes/No با be", "برای پرسش بله/خیر، am/is/are را پیش از فاعل می‌آوریم."], ["سؤال‌واژه‌های what و where", "برای پرسیدن درباره چیز و مکان از what و where در ابتدای سؤال استفاده می‌کنیم."], ["حروف تعریف a و an", "a پیش از صدای همخوان و an پیش از صدای واکه می‌آید."], ["جمع بستن اسم‌ها", "بیشتر اسم‌ها با s جمع بسته می‌شوند؛ بعضی اسم‌ها شکل بی‌قاعده دارند."], ["اشاره‌گرهای this و that", "this برای نزدیک و that برای دور، معمولاً با اسم مفرد به کار می‌رود."], ["these و those", "these و those شکل جمع اشاره‌گرها هستند."], ["There is و There are", "برای بیان وجود چیزی از there is در مفرد و there are در جمع استفاده می‌کنیم."], ["حروف اضافه مکان", "in، on و under مکان یا موقعیت را نسبت به چیزهای دیگر نشان می‌دهند."], ["حروف اضافه زمان at / on / in", "at برای ساعت، on برای روز و تاریخ و in برای ماه و سال کاربرد دارد."], ["مالکیت با ’s", "برای نشان دادن مالکیتِ شخص یا حیوان معمولاً به اسم ’s اضافه می‌کنیم."], ["افعال have و has", "have با I/you/we/they و has با he/she/it در زمان حال ساده می‌آید."], ["منفی‌سازی با don’t و doesn’t", "در حال ساده برای منفی کردن فعل اصلی از do not یا does not استفاده می‌کنیم."], ["سؤال‌سازی با do و does", "برای سؤال حال ساده do یا does پیش از فاعل قرار می‌گیرد."], ["افعال امری", "برای دستور یا درخواست ساده از شکل پایه فعل استفاده می‌کنیم."], ["can برای توانایی", "can پیش از شکل پایه فعل می‌آید و توانایی یا امکان را نشان می‌دهد."], ["صفت‌ها و جایگاه آن‌ها", "صفت معمولاً پیش از اسم یا پس از فعل‌های ربطی مانند be می‌آید."], ["قیدهای تکرار", "always، usually، often و never دفعات انجام کار را نشان می‌دهند و معمولاً پیش از فعل اصلی می‌آیند."]], "A2": [["گذشته استمراری", "was/were + فعل ing برای عملی در حال انجام در نقطه‌ای از گذشته است."], ["گذشته ساده در سؤال و منفی", "برای سؤال و منفی گذشته ساده از did استفاده می‌کنیم و فعل اصلی به شکل پایه برمی‌گردد."], ["حال کامل با already و yet", "already معمولاً در جمله مثبت و yet بیشتر در پرسش و منفی برای زمان حال کامل می‌آید."], ["حال کامل با just و recently", "just و recently زمان نزدیکِ انجام یا تکمیل یک رویداد را برجسته می‌کنند."], ["مقایسه صفات", "برای مقایسه دو چیز از صفت‌های comparative و معمولاً than استفاده می‌کنیم."], ["صفات عالی", "برای بیان بالاترین درجه در یک گروه از the و صفت عالی استفاده می‌شود."], ["کمیت‌سنج‌ها much و many", "many با اسم جمع قابل‌شمارش و much با اسم غیرقابل‌شمارش می‌آید."], ["a few و a little", "a few برای تعداد کمِ قابل‌شمارش و a little برای مقدار کمِ غیرقابل‌شمارش است."], ["مصدر هدف با to", "to + فعل پایه می‌تواند هدف انجام یک کار را بیان کند."], ["قیدهای حالت", "قیدهایی مانند slowly و carefully چگونگی انجام فعل را توصیف می‌کنند."], ["آینده با will", "will برای پیش‌بینی، تصمیم لحظه‌ای و وعده به کار می‌رود."], ["حال استمراری برای قرار آینده", "حال استمراری می‌تواند برنامه قطعی و هماهنگ‌شده آینده را بیان کند."], ["must و mustn’t", "must الزام قوی و mustn’t ممنوعیت را نشان می‌دهد."], ["may و might برای احتمال", "may و might احتمال را بیان می‌کنند و معمولاً از will قطعیت کمتری دارند."], ["ضمیرهای مفعولی", "me، him، her، us و them پس از فعل یا حرف اضافه قرار می‌گیرند."], ["ضمیرهای انعکاسی", "myself، yourself و شکل‌های دیگر زمانی استفاده می‌شوند که فاعل و مفعول یک نفر باشند."], ["حروف ربط because و so", "because دلیل و so نتیجه را به جمله پیوند می‌دهد."], ["جملات موصولی ساده", "who برای افراد و which برای اشیا اطلاعات بیشتری درباره اسم می‌دهند."]], "B1": [["حال کامل در برابر گذشته ساده", "حال کامل به تجربه یا نتیجه مرتبط با اکنون اشاره می‌کند؛ گذشته ساده زمان تمام‌شده مشخص دارد."], ["حال کامل استمراری", "have/has been + ing بر مدت و تداوم فعالیت تأکید می‌کند."], ["گذشته کامل", "had + قسمت سوم فعل، عملی را نشان می‌دهد که پیش از رویداد دیگری در گذشته رخ داده است."], ["آینده استمراری", "will be + ing برای کاری است که در زمان مشخصی در آینده در جریان خواهد بود."], ["آینده کامل", "will have + قسمت سوم فعل، تکمیل کاری را تا زمان معینی در آینده نشان می‌دهد."], ["شرطی صفر", "if + حال ساده برای حقایق عمومی و نتایج همیشگی به کار می‌رود."], ["شرطی اول", "if + حال ساده و will + فعل پایه برای احتمال واقعی آینده است."], ["شرطی دوم", "if + گذشته ساده و would + فعل پایه برای فرض غیرواقعی یا بعید است."], ["شرطی سوم", "if + گذشته کامل و would have + قسمت سوم برای گذشته خلاف واقع است."], ["wish برای وضعیت حال", "wish + گذشته ساده آرزوی خلاف واقع درباره وضعیت کنونی را بیان می‌کند."], ["used to", "used to + فعل پایه عادت یا وضعیت گذشته‌ای را بیان می‌کند که دیگر برقرار نیست."], ["be used to و get used to", "be used to + اسم یا ing به معنی عادت داشتن و get used to به معنی عادت کردن است."], ["گزارش سؤال‌ها", "در سؤال غیرمستقیم ترتیب جمله خبری می‌آید و do/does/did حذف می‌شود."], ["مجهول در زمان‌های رایج", "در مجهول، شکل مناسب be با قسمت سوم فعل می‌آید و مفعول جمله فعال به جایگاه فاعل می‌رود."], ["افعال وجهی برای استنباط", "must، might و can’t می‌توانند میزان اطمینان گوینده درباره یک نتیجه را نشان دهند."], ["gerund و infinitive", "برخی فعل‌ها پس از خود ing و برخی to + فعل پایه می‌گیرند؛ معنی گاهی تغییر می‌کند."], ["عبارات موصولی تعیین‌کننده", "عبارت موصولی ضروری مشخص می‌کند دقیقاً درباره کدام شخص یا چیز صحبت می‌کنیم."], ["پیونددهنده‌های تضاد و نتیجه", "however، although، therefore و as a result رابطه منطقی میان ایده‌ها را مشخص می‌کنند."]], "B2": [["شرطی‌های ترکیبی", "در mixed conditional زمان شرط و نتیجه متفاوت است؛ مثلاً شرط گذشته پیامد اکنونی دارد."], ["وارونگی پس از قیدهای منفی", "پس از never، rarely و under no circumstances در سبک رسمی، فعل کمکی پیش از فاعل می‌آید."], ["وارونگی با not only", "در ساختار آغازشده با not only، بخش اول جمله وارونگی فعل کمکی و فاعل دارد."], ["مجهول سببی have/get", "have/get something done نشان می‌دهد کاری را شخص دیگری برای ما انجام داده است."], ["مجهول با افعال گزارشی", "ساختار it is said that یا subject + is said to برای گزارش باور یا ادعا استفاده می‌شود."], ["جملات موصولی غیرتعیین‌کننده", "این بندها اطلاعات اضافی می‌دهند و معمولاً با ویرگول جدا می‌شوند."], ["بندهای موصولی کوتاه‌شده", "در برخی بندهای موصولی می‌توان ضمیر و فعل کمکی را حذف و ساختار را فشرده کرد."], ["ساختارهای تأکیدی cleft", "ساختارهایی مانند it is/was ... that بخشی از جمله را برجسته می‌کنند."], ["تأکید با do", "do/does/did پیش از فعل پایه می‌تواند برای تأکید در جمله مثبت بیاید."], ["حروف ربط امتیازی", "although، even though، whereas و while تضاد یا امتیاز را بیان می‌کنند."], ["قیدهای ربطی", "nevertheless، consequently و furthermore رابطه منطقی بین جمله‌ها را روشن می‌کنند."], ["صفات و قیدهای درجه", "highly، utterly، fairly و relatively شدت یا درجه صفت را تنظیم می‌کنند."], ["ساختارهای مقایسه‌ای پیشرفته", "the more..., the more... رابطه افزایش یا کاهش هم‌زمان دو عامل را بیان می‌کند."], ["مصدر کامل", "to have + قسمت سوم نشان می‌دهد عمل مصدر پیش از زمان فعل اصلی رخ داده است."], ["وجهی کامل", "should have، might have و must have برای قضاوت یا استنباط درباره گذشته کاربرد دارند."], ["حذف و جانشینی", "so، neither، one و do می‌توانند از تکرار بخش‌های قابل‌پیش‌بینی جلوگیری کنند."], ["اسم‌سازی در نوشتار رسمی", "تبدیل فعل یا صفت به اسم می‌تواند لحن نوشتار را رسمی‌تر و فشرده‌تر کند."], ["نشانه‌گذاری بندهای وابسته", "ویرگول و جایگاه بندهای وابسته بر خوانایی و معنی جمله‌های پیچیده اثر می‌گذارد."]], "C1": [["وجه‌نمایی و hedging", "عباراتی مانند appears to، may well و arguably میزان قطعیت ادعا را دقیق تنظیم می‌کنند."], ["وجهی کامل برای انتقاد ظریف", "could have، needn’t have و should have ارزیابی دقیق رخدادهای گذشته را ممکن می‌کنند."], ["مجهول گزارشی پیشرفته", "ساختارهای is thought to have و is widely believed that برای گزارش غیرمستقیم رسمی‌اند."], ["وارونگی رسمی و ادبی", "عباراتی مانند under no circumstances و little did با وارونگی تأکید می‌سازند."], ["cleft و pseudo-cleft", "What matters is... و The reason why... اطلاعات را برجسته و سازمان‌دهی می‌کنند."], ["شرطی معکوس رسمی", "Had it not been for، Were it not for و Should you need جایگزین رسمی if هستند."], ["بندهای امتیازی پیشرفته", "Much as، however + adjective و try as ساختارهای امتیازی فشرده‌اند."], ["عبارات participle", "عبارت‌های ing و ed می‌توانند بندهای وابسته را کوتاه و متن را فشرده کنند."], ["بندهای مطلق", "ساختارهایی مانند the weather permitting یک زمینه یا شرط مستقل را فشرده بیان می‌کنند."], ["حذف پیشرفته در بندها", "در صورت روشن بودن مرجع، بخش‌های تکراری در بندهای وابسته قابل حذف‌اند."], ["تطابق فاعل و فعل در ساختار پیچیده", "فعل باید با هسته فاعل هماهنگ باشد، نه با نزدیک‌ترین اسم در عبارت میانجی."], ["تطابق زمان در روایت", "انتخاب زمان‌ها باید رابطه زمانی میان رویدادها و زاویه دید روایت را حفظ کند."], ["افعال گزارشی با الگوهای متفاوت", "افعالی مانند allege، concede و maintain الگوهای دستوری و بار معنایی متفاوت دارند."], ["اسم‌سازی و سبک آکادمیک", "nominalisation اطلاعات را فشرده می‌کند اما استفاده بیش از حد می‌تواند متن را سنگین کند."], ["توازی نحوی", "اجزای هم‌نقش در فهرست‌ها و تقابل‌ها باید ساختار دستوری موازی داشته باشند."], ["پیوستگی مرجع ضمیر", "ضمیر باید مرجع روشن و بی‌ابهام داشته باشد، به‌ویژه در جمله‌های چندبندی."], ["ترتیب اطلاعات و موضوع/خبر", "قرار دادن اطلاعات آشنا پیش از اطلاعات تازه به جریان طبیعی متن کمک می‌کند."], ["نشانه‌گذاری برای بندهای تو در تو", "ویرگول، نقطه‌ویرگول و خط تیره می‌توانند ساختار استدلال پیچیده را خواناتر کنند."]], "C2": [["وارونگی ادبی ظریف", "وارونگی می‌تواند لحن ادبی، تأکید یا ریتم بسازد و باید با بافت هماهنگ باشد."], ["حذف نحوی پیشرفته", "حذف بخش بازیافت‌پذیر جمله از تکرار می‌کاهد، اما نباید مرجع را مبهم کند."], ["موازات بلاغی", "تکرار ساختار نحوی مشابه، تقابل و آهنگ استدلال را تقویت می‌کند."], ["پاره‌جمله‌های بلاغی", "جمله‌واره‌های ناقصِ هدفمند می‌توانند در نثر ادبی یا گفتار تأکید ایجاد کنند."], ["ساختارهای cleft چندلایه", "ترکیب cleft با بندهای وابسته برای کنترل کانون اطلاعات در جمله‌های پیچیده به کار می‌رود."], ["وجه‌نمایی معرفتی", "must، may، cannot و قیدهایی مانند presumably درجه اطمینان معرفتی را مشخص می‌کنند."], ["فاصله‌گذاری گفتمانی", "ساختارهای impersonal و مجهول می‌توانند گوینده را از ادعا فاصله دهند."], ["پیش‌انگاشت و بندهای موصولی", "بندهای موصولی و بندهای اسمی می‌توانند اطلاعات را به‌صورت پیش‌فرض وارد گفتمان کنند."], ["کاربردشناسی ادب و غیرمستقیم‌گویی", "ساختار پرسشی و شرطی می‌تواند درخواست یا مخالفت را غیرمستقیم و مؤدبانه کند."], ["تغییر register", "انتخاب واژگان، انقباض‌ها و ساختارها باید با مخاطب و ژانر رسمی یا محاوره‌ای سازگار باشد."], ["ابهام‌زدایی نحوی", "بازچینی بندها و نشانه‌گذاری از برداشت‌های چندگانه ناخواسته جلوگیری می‌کند."], ["ساختارهای موازی متقاطع", "چیدمان متقارن و متقاطع می‌تواند تقابل معنایی را برجسته کند."], ["ساختارهای شرطی حذف‌شده", "در سبک فشرده، if و گاهی فعل کمکی با حفظ رابطه شرط و نتیجه حذف می‌شوند."], ["بندهای وابسته فشرده", "ساختارهای participial و absolute چند رابطه معنایی را در قالبی کوتاه جمع می‌کنند."], ["هم‌آیی و محدودیت انتخاب", "ترکیب طبیعی واژه‌ها به محدودیت‌های هم‌آیی و معنای دقیق واژگان وابسته است."], ["نشانگرهای گفتمان در استدلال", "نشانگرها باید رابطه واقعی مانند concession، reformulation یا inference را بازتاب دهند."], ["تغییر کانون و جابه‌جایی اجزا", "fronting و postponement برای مدیریت وزن اطلاعات و تمرکز خواننده استفاده می‌شوند."], ["انسجام در متن چندبخشی", "ارجاع، تکرار کنترل‌شده و زنجیره واژگانی پیوند میان جمله‌ها و بندها را حفظ می‌کنند."]]};
  const grammarExamples = {"A1": ["I study English every day.", "Are you from Iran?", "Where is the train station?", "She has an orange in her bag.", "These books are new.", "This is my notebook.", "Those are our neighbours.", "There are two shops near my home.", "The keys are under the chair.", "My class starts at nine o’clock.", "Sara’s phone is new.", "He has a small bicycle.", "They don’t live near the school.", "Does your sister speak English?", "Please close the door.", "I can use a computer.", "My younger brother is tall.", "I usually walk to work."], "A2": ["I was reading when the phone rang.", "Did you enjoy the journey?", "Have you finished your homework yet?", "She has just arrived at the airport.", "This suitcase is heavier than mine.", "That was the most exciting trip of my life.", "How many tickets do we need?", "There is a little milk left.", "I went online to book a hotel.", "He answered the question carefully.", "I think it will rain tomorrow.", "We are meeting the guide at six.", "You must wear a seat belt.", "The train might be delayed.", "The doctor gave him some advice.", "She taught herself to swim.", "I stayed home because I felt ill.", "The woman who called you is my teacher."], "B1": ["I have visited three countries so far.", "She has been studying since breakfast.", "The train had left before we arrived.", "This time tomorrow, I will be flying to Berlin.", "By Friday, we will have completed the project.", "If you heat ice, it melts.", "If I finish early, I will call you.", "If I had more free time, I would learn Turkish.", "If they had left earlier, they would have caught the train.", "I wish I knew the answer.", "I used to play football after school.", "I am getting used to working remotely.", "He asked me where I lived.", "The new bridge was opened last month.", "She must have forgotten the meeting.", "I stopped to check the map; I stopped checking my phone.", "The book that you recommended was excellent.", "The roads were flooded; therefore, the event was postponed."], "B2": ["If I had accepted the offer, I would be living abroad now.", "Rarely do we see such a clear result.", "Not only did the policy reduce costs, but it also improved safety.", "I had my laptop repaired yesterday.", "The company is believed to be expanding rapidly.", "My colleague, who lives in Ankara, works remotely.", "The documents submitted yesterday need reviewing.", "It was the final paragraph that changed my mind.", "I do understand your concerns.", "Although the task was difficult, we completed it.", "The data was incomplete; nevertheless, the team proceeded.", "The proposal is highly unlikely to succeed.", "The more you practise, the more confident you become.", "She seems to have misunderstood the instructions.", "You should have checked the figures first.", "I enjoyed the first film, and my sister did too.", "The implementation of the plan requires careful monitoring.", "The proposal, which was revised twice, was finally approved."], "C1": ["The results appear to indicate a gradual improvement.", "You needn’t have bought another ticket.", "The minister is said to have resigned.", "Under no circumstances should these files be shared.", "What concerns us most is the lack of reliable data.", "Had we known the risks, we would have acted differently.", "Much as I admire the idea, I question its timing.", "Having reviewed the evidence, the panel issued its report.", "All things considered, the decision was reasonable.", "If appropriate, please contact the research team.", "A series of unexpected delays has affected the launch.", "By the time she arrived, the guests had already left.", "The witness maintained that the statement was inaccurate.", "The rapid expansion of the network created new challenges.", "The plan is ambitious, practical, and financially sound.", "Each participant must submit their own response.", "What follows is a brief account of the findings.", "The proposal; despite its apparent simplicity, raises concerns."], "C2": ["Little did she suspect that the decision would reshape the field.", "He wanted recognition, not merely for himself, but for the entire team.", "Would it be possible to reconsider the wording at this stage?", "A remarkable achievement. And one that few had anticipated.", "What the passage reveals is not merely conflict but a shift in perspective.", "The evidence must presumably be interpreted within its historical context.", "It has been argued that the policy may have unintended consequences.", "The report, which the committee had already scrutinised, was released.", "Might I ask whether a later deadline would be more feasible?", "The informal tone suits the audience; the formal register would not.", "The observer who arrived late left early.", "She praised the plan, and he the execution.", "Were the circumstances different, the outcome might be reversed.", "The matter having been settled, the delegates departed.", "A deeply held conviction, not a passing preference, shaped the decision.", "Taken together, the indicators suggest a broader pattern.", "Only after the review did the underlying flaw become apparent.", "The argument is coherent, the evidence persuasive, and the conclusion measured."]};
  const grammarContexts = {"A1-1": ["introductions", "My name is Sara, and I am from Tehran."], "A1-2": ["family", "My older brother is kind, and he lives nearby."], "A1-3": ["food", "There are fresh vegetables on the table."], "A1-4": ["daily life", "I usually walk to the library after work."], "A2-1": ["travel", "We had already booked our tickets before the trip."], "A2-2": ["health", "You should rest if you feel unwell."], "A2-3": ["work and education", "I have been preparing for the interview all week."], "A2-4": ["experiences and plans", "I have never visited Rome, but I hope to go next year."], "B1-1": ["communication", "She explained her viewpoint clearly during the discussion."], "B1-2": ["technology", "The software has been running smoothly since the update."], "B1-3": ["environment", "If communities recycle more, they will reduce waste."], "B1-4": ["goals", "If I had more time, I would practise every day."], "B2-1": ["academic argument", "Not only did the evidence support the claim, but it also challenged the assumption."], "B2-2": ["business", "If the team had negotiated earlier, it would have secured better terms."], "B2-3": ["media", "The article published this morning has already been corrected."], "B2-4": ["problem solving", "The proposal should be reviewed before it is implemented."], "C1-1": ["critical analysis", "What the evidence appears to suggest is a more complex explanation."], "C1-2": ["research", "The findings are believed to have been replicated independently."], "C1-3": ["society", "Were resources allocated differently, the outcome might be fairer."], "C1-4": ["professional expression", "Much as I appreciate the proposal, I would qualify one assumption."], "C2-1": ["abstract thought", "Little did the researchers anticipate the implications of that premise."], "C2-2": ["literary language", "Not merely elegant, the passage is also structurally intricate."], "C2-3": ["diplomacy", "Might I suggest that we revisit the wording before publication?"], "C2-4": ["synthesis", "Taken together, the findings point to a discrepancy that warrants scrutiny."]};
  lessons.forEach(lesson => {
    const additions = extraVocabulary[lesson.id] || [];
    additions.forEach(([en,fa], index) => lesson.words.push({en,fa,example:`${en.charAt(0).toUpperCase()+en.slice(1)} is useful in ${lesson.title.toLowerCase()}.`}));
    // Replace generated placeholder examples with contextual sentences that include each vocabulary item.
    lesson.words.slice(6).forEach((word, index) => { word.example = `We often use the word “${word.en}” when talking about ${lesson.title.toLowerCase()}.`; });
    const bank = grammarBank[lesson.level] || [];
    const ctx = grammarContexts[lesson.id]?.[1] || `This example relates to ${lesson.title.toLowerCase()}.`;
    lesson.grammarPoints = bank.map((point, index) => ({
      title: point[0], explanation: point[1],
      example: index === 0 ? lesson.rule : (grammarExamples[lesson.level]?.[index] || ctx),
      translation: index === 0 ? lesson.ruleFa : `این مثال کاربرد ${point[0]} را در موضوع «${lesson.title}» نشان می‌دهد.`
    }));
  });
  const esc = v => String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fresh = () => ({xp:0,learned:[],grammarLearned:[],completed:[],scores:{},activeLesson:null});
  let state = fresh();
  let hasNewProgress=false;
  try { const old=JSON.parse(localStorage.getItem(KEY)||"null"); if(old&&typeof old==="object"){hasNewProgress=true;state={...fresh(),...old,learned:Array.isArray(old.learned)?old.learned:[],grammarLearned:Array.isArray(old.grammarLearned)?old.grammarLearned:[],completed:Array.isArray(old.completed)?old.completed:[],scores:old.scores||{}};} } catch {}
  if(!hasNewProgress){
    // Preserve vocabulary, XP, and completed lessons from the earlier A1/A2/B1 modules.
    const legacyKeys={
      A1:"smitAI_english_progress_v1",
      A2:"smitAI_english_A2_progress_v1",
      B1:"smitAI_english_B1_progress_v1"
    };
    const legacyData={};
    const oldLearned=new Set();
    let carriedXP=0;
    Object.entries(legacyKeys).forEach(([level,key])=>{
      try{
        const value=JSON.parse(localStorage.getItem(key)||"null");
        if(!value || typeof value!=="object") return;
        legacyData[level]=value;
        carriedXP+=Number(value.xp)||0;
        (Array.isArray(value.learned)?value.learned:[]).forEach(word=>{
          oldLearned.add(String(Array.isArray(word)?word[0]:word));
        });
        (Array.isArray(value.completedLessons)?value.completedLessons:[]).forEach(id=>{
          const lessonId=`${level}-${Number(id)}`;
          if(lessons.some(lesson=>lesson.id===lessonId) && !state.completed.includes(lessonId)){
            state.completed.push(lessonId);
          }
        });
      }catch{}
    });
    const oldA1=legacyData.A1||{};
    const oldA2=legacyData.A2||{};
    const oldB1=legacyData.B1||{};
    const oldUnlocked=Array.isArray(oldA1.unlockedLevels)?oldA1.unlockedLevels:[];
    if(oldA1.quizPassed===true || oldUnlocked.includes("A2")){
      lessons.filter(lesson=>lesson.level==="A1").forEach(lesson=>{
        if(!state.completed.includes(lesson.id)) state.completed.push(lesson.id);
      });
    }
    if(oldA2.quizPassed===true || oldUnlocked.includes("B1")){
      lessons.filter(lesson=>lesson.level==="A2").forEach(lesson=>{
        if(!state.completed.includes(lesson.id)) state.completed.push(lesson.id);
      });
    }
    if(oldB1.quizPassed===true){
      lessons.filter(lesson=>lesson.level==="B1").forEach(lesson=>{
        if(!state.completed.includes(lesson.id)) state.completed.push(lesson.id);
      });
    }
    state.xp=carriedXP;
    lessons.forEach(lesson=>lesson.words.forEach(word=>{
      if(oldLearned.has(word.en)){
        const key=`${lesson.id}:${word.en}`;
        if(!state.learned.includes(key)) state.learned.push(key);
      }
    }));
    try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.warn("English progress migration could not be saved",e);}
  }
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.warn("English progress could not be saved",e);}};
  const $=s=>document.querySelector(s);
  const page=()=>$("#dynamicPage");
  function say(text){ if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return; window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text);u.lang="en-US";u.rate=.88;window.speechSynthesis.speak(u); }
  function unlocked(levelIndex){ if(levelIndex===0)return true; const prev=levels[levelIndex-1];return lessons.filter(l=>l.level===prev.id).every(l=>state.completed.includes(l.id)); }
  function levelProgress(id){const ls=lessons.filter(l=>l.level===id);return {done:ls.filter(l=>state.completed.includes(l.id)).length,total:ls.length,words:ls.reduce((n,l)=>n+l.words.length,0)};}
  function header(title,sub){return `<header class="ec-head"><span class="ec-kicker">SMIT AI / ENGLISH MASTERY PATH</span><h1>${title}</h1><p>${sub}</p></header>`;}
  function renderHome(){
    const totalWords=lessons.reduce((n,l)=>n+l.words.length,0),doneWords=state.learned.length,allDone=state.completed.length;
    page().innerHTML=`<section class="ec-shell">${header("آموزش جامع زبان انگلیسی / English Learning","مسیر مرحله‌به‌مرحله از A1 تا C2؛ هر درس شامل واژگان، تلفظ، عبارت‌های کاربردی، گرامر و آزمون پایان درس است.")}
      <div class="ec-overview"><div><small>YOUR XP</small><b>${state.xp}</b></div><div><small>LESSONS PASSED</small><b>${allDone}/24</b></div><div><small>WORDS LEARNED</small><b>${doneWords}/${totalWords}</b></div><div><small>COURSE PROGRESS</small><b>${Math.round(allDone/24*100)}%</b></div></div>
      <div class="ec-search-row"><div class="smit-uiverse-search ec-search"><span class="us-grid"></span><span class="us-glow"></span><span class="us-border"></span><span class="us-white"></span><span class="us-dark"></span><span class="us-icon">⌕</span><input id="ecCourseSearch" type="search" placeholder="جست‌وجوی سطح یا موضوع درس..." autocomplete="off"></div><span class="ec-search-note">24 LESSONS · 6 LEVELS</span></div>
      <div class="ec-levels" id="ecLevels">${levels.map((lv,i)=>{const p=levelProgress(lv.id),open=unlocked(i);return `<article class="ec-level ${open?"":"is-locked"}" data-level-card="${lv.id}"><div class="ec-level-top"><span class="ec-level-code">${lv.id}</span><span class="ec-lock">${open?"UNLOCKED":"LOCKED"}</span></div><h2>${lv.name}</h2><p class="ec-fa">${lv.fa}</p><p>${lv.desc}</p><div class="ec-level-progress"><i style="width:${p.done/4*100}%"></i></div><small>${p.done}/4 درس تکمیل‌شده</small><button type="button" data-level-open="${lv.id}" ${open?"":"disabled"}>${open?"ورود به سطح / Open level":"ابتدا سطح قبلی را کامل کن"}</button></article>`;}).join("")}</div>
      <div class="ec-note"><b>روش پیشنهادی:</b> واژگان را با صدای بلند تکرار کن، مثال‌ها را بخوان، نکته گرامری را مرور کن و سپس آزمون ۵ سؤالی را انجام بده. برای قبولی حداقل ۴ پاسخ درست لازم است.</div></section>`;
    const search=$("#ecCourseSearch");search?.addEventListener("input",()=>{const q=search.value.trim().toLowerCase();page().querySelectorAll("[data-level-card]").forEach(card=>{const lv=levels.find(x=>x.id===card.dataset.levelCard);const text=[lv.id,lv.name,lv.fa,lv.desc,...lessons.filter(l=>l.level===lv.id).map(l=>l.title)].join(" ").toLowerCase();card.hidden=!!q&&!text.includes(q);});});
  }
  function renderLevel(id){const li=levels.findIndex(l=>l.id===id);if(li<0)return renderHome();if(!unlocked(li)){alert("برای باز شدن این سطح، چهار درس سطح قبلی را با موفقیت بگذران.");return;}
    const lv=levels[li],ls=lessons.filter(l=>l.level===id),p=levelProgress(id);
    page().innerHTML=`<section class="ec-shell">${header(`${lv.id} · ${lv.name}`,`${lv.fa} — ${lv.desc}`)}<div class="ec-level-toolbar"><button class="ec-secondary" data-ec-home>← بازگشت به مسیر</button><span>${p.done}/4 LESSONS COMPLETED</span></div><div class="ec-progress-track"><i style="width:${p.done/4*100}%"></i></div><div class="ec-lesson-grid">${ls.map(l=>`<article class="ec-lesson-card"><div class="ec-lesson-meta"><span>${l.level} / LESSON ${l.number}</span><b>${state.completed.includes(l.id)?"✓ PASSED":"IN PROGRESS"}</b></div><h2>${l.title}</h2><p>${l.grammar}</p><small>${l.words.length} واژه · ${l.grammarPoints.length} مبحث گرامری · ۲ عبارت · آزمون ۵ سؤالی</small><button type="button" data-lesson-open="${l.id}">باز کردن درس / Study lesson</button></article>`).join("")}</div></section>`;
  }
  function renderLesson(id){const l=lessons.find(x=>x.id===id);if(!l)return renderHome();if(!unlocked(l.levelIndex))return renderHome();state.activeLesson=id;save();const done=state.completed.includes(id);
    page().innerHTML=`<section class="ec-shell">${header(`${l.level} · ${l.title}`,`درس ${l.number} از ۴ — ابتدا واژگان و گرامر را یاد بگیر، سپس آزمون بده.`)}<div class="ec-level-toolbar"><button class="ec-secondary" data-level-return="${l.level}">← بازگشت به درس‌های ${l.level}</button><span>${done?"LESSON PASSED":"LESSON STUDY"}</span></div>
      <div class="ec-section-title"><div><span>01 / VOCABULARY</span><h2>واژگان و تلفظ</h2></div><small>${l.words.filter(w=>state.learned.includes(`${id}:${w.en}`)).length}/${l.words.length} یادگرفته‌شده</small></div>
      <div class="smit-uiverse-search ec-vocab-search"><span class="us-grid"></span><span class="us-glow"></span><span class="us-border"></span><span class="us-white"></span><span class="us-dark"></span><span class="us-icon">⌕</span><input id="ecVocabSearch" type="search" placeholder="جست‌وجوی واژه در این درس..." autocomplete="off"></div>
      <div class="ec-vocab-grid" id="ecVocabGrid">${l.words.map((w,i)=>{const key=`${id}:${w.en}`,learned=state.learned.includes(key);return `<article class="ec-vocab" data-vocab="${esc((w.en+" "+w.fa).toLowerCase())}"><div><h3>${w.en}</h3><b>${w.fa}</b></div><p>${w.example}</p><div class="ec-vocab-actions"><button type="button" data-ec-speak="${i}">🔊 Listen</button><button type="button" data-ec-learn="${i}" ${learned?"disabled":""}>${learned?"✓ Learned":"Mark as Learned · +5 XP"}</button></div></article>`;}).join("")}</div>
      <div class="ec-content-grid"><section class="ec-content-card ec-grammar-card"><span>02 / GRAMMAR · 18 TOPICS</span><h2>۱۸ مبحث گرامری این درس</h2><p>هر درس شامل ۱۸ نکته مستقل و سطح‌بندی‌شده است. برای مطالعه جزئیات هر نکته، آن را باز کن.</p><div class="ec-grammar-list">${l.grammarPoints.map((g,i)=>`<details class="ec-grammar-item" ${i===0?"open":""}><summary><b>${String(i+1).padStart(2,"0")}. ${esc(g.title)}</b></summary><p>${esc(g.explanation)}</p><div class="ec-example"><b>EXAMPLE</b><p dir="ltr">${esc(g.example)}</p><p>${esc(g.translation)}</p></div><button type="button" data-ec-speak-text="${esc(g.example)}">🔊 شنیدن مثال</button></details>`).join("")}</div><button type="button" class="smit-btn" data-ec-grammar-learn="${l.id}" ${state.grammarLearned.includes(`${l.id}:${l.grammar}`)?"disabled":""}>${state.grammarLearned.includes(`${l.id}:${l.grammar}`)?"✓ Grammar Learned":"Mark Grammar as Learned · +5 XP"}</button></section>
      <section class="ec-content-card"><span>03 / REAL-LIFE PHRASES</span><h2>عبارت‌های کاربردی</h2>${l.phrases.map((p,i)=>`<div class="ec-phrase"><div><b>${p[0]}</b><small>${p[1]}</small></div><button type="button" data-ec-phrase="${i}">🔊</button></div>`).join("")}</section></div>
      <section class="ec-quiz-launch"><div><span>04 / LESSON CHECK</span><h2>آزمون پایان درس</h2><p>۵ سؤال چهارگزینه‌ای از واژگان و گرامر همین درس. برای قبولی باید حداقل ۴ سؤال را درست پاسخ بدهی.</p></div><button type="button" data-ec-quiz="${id}">شروع آزمون / Start quiz</button></section>
      ${done?`<p class="ec-passed-note">✓ این درس را با موفقیت گذرانده‌ای. می‌توانی برای مرور دوباره آزمون بدهی.</p>`:""}</section>`;
    const search=$("#ecVocabSearch");search?.addEventListener("input",()=>{const q=search.value.trim().toLowerCase();page().querySelectorAll("[data-vocab]").forEach(card=>card.hidden=!card.dataset.vocab.includes(q));});
  }
  function buildQuiz(l){
    const all=l.words;const picked=[...all].sort(()=>Math.random()-.5).slice(0,4);const qs=picked.map((w,i)=>{const pool=all.filter(x=>x!==w);const wrong=[pool[i%pool.length],pool[(i+1)%pool.length],pool[(i+2)%pool.length]].map(x=>x.fa);const options=[w.fa,...wrong].sort(()=>Math.random()-.5);return {q:`معنی «${w.en}» کدام است؟`,options,answer:options.indexOf(w.fa),explain:`${w.en} یعنی ${w.fa}.`};});
    // Test grammar in context: choose the example that demonstrates this lesson's target structure.
    const sameLevel=lessons.filter(x=>x.level===l.level&&x.id!==l.id);
    const grammarPoint=l.grammarPoints[Math.floor(Math.random()*l.grammarPoints.length)];
    const correct=grammarPoint.example;
    const opts=[correct,...sameLevel.slice(0,3).map(x=>x.rule)].sort(()=>Math.random()-.5);
    qs.push({q:`کدام جمله نمونه‌ای از مبحث «${grammarPoint.title}» است؟`,options:opts,answer:opts.indexOf(correct),explain:`${grammarPoint.explanation} نمونه: ${correct}`});return qs;
  }
  function renderQuiz(id){const l=lessons.find(x=>x.id===id);if(!l)return;const qs=buildQuiz(l);let answers={};
    const draw=()=>{page().innerHTML=`<section class="ec-shell">${header(`آزمون ${l.level} · درس ${l.number}`,`۵ سؤال · حد نصاب قبولی ۴ از ۵ · پاسخ‌ها را با دقت انتخاب کن.`)}<div class="ec-level-toolbar"><button class="ec-secondary" data-lesson-return="${id}">← بازگشت به درس</button><span>LESSON QUIZ</span></div><form id="ecQuizForm">${qs.map((q,i)=>`<section class="ec-question"><span>QUESTION ${i+1} / 5</span><h3>${q.q}</h3><div>${q.options.map((o,j)=>`<label class="ec-option"><input type="radio" name="q${i}" value="${j}" ${answers[i]===j?"checked":""}><span>${String.fromCharCode(65+j)}. ${o}</span></label>`).join("")}</div></section>`).join("")}<button class="ec-quiz-submit" type="submit" ${Object.keys(answers).length<5?"disabled":""}>ثبت پاسخ‌ها / Submit answers</button></form></section>`;
      page().querySelectorAll("input[type=radio]").forEach(input=>input.addEventListener("change",()=>{answers[Number(input.name.slice(1))]=Number(input.value);const btn=$("#ecQuizForm button[type=submit]");if(btn)btn.disabled=Object.keys(answers).length!==5;}));
      $("#ecQuizForm")?.addEventListener("submit",e=>{e.preventDefault();if(Object.keys(answers).length!==5)return;const score=qs.reduce((n,q,i)=>n+(answers[i]===q.answer?1:0),0);const passed=score>=4;if(passed&&!state.completed.includes(id)){state.completed.push(id);state.xp+=20;}state.scores[id]=Math.max(state.scores[id]||0,score);save();
        const next=lessons.find(x=>x.levelIndex===l.levelIndex&&x.number===l.number+1);const nextLevel=levels[l.levelIndex+1];
        page().innerHTML=`<section class="ec-shell">${header(passed?"آفرین! درس را با موفقیت گذراندی 🎉":"نیاز به مرور بیشتر داری",`${score} از ۵ پاسخ درست`)}<div class="ec-result ${passed?"is-pass":"is-retry"}"><b>${score}/5</b><h2>${passed?"PASSED":"TRY AGAIN"}</h2><p>${passed?"۲۰ XP برای تکمیل درس دریافت کردی. پاسخ‌های درست را مرور کن.":"برای قبولی حداقل ۴ پاسخ درست لازم است. محتوای درس را دوباره مرور و تلاش کن."}</p></div><div class="ec-review">${qs.map((q,i)=>`<article><b>${i+1}. ${q.q}</b><p>پاسخ درست: ${q.options[q.answer]}</p><small>${q.explain}</small></article>`).join("")}</div><div class="ec-result-actions"><button type="button" data-lesson-return="${id}">مرور درس</button>${passed&&next?`<button type="button" data-lesson-open="${next.id}">درس بعدی / Next lesson</button>`:""}${passed&&!next&&nextLevel?`<button type="button" data-level-open="${nextLevel.id}" ${unlocked(l.levelIndex+1)?"":"disabled"}>${unlocked(l.levelIndex+1)?`ورود به سطح ${nextLevel.id}`:"سطح بعدی پس از تکمیل ۴ درس باز می‌شود"}</button>`:""}<button type="button" data-ec-home>مسیر یادگیری</button></div></section>`;
      });
    };draw();
  }
  function clickHandler(e){const t=e.target.closest("[data-level-open],[data-lesson-open],[data-ec-home],[data-level-return],[data-lesson-return],[data-ec-quiz],[data-ec-speak],[data-ec-speak-text],[data-ec-phrase],[data-ec-learn],[data-ec-grammar-learn]");if(!t)return;
    if(t.hasAttribute("data-ec-home")){renderHome();return;}
    if(t.hasAttribute("data-level-open")){renderLevel(t.dataset.levelOpen);return;}
    if(t.hasAttribute("data-lesson-open")){renderLesson(t.dataset.lessonOpen);return;}
    if(t.hasAttribute("data-level-return")){renderLevel(t.dataset.levelReturn);return;}
    if(t.hasAttribute("data-lesson-return")){renderLesson(t.dataset.lessonReturn);return;}
    if(t.hasAttribute("data-ec-quiz")){renderQuiz(t.dataset.ecQuiz);return;}
    const l=lessons.find(x=>x.id===state.activeLesson);
    if(t.hasAttribute("data-ec-speak")&&l){say(l.words[Number(t.dataset.ecSpeak)].en);return;}
    if(t.hasAttribute("data-ec-speak-text")){say(t.dataset.ecSpeakText);return;}
    if(t.hasAttribute("data-ec-phrase")&&l){say(l.phrases[Number(t.dataset.ecPhrase)][0]);return;}
    if(t.hasAttribute("data-ec-learn")&&l){
      const w=l.words[Number(t.dataset.ecLearn)],key=`${l.id}:${w.en}`;
      if(w&&!state.learned.includes(key)){
        const quizWord=[w.en,w.fa];
        const pool=lessons.flatMap(item=>item.words.map(word=>[word.en,word.fa]));
        window.SMITWordQuiz.open({container:page(),word:quizWord,wordsPool:pool,level:l.level,itemLabel:"واژه", 
          onPass:()=>{if(!state.learned.includes(key)){state.learned.push(key);state.xp+=5;save();if(window.SMITLearningFeedback)window.SMITLearningFeedback.show(5);}renderLesson(l.id);},
          onBack:()=>renderLesson(l.id)
        });
      }
      return;
    }
    if(t.hasAttribute("data-ec-grammar-learn")&&l){
      const key=`${l.id}:${l.grammar}`;
      if(!state.grammarLearned.includes(key)){
        const grammarItem=[l.grammar,l.grammarExplanation];
        const grammarPool=lessons.map(item=>[item.grammar,item.grammarExplanation]);
        window.SMITWordQuiz.open({container:page(),word:grammarItem,wordsPool:grammarPool,level:l.level,itemLabel:"مبحث گرامری",
          onPass:()=>{if(!state.grammarLearned.includes(key)){state.grammarLearned.push(key);state.xp+=5;save();if(window.SMITLearningFeedback)window.SMITLearningFeedback.show(5);}renderLesson(l.id);},
          onBack:()=>renderLesson(l.id)
        });
      }
      return;
    }
  }
  function open(){renderHome();}
  document.addEventListener("DOMContentLoaded",()=>{
    const old=window.SMITNavigate;
    window.SMITNavigate=function(route){if(route==="english")return open();return old?.(route);};
    const p=page();p?.addEventListener("click",clickHandler);
    // If the English page was the initial deep link, render the upgraded curriculum.
    if(location.hash==="#english")open();
  });
  window.SMITEnglishComplete={levels,lessons,getProgress:()=>JSON.parse(JSON.stringify(state)),open};
})();



/* SMIT AI — English certificate renderer and print handler */
(function(){
  if(window.__smitEnglishCertificateReady)return;
  window.__smitEnglishCertificateReady=true;
  function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function learnerName(){
    try{
      const raw=localStorage.getItem("smitAI_profile_v1");
      const profile=raw?JSON.parse(raw):{};
      const name=(profile.name||"").trim();
      return name || "SMIT AI LEARNER";
    }catch(e){return "SMIT AI LEARNER";}
  }
  document.addEventListener("click",function(event){
    const button=event.target.closest("[data-smit-certificate]");
    if(!button)return;
    const level=button.dataset.smitCertificate||"A1";
    const score=Number(button.dataset.score)||0;
    const total=Number(button.dataset.total)||20;
    const percent=Math.round(score/total*100);
    const date=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
    const id="SMIT-"+level+"-"+Date.now().toString(36).toUpperCase();
    const learner=escapeHtml(learnerName().toUpperCase());
    const win=window.open("","_blank","width=1100,height=800");
    if(!win){alert("Please allow pop-ups to print your certificate.");return;}
    win.document.open();
    win.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SMIT AI Certificate</title>
    <style>
    *{box-sizing:border-box}body{margin:0;padding:34px;background:#10131d;color:#24263a;font-family:Georgia,'Times New Roman',serif}
    .certificate{position:relative;max-width:1050px;min-height:700px;margin:auto;padding:58px 72px;background:radial-gradient(ellipse at 15% 10%,#fff8e8 0,transparent 42%),linear-gradient(135deg,#fffdf6,#f7f0df);border:10px double #b8954b;outline:1px solid #d7c28f;outline-offset:-22px;text-align:center;box-shadow:0 20px 80px #0008}
    .brand{font:700 20px Arial,sans-serif;letter-spacing:7px;color:#9d7731}.institute{font:12px Arial,sans-serif;letter-spacing:5px;color:#777;margin-top:8px}
    .rule{height:1px;background:linear-gradient(90deg,transparent,#b8954b,transparent);margin:28px 0}
    h1{font:normal 42px Georgia,serif;letter-spacing:3px;color:#9b7838;margin:20px 0 10px;text-transform:uppercase}
    .program{font:700 13px Arial,sans-serif;letter-spacing:4px;color:#596071}
    .present{font:italic 19px Georgia,serif;color:#777;margin:34px 0 10px}
    .name{font:normal 44px Georgia,serif;letter-spacing:3px;color:#20243a;border-bottom:1px solid #c5a65c;display:inline-block;padding:0 35px 12px;min-width:55%}
    .description{font:17px/1.7 Arial,sans-serif;max-width:720px;margin:25px auto;color:#555}
    .level{display:inline-block;margin:8px auto 20px;padding:11px 26px;border:1px solid #c3a35c;color:#8c6b2c;font:700 15px Arial,sans-serif;letter-spacing:3px}
    .stats{display:flex;justify-content:center;gap:70px;margin:22px auto 30px;font:12px Arial,sans-serif;color:#777}
    .stats strong{display:block;font:700 20px Arial,sans-serif;color:#25283c;margin-top:7px}
    .footer{display:flex;justify-content:space-between;align-items:end;margin-top:35px;font:11px Arial,sans-serif;color:#777}
    .seal{position:absolute;right:50px;top:48px;border:2px solid #b8954b;border-radius:50%;width:72px;height:72px;display:grid;place-items:center;color:#9b7838;font:700 11px Arial,sans-serif}
    .motto{font:italic 14px Georgia,serif;color:#9b7838;margin-top:25px}
    .print{display:block;margin:22px auto 0;padding:12px 28px;background:#c19a4a;color:#fff;border:0;border-radius:8px;font-weight:bold;cursor:pointer}
    @media print{body{padding:0;background:white}.certificate{box-shadow:none;max-width:none;min-height:100vh;break-inside:avoid}.print{display:none}}
    </style></head><body><main class="certificate"><div class="seal">SMIT<br>AI</div>
    <div class="brand">SMIT AI</div><div class="institute">LANGUAGE INSTITUTE</div><div class="rule"></div>
    <h1>Certificate of Completion</h1><div class="program">ENGLISH LANGUAGE PROGRAM</div>
    <div class="present">This certificate is proudly presented to</div><div class="name">${learner}</div>
    <p class="description">For successfully completing the English language course and passing the comprehensive final examination.</p>
    <div class="level">${level} · ${({A1:"BEGINNER",A2:"ELEMENTARY",B1:"INTERMEDIATE",B2:"UPPER INTERMEDIATE",C1:"ADVANCED",C2:"PROFICIENCY"})[level]||"ENGLISH"}</div>
    <div class="stats"><div>EXAM SCORE<strong>${percent}%</strong></div><div>DATE OF ISSUE<strong>${date}</strong></div><div>CERTIFICATE ID<strong>${id}</strong></div></div>
    <div class="rule"></div><div class="footer"><div><strong>AUTHORIZED BY SMIT AI</strong><br>English Language Education &amp; Assessment</div><div>Official Platform Certificate</div></div>
    <div class="motto">Keep learning. Reach higher.</div></main><button class="print" onclick="window.print()">Print / Save as PDF</button></body></html>`);
    win.document.close();
  });
})();
