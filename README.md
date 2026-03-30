# DevHive AI Platform 🐝

مولّد مشاريع برمجية كاملة بالذكاء الاصطناعي، يعمل في المتصفح مباشرةً.

## الميزات

- **ثلاثة مزودين للذكاء الاصطناعي**: Ollama (محلي)، Google Gemini، OpenRouter (مجاني)
- **ستة أنواع تطبيقات**: Next.js، React+Node، REST API، SaaS، موقع ويب، PWA
- **توليد ذكي متعدد الملفات**: يخطط AI هيكل الملفات أولاً ثم يولّد كل ملف بالتسلسل
- **محرك الإصلاح الذاتي**: يكتشف ويُصلح أخطاء الـ imports تلقائياً (3 مراحل)
- **بث حي (Streaming)**: مشاهدة الكود وهو يُكتب token بـ token
- **إدارة متعددة المشاريع**: حفظ وتحميل مشاريع متعددة محلياً

## المتطلبات

| المتطلب | الإصدار |
|---------|---------|
| Node.js | >= 18.x |
| npm     | >= 9.x  |

### لاستخدام Ollama (محلي)
```bash
# تثبيت Ollama
# https://ollama.ai

# تشغيل نموذج (مثال)
ollama pull qwen2.5-coder:7b
ollama serve
```

## التشغيل

```bash
# تثبيت الحزم
npm install

# تشغيل بيئة التطوير
npm run dev

# بناء للإنتاج
npm run build
npm run preview
```

افتح `http://localhost:5173` في المتصفح.

## البنية التقنية

```
src/
├── context/ForgeContext.jsx     # إدارة الحالة المركزية (useReducer)
├── hooks/
│   ├── useGeneration.js         # منسّق التوليد الرئيسي
│   ├── usePlanner.js            # مرحلة التخطيط بالـ AI
│   ├── useHealer.js             # الإصلاح الذاتي (XML patches)
│   ├── useReviewer.js           # مراجع الـ imports
│   └── useOllama.js             # اكتشاف الاتصال + auto-retry
├── services/
│   ├── providerRouter.js        # موزّع المزودين
│   ├── ollamaService.js         # Ollama HTTP streaming
│   ├── geminiService.js         # Google Gemini SSE streaming
│   └── openRouterService.js     # OpenRouter SSE streaming
├── config/
│   ├── constants.js             # أنواع التطبيقات وخطط الملفات
│   └── prompts.js               # بناء الـ Prompts
└── utils/
    ├── codeAnalyzer.js          # فحص جودة الكود
    ├── projectStore.js          # حفظ/تحميل المشاريع
    └── download.js              # تحميل ZIP
```

## الترخيص

MIT
