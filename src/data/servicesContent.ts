import type { LocaleCode } from '../i18n/types';

export type ServiceIconId =
  | 'strategy'
  | 'design'
  | 'apps'
  | 'ai'
  | 'api'
  | 'cloud'
  | 'intel'
  | 'security'
  | 'seo';

export interface ServiceGridItem {
  id: string;
  code: string;
  icon: ServiceIconId;
  accent: 'cyan' | 'gold' | 'azure' | 'green' | 'ruby';
  title: string;
  summary: string;
  tags: string[];
  topic: string;
}

export interface DeliveryStepItem {
  step: string;
  title: string;
  detail: string;
}

export interface EngagementModelItem {
  tag: string;
  name: string;
  idealFor: string;
  points: string[];
  topic: string;
}

export interface ServiceFaqItem {
  q: string;
  a: string;
}

export interface ServicesLocaleContent {
  heroEyebrow: string;
  heroTitlePrefix: string;
  heroTitleAccent: string;
  heroTitleSuffix: string;
  heroSubtitle: string;
  turnkeyBadge: string;
  ctaScope: string;
  ctaWork: string;
  stats: { value: string; label: string; tone: 'ink' | 'green' | 'cyan' | 'gold' }[];
  gridEyebrow: string;
  gridTitle: string;
  gridSubtitle: string;
  requestServiceLabel: string;
  services: ServiceGridItem[];
  processEyebrow: string;
  processTitle: string;
  phaseLabel: string;
  steps: DeliveryStepItem[];
  modelsEyebrow: string;
  modelsTitle: string;
  startPrefix: string;
  models: EngagementModelItem[];
  faqEyebrow: string;
  faqTitle: string;
  faqs: ServiceFaqItem[];
  playbookPrompt: string;
  playbookCta: string;
  inquiryGreeting: string;
  inquirySelectedLabel: string;
  inquiryGoalsLabel: string;
  inquiryPlaceholder: string;
}

