export type LocaleCode = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'zh-CN';

export interface LocaleOption {
  code: LocaleCode;
  badge: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'en', badge: 'EN', nativeName: 'English (United States)', dir: 'ltr' },
  { code: 'ar', badge: 'AR', nativeName: 'العربية', dir: 'rtl' },
  { code: 'fr', badge: 'FR', nativeName: 'Français (France)', dir: 'ltr' },
  { code: 'es', badge: 'ES', nativeName: 'Español (España)', dir: 'ltr' },
  { code: 'de', badge: 'DE', nativeName: 'Deutsch (Deutschland)', dir: 'ltr' },
  { code: 'zh-CN', badge: 'ZH-CN', nativeName: '简体中文 (中国)', dir: 'ltr' },
];

export interface TranslationSchema {
  nav: {
    home: string;
    services: string;
    apps: string;
    models: string;
    skills: string;
    top21: string;
    arcade: string;
    constellation: string;
    vision: string;
    search: string;
    tagline: string;
    lightMode: string;
    darkMode: string;
    openCli: string;
    languageLabel: string;
  };
  footer: {
    tagline: string;
    syncedBadge: string;
    partnerCta: string;
    copyright: string;
    shortcutHint: string;
    groups: {
      products: string;
      capabilities: string;
      enterprise: string;
      industries: string;
      developers: string;
      interactiveLab: string;
      organization: string;
      governance: string;
    };
    links: {
      pulseDesktop: string;
      sentinelMobile: string;
      aiRunner: string;
      browserAiStudio: string;
      skillsBundler: string;
      top21Radar: string;
      researchPapers: string;
      crossPlatform: string;
      marketIntel: string;
      localWebGpu: string;
      agentSkills: string;
      interactiveArcade: string;
      enterpriseOverview: string;
      customApps: string;
      privateAiRag: string;
      marketDataPipelines: string;
      perfSecurityAudits: string;
      scopeProject: string;
      fintechQuant: string;
      startupsSaas: string;
      ecommerceOps: string;
      researchEdu: string;
      smbBusiness: string;
      githubOrg: string;
      platformReleases: string;
      platformDocs: string;
      controlPlane: string;
      constellation: string;
      agentDiscovery: string;
      techAiQuiz: string;
      neuralChess: string;
      orbitalDefender: string;
      kronvexCli: string;
      visionManifesto: string;
      strategicRoadmap: string;
      leadership: string;
      contactInquiries: string;
      researchWeb: string;
      securityPolicy: string;
      responsibleDisclosure: string;
      contributing: string;
      codeOfConduct: string;
      zeroTracking: string;
      servicesEngagement: string;
      workCaseStudies: string;
      engineeringPlaybook: string;
      mcpServer: string;
    };
  };
  home: {
    statusBadge: string;
    heroPrefix: string;
    heroHighlight: string;
    heroSuffix: string;
    heroDesc: string;
    ctaChat: string;
    ctaAppsAndroid: string;
    ctaAppsWindows: string;
    ctaAppsCross: string;
    statOs: string;
    statEngine: string;
    statSkills: string;
    statSkillsReady: string;
    statRepos: string;
    statReposPublic: string;
    emblemLabel: string;
    emblemMatrix: string;
    emblemApps: string;
    emblemModels: string;
    emblemCloud: string;
    archLabel: string;
    archTitle: string;
    archSubtitle: string;
    pillarLabel: string;
    pillars: {
      apps: { title: string; subtitle: string; desc: string };
      intel: { title: string; subtitle: string; desc: string };
      ai: { title: string; subtitle: string; desc: string };
    };
    platformLabel: string;
    platformTitle: string;
    exploreConstellation: string;
    platformCards: {
      chat: { title: string; desc: string; cta: string };
      apps: { title: string; desc: string; cta: string };
      skills: { title: string; desc: string; cta: string };
      arcade: { title: string; desc: string; cta: string; badge: string };
      top21: { title: string; desc: string; cta: string; badge: string };
      constellation: { title: string; desc: string; cta: string };
    };
    trustBadge: string;
    trustTitle: string;
    trustDesc: string;
    ctaEnterprise: string;
    ctaGithub: string;
    ctaRoadmap: string;
  };
  apps: {
    badge: string;
    title: string;
    subtitle: string;
    detectedOs: string;
    allApps: string;
    crossPlatform: string;
    keyCapabilities: string;
    systemReq: string;
    directArtifacts: string;
    download: string;
    recommended: string;
    shaNotice: string;
  };
  models: {
    badge: string;
    title: string;
    subtitle: string;
    detectorTitle: string;
    active: string;
    tabCatalog: string;
    tabChat: string;
    loadChatBtn: string;
    selectQuant: string;
    directDownload: string;
    runLocally: string;
  };
  skills: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    inspectBtn: string;
    bundleBtn: string;
    selectedBtn: string;
    composerTitle: string;
    composerSub: string;
    clearBtn: string;
    downloadZipBtn: string;
    buildingZip: string;
  };
  top21: {
    badge: string;
    title: string;
    subtitle: string;
    refreshBtn: string;
    refreshingBtn: string;
    tabGithub: string;
    tabHf: string;
    tabPapers: string;
    ghWeekly: string;
    ghStarred: string;
    ghDownloaded: string;
    hfWeekly: string;
    hf30d: string;
    hfAllTime: string;
    papersGiants: string;
    papersLiveGiants: string;
    papersDaily: string;
    discoveryLabel: string;
    allDomains: string;
    allLabs: string;
    filterGhPlaceholder: string;
    filterHfPlaceholder: string;
    filterPapersPlaceholder: string;
    openBtn: string;
    releasesBtn: string;
    pdfBtn: string;
    labPortalBtn: string;
  };
  arcade: {
    badge: string;
    title: string;
    subtitle: string;
    zeroLatency: string;
    tabQuiz: string;
    tabChess: string;
    tabOrbital: string;
  };
  constellation: {
    badge: string;
    title: string;
    subtitle: string;
  };
  enterprise: {
    badge: string;
    title: string;
    subtitle: string;
    ctaScope: string;
    ctaIndustries: string;
    capLabel: string;
    capTitle: string;
    indLabel: string;
    indTitle: string;
    indSub: string;
    delivLabel: string;
    delivTitle: string;
    scopeBadge: string;
    scopeTitle: string;
    scopeSub: string;
    step1: string;
    step2: string;
    step3: string;
    requestProposal: string;
  };
  vision: {
    badge: string;
    title: string;
    roadmapLabel: string;
    roadmapTitle: string;
    divisionsTitle: string;
    founderRole: string;
  };
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    composerTitle: string;
    composerSub: string;
    nameLabel: string;
    categoryLabel: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitGithub: string;
    copyInquiry: string;
    copied: string;
  };
  command: {
    quickSearch: string;
    placeholder: string;
    noMatches: string;
  };
}