export const SERVICES_CONTENT: Record<LocaleCode, ServicesLocaleContent> = {
  en: {
    heroEyebrow: 'KRONVEX SERVICES · FULL-LIFECYCLE ENGINEERING',
    heroTitlePrefix: 'Custom Software, Cloud & ',
    heroTitleAccent: 'AI-Native Engineering',
    heroTitleSuffix: ' Services',
    heroSubtitle:
      'We take full end-to-end ownership of your project—from product strategy and UX/UI design to cross-platform builds (Web, Windows, macOS, Linux, Mobile), Google Cloud / AWS / Firebase infrastructure, private AI, and security vulnerability remediation.',
    turnkeyBadge: 'TURNKEY DELIVERY · WE OWN THE ENTIRE PROJECT FROM IDEA TO PRODUCTION',
    ctaScope: 'Build Your Project Scope',
    ctaWork: 'View Engineering Case Studies',
    stats: [
      { value: '100/100', label: 'Lighthouse Performance', tone: 'ink' },
      { value: 'End-to-End', label: 'Full Project Ownership', tone: 'green' },
      { value: '100%', label: 'Client Code & IP Rights', tone: 'cyan' },
      { value: '48h', label: 'Scoping & Security SLA', tone: 'gold' },
    ],
    gridEyebrow: 'COMPLETE SERVICE CATALOG · 9 CORE DISCIPLINES',
    gridTitle: 'Every capability required to take your product from zero to resilient scale.',
    gridSubtitle:
      'Engage KRONVEX for a focused technical sprint or hand over the entire project lifecycle—strategy, design, engineering, cloud, and security hardening under one accountable roof.',
    requestServiceLabel: 'Request this service',
    services: [
      {
        id: 'product-strategy',
        code: '01',
        icon: 'strategy',
        accent: 'gold',
        title: 'Product Strategy & Turnkey Delivery',
        summary:
          'We take complete ownership of your project from day one—market-driven roadmaps, technical blueprinting, MVP scoping, and full end-to-end execution through production launch and post-release scaling.',
        tags: ['Full Project Ownership', 'System Architecture', 'MVP to Scale'],
        topic: 'Product Strategy & Turnkey Delivery',
      },
      {
        id: 'ux-ui-design',
        code: '02',
        icon: 'design',
        accent: 'cyan',
        title: 'UX & UI Design Systems',
        summary:
          'User-centric product design built on optical clarity, reusable Design Tokens, interactive prototypes, 60fps Zero-GPU interfaces, WCAG AA accessibility, and native RTL/LTR multi-language precision.',
        tags: ['Design Systems', 'WCAG AA', 'Interactive Prototypes'],
        topic: 'UX & UI Design Systems',
      },
      {
        id: 'cross-platform-apps',
        code: '03',
        icon: 'apps',
        accent: 'azure',
        title: 'Web, Desktop & Mobile Apps',
        summary:
          'Production software engineered on shared type-safe cores across Web (React/TypeScript), Desktop (Windows, macOS & Linux binaries), and Mobile (Android & iOS / Flutter) with signed SHA-256 releases.',
        tags: ['Web', 'Windows · macOS · Linux', 'Android · iOS'],
        topic: 'Web, Desktop (Windows/macOS/Linux) & Mobile Development',
      },
      {
        id: 'private-ai-rag',
        code: '04',
        icon: 'ai',
        accent: 'green',
        title: 'Private AI, RAG & Agents',
        summary:
          'Custom enterprise RAG pipelines, autonomous AI agents, portable SKILL.md workflows, and zero-cloud local inference via WebGPU/ONNX or Ollama so sensitive company data never leaves your hardware.',
        tags: ['Private RAG', 'WebGPU / Ollama', 'AI Agents'],
        topic: 'Private AI, RAG & Autonomous Agents',
      },
      {
        id: 'apis-mcp-cli',
        code: '05',
        icon: 'api',
        accent: 'cyan',
        title: 'APIs, MCP Servers & CLIs',
        summary:
          'High-throughput REST & Edge APIs with OpenAPI 3.1 contracts and Postman collections, token-efficient Code-Mode MCP gateways for AI agents, and zero-dependency terminal CLIs for developer ecosystems.',
        tags: ['OpenAPI 3.1', 'Code-Mode MCP', 'Custom CLIs'],
        topic: 'APIs, MCP Servers & Custom CLIs',
      },
      {
        id: 'cloud-devops',
        code: '06',
        icon: 'cloud',
        accent: 'azure',
        title: 'Cloud, Edge & DevOps',
        summary:
          'End-to-end cloud architecture, migration, and CI/CD automation across Google Cloud (GCP), Amazon Web Services (AWS), Firebase, and Cloudflare Workers—built for resilience, zero downtime, and cost control.',
        tags: ['Google Cloud', 'AWS', 'Firebase', 'Cloudflare'],
        topic: 'Cloud, Edge & DevOps (GCP / AWS / Firebase / Cloudflare)',
      },
      {
        id: 'market-intel-data',
        code: '07',
        icon: 'intel',
        accent: 'green',
        title: 'Market Intelligence & Data Pipelines',
        summary:
          'Real-time quantitative data ingestion, automated research & competitor radars, telemetry pipelines, and executive analytics dashboards that distill raw streams into decisive clarity.',
        tags: ['Live Telemetry', 'Quant Pipelines', 'Analytics'],
        topic: 'Market Intelligence & Data Pipelines',
      },
      {
        id: 'due-diligence-security',
        code: '08',
        icon: 'security',
        accent: 'ruby',
        title: 'Technical Due Diligence & Security',
        summary:
          'Deep codebase and architecture risk audits before investment or launch—plus active security vulnerability remediation, exploit patching, secret leak elimination, and OWASP / CSP / HSTS hardening.',
        tags: ['Vulnerability Patching', 'Codebase Audit', 'OWASP / HSTS'],
        topic: 'Technical Due Diligence & Security Hardening',
      },
      {
        id: 'perf-seo-geo',
        code: '09',
        icon: 'seo',
        accent: 'gold',
        title: 'Performance, SEO & GEO/AEO',
        summary:
          'Lighthouse 100/100 engineering, zero-CLS optimization, technical SEO, and Generative Engine Optimization (GEO/AEO) with structured JSON-LD & llms.txt so both Google and AI engines cite your brand.',
        tags: ['Lighthouse 100', 'Technical SEO', 'GEO / AEO'],
        topic: 'Performance, SEO & GEO/AEO Optimization',
      },
    ],
    processEyebrow: 'DELIVERY METHODOLOGY',
    processTitle: 'How KRONVEX takes your entire project from concept to resilient launch.',
    phaseLabel: 'PHASE',
    steps: [
      {
        step: '01',
        title: 'Discovery & System Spec',
        detail: 'Audit business goals, technical risks, cloud targets, and security boundaries. Deliver an unambiguous blueprint before code begins.',
      },
      {
        step: '02',
        title: 'Design & Vertical Slice',
        detail: 'Validate UX/UI flows and ship a working end-to-end vertical slice fast so stakeholders interact with real software in week one.',
      },
      {
        step: '03',
        title: 'Full Build & Security Hardening',
        detail: 'Complete cross-platform & cloud implementation, vulnerability patching, automated CI gates, Lighthouse 100 checks, and accessibility QA.',
      },
      {
        step: '04',
        title: 'Launch, Handover & Scale',
        detail: 'Zero-downtime deployment on GCP, AWS, Firebase, or Cloudflare, full source & IP transfer, documentation, and optional long-term operations.',
      },
    ],
    modelsEyebrow: 'ENGAGEMENT MODELS',
    modelsTitle: 'Flexible collaboration built for speed, security, and total accountability.',
    startPrefix: 'Start',
    models: [
      {
        tag: '2 – 4 WEEKS',
        name: 'Audit, Strategy & Prototype Sprint',
        idealFor: 'Founders & teams needing technical due diligence, security remediation, or a rapid validated prototype.',
        points: [
          'Complete architecture spec or deep security vulnerability audit',
          'Working vertical slice prototype or local AI proof-of-concept',
          'Cloud cost, performance & SEO/GEO readiness baseline',
        ],
        topic: 'Audit, Strategy & Prototype Sprint',
      },
      {
        tag: '1 – 3 MONTHS · FULL TURNKEY',
        name: 'Full-Project End-to-End Delivery',
        idealFor: 'Organizations wanting KRONVEX to own the entire project from strategy & design to live production launch.',
        points: [
          'Complete execution: UX/UI, Web/Windows/macOS/Linux/Mobile, APIs & AI',
          'Production cloud deployment on GCP, AWS, Firebase & Cloudflare',
          'Full security hardening, CI/CD & 100% client code/IP ownership',
        ],
        topic: 'Full-Project End-to-End Delivery',
      },
      {
        tag: 'ONGOING PARTNER',
        name: 'Dedicated AI-Native Partner',
        idealFor: 'Teams scaling continuously with custom AI agents, MCP tooling, cloud ops, and proactive security.',
        points: [
          'Direct partnership with KRONVEX lead systems architecture',
          'Continuous feature delivery, cloud optimization & vulnerability patching',
          'Custom agentic workflows (SKILL.md, MCP & CLI automation)',
        ],
        topic: 'Dedicated AI-Native Partner',
      },
    ],
    faqEyebrow: 'FREQUENTLY ASKED QUESTIONS',
    faqTitle: 'Direct answers on full-project ownership, cloud stacks, security & IP.',
    faqs: [
      {
        q: 'Can KRONVEX handle our entire project from idea to live production?',
        a: 'Yes. We provide complete turnkey ownership—covering product strategy, UX/UI design, Web/Windows/macOS/Linux/Mobile engineering, cloud deployment (Google Cloud, AWS, Firebase, Cloudflare), security hardening, and post-launch support.',
      },
      {
        q: 'Do you audit existing apps and close security vulnerabilities?',
        a: 'Yes. Our Technical Due Diligence & Security service inspects your codebase, dependencies, cloud IAM, headers (CSP/HSTS), and API endpoints to identify and actively patch vulnerabilities before launch or investor review.',
      },
      {
        q: 'Which desktop, mobile, and cloud platforms do you build for?',
        a: 'We engineer for Web (React/TypeScript), Desktop (Windows, macOS, and Linux), and Mobile (Android & iOS/Flutter), deployed across Google Cloud (GCP), Amazon Web Services (AWS), Firebase, and Cloudflare Workers.',
      },
      {
        q: 'Do we keep 100% ownership of the source code and intellectual property?',
        a: 'Yes. Every custom engagement transfers 100% of source code, infrastructure-as-code, CI pipelines, documentation, and IP directly to your organization with zero vendor lock-in.',
      },
      {
        q: 'Can KRONVEX deploy private AI without sending our data to external clouds?',
        a: 'Yes. We architect local-first and private AI systems running quantized GGUF/ONNX models on your own servers, VPC, or directly inside the user’s browser via WebGPU/WASM.',
      },
      {
        q: 'How quickly can we scope and start a project?',
        a: 'Initial technical scoping takes 48 hours. Click any service card above or open our Scope Builder to send a structured brief with zero cookies or tracking.',
      },
    ],
    playbookPrompt: 'Want to inspect how we engineer, audit, and ship every release? Read the KRONVEX Engineering Playbook.',
    playbookCta: 'Open Engineering Playbook',
    inquiryGreeting: 'Hello KRONVEX Engineering team,',
    inquirySelectedLabel: 'Selected Service / Model:',
    inquiryGoalsLabel: 'Project Goals, Target Platforms & Timeline:',
    inquiryPlaceholder: '(Tell us if you need full end-to-end project delivery, cloud setup, security patching, or a specific build...)',
  },

  ar: {
    heroEyebrow: 'خدمات KRONVEX · هندسة برمجية وذكاء اصطناعي متكامل',
    heroTitlePrefix: 'تطوير البرمجيات، السحابة و',
    heroTitleAccent: 'الهندسة المدعومة بالذكاء الاصطناعي',
    heroTitleSuffix: '',
    heroSubtitle:
      'نتكفل بمشروعك بالكامل من الفكرة حتى الإطلاق والتشغيل — بدءاً من استراتيجية المنتج وتصميم UX/UI، مروراً بتطوير تطبيقات الويب وWindows وmacOS وLinux والهواتف، والبنية السحابية على Google Cloud وAWS وFirebase وCloudflare، وصولاً إلى الذكاء الاصطناعي الخاص وإغلاق الثغرات الأمنية.',
    turnkeyBadge: 'تسليم متكامل · نتكفل بالمشروع بالكامل من الفكرة إلى الإنتاج',
    ctaScope: 'حدّد نطاق مشروعك الآن',
    ctaWork: 'استعرض دراسات الحالة',
    stats: [
      { value: '100/100', label: 'أداء Lighthouse', tone: 'ink' },
      { value: 'متكامل', label: 'نتكفل بالمشروع بالكامل', tone: 'green' },
      { value: '100%', label: 'ملكية الكود والملكية الفكرية للعميل', tone: 'cyan' },
      { value: '48 ساعة', label: 'تسعير تقني واستجابة أمنية', tone: 'gold' },
    ],
    gridEyebrow: 'دليل الخدمات الشامل · 9 تخصصات هندسية دقيقة',
    gridTitle: 'كل ما تحتاجه لتحويل فكرتك إلى منتج قوي وآمن وجاهز للتوسع.',
    gridSubtitle:
      'يمكنك الاستعانة بنا لمهمة تقنية محددة أو تسليمنا المشروع بالكامل — نتولى التخطيط، التصميم، البرمجة، السحابة، وإغلاق الثغرات الأمنية تحت سقف هندسي واحد.',
    requestServiceLabel: 'اطلب هذه الخدمة',
    services: [
      {
        id: 'product-strategy',
        code: '01',
        icon: 'strategy',
        accent: 'gold',
        title: 'استراتيجية المنتج والتكفل بالمشروع بالكامل',
        summary:
          'نتكفل بالمشروع بالكامل من اليوم الأول — دراسة السوق، وضع الخطة والمعمارية التقنية، بناء النسخة الأولية (MVP)، والإشراف والتنفيذ الكامل حتى الإطلاق الفعلي والتوسع دون تعقيد عليك.',
        tags: ['تكفل كامل بالمشروع', 'معمارية الأنظمة', 'من الفكرة للإطلاق'],
        topic: 'استراتيجية المنتج والتكفل بالمشروع بالكامل',
      },
      {
        id: 'ux-ui-design',
        code: '02',
        icon: 'design',
        accent: 'cyan',
        title: 'تصميم UX & UI وأنظمة التصميم',
        summary:
          'تصميم واجهات وتجربة مستخدم عالية الوضوح مع أنظمة Design Tokens قابلة لإعادة الاستخدام، نماذج تفاعلية، سرعة 60fps بدون ثقل على المعالج، وتوافق WCAG AA مع دعم أصيل للعربية (RTL).',
        tags: ['أنظمة التصميم', 'WCAG AA', 'دعم عربي RTL'],
        topic: 'تصميم UX & UI وأنظمة التصميم',
      },
      {
        id: 'cross-platform-apps',
        code: '03',
        icon: 'apps',
        accent: 'azure',
        title: 'تطبيقات الويب، سطح المكتب والهواتف',
        summary:
          'برمجة تطبيقات إنتاجية بكود موحّد وآمن للويب (React/TypeScript)، وأنظمة سطح المكتب (Windows وmacOS وLinux)، والهواتف الذكية (Android وiOS / Flutter) مع إصدارات موقّعة بـ SHA-256.',
        tags: ['الويب', 'Windows · macOS · Linux', 'Android · iOS'],
        topic: 'تطوير تطبيقات الويب وWindows وmacOS وLinux والهواتف',
      },
      {
        id: 'private-ai-rag',
        code: '04',
        icon: 'ai',
        accent: 'green',
        title: 'الذكاء الاصطناعي الخاص، RAG والوكلاء',
        summary:
          'بناء أنظمة RAG خاصة بالشركات، وكلاء ذكاء اصطناعي مخصصين، مهارات SKILL.md، وتشغيل نماذج محلية عبر WebGPU/ONNX أو Ollama بحيث لا تغادر بياناتك الحساسة أجهزتك إطلاقاً.',
        tags: ['RAG خاص', 'WebGPU / Ollama', 'وكلاء AI'],
        topic: 'الذكاء الاصطناعي الخاص، RAG والوكلاء',
      },
      {
        id: 'apis-mcp-cli',
        code: '05',
        icon: 'api',
        accent: 'cyan',
        title: 'واجهات API، خوادم MCP وأدوات CLI',
        summary:
          'تصميم وبناء واجهات REST وEdge APIs عالية السرعة بعقود OpenAPI 3.1 ومجموعات Postman، وخوادم Code-Mode MCP لوكلاء الذكاء الاصطناعي، وأدوات سطر أوامر (CLI) بدون تبعيات.',
        tags: ['OpenAPI 3.1', 'Code-Mode MCP', 'أدوات CLI'],
        topic: 'واجهات API، خوادم MCP وأدوات CLI',
      },
      {
        id: 'cloud-devops',
        code: '06',
        icon: 'cloud',
        accent: 'azure',
        title: 'الحوسبة السحابية، Edge وDevOps',
        summary:
          'هندسة السحابة، الهجرة، وأتمتة النشر المستمر (CI/CD) على Google Cloud (GCP) وAmazon Web Services (AWS) وFirebase وCloudflare Workers — لاستقرار عالٍ، صفر توقف، وضبط التكلفة.',
        tags: ['Google Cloud', 'AWS', 'Firebase', 'Cloudflare'],
        topic: 'الحوسبة السحابية وDevOps (Google Cloud / AWS / Firebase / Cloudflare)',
      },
      {
        id: 'market-intel-data',
        code: '07',
        icon: 'intel',
        accent: 'green',
        title: 'استخبارات الأسواق وخطوط البيانات',
        summary:
          'بناء خطوط جمع ومعالجة بيانات لحظية، رادارات أبحاث ومراقبة آلية، أنظمة تليميتري كمّية، ولوحات تحكم تنفيذية تحوّل تدفقات البيانات الخام إلى قرارات واضحة.',
        tags: ['بيانات لحظية', 'خطوط كمّية', 'لوحات قرار'],
        topic: 'استخبارات الأسواق وخطوط البيانات',
      },
      {
        id: 'due-diligence-security',
        code: '08',
        icon: 'security',
        accent: 'ruby',
        title: 'التدقيق التقني وإغلاق الثغرات الأمنية',
        summary:
          'فحص عميق للكود والمعمارية وتقييم المخاطر قبل الاستثمار أو الإطلاق — مع اكتشاف وإغلاق الثغرات الأمنية فعلياً، سد نقاط الاختراق، تنظيف تسريبات المفاتيح، وتحصين OWASP وCSP وHSTS.',
        tags: ['إغلاق الثغرات الأمنية', 'فحص الكود والمخاطر', 'تحصين OWASP'],
        topic: 'التدقيق التقني وإغلاق الثغرات الأمنية',
      },
      {
        id: 'perf-seo-geo',
        code: '09',
        icon: 'seo',
        accent: 'gold',
        title: 'تحسين الأداء، SEO وظهور الذكاء الاصطناعي',
        summary:
          'رفع الأداء إلى 100/100 على Lighthouse، تحسين SEO التقني، وتهيئة GEO/AEO عبر JSON-LD وllms.txt لضمان تصدر موقعك في نتائج Google واستشهادات محركات الذكاء الاصطناعي.',
        tags: ['Lighthouse 100', 'SEO تقني', 'GEO / AEO'],
        topic: 'تحسين الأداء وSEO وGEO/AEO',
      },
    ],
    processEyebrow: 'منهجية التنفيذ',
    processTitle: 'كيف نتكفل بمشروعك خطوة بخطوة من الفكرة حتى الإطلاق الآمن.',
    phaseLabel: 'المرحلة',
    steps: [
      {
        step: '01',
        title: 'التحليل والمخطط الهندسي',
        detail: 'دراسة الأهداف، المخاطر، اختيار السحابة الأنسب، وضبط المتطلبات الأمنية في وثيقة واضحة قبل كتابة سطر كود واحد.',
      },
      {
        step: '02',
        title: 'التصميم والنسخة الأولية السريعة',
        detail: 'اعتماد واجهات UX/UI وتسليم شريحة فعلية شغّالة سريعاً لتجربة المنتج الحقيقي منذ الأسبوع الأول.',
      },
      {
        step: '03',
        title: 'التطوير الكامل وإغلاق الثغرات',
        detail: 'تنفيذ كافة المنصات والسحابة، فحص وإغلاق الثغرات الأمنية، تفعيل اختبارات CI، وتحقيق أداء 100/100.',
      },
      {
        step: '04',
        title: 'الإطلاق، التسليم والتوسع',
        detail: 'نشر بدون توقف على GCP أو AWS أو Firebase أو Cloudflare، تسليم كامل الكود والملكية الفكرية، ومرافقة تقنية مستمرة.',
      },
    ],
    modelsEyebrow: 'نماذج العمل والتعاون',
    modelsTitle: 'صيغ تعاون مرنة تناسب سرعة إطلاقك ومستوى الأمان المطلوب.',
    startPrefix: 'ابدأ',
    models: [
      {
        tag: '2 – 4 أسابيع',
        name: 'سباق التدقيق، التخطيط أو النموذج الأولي',
        idealFor: 'المؤسسين والفرق التي تحتاج فحصاً أمنياً وإغلاق ثغرات، أو تدقيق كود، أو نموذجاً أولياً سريعاً.',
        points: [
          'مخطط معماري كامل أو تقرير تدقيق وإغلاق ثغرات أمنية',
          'نموذج عملي شغّال أو إثبات مفهوم لنظام ذكاء اصطناعي محلي',
          'خطة واضحة لتكلفة السحابة والأداء وجاهزية SEO/GEO',
        ],
        topic: 'سباق التدقيق والتخطيط والنموذج الأولي',
      },
      {
        tag: '1 – 3 أشهر · تسليم مفتاح',
        name: 'التكفل بالمشروع بالكامل حتى الإطلاق',
        idealFor: 'الشركات ورواد الأعمال الذين يريدون فريقاً يتكفل بالمشروع بالكامل من الفكرة والتصميم حتى النشر والتشغيل.',
        points: [
          'تنفيذ شامل: UX/UI، الويب وWindows/macOS/Linux والهواتف والـ APIs والـ AI',
          'نشر سحابي احترافي على Google Cloud وAWS وFirebase وCloudflare',
          'إغلاق الثغرات الأمنية، خطوط CI/CD، وملكية 100% للكود للعميل',
        ],
        topic: 'التكفل بالمشروع بالكامل حتى الإطلاق',
      },
      {
        tag: 'شراكة مستمرة',
        name: 'شريك هندسي وذكاء اصطناعي مخصص',
        idealFor: 'المؤسسات التي تتوسع باستمرار وتحتاج تطويراً متواصلاً، تشغيل سحابي، وحماية أمنية دائمة.',
        points: [
          'عمل مباشر مع القيادة الهندسية في KRONVEX',
          'تطوير ميزات مستمر، تحسين تكلفة السحابة، وسد أي ثغرات فورياً',
          'بناء أتمتة ووكلاء ذكاء اصطناعي مخصصين (MCP / SKILL.md / CLI)',
        ],
        topic: 'شريك هندسي وذكاء اصطناعي مخصص',
      },
    ],
    faqEyebrow: 'الأسئلة الشائعة',
    faqTitle: 'إجابات واضحة حول التكفل الكامل بالمشروع، السحابة، الأمان والملكية.',
    faqs: [
      {
        q: 'هل تتكفلون بالمشروع بالكامل من الفكرة حتى النشر والتشغيل؟',
        a: 'نعم، نتكفل بالمشروع بالكامل من الألف إلى الياء: التخطيط والاستراتيجية، تصميم UX/UI، البرمجة للويب وWindows وmacOS وLinux والهواتف، النشر على Google Cloud وAWS وFirebase وCloudflare، إغلاق الثغرات الأمنية، والمتابعة بعد الإطلاق.',
      },
      {
        q: 'هل تقومون بفحص المشاريع القائمة وإغلاق الثغرات الأمنية بها؟',
        a: 'نعم، نقدم خدمة التدقيق التقني وإغلاق الثغرات الأمنية لفحص الكود، الصلاحيات السحابية، واجهات API، تسريبات المفاتيح، وترويسات الحماية (OWASP / CSP / HSTS) مع إصلاح الثغرات فعلياً والتحقق منها.',
      },
      {
        q: 'ما هي الأنظمة والمنصات السحابية التي تدعمونها؟',
        a: 'نطور للويب (React/TypeScript)، سطح المكتب (Windows وmacOS وLinux)، والهواتف (Android وiOS/Flutter)، وننشر على Google Cloud (GCP) وAmazon Web Services (AWS) وFirebase وCloudflare Workers.',
      },
      {
        q: 'هل نحتفظ بملكية 100% للكود المصدري والملكية الفكرية؟',
        a: 'بالتأكيد. كل مشروع مخصص ننفذه تُنقل ملكيته الكاملة (الكود المصدري، سكربتات البنية التحتية، والتوثيق) مباشرة إلى جهتك دون أي قيود أو احتكار.',
      },
      {
        q: 'هل يمكن تشغيل الذكاء الاصطناعي بشكل خاص دون إرسال بياناتنا لسحابات خارجية؟',
        a: 'نعم، نتخصص في أنظمة الذكاء الاصطناعي المحلية والخاصة التي تعمل على خوادمك أو داخل متصفح المستخدم عبر WebGPU/WASM وOllama دون تسريب أي بايت لجهات خارجية.',
      },
      {
        q: 'كم يستغرق تحديد النطاق والبدء في المشروع؟',
        a: 'ننجز الدراسة التقنية وتحديد النطاق خلال 48 ساعة. يمكنك النقر على أي خدمة في الجدول أعلاه لإرسال تفاصيل مشروعك مباشرة.',
      },
    ],
    playbookPrompt: 'تريد الاطلاع على معاييرنا الهندسية والأمنية في كل مشروع؟ اقرأ دليل KRONVEX الهندسي.',
    playbookCta: 'افتح الدليل الهندسي',
    inquiryGreeting: 'مرحباً فريق KRONVEX الهندسي،',
    inquirySelectedLabel: 'الخدمة / نموذج العمل المختار:',
    inquiryGoalsLabel: 'أهداف المشروع، المنصات المطلوبة والمدة المقترحة:',
    inquiryPlaceholder: '(اذكر هنا إن كنت تريد التكفل بالمشروع بالكامل، أو إغلاق ثغرات أمنية، أو بناء تطبيق أو بنية سحابية...)',
  },

  fr: {
    heroEyebrow: 'SERVICES KRONVEX · INGÉNIERIE DE BOUT EN BOUT',
    heroTitlePrefix: 'Logiciels Sur Mesure, Cloud & ',
    heroTitleAccent: 'Ingénierie IA-Native',
    heroTitleSuffix: '',
    heroSubtitle:
      'Nous prenons en charge l’intégralité de votre projet — de la stratégie produit et du design UX/UI au développement multi-plateforme (Web, Windows, macOS, Linux, Mobile), l’infrastructure Google Cloud / AWS / Firebase / Cloudflare, l’IA privée et la correction de failles de sécurité.',
    turnkeyBadge: 'CLÉ EN MAIN · PRISE EN CHARGE COMPLÈTE DE L’IDÉE À LA PRODUCTION',
    ctaScope: 'Définir votre projet',
    ctaWork: 'Voir les études de cas',
    stats: [
      { value: '100/100', label: 'Performance Lighthouse', tone: 'ink' },
      { value: 'Clé en main', label: 'Gestion complète du projet', tone: 'green' },
      { value: '100%', label: 'Propriété du code & PI', tone: 'cyan' },
      { value: '48h', label: 'Cadrage & SLA Sécurité', tone: 'gold' },
    ],
    gridEyebrow: 'CATALOGUE COMPLET · 9 DISCIPLINES CLÉS',
    gridTitle: 'Toutes les compétences pour mener votre produit de zéro à l’échelle industrielle.',
    gridSubtitle:
      'Sollicitez KRONVEX pour une mission ciblée ou confiez-nous l’intégralité du projet : stratégie, UX/UI, développement, cloud et sécurisation sous une seule équipe responsable.',
    requestServiceLabel: 'Demander ce service',
    services: [
      {
        id: 'product-strategy',
        code: '01',
        icon: 'strategy',
        accent: 'gold',
        title: 'Stratégie Produit & Prise en Charge Globale',
        summary:
          'Nous assumons la responsabilité complète de votre projet de A à Z : feuille de route marché, architecture système, cadrage MVP et exécution intégrale jusqu’au lancement et à la montée en charge.',
        tags: ['Projet Clé en Main', 'Architecture', 'MVP vers Scale'],
        topic: 'Stratégie Produit & Prise en Charge Globale',
      },
      {
        id: 'ux-ui-design',
        code: '02',
        icon: 'design',
        accent: 'cyan',
        title: 'Design UX & UI et Design Systems',
        summary:
          'Conception centrée utilisateur avec Design Tokens réutilisables, prototypes interactifs, interfaces optiques 60fps Zero-GPU, accessibilité WCAG AA et support multilingue RTL/LTR.',
        tags: ['Design Systems', 'WCAG AA', 'Prototypes'],
        topic: 'Design UX & UI et Design Systems',
      },
      {
        id: 'cross-platform-apps',
        code: '03',
        icon: 'apps',
        accent: 'azure',
        title: 'Apps Web, Desktop & Mobile',
        summary:
          'Logiciels de production bâtis sur des cœurs typés pour le Web (React/TypeScript), Desktop (Windows, macOS & Linux) et Mobile (Android & iOS / Flutter) avec livrables signés SHA-256.',
        tags: ['Web', 'Windows · macOS · Linux', 'Android · iOS'],
        topic: 'Développement Web, Desktop (Windows/macOS/Linux) & Mobile',
      },
      {
        id: 'private-ai-rag',
        code: '04',
        icon: 'ai',
        accent: 'green',
        title: 'IA Privée, RAG & Agents Autonomes',
        summary:
          'Pipelines RAG d’entreprise, agents IA sur mesure, workflows SKILL.md et inférence locale WebGPU/ONNX ou Ollama garantissant que vos données confidentielles ne quittent jamais vos serveurs.',
        tags: ['RAG Privé', 'WebGPU / Ollama', 'Agents IA'],
        topic: 'IA Privée, RAG & Agents Autonomes',
      },
      {
        id: 'apis-mcp-cli',
        code: '05',
        icon: 'api',
        accent: 'cyan',
        title: 'APIs, Serveurs MCP & CLIs',
        summary:
          'APIs REST/Edge haute performance avec contrats OpenAPI 3.1 et collections Postman, passerelles MCP Code-Mode économes en tokens, et CLIs zéro-dépendance pour développeurs.',
        tags: ['OpenAPI 3.1', 'MCP Code-Mode', 'CLIs Sur Mesure'],
        topic: 'APIs, Serveurs MCP & CLIs',
      },
      {
        id: 'cloud-devops',
        code: '06',
        icon: 'cloud',
        accent: 'azure',
        title: 'Cloud, Edge & DevOps',
        summary:
          'Architecture cloud, migration et automatisation CI/CD sur Google Cloud (GCP), Amazon Web Services (AWS), Firebase et Cloudflare Workers — haute disponibilité, zéro temps d’arrêt et maîtrise des coûts.',
        tags: ['Google Cloud', 'AWS', 'Firebase', 'Cloudflare'],
        topic: 'Cloud, Edge & DevOps (GCP / AWS / Firebase / Cloudflare)',
      },
      {
        id: 'market-intel-data',
        code: '07',
        icon: 'intel',
        accent: 'green',
        title: 'Market Intelligence & Data Pipelines',
        summary:
          'Ingestion de données quantitatives temps réel, radars de veille automatisés, télémétrie et tableaux de bord exécutifs transformant les flux bruts en décisions claires.',
        tags: ['Télémétrie Live', 'Pipelines Quant', 'Analytics'],
        topic: 'Market Intelligence & Data Pipelines',
      },
      {
        id: 'due-diligence-security',
        code: '08',
        icon: 'security',
        accent: 'ruby',
        title: 'Due Diligence Technique & Sécurité',
        summary:
          'Audit approfondi du code et des risques avant investissement ou mise en ligne, correction active des failles de sécurité, suppression des fuites de secrets et durcissement OWASP / CSP / HSTS.',
        tags: ['Correction de Failles', 'Audit Codebase', 'OWASP / HSTS'],
        topic: 'Due Diligence Technique & Sécurité',
      },
      {
        id: 'perf-seo-geo',
        code: '09',
        icon: 'seo',
        accent: 'gold',
        title: 'Performance, SEO & GEO/AEO',
        summary:
          'Ingénierie Lighthouse 100/100, optimisation zéro-CLS, SEO technique et GEO/AEO (JSON-LD & llms.txt) pour maximiser votre visibilité sur Google et les moteurs de réponse IA.',
        tags: ['Lighthouse 100', 'SEO Technique', 'GEO / AEO'],
        topic: 'Performance, SEO & GEO/AEO',
      },
    ],
    processEyebrow: 'MÉTHODOLOGIE DE LIVRAISON',
    processTitle: 'Comment KRONVEX pilote votre projet de l’idée au déploiement.',
    phaseLabel: 'PHASE',
    steps: [
      { step: '01', title: 'Cadrage & Architecture', detail: 'Audit des objectifs, risques, choix cloud et exigences de sécurité avant d’écrire le code.' },
      { step: '02', title: 'Design & Tranche Verticale', detail: 'Validation UX/UI et livraison rapide d’un prototype fonctionnel dès la première semaine.' },
      { step: '03', title: 'Développement & Sécurisation', detail: 'Implémentation multi-plateforme et cloud, correction des vulnérabilités, CI et Lighthouse 100.' },
      { step: '04', title: 'Déploiement & Transfert', detail: 'Mise en ligne sur GCP, AWS, Firebase ou Cloudflare, transfert complet du code/PI et accompagnement.' },
    ],
    modelsEyebrow: 'MODÈLES DE COLLABORATION',
    modelsTitle: 'Des formats flexibles conçus pour la rapidité et la responsabilité totale.',
    startPrefix: 'Démarrer',
    models: [
      {
        tag: '2 – 4 SEMAINES',
        name: 'Sprint Audit, Stratégie & Prototype',
        idealFor: 'Équipes ayant besoin d’une due diligence, d’une remédiation sécurité ou d’un prototype validé.',
        points: ['Audit complet du code et correction des failles critiques', 'Prototype fonctionnel ou PoC d’IA locale', 'Plan cloud, performance et SEO/GEO'],
        topic: 'Sprint Audit, Stratégie & Prototype',
      },
      {
        tag: '1 – 3 MOIS · CLÉ EN MAIN',
        name: 'Livraison Complète du Projet',
        idealFor: 'Entreprises souhaitant confier l’intégralité du projet à KRONVEX jusqu’à la mise en production.',
        points: ['Exécution totale : UX/UI, Web/Windows/macOS/Linux/Mobile, APIs & IA', 'Déploiement GCP, AWS, Firebase & Cloudflare', 'Durcissement sécurité et 100% propriété du code'],
        topic: 'Livraison Complète du Projet',
      },
      {
        tag: 'PARTENAIRE CONTINU',
        name: 'Partenaire Ingénierie IA-Native',
        idealFor: 'Organisations en croissance continue sur les agents IA, le cloud et la sécurité proactive.',
        points: ['Collaboration directe avec l’architecte principal KRONVEX', 'Évolutions continues, optimisation cloud et patchs sécurité', 'Workflows agentiques MCP, SKILL.md & CLI'],
        topic: 'Partenaire Ingénierie IA-Native',
      },
    ],
    faqEyebrow: 'QUESTIONS FRÉQUENTES',
    faqTitle: 'Réponses sur la prise en charge globale, le cloud, la sécurité et la PI.',
    faqs: [
      { q: 'Prenez-vous en charge un projet dans sa totalité de A à Z ?', a: 'Oui. Nous pilotons la stratégie, le design UX/UI, le développement Web/Windows/macOS/Linux/Mobile, le cloud (GCP, AWS, Firebase, Cloudflare), la sécurité et le suivi post-lancement.' },
      { q: 'Corrigez-vous les vulnérabilités de sécurité sur des projets existants ?', a: 'Oui. Notre offre Due Diligence & Sécurité audite le code, les API, les configurations cloud et corrige activement les failles OWASP, fuites de clés et en-têtes CSP/HSTS.' },
      { q: 'Quelles plateformes desktop, mobile et cloud couvrez-vous ?', a: 'Web (React/TS), Desktop (Windows, macOS, Linux), Mobile (Android, iOS/Flutter), et les clouds Google Cloud (GCP), AWS, Firebase et Cloudflare Workers.' },
      { q: 'Conservons-nous 100% du code source et de la propriété intellectuelle ?', a: 'Oui. L’intégralité du code source, des scripts IaC et de la propriété intellectuelle vous est transférée sans verrouillage fournisseur.' },
    ],
    playbookPrompt: 'Découvrez nos standards d’ingénierie et de sécurité dans le KRONVEX Engineering Playbook.',
    playbookCta: 'Ouvrir le Playbook',
    inquiryGreeting: 'Bonjour l’équipe KRONVEX,',
    inquirySelectedLabel: 'Service / Modèle sélectionné :',
    inquiryGoalsLabel: 'Objectifs, plateformes cibles et délais :',
    inquiryPlaceholder: '(Précisez si vous souhaitez une prise en charge complète du projet, un audit sécurité, du cloud ou un développement ciblé...)',
  },

  es: {
    heroEyebrow: 'SERVICIOS KRONVEX · INGENIERÍA INTEGRAL',
    heroTitlePrefix: 'Software a Medida, Cloud e ',
    heroTitleAccent: 'Ingeniería IA-Nativa',
    heroTitleSuffix: '',
    heroSubtitle:
      'Asumimos la ejecución completa de tu proyecto de principio a fin: desde estrategia de producto y diseño UX/UI hasta desarrollo multiplataforma (Web, Windows, macOS, Linux, Móvil), Google Cloud / AWS / Firebase / Cloudflare, IA privada y cierre de vulnerabilidades de seguridad.',
    turnkeyBadge: 'LLAVE EN MANO · NOS ENCARGAMOS DEL PROYECTO COMPLETO',
    ctaScope: 'Definir Alcance del Proyecto',
    ctaWork: 'Ver Casos de Estudio',
    stats: [
      { value: '100/100', label: 'Rendimiento Lighthouse', tone: 'ink' },
      { value: 'Integral', label: 'Proyecto Llave en Mano', tone: 'green' },
      { value: '100%', label: 'Propiedad del Código y PI', tone: 'cyan' },
      { value: '48h', label: 'Alcance y SLA de Seguridad', tone: 'gold' },
    ],
    gridEyebrow: 'CATÁLOGO COMPLETO · 9 DISCIPLINAS DE INGENIERÍA',
    gridTitle: 'Todas las capacidades para llevar tu producto de cero a producción segura.',
    gridSubtitle:
      'Contrata a KRONVEX para un sprint técnico puntual o deléganos el ciclo completo del proyecto: estrategia, diseño, código, nube y remediación de seguridad bajo un solo equipo.',
    requestServiceLabel: 'Solicitar este servicio',
    services: [
      {
        id: 'product-strategy',
        code: '01',
        icon: 'strategy',
        accent: 'gold',
        title: 'Estrategia de Producto y Entrega Integral',
        summary:
          'Nos encargamos del proyecto completo desde el primer día: hoja de ruta de mercado, arquitectura técnica, MVP y ejecución total hasta el lanzamiento en producción y escalado.',
        tags: ['Proyecto Completo', 'Arquitectura', 'MVP a Escala'],
        topic: 'Estrategia de Producto y Entrega Integral',
      },
      {
        id: 'ux-ui-design',
        code: '02',
        icon: 'design',
        accent: 'cyan',
        title: 'Diseño UX & UI y Design Systems',
        summary:
          'Diseño centrado en el usuario con Design Tokens reutilizables, prototipos interactivos, interfaces ópticas 60fps Zero-GPU, accesibilidad WCAG AA y soporte multilingüe RTL/LTR.',
        tags: ['Design Systems', 'WCAG AA', 'Prototipos'],
        topic: 'Diseño UX & UI y Design Systems',
      },
      {
        id: 'cross-platform-apps',
        code: '03',
        icon: 'apps',
        accent: 'azure',
        title: 'Apps Web, Escritorio y Móvil',
        summary:
          'Software de producción con núcleos tipados para Web (React/TypeScript), Escritorio (Windows, macOS y Linux) y Móvil (Android e iOS / Flutter) con lanzamientos firmados SHA-256.',
        tags: ['Web', 'Windows · macOS · Linux', 'Android · iOS'],
        topic: 'Desarrollo Web, Escritorio (Windows/macOS/Linux) y Móvil',
      },
      {
        id: 'private-ai-rag',
        code: '04',
        icon: 'ai',
        accent: 'green',
        title: 'IA Privada, RAG y Agentes Autónomos',
        summary:
          'Pipelines RAG empresariales, agentes de IA personalizados, flujos SKILL.md e inferencia local con WebGPU/ONNX u Ollama para que tus datos confidenciales nunca salgan de tu infraestructura.',
        tags: ['RAG Privado', 'WebGPU / Ollama', 'Agentes IA'],
        topic: 'IA Privada, RAG y Agentes Autónomos',
      },
      {
        id: 'apis-mcp-cli',
        code: '05',
        icon: 'api',
        accent: 'cyan',
        title: 'APIs, Servidores MCP y CLIs',
        summary:
          'APIs REST/Edge de alta velocidad con OpenAPI 3.1 y colecciones Postman, servidores MCP Code-Mode eficientes en tokens, y CLIs de cero dependencias para ecosistemas de desarrollo.',
        tags: ['OpenAPI 3.1', 'MCP Code-Mode', 'CLIs a Medida'],
        topic: 'APIs, Servidores MCP y CLIs',
      },
      {
        id: 'cloud-devops',
        code: '06',
        icon: 'cloud',
        accent: 'azure',
        title: 'Cloud, Edge y DevOps',
        summary:
          'Arquitectura en la nube, migración y automatización CI/CD en Google Cloud (GCP), Amazon Web Services (AWS), Firebase y Cloudflare Workers — alta disponibilidad y cero caídas.',
        tags: ['Google Cloud', 'AWS', 'Firebase', 'Cloudflare'],
        topic: 'Cloud, Edge y DevOps (GCP / AWS / Firebase / Cloudflare)',
      },
      {
        id: 'market-intel-data',
        code: '07',
        icon: 'intel',
        accent: 'green',
        title: 'Inteligencia de Mercado y Datos',
        summary:
          'Pipelines de datos cuantitativos en tiempo real, radares automáticos de investigación, telemetría y paneles ejecutivos que convierten flujos brutos en decisiones claras.',
        tags: ['Telemetría Live', 'Pipelines Quant', 'Analítica'],
        topic: 'Inteligencia de Mercado y Datos',
      },
      {
        id: 'due-diligence-security',
        code: '08',
        icon: 'security',
        accent: 'ruby',
        title: 'Due Diligence Técnica y Seguridad',
        summary:
          'Auditoría profunda de código y riesgos antes de invertir o lanzar, más cierre activo de vulnerabilidades de seguridad, parcheo de brechas, eliminación de secretos y endurecimiento OWASP/CSP/HSTS.',
        tags: ['Cierre de Vulnerabilidades', 'Auditoría Código', 'OWASP / HSTS'],
        topic: 'Due Diligence Técnica y Seguridad',
      },
      {
        id: 'perf-seo-geo',
        code: '09',
        icon: 'seo',
        accent: 'gold',
        title: 'Rendimiento, SEO y GEO/AEO',
        summary:
          'Ingeniería Lighthouse 100/100, cero CLS, SEO técnico y optimización GEO/AEO con JSON-LD y llms.txt para destacar tanto en Google como en motores de respuesta de IA.',
        tags: ['Lighthouse 100', 'SEO Técnico', 'GEO / AEO'],
        topic: 'Rendimiento, SEO y GEO/AEO',
      },
    ],
    processEyebrow: 'METODOLOGÍA DE ENTREGA',
    processTitle: 'Cómo KRONVEX ejecuta tu proyecto completo de la idea al lanzamiento.',
    phaseLabel: 'FASE',
    steps: [
      { step: '01', title: 'Descubrimiento y Arquitectura', detail: 'Evaluamos objetivos, riesgos, nube objetivo y seguridad en un plano técnico concreto.' },
      { step: '02', title: 'Diseño y Prototipo Vertical', detail: 'Validamos UX/UI y entregamos un corte funcional real desde la primera semana.' },
      { step: '03', title: 'Desarrollo y Blindaje de Seguridad', detail: 'Implementación completa, cierre de vulnerabilidades, CI automático y Lighthouse 100.' },
      { step: '04', title: 'Despliegue y Entrega Total', detail: 'Lanzamiento en GCP, AWS, Firebase o Cloudflare, transferencia total del código y soporte.' },
    ],
    modelsEyebrow: 'MODELOS DE COLABORACIÓN',
    modelsTitle: 'Formatos flexibles pensados para velocidad y responsabilidad total.',
    startPrefix: 'Iniciar',
    models: [
      {
        tag: '2 – 4 SEMANAS',
        name: 'Sprint de Auditoría, Estrategia y Prototipo',
        idealFor: 'Equipos que necesitan due diligence, cierre de vulnerabilidades o un prototipo validado.',
        points: ['Auditoría de arquitectura y parcheo de vulnerabilidades', 'Prototipo funcional o PoC de IA local', 'Plan de nube, rendimiento y SEO/GEO'],
        topic: 'Sprint de Auditoría, Estrategia y Prototipo',
      },
      {
        tag: '1 – 3 MESES · LLAVE EN MANO',
        name: 'Entrega Completa del Proyecto',
        idealFor: 'Empresas que quieren que KRONVEX asuma el proyecto completo hasta producción.',
        points: ['Ejecución integral: UX/UI, Web/Windows/macOS/Linux/Móvil, APIs e IA', 'Despliegue en Google Cloud, AWS, Firebase y Cloudflare', 'Cierre de brechas de seguridad y 100% propiedad del código'],
        topic: 'Entrega Completa del Proyecto',
      },
      {
        tag: 'SOCIO CONTINUO',
        name: 'Socio Dedicado de Ingeniería IA',
        idealFor: 'Organizaciones en evolución continua con agentes de IA, nube y seguridad proactiva.',
        points: ['Trabajo directo con la arquitectura principal de KRONVEX', 'Mejoras continuas, optimización cloud y parches de seguridad', 'Flujos agénticos MCP, SKILL.md y CLI'],
        topic: 'Socio Dedicado de Ingeniería IA',
      },
    ],
    faqEyebrow: 'PREGUNTAS FRECUENTES',
    faqTitle: 'Respuestas claras sobre entrega integral, nube, seguridad y propiedad.',
    faqs: [
      { q: '¿Pueden encargarse del proyecto completo de principio a fin?', a: 'Sí. Asumimos estrategia, UX/UI, desarrollo Web/Windows/macOS/Linux/Móvil, despliegue en Google Cloud/AWS/Firebase/Cloudflare, cierre de vulnerabilidades y operación.' },
      { q: '¿Auditan proyectos existentes y cierran vulnerabilidades de seguridad?', a: 'Sí. Identificamos y corregimos activamente brechas OWASP, fugas de credenciales, permisos cloud y cabeceras CSP/HSTS antes de auditorías o lanzamientos.' },
      { q: '¿Conservamos el 100% del código fuente y la propiedad intelectual?', a: 'Sí. Todo el código fuente, pipelines CI/CD y documentación se transfieren 100% a tu organización sin dependencia de proveedor.' },
    ],
    playbookPrompt: '¿Quieres revisar nuestros estándares técnicos? Lee el KRONVEX Engineering Playbook.',
    playbookCta: 'Abrir Playbook',
    inquiryGreeting: 'Hola equipo de KRONVEX,',
    inquirySelectedLabel: 'Servicio / Modelo seleccionado:',
    inquiryGoalsLabel: 'Objetivos, plataformas y plazos:',
    inquiryPlaceholder: '(Indica si necesitas entrega completa del proyecto, cierre de vulnerabilidades, cloud o desarrollo específico...)',
  },

  de: {
    heroEyebrow: 'KRONVEX SERVICES · END-TO-END ENGINEERING',
    heroTitlePrefix: 'Individuelle Software, Cloud & ',
    heroTitleAccent: 'AI-Native Engineering',
    heroTitleSuffix: '',
    heroSubtitle:
      'Wir übernehmen die vollständige End-to-End-Umsetzung Ihres Projekts — von Produktstrategie und UX/UI-Design über Cross-Platform-Apps (Web, Windows, macOS, Linux, Mobile) sowie Google Cloud / AWS / Firebase / Cloudflare bis hin zu privater KI und dem Schließen von Sicherheitslücken.',
    turnkeyBadge: 'SCHLÜSSELFERTIG · VOLLE PROJEKTVERANTWORTUNG VON DER IDEE BIS ZUM LIVEGANG',
    ctaScope: 'Projektumfang definieren',
    ctaWork: 'Fallstudien ansehen',
    stats: [
      { value: '100/100', label: 'Lighthouse Performance', tone: 'ink' },
      { value: 'End-to-End', label: 'Volle Projektübernahme', tone: 'green' },
      { value: '100%', label: 'Code- & IP-Eigentum', tone: 'cyan' },
      { value: '48h', label: 'Scoping & Security SLA', tone: 'gold' },
    ],
    gridEyebrow: 'VOLLSTÄNDIGER LEISTUNGSKATALOG · 9 KERNBEREICHE',
    gridTitle: 'Alle Disziplinen, um Ihr Produkt sicher und skalierbar in Produktion zu bringen.',
    gridSubtitle:
      'Beauftragen Sie KRONVEX für einen fokussierten Sprint oder übergeben Sie uns das gesamte Projekt — Strategie, Design, Entwicklung, Cloud und Security-Härtung aus einer Hand.',
    requestServiceLabel: 'Service anfragen',
    services: [
      {
        id: 'product-strategy',
        code: '01',
        icon: 'strategy',
        accent: 'gold',
        title: 'Produktstrategie & Komplettumsetzung',
        summary:
          'Wir übernehmen das gesamte Projekt von Tag eins — marktorientierte Roadmap, Systemarchitektur, MVP-Planung und vollständige Umsetzung bis zum stabilen Produktionsbetrieb.',
        tags: ['Komplettübernahme', 'Systemarchitektur', 'MVP bis Scale'],
        topic: 'Produktstrategie & Komplettumsetzung',
      },
      {
        id: 'ux-ui-design',
        code: '02',
        icon: 'design',
        accent: 'cyan',
        title: 'UX- & UI-Design-Systeme',
        summary:
          'Nutzerzentriertes Interface-Design mit wiederverwendbaren Design Tokens, interaktiven Prototypen, 60fps Zero-GPU-Oberflächen, WCAG-AA-Barrierefreiheit und RTL/LTR-Präzision.',
        tags: ['Design-Systeme', 'WCAG AA', 'Prototypen'],
        topic: 'UX- & UI-Design-Systeme',
      },
      {
        id: 'cross-platform-apps',
        code: '03',
        icon: 'apps',
        accent: 'azure',
        title: 'Web-, Desktop- & Mobile-Apps',
        summary:
          'Produktionsreife Software auf typsicheren Kernen für Web (React/TypeScript), Desktop (Windows, macOS & Linux) sowie Mobile (Android & iOS / Flutter) mit signierten SHA-256-Releases.',
        tags: ['Web', 'Windows · macOS · Linux', 'Android · iOS'],
        topic: 'Web-, Desktop- (Windows/macOS/Linux) & Mobile-Entwicklung',
      },
      {
        id: 'private-ai-rag',
        code: '04',
        icon: 'ai',
        accent: 'green',
        title: 'Private KI, RAG & KI-Agenten',
        summary:
          'Unternehmens-RAG-Pipelines, autonome KI-Agenten, SKILL.md-Workflows und lokale Inferenz via WebGPU/ONNX oder Ollama — sensible Daten verlassen niemals Ihre Infrastruktur.',
        tags: ['Privates RAG', 'WebGPU / Ollama', 'KI-Agenten'],
        topic: 'Private KI, RAG & KI-Agenten',
      },
      {
        id: 'apis-mcp-cli',
        code: '05',
        icon: 'api',
        accent: 'cyan',
        title: 'APIs, MCP-Server & Custom CLIs',
        summary:
          'Hochperformante REST/Edge-APIs mit OpenAPI-3.1-Verträgen und Postman-Sammlungen, token-sparende Code-Mode-MCP-Gateways sowie Zero-Dependency-CLIs für Entwickler.',
        tags: ['OpenAPI 3.1', 'Code-Mode MCP', 'Custom CLIs'],
        topic: 'APIs, MCP-Server & Custom CLIs',
      },
      {
        id: 'cloud-devops',
        code: '06',
        icon: 'cloud',
        accent: 'azure',
        title: 'Cloud, Edge & DevOps',
        summary:
          'Cloud-Architektur, Migration und CI/CD-Automatisierung auf Google Cloud (GCP), Amazon Web Services (AWS), Firebase und Cloudflare Workers — hochverfügbar und kosteneffizient.',
        tags: ['Google Cloud', 'AWS', 'Firebase', 'Cloudflare'],
        topic: 'Cloud, Edge & DevOps (GCP / AWS / Firebase / Cloudflare)',
      },
      {
        id: 'market-intel-data',
        code: '07',
        icon: 'intel',
        accent: 'green',
        title: 'Market Intelligence & Daten-Pipelines',
        summary:
          'Echtzeit-Datenverarbeitung, automatisierte Forschungsradare, quantitative Telemetrie und Executive-Dashboards für präzise Entscheidungen.',
        tags: ['Live-Telemetrie', 'Quant-Pipelines', 'Analytics'],
        topic: 'Market Intelligence & Daten-Pipelines',
      },
      {
        id: 'due-diligence-security',
        code: '08',
        icon: 'security',
        accent: 'ruby',
        title: 'Technical Due Diligence & Security',
        summary:
          'Tiefgehende Codebase- und Risiko-Audits vor Investment oder Launch sowie aktives Schließen von Sicherheitslücken, Exploit-Patching, Secret-Bereinigung und OWASP/CSP/HSTS-Härtung.',
        tags: ['Sicherheitslücken schließen', 'Code-Audit', 'OWASP / HSTS'],
        topic: 'Technical Due Diligence & Security',
      },
      {
        id: 'perf-seo-geo',
        code: '09',
        icon: 'seo',
        accent: 'gold',
        title: 'Performance, SEO & GEO/AEO',
        summary:
          'Lighthouse 100/100 Optimierung, technisches SEO sowie Generative Engine Optimization (JSON-LD & llms.txt) für maximale Sichtbarkeit in Google und KI-Antwortmaschinen.',
        tags: ['Lighthouse 100', 'Technisches SEO', 'GEO / AEO'],
        topic: 'Performance, SEO & GEO/AEO',
      },
    ],
    processEyebrow: 'LIEFERMETHODIK',
    processTitle: 'Wie KRONVEX Ihr gesamtes Projekt von der Idee bis zum Launch führt.',
    phaseLabel: 'PHASE',
    steps: [
      { step: '01', title: 'Analyse & Architektur', detail: 'Klare Bewertung von Zielen, Risiken, Cloud-Plattformen und Sicherheitsgrenzen vor der Entwicklung.' },
      { step: '02', title: 'Design & Vertikaler Prototyp', detail: 'UX/UI-Validierung und schneller produktiver Funktionsschnitt bereits in Woche eins.' },
      { step: '03', title: 'Entwicklung & Security-Härtung', detail: 'Vollständige Umsetzung, Schließen von Sicherheitslücken, CI-Gates und Lighthouse 100.' },
      { step: '04', title: 'Go-Live, Übergabe & Betrieb', detail: 'Zero-Downtime-Deployment auf GCP, AWS, Firebase oder Cloudflare plus 100% Code-Übergabe.' },
    ],
    modelsEyebrow: 'ZUSAMMENARBEITSMODELLE',
    modelsTitle: 'Flexible Modelle für Geschwindigkeit, Sicherheit und volle Verantwortung.',
    startPrefix: 'Starten:',
    models: [
      {
        tag: '2 – 4 WOCHEN',
        name: 'Audit-, Strategie- & Prototyp-Sprint',
        idealFor: 'Teams mit Bedarf an Due Diligence, Sicherheits-Patching oder einem validierten Prototyp.',
        points: ['Architektur-Blueprint oder Sicherheits-Schwachstellen-Audit', 'Lauffähiger Prototyp oder lokaler KI-PoC', 'Cloud-, Performance- & SEO/GEO-Baseline'],
        topic: 'Audit-, Strategie- & Prototyp-Sprint',
      },
      {
        tag: '1 – 3 MONATE · SCHLÜSSELFERTIG',
        name: 'Vollständige End-to-End-Projektlieferung',
        idealFor: 'Unternehmen, die das gesamte Projekt vollständig in die Hände von KRONVEX legen möchten.',
        points: ['Komplettumsetzung: UX/UI, Web/Windows/macOS/Linux/Mobile, APIs & KI', 'Cloud-Deployment auf GCP, AWS, Firebase & Cloudflare', 'Security-Härtung und 100% Code-/IP-Eigentum'],
        topic: 'Vollständige End-to-End-Projektlieferung',
      },
      {
        tag: 'LAUFENDER PARTNER',
        name: 'Dedizierter AI-Native Partner',
        idealFor: 'Organisationen im kontinuierlichen Ausbau von KI-Agenten, Cloud-Ops und Security.',
        points: ['Direkte Zusammenarbeit mit der KRONVEX-Architekturleitung', 'Laufende Features, Cloud-Optimierung & Security-Patches', 'Individuelle MCP-, SKILL.md- & CLI-Automatisierung'],
        topic: 'Dedizierter AI-Native Partner',
      },
    ],
    faqEyebrow: 'HÄUFIGE FRAGEN',
    faqTitle: 'Antworten zu Projektübernahme, Cloud-Stacks, Sicherheit & IP.',
    faqs: [
      { q: 'Übernimmt KRONVEX das gesamte Projekt von der Idee bis zum Betrieb?', a: 'Ja. Wir liefern schlüsselfertig: Produktstrategie, UX/UI, Web/Windows/macOS/Linux/Mobile, Cloud (GCP, AWS, Firebase, Cloudflare), Security-Härtung und laufende Begleitung.' },
      { q: 'Prüfen Sie bestehenden Code und schließen Sicherheitslücken?', a: 'Ja. Unser Technical Due Diligence & Security Service identifiziert und behebt Sicherheitslücken, Secret-Leaks, Cloud-Fehlkonfigurationen und OWASP/CSP/HSTS-Risiken aktiv.' },
      { q: 'Behalten wir 100% Eigentum an Quellcode und IP?', a: 'Ja. Quellcode, Infrastruktur-Skripte, CI-Pipelines und alle IP-Rechte gehen vollständig ohne Vendor-Lock-in an Sie über.' },
    ],
    playbookPrompt: 'Möchten Sie unsere Engineering- und Security-Standards prüfen? Lesen Sie das KRONVEX Playbook.',
    playbookCta: 'Playbook öffnen',
    inquiryGreeting: 'Hallo KRONVEX Engineering-Team,',
    inquirySelectedLabel: 'Ausgewählter Service / Modell:',
    inquiryGoalsLabel: 'Projektziele, Zielplattformen & Zeitrahmen:',
    inquiryPlaceholder: '(Beschreiben Sie, ob Sie eine Komplettübernahme, Sicherheits-Patching, Cloud oder App-Entwicklung wünschen...)',
  },

  'zh-CN': {
    heroEyebrow: 'KRONVEX 工程服务 · 全生命周期交付',
    heroTitlePrefix: '定制软件、云架构与 ',
    heroTitleAccent: 'AI 原生工程',
    heroTitleSuffix: ' 服务',
    heroSubtitle:
      '我们全程托管并端到端负责您的整个项目——从产品战略与 UX/UI 设计，到全平台应用开发（Web、Windows、macOS、Linux、移动端）、Google Cloud / AWS / Firebase / Cloudflare 云架构、私有 AI 系统以及安全漏洞修复加固。',
    turnkeyBadge: '全权交付 · 从创意构想到生产上线的完整项目托管',
    ctaScope: '规划项目范围',
    ctaWork: '查看工程案例',
    stats: [
      { value: '100/100', label: 'Lighthouse 性能分', tone: 'ink' },
      { value: '全流程', label: '整套项目全权负责', tone: 'green' },
      { value: '100%', label: '源码与知识产权归属客户', tone: 'cyan' },
      { value: '48h', label: '方案评估与安全响应', tone: 'gold' },
    ],
    gridEyebrow: '完整服务矩阵 · 9 大核心工程领域',
    gridTitle: '覆盖从 0 到 1 上线与规模化增长所需的全部技术能力。',
    gridSubtitle:
      '无论是专项技术冲刺，还是将整个项目全权交由 KRONVEX 团队托管——战略、设计、研发、云部署与安全加固均由统一架构团队负责到底。',
    requestServiceLabel: '申请此项服务',
    services: [
      {
        id: 'product-strategy',
        code: '01',
        icon: 'strategy',
        accent: 'gold',
        title: '产品战略与全流程项目托管',
        summary:
          '从第一天起全权负责您的整个项目：市场导向路线图、系统架构蓝图、MVP 规划，并完整交付至生产上线与后续扩展。',
        tags: ['全项目负责', '系统架构', 'MVP 到规模化'],
        topic: '产品战略与全流程项目托管',
      },
      {
        id: 'ux-ui-design',
        code: '02',
        icon: 'design',
        accent: 'cyan',
        title: 'UX & UI 与设计系统',
        summary:
          '以用户为核心的界面设计、可复用 Design Tokens、交互原型、60fps 零 GPU 负担光学界面、WCAG AA 无障碍以及多语言 RTL/LTR 适配。',
        tags: ['设计系统', 'WCAG AA', '交互原型'],
        topic: 'UX & UI 与设计系统',
      },
      {
        id: 'cross-platform-apps',
        code: '03',
        icon: 'apps',
        accent: 'azure',
        title: 'Web、桌面与移动应用开发',
        summary:
          '基于类型安全核心打造生产级跨平台应用：Web（React/TypeScript）、桌面端（Windows、macOS 与 Linux）以及移动端（Android / iOS / Flutter），附带 SHA-256 签名发布。',
        tags: ['Web', 'Windows · macOS · Linux', 'Android · iOS'],
        topic: 'Web、桌面（Windows/macOS/Linux）与移动应用开发',
      },
      {
        id: 'private-ai-rag',
        code: '04',
        icon: 'ai',
        accent: 'green',
        title: '私有 AI、RAG 与智能体',
        summary:
          '企业级私有 RAG 检索管道、定制 AI 智能体、SKILL.md 工作流，以及基于 WebGPU/ONNX 或 Ollama 的本地零云端推理，确保敏感数据不出内网。',
        tags: ['私有 RAG', 'WebGPU / Ollama', 'AI 智能体'],
        topic: '私有 AI、RAG 与智能体',
      },
      {
        id: 'apis-mcp-cli',
        code: '05',
        icon: 'api',
        accent: 'cyan',
        title: 'API、MCP 服务器与 CLI 工具',
        summary:
          '高性能 REST/Edge API（含 OpenAPI 3.1 规范与 Postman 集合）、节省 Token 的 Code-Mode MCP 网关以及零依赖开发者 CLI 工具。',
        tags: ['OpenAPI 3.1', 'Code-Mode MCP', '定制 CLI'],
        topic: 'API、MCP 服务器与 CLI 工具',
      },
      {
        id: 'cloud-devops',
        code: '06',
        icon: 'cloud',
        accent: 'azure',
        title: '云计算、边缘网络与 DevOps',
        summary:
          '覆盖 Google Cloud (GCP)、Amazon Web Services (AWS)、Firebase 与 Cloudflare Workers 的云架构、迁移、CI/CD 自动化与零停机运维。',
        tags: ['Google Cloud', 'AWS', 'Firebase', 'Cloudflare'],
        topic: '云计算、边缘与 DevOps (GCP / AWS / Firebase / Cloudflare)',
      },
      {
        id: 'market-intel-data',
        code: '07',
        icon: 'intel',
        accent: 'green',
        title: '市场情报与数据管道',
        summary:
          '实时量化数据采集、自动化科研与行业雷达、遥测管道及高管决策看板，将原始数据流提炼为清晰洞察。',
        tags: ['实时遥测', '量化管道', '决策分析'],
        topic: '市场情报与数据管道',
      },
      {
        id: 'due-diligence-security',
        code: '08',
        icon: 'security',
        accent: 'ruby',
        title: '技术尽职调查与安全漏洞修复',
        summary:
          '投前与上线前深度代码和架构风险审计，主动排查并修复安全漏洞、封堵攻击面、清除密钥泄漏，并实施 OWASP / CSP / HSTS 安全加固。',
        tags: ['安全漏洞修复', '代码风险审计', 'OWASP / HSTS'],
        topic: '技术尽职调查与安全漏洞修复',
      },
      {
        id: 'perf-seo-geo',
        code: '09',
        icon: 'seo',
        accent: 'gold',
        title: '性能优化、SEO 与 GEO/AEO',
        summary:
          'Lighthouse 100/100 极限性能调优、技术 SEO 以及面向 AI 搜索引擎的 GEO/AEO（JSON-LD 与 llms.txt）建设。',
        tags: ['Lighthouse 100', '技术 SEO', 'GEO / AEO'],
        topic: '性能优化、SEO 与 GEO/AEO',
      },
    ],
    processEyebrow: '交付方法论',
    processTitle: 'KRONVEX 如何将您的完整项目从构想稳步推向生产上线。',
    phaseLabel: '阶段',
    steps: [
      { step: '01', title: '需求诊断与架构蓝图', detail: '评估业务目标、技术风险、云平台选型与安全边界，在编码前输出清晰架构规范。' },
      { step: '02', title: '交互设计与垂直原型', detail: '快速验证 UX/UI 流程，第一周即可体验可运行的端到端核心功能切片。' },
      { step: '03', title: '完整研发与安全加固', detail: '全平台与云端开发、主动修复安全漏洞、自动化 CI 门禁与 Lighthouse 100 验收。' },
      { step: '04', title: '生产发布与源码移交', detail: '在 GCP、AWS、Firebase 或 Cloudflare 零停机上线，完整移交源码与知识产权。' },
    ],
    modelsEyebrow: '合作模式',
    modelsTitle: '兼顾速度、安全与全权负责的灵活协作方式。',
    startPrefix: '启动',
    models: [
      {
        tag: '2 – 4 周',
        name: '审计、战略与原型冲刺',
        idealFor: '需要技术尽调、安全漏洞修复或快速验证原型的团队与创始人。',
        points: ['完整架构方案或深度安全漏洞修复报告', '可运行原型或本地 AI 概念验证', '云成本、性能与 SEO/GEO 基准评估'],
        topic: '审计、战略与原型冲刺',
      },
      {
        tag: '1 – 3 个月 · 全程交钥匙',
        name: '全项目端到端交付',
        idealFor: '希望将整个项目全权交由 KRONVEX 从规划设计交付到生产上线的企业。',
        points: ['完整交付：UX/UI、Web/Windows/macOS/Linux/移动端、API 与 AI', 'Google Cloud、AWS、Firebase 与 Cloudflare 生产部署', '安全漏洞加固、CI/CD 及 100% 源码与知识产权归属'],
        topic: '全项目端到端交付',
      },
      {
        tag: '长期合作伙伴',
        name: '专属 AI 原生工程伙伴',
        idealFor: '持续迭代 AI 智能体、云基础设施与主动安全防护的成长型组织。',
        points: ['与 KRONVEX 核心架构直接协同', '持续功能研发、云成本优化与实时漏洞修复', '定制 MCP、SKILL.md 与 CLI 自动化工作流'],
        topic: '专属 AI 原生工程伙伴',
      },
    ],
    faqEyebrow: '常见问题',
    faqTitle: '关于全项目负责、云栈、安全加固与产权归属的明确解答。',
    faqs: [
      { q: 'KRONVEX 可以全程负责整个项目从构想到上线吗？', a: '可以。我们提供完整的交钥匙交付：产品战略、UX/UI 设计、Web/Windows/macOS/Linux/移动端开发、Google Cloud/AWS/Firebase/Cloudflare 云部署、安全加固及上线维护。' },
      { q: '你们能审查现有系统并修复安全漏洞吗？', a: '可以。我们的技术尽调与安全服务会全面排查代码、API、云权限、密钥泄漏及 OWASP/CSP/HSTS 风险，并直接实施漏洞修复与复测。' },
      { q: '客户是否保留 100% 源代码和知识产权？', a: '是的。所有定制项目的源代码、基础设施脚本、文档与知识产权 100% 移交给客户，无任何供应商锁定。' },
    ],
    playbookPrompt: '想了解我们在每个版本中遵循的工程与安全标准？欢迎阅读 KRONVEX 工程手册。',
    playbookCta: '打开工程手册',
    inquiryGreeting: '你好 KRONVEX 工程团队，',
    inquirySelectedLabel: '已选服务 / 合作模式：',
    inquiryGoalsLabel: '项目目标、目标平台与周期：',
    inquiryPlaceholder: '（请说明您是否需要整套项目全权交付、安全漏洞修复、云部署或特定平台开发...）',
  },
};
