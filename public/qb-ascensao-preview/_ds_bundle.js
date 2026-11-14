/* @ds-bundle: {"format":4,"namespace":"QuebrandoABancaDesignSystem_3e4054","components":[{"name":"AchievementEmblem","sourcePath":"components/brand/AchievementEmblem.jsx"},{"name":"BrandLogo","sourcePath":"components/brand/BrandLogo.jsx"},{"name":"HeroAscension","sourcePath":"components/brand/HeroAscension.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"ICON_NAMES","sourcePath":"components/core/Icon.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Panel","sourcePath":"components/core/Panel.jsx"},{"name":"ProgressBar","sourcePath":"components/core/ProgressBar.jsx"},{"name":"Flashcard","sourcePath":"components/flashcards/Flashcard.jsx"},{"name":"ConceptPanel","sourcePath":"components/mindmap/ConceptPanel.jsx"},{"name":"MindMapCanvas","sourcePath":"components/mindmap/MindMapCanvas.jsx"},{"name":"BrandHeader","sourcePath":"components/navigation/BrandHeader.jsx"},{"name":"RadialNavigation","sourcePath":"components/navigation/RadialNavigation.jsx"},{"name":"AnswerActionBar","sourcePath":"components/questions/AnswerActionBar.jsx"},{"name":"FeedbackDrawer","sourcePath":"components/questions/FeedbackDrawer.jsx"},{"name":"QuestionCard","sourcePath":"components/questions/QuestionCard.jsx"},{"name":"CognitiveAlertBanner","sourcePath":"components/study/CognitiveAlertBanner.jsx"},{"name":"StudySessionHeader","sourcePath":"components/study/StudySessionHeader.jsx"},{"name":"TutorPanel","sourcePath":"components/tutor/TutorPanel.jsx"}],"sourceHashes":{"components/brand/AchievementEmblem.jsx":"a82881b2cd13","components/brand/BrandLogo.jsx":"2ee7ae9f3994","components/brand/HeroAscension.jsx":"88f01639df84","components/core/Badge.jsx":"e7c4f4f5ffe3","components/core/Button.jsx":"733137c4e7df","components/core/Icon.jsx":"af4306c03b53","components/core/IconButton.jsx":"753c5892c2bc","components/core/Panel.jsx":"7ad55ce0729c","components/core/ProgressBar.jsx":"4f41a84badcf","components/flashcards/Flashcard.jsx":"30a19bc38738","components/mindmap/ConceptPanel.jsx":"3e74cfafb563","components/mindmap/MindMapCanvas.jsx":"0fcd9bdb9a2e","components/navigation/BrandHeader.jsx":"42b22d8b1919","components/navigation/RadialNavigation.jsx":"293d5e94d4ae","components/questions/AnswerActionBar.jsx":"b1d913ddca16","components/questions/FeedbackDrawer.jsx":"79e2ce38b60c","components/questions/QuestionCard.jsx":"7149a8a3f8d0","components/study/CognitiveAlertBanner.jsx":"a2f1f28029a7","components/study/StudySessionHeader.jsx":"2c879748f6da","components/tutor/TutorPanel.jsx":"30dd929155bb","ui_kits/app/App.jsx":"3370cbde4cb7","ui_kits/app/AppShell.jsx":"e86609a4d7ad","ui_kits/app/Dashboard.jsx":"bb6e377cc630","ui_kits/app/FlashcardSession.jsx":"ad96e981c8ee","ui_kits/app/MindMapScreen.jsx":"0073f5c34e76","ui_kits/app/QuestionSession.jsx":"b9e00c9f9208","ui_kits/app/TutorScreen.jsx":"14bfc76c89f5","ui_kits/app/Welcome.jsx":"7a5bad081b8c","ui_kits/app/data.js":"1a8e5e1d2e16"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.QuebrandoABancaDesignSystem_3e4054 = window.QuebrandoABancaDesignSystem_3e4054 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/BrandLogo.jsx
try { (() => {
const MARKS = {
  'q-sword': ['qb-mark-q-sword', 115 / 135],
  sword: ['qb-mark-sword', 55 / 115],
  mountain: ['qb-mark-mountain', 120 / 70],
  'mountain-ribbon': ['qb-mark-mountain-ribbon', 110 / 65]
};
function Img({
  cls,
  w,
  h,
  label,
  radius,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    role: "img",
    "aria-label": label,
    className: `qb-img ${cls}`,
    style: {
      display: 'inline-block',
      width: w,
      height: h,
      backgroundSize: 'contain',
      borderRadius: radius,
      flexShrink: 0,
      ...style
    }
  });
}
function BrandLogo({
  variant = 'horizontal',
  size = 40,
  mark = 'q-sword',
  showMotto = false,
  align = 'start',
  style
}) {
  const label = 'Quebrando a Banca';
  if (variant === 'mark') {
    const [cls, ratio] = MARKS[mark] || MARKS['q-sword'];
    return /*#__PURE__*/React.createElement(Img, {
      cls: cls,
      w: ratio >= 1 ? size * ratio : size * ratio,
      h: size,
      label: label,
      style: style
    });
  }
  if (variant === 'app-icon') return /*#__PURE__*/React.createElement(Img, {
    cls: "qb-logo-app-icon",
    w: size,
    h: size * 166 / 174,
    label: label,
    radius: "22%",
    style: {
      backgroundSize: 'cover',
      ...style
    }
  });
  if (variant === 'vertical') return /*#__PURE__*/React.createElement(Img, {
    cls: "qb-logo-vertical",
    w: size * 545 / 480,
    h: size,
    label: label,
    style: style
  });
  if (variant === 'wordmark') {
    const fs = size;
    return /*#__PURE__*/React.createElement("div", {
      role: "img",
      "aria-label": label,
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        gap: fs * 0.18,
        ...style
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: `600 ${fs}px/1 var(--font-display)`,
        color: 'var(--qb-ivory)',
        letterSpacing: '.02em',
        whiteSpace: 'nowrap'
      }
    }, "QUEBRANDO A BANCA"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: fs * 0.4,
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: 'linear-gradient(90deg,rgba(208,179,134,0),var(--qb-gold),rgba(208,179,134,0))'
      }
    })), showMotto && /*#__PURE__*/React.createElement("span", {
      style: {
        font: `italic 500 ${fs * 0.4}px/1.2 var(--font-serif)`,
        color: 'var(--qb-parchment)',
        whiteSpace: 'nowrap',
        marginTop: fs * 0.1
      }
    }, "Conhecimento \xB7 Estrat\xE9gia \xB7 Disciplina \xB7 Conquista"));
  }
  // horizontal: mark left, wordmark + subtitle right (header lockup)
  return /*#__PURE__*/React.createElement("div", {
    role: "img",
    "aria-label": label,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.3,
      ...style
    }
  }, /*#__PURE__*/React.createElement(Img, {
    cls: "qb-mark-q-sword",
    w: size * 0.85,
    h: size
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: size * 0.06
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `600 ${size * 0.62}px/1 var(--font-serif)`,
      color: 'var(--qb-ivory)',
      whiteSpace: 'nowrap'
    }
  }, "Quebrando a Banca")));
}
Object.assign(__ds_scope, { BrandLogo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/BrandLogo.jsx", error: String((e && e.message) || e) }); }

// components/brand/HeroAscension.jsx
try { (() => {
const SCENES = {
  night: 'qb-scene-night',
  day: 'qb-scene-day',
  sunset: 'qb-scene-sunset'
};
function HeroAscension({
  scene = 'night',
  eyebrow,
  title,
  subtitle,
  children,
  height = 360,
  focal = 'right',
  overlay = 'strong',
  radius = 'var(--radius-card)',
  style
}) {
  const pos = focal === 'right' ? '70% 35%' : focal === 'center' ? '50% 40%' : '30% 40%';
  const protect = overlay === 'strong' ? 'linear-gradient(90deg,rgba(10,30,52,.97) 0%,rgba(10,30,52,.88) 34%,rgba(10,30,52,.35) 64%,rgba(10,30,52,.05) 100%)' : 'var(--gradient-scene-protect)';
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: radius,
      minHeight: height,
      border: 'var(--border-hairline)',
      background: 'var(--qb-midnight)',
      isolation: 'isolate',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `qb-img ${SCENES[scene] || SCENES.night}`,
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      backgroundPosition: pos,
      zIndex: -2
    }
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      background: protect,
      zIndex: -1
    }
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '45%',
      background: 'linear-gradient(180deg,rgba(10,30,52,0),rgba(10,30,52,.75))',
      zIndex: -1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 14,
      minHeight: height,
      padding: 'clamp(24px,4vw,48px)',
      maxWidth: 620
    }
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    className: "qb-overline",
    style: {
      color: 'var(--qb-gold)'
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("h1", {
    style: {
      font: '600 clamp(32px,4.4vw,52px)/1.08 var(--font-display)',
      color: 'var(--qb-ivory)',
      letterSpacing: '.02em',
      textShadow: '0 2px 18px rgba(8,10,15,.6)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'italic 500 clamp(18px,1.8vw,22px)/1.4 var(--font-serif)',
      color: 'var(--qb-parchment)',
      maxWidth: 480
    }
  }, subtitle), children && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 10
    }
  }, children)));
}
Object.assign(__ds_scope, { HeroAscension });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/HeroAscension.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
// Lucide icons (ISC), copied programmatically from lucide-static@0.460.0 (same files live in assets/icons/).
// Default stroke 1.75 matches the thin outline icons in the brand header reference.
const ICONS = {
  "search": "<circle cx=\"11\" cy=\"11\" r=\"8\" /><path d=\"m21 21-4.3-4.3\" />",
  "bell": "<path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\" /><path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\" />",
  "chart-column": "<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M18 17V9\" /><path d=\"M13 17V5\" /><path d=\"M8 17v-3\" />",
  "circle-user": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><path d=\"M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662\" />",
  "house": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" /><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />",
  "network": "<rect x=\"16\" y=\"16\" width=\"6\" height=\"6\" rx=\"1\" /><rect x=\"2\" y=\"16\" width=\"6\" height=\"6\" rx=\"1\" /><rect x=\"9\" y=\"2\" width=\"6\" height=\"6\" rx=\"1\" /><path d=\"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3\" /><path d=\"M12 12V8\" />",
  "layers": "<path d=\"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z\" /><path d=\"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65\" /><path d=\"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65\" />",
  "list-checks": "<path d=\"m3 17 2 2 4-4\" /><path d=\"m3 7 2 2 4-4\" /><path d=\"M13 6h8\" /><path d=\"M13 12h8\" /><path d=\"M13 18h8\" />",
  "message-circle": "<path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\" />",
  "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><polyline points=\"12 6 12 12 16 14\" />",
  "focus": "<circle cx=\"12\" cy=\"12\" r=\"3\" /><path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" />",
  "chevron-left": "<path d=\"m15 18-6-6 6-6\" />",
  "chevron-right": "<path d=\"m9 18 6-6-6-6\" />",
  "chevron-down": "<path d=\"m6 9 6 6 6-6\" />",
  "chevron-up": "<path d=\"m18 15-6-6-6 6\" />",
  "x": "<path d=\"M18 6 6 18\" /><path d=\"m6 6 12 12\" />",
  "check": "<path d=\"M20 6 9 17l-5-5\" />",
  "circle-check": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m9 12 2 2 4-4\" />",
  "circle-x": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m15 9-6 6\" /><path d=\"m9 9 6 6\" />",
  "triangle-alert": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /><path d=\"M12 9v4\" /><path d=\"M12 17h.01\" />",
  "rotate-ccw": "<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /><path d=\"M3 3v5h5\" />",
  "link": "<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\" /><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\" />",
  "book-open": "<path d=\"M12 7v14\" /><path d=\"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z\" />",
  "zoom-in": "<circle cx=\"11\" cy=\"11\" r=\"8\" /><line x1=\"21\" x2=\"16.65\" y1=\"21\" y2=\"16.65\" /><line x1=\"11\" x2=\"11\" y1=\"8\" y2=\"14\" /><line x1=\"8\" x2=\"14\" y1=\"11\" y2=\"11\" />",
  "zoom-out": "<circle cx=\"11\" cy=\"11\" r=\"8\" /><line x1=\"21\" x2=\"16.65\" y1=\"21\" y2=\"16.65\" /><line x1=\"8\" x2=\"14\" y1=\"11\" y2=\"11\" />",
  "maximize": "<path d=\"M8 3H5a2 2 0 0 0-2 2v3\" /><path d=\"M21 8V5a2 2 0 0 0-2-2h-3\" /><path d=\"M3 16v3a2 2 0 0 0 2 2h3\" /><path d=\"M16 21h3a2 2 0 0 0 2-2v-3\" />",
  "list": "<path d=\"M3 12h.01\" /><path d=\"M3 18h.01\" /><path d=\"M3 6h.01\" /><path d=\"M8 12h13\" /><path d=\"M8 18h13\" /><path d=\"M8 6h13\" />",
  "arrow-right": "<path d=\"M5 12h14\" /><path d=\"m12 5 7 7-7 7\" />",
  "arrow-left": "<path d=\"m12 19-7-7 7-7\" /><path d=\"M19 12H5\" />",
  "skip-forward": "<polygon points=\"5 4 15 12 5 20 5 4\" /><line x1=\"19\" x2=\"19\" y1=\"5\" y2=\"19\" />",
  "flag": "<path d=\"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z\" /><line x1=\"4\" x2=\"4\" y1=\"22\" y2=\"15\" />",
  "lightbulb": "<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\" /><path d=\"M9 18h6\" /><path d=\"M10 22h4\" />",
  "send": "<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\" /><path d=\"m21.854 2.147-10.94 10.939\" />",
  "target": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><circle cx=\"12\" cy=\"12\" r=\"6\" /><circle cx=\"12\" cy=\"12\" r=\"2\" />",
  "brain": "<path d=\"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z\" /><path d=\"M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z\" /><path d=\"M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4\" /><path d=\"M17.599 6.5a3 3 0 0 0 .399-1.375\" /><path d=\"M6.003 5.125A3 3 0 0 0 6.401 6.5\" /><path d=\"M3.477 10.896a4 4 0 0 1 .585-.396\" /><path d=\"M19.938 10.5a4 4 0 0 1 .585.396\" /><path d=\"M6 18a4 4 0 0 1-1.967-.516\" /><path d=\"M19.967 17.484A4 4 0 0 1 18 18\" />",
  "settings": "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />",
  "menu": "<line x1=\"4\" x2=\"20\" y1=\"12\" y2=\"12\" /><line x1=\"4\" x2=\"20\" y1=\"6\" y2=\"6\" /><line x1=\"4\" x2=\"20\" y1=\"18\" y2=\"18\" />",
  "plus": "<path d=\"M5 12h14\" /><path d=\"M12 5v14\" />",
  "minus": "<path d=\"M5 12h14\" />",
  "circle-help": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" /><path d=\"M12 17h.01\" />",
  "info": "<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 16v-4\" /><path d=\"M12 8h.01\" />",
  "eye": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />",
  "eye-off": "<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\" /><path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\" /><path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\" /><path d=\"m2 2 20 20\" />",
  "moon": "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\" />",
  "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\" /><path d=\"M12 2v2\" /><path d=\"M12 20v2\" /><path d=\"m4.93 4.93 1.41 1.41\" /><path d=\"m17.66 17.66 1.41 1.41\" /><path d=\"M2 12h2\" /><path d=\"M20 12h2\" /><path d=\"m6.34 17.66-1.41 1.41\" /><path d=\"m19.07 4.93-1.41 1.41\" />",
  "calendar": "<path d=\"M8 2v4\" /><path d=\"M16 2v4\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\" /><path d=\"M3 10h18\" />",
  "trophy": "<path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\" /><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\" /><path d=\"M4 22h16\" /><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\" /><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\" /><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\" />",
  "pause": "<rect x=\"14\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\" /><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\" />",
  "play": "<polygon points=\"6 3 20 12 6 21 6 3\" />",
  "corner-up-left": "<polyline points=\"9 14 4 9 9 4\" /><path d=\"M20 20v-7a4 4 0 0 0-4-4H4\" />",
  "bookmark": "<path d=\"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z\" />",
  "sparkles": "<path d=\"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z\" /><path d=\"M20 3v4\" /><path d=\"M22 5h-4\" /><path d=\"M4 17v2\" /><path d=\"M5 18H3\" />",
  "scale": "<path d=\"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z\" /><path d=\"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z\" /><path d=\"M7 21h10\" /><path d=\"M12 3v18\" /><path d=\"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2\" />",
  "gavel": "<path d=\"m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8\" /><path d=\"m16 16 6-6\" /><path d=\"m8 8 6-6\" /><path d=\"m9 7 8 8\" /><path d=\"m21 11-8-8\" />",
  "landmark": "<line x1=\"3\" x2=\"21\" y1=\"22\" y2=\"22\" /><line x1=\"6\" x2=\"6\" y1=\"18\" y2=\"11\" /><line x1=\"10\" x2=\"10\" y1=\"18\" y2=\"11\" /><line x1=\"14\" x2=\"14\" y1=\"18\" y2=\"11\" /><line x1=\"18\" x2=\"18\" y1=\"18\" y2=\"11\" /><polygon points=\"12 2 20 7 4 7\" />",
  "loader-circle": "<path d=\"M21 12a9 9 0 1 1-6.219-8.56\" />",
  "circle-dashed": "<path d=\"M10.1 2.182a10 10 0 0 1 3.8 0\" /><path d=\"M13.9 21.818a10 10 0 0 1-3.8 0\" /><path d=\"M17.609 3.721a10 10 0 0 1 2.69 2.7\" /><path d=\"M2.182 13.9a10 10 0 0 1 0-3.8\" /><path d=\"M20.279 17.609a10 10 0 0 1-2.7 2.69\" /><path d=\"M21.818 10.1a10 10 0 0 1 0 3.8\" /><path d=\"M3.721 6.391a10 10 0 0 1 2.7-2.69\" /><path d=\"M6.391 20.279a10 10 0 0 1-2.69-2.7\" />",
  "map": "<path d=\"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z\" /><path d=\"M15 5.764v15\" /><path d=\"M9 3.236v15\" />",
  "user": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\" /><circle cx=\"12\" cy=\"7\" r=\"4\" />",
  "lock": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" /><path d=\"M7 11V7a5 5 0 0 1 10 0v4\" />",
  "flame": "<path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\" />",
  "timer": "<line x1=\"10\" x2=\"14\" y1=\"2\" y2=\"2\" /><line x1=\"12\" x2=\"15\" y1=\"14\" y2=\"11\" /><circle cx=\"12\" cy=\"14\" r=\"8\" />",
  "history": "<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /><path d=\"M3 3v5h5\" /><path d=\"M12 7v5l4 2\" />",
  "coffee": "<path d=\"M10 2v2\" /><path d=\"M14 2v2\" /><path d=\"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1\" /><path d=\"M6 2v2\" />",
  "log-out": "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\" /><polyline points=\"16 17 21 12 16 7\" /><line x1=\"21\" x2=\"9\" y1=\"12\" y2=\"12\" />",
  "repeat": "<path d=\"m17 2 4 4-4 4\" /><path d=\"M3 11v-1a4 4 0 0 1 4-4h14\" /><path d=\"m7 22-4-4 4-4\" /><path d=\"M21 13v1a4 4 0 0 1-4 4H3\" />",
  "file-text": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\" /><path d=\"M14 2v4a2 2 0 0 0 2 2h4\" /><path d=\"M10 9H8\" /><path d=\"M16 13H8\" /><path d=\"M16 17H8\" />",
  "locate-fixed": "<line x1=\"2\" x2=\"5\" y1=\"12\" y2=\"12\" /><line x1=\"19\" x2=\"22\" y1=\"12\" y2=\"12\" /><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"5\" /><line x1=\"12\" x2=\"12\" y1=\"19\" y2=\"22\" /><circle cx=\"12\" cy=\"12\" r=\"7\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />",
  "shield-alert": "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"M12 8v4\" /><path d=\"M12 16h.01\" />"
};
const ICON_NAMES = Object.keys(ICONS);
function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  color = 'currentColor',
  label,
  style,
  className
}) {
  const inner = ICONS[name];
  if (!inner) return null;
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
    role: label ? 'img' : undefined,
    "aria-label": label,
    "aria-hidden": label ? undefined : true,
    style: {
      flexShrink: 0,
      display: 'block',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: inner
    }
  });
}
Object.assign(__ds_scope, { ICON_NAMES, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/brand/AchievementEmblem.jsx
try { (() => {
const EMBLEMS = {
  soldado: {
    cls: 'qb-emblem-soldado',
    name: 'O Soldado',
    virtue: 'Disciplina e ação'
  },
  sabio: {
    cls: 'qb-emblem-sabio',
    name: 'O Sábio',
    virtue: 'Conhecimento e reflexão'
  },
  estrategista: {
    cls: 'qb-emblem-estrategista',
    name: 'O Estrategista',
    virtue: 'Visão e decisão'
  },
  ascensao: {
    cls: 'qb-emblem-ascensao',
    name: 'A Ascensão',
    virtue: 'A união das virtudes na conquista'
  }
};
function AchievementEmblem({
  variant = 'soldado',
  state = 'earned',
  size = 112,
  progress,
  rule,
  showLabel = true,
  style
}) {
  const e = EMBLEMS[variant] || EMBLEMS.soldado;
  const locked = state === 'locked';
  const pct = progress != null ? Math.round(Math.max(0, Math.min(1, progress)) * 100) : null;
  const stateText = state === 'earned' ? 'Conquistado' : locked ? 'Bloqueado' : `${pct ?? 0}% concluído`;
  return /*#__PURE__*/React.createElement("figure", {
    style: {
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      width: Math.max(size, 140),
      ...style
    },
    "aria-label": `${e.name} — ${stateText}${rule ? '. ' + rule : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size * 154 / 184
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `qb-img ${e.cls}`,
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: '18%',
      backgroundColor: 'var(--qb-obsidian)',
      filter: locked ? 'grayscale(1) brightness(.45)' : state === 'in-progress' ? 'saturate(.7) brightness(.8)' : 'none',
      boxShadow: state === 'earned' ? '0 0 28px -6px rgba(242,199,110,.45)' : 'none'
    }
  }), locked && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--qb-parchment)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "lock",
    size: size * 0.24
  })), state === 'earned' && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      right: -6,
      bottom: -6,
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: 'var(--qb-navy-deep)',
      border: '1px solid var(--state-correct)',
      color: 'var(--state-correct)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 16,
    strokeWidth: 2.25
  }))), showLabel && /*#__PURE__*/React.createElement("figcaption", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px/1.2 var(--font-display)',
      letterSpacing: '.12em',
      color: locked ? 'var(--text-muted)' : 'var(--qb-ivory)',
      textTransform: 'uppercase'
    }
  }, e.name), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'italic 500 15px/1.25 var(--font-serif)',
      color: 'var(--text-secondary)'
    }
  }, e.virtue), state === 'in-progress' && pct != null && /*#__PURE__*/React.createElement("span", {
    style: {
      width: Math.min(size, 120),
      height: 4,
      borderRadius: 999,
      background: 'var(--state-progress-track)',
      marginTop: 4,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: `${pct}%`,
      height: '100%',
      background: 'var(--state-progress)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px/1.35 var(--font-body)',
      color: 'var(--text-muted)',
      maxWidth: 160
    }
  }, rule ? rule : stateText)));
}
Object.assign(__ds_scope, { AchievementEmblem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/AchievementEmblem.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
const STATE_ICONS = {
  correct: 'circle-check',
  incorrect: 'circle-x',
  'no-evidence': 'circle-dashed',
  attention: 'triangle-alert'
};
function Badge({
  tone = 'neutral',
  icon,
  children,
  className = '',
  style
}) {
  const glyph = icon === null ? null : icon || STATE_ICONS[tone];
  return /*#__PURE__*/React.createElement("span", {
    className: `qb-badge qb-badge--${tone} ${className}`,
    style: style
  }, glyph && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: glyph,
    size: 14,
    strokeWidth: 2
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  children,
  className = '',
  style,
  ...rest
}) {
  const iconSize = size === 'lg' ? 20 : size === 'sm' ? 16 : 18;
  const cls = ['qb-btn', `qb-btn--${variant}`, size !== 'md' && `qb-btn--${size}`, fullWidth && 'qb-btn--full', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    disabled: disabled || loading,
    "aria-busy": loading || undefined,
    style: style
  }, rest), loading ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "loader-circle",
    size: iconSize,
    className: "qb-spin"
  }) : icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: iconSize
  }), children, iconRight && !loading && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: iconSize
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  round = false,
  count,
  pressed,
  className = '',
  type = 'button',
  ...rest
}) {
  const cls = ['qb-iconbtn', variant !== 'ghost' && `qb-iconbtn--${variant}`, size === 'sm' && 'qb-iconbtn--sm', round && 'qb-iconbtn--round', className].filter(Boolean).join(' ');
  const a11y = count ? `${label} (${count} novas)` : label;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    "aria-label": a11y,
    title: label,
    "aria-pressed": pressed === undefined ? undefined : pressed
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'sm' ? 18 : 22
  }), count ? /*#__PURE__*/React.createElement("span", {
    className: "qb-iconbtn__count",
    "aria-hidden": "true"
  }, count > 9 ? '9+' : count) : null);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Panel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Panel({
  variant = 'raised',
  padding = 24,
  as: Tag = 'div',
  interactive = false,
  className = '',
  style,
  children,
  ...rest
}) {
  const cls = ['qb-panel', variant !== 'raised' && `qb-panel--${variant}`, interactive && 'qb-panel--interactive', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls,
    tabIndex: interactive ? 0 : undefined,
    style: {
      padding,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Panel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Panel.jsx", error: String((e && e.message) || e) }); }

// components/core/ProgressBar.jsx
try { (() => {
function ProgressBar({
  value = 0,
  label,
  valueText,
  tone = 'progress',
  size = 'md',
  showValue = true,
  style
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const fill = tone === 'correct' ? 'var(--state-correct)' : tone === 'gold' ? 'var(--qb-gold)' : 'var(--state-progress)';
  const h = size === 'sm' ? 4 : size === 'lg' ? 10 : 6;
  const text = valueText || `${Math.round(pct)}%`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minWidth: 0,
      ...style
    }
  }, (label || showValue) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      font: '500 13px/1.3 var(--font-body)'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12
    }
  }, text)), /*#__PURE__*/React.createElement("div", {
    role: "progressbar",
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-valuenow": Math.round(pct),
    "aria-valuetext": text,
    "aria-label": label,
    style: {
      height: h,
      borderRadius: 999,
      background: 'var(--state-progress-track)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: '100%',
      borderRadius: 999,
      background: fill,
      transition: 'width var(--dur-slow) var(--ease-standard)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/flashcards/Flashcard.jsx
try { (() => {
const RATES = [['errei', 'Errei'], ['dificil', 'Difícil'], ['bom', 'Bom'], ['facil', 'Fácil']];
function Flashcard({
  front,
  back,
  deck,
  origin,
  onOpenOrigin,
  flipped: flippedProp,
  onFlip,
  onRate,
  intervals = {
    errei: '< 1 min',
    dificil: '10 min',
    bom: '1 d',
    facil: '4 d'
  },
  demo = true,
  height = 360,
  style
}) {
  const [inner, setInner] = React.useState(false);
  const flipped = flippedProp ?? inner;
  const flip = () => {
    setInner(f => !f);
    onFlip && onFlip(!flipped);
  };
  const face = {
    background: 'var(--surface)',
    border: '1px solid rgba(208,179,134,.5)',
    boxShadow: 'var(--shadow-raised)',
    padding: 'clamp(20px,3vw,32px)',
    gap: 16
  };
  const Head = ({
    label
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "qb-overline"
  }, label), deck && /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 13px/1 var(--font-body)',
      color: 'var(--text-muted)'
    }
  }, deck));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "qb-flash",
    style: {
      height
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `qb-flash__inner ${flipped ? 'is-flipped' : ''}`
  }, /*#__PURE__*/React.createElement("section", {
    className: "qb-flash__face",
    style: face,
    "aria-hidden": flipped
  }, /*#__PURE__*/React.createElement(Head, {
    label: "Frente"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      font: '400 clamp(20px,2.4vw,26px)/1.4 var(--font-heading)',
      color: 'var(--text-primary)',
      maxWidth: '30ch'
    }
  }, front)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    icon: "repeat",
    onClick: flip,
    tabIndex: flipped ? -1 : 0
  }, "Mostrar resposta"))), /*#__PURE__*/React.createElement("section", {
    className: "qb-flash__face qb-flash__face--back",
    style: face,
    "aria-hidden": !flipped
  }, /*#__PURE__*/React.createElement(Head, {
    label: "Verso"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 17px/1.65 var(--font-body)',
      color: 'var(--text-secondary)',
      maxWidth: 'var(--measure)',
      margin: '0 auto'
    }
  }, back)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, origin ? /*#__PURE__*/React.createElement("button", {
    className: "qb-linkbtn",
    onClick: onOpenOrigin,
    tabIndex: flipped ? 0 : -1
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "network",
    size: 15
  }), "Origem: ", origin) : /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("button", {
    className: "qb-linkbtn",
    onClick: flip,
    tabIndex: flipped ? 0 : -1,
    style: {
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "repeat",
    size: 15
  }), "Ver frente"))))), flipped && onRate && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "group",
    "aria-label": "Autoavalia\xE7\xE3o",
    style: {
      display: 'flex',
      gap: 8
    }
  }, RATES.map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: "qb-rate",
    onClick: () => onRate(k)
  }, l, /*#__PURE__*/React.createElement("small", null, intervals[k])))), demo && /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px/1.4 var(--font-body)',
      color: 'var(--text-muted)',
      textAlign: 'center'
    }
  }, "Intervalos ilustrativos \u2014 modo demonstra\xE7\xE3o, sem agendamento real.")));
}
Object.assign(__ds_scope, { Flashcard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/flashcards/Flashcard.jsx", error: String((e && e.message) || e) }); }

// components/mindmap/ConceptPanel.jsx
try { (() => {
const H = ({
  children
}) => /*#__PURE__*/React.createElement("h3", {
  className: "qb-overline",
  style: {
    color: 'var(--qb-gold)'
  }
}, children);
function ConceptPanel({
  title,
  path = [],
  mastery,
  summary,
  example,
  connections = [],
  sources = [],
  onNavigate,
  onReview,
  reviewCount,
  returnTo,
  onReturn,
  onClose,
  style
}) {
  const tone = mastery && mastery.state;
  return /*#__PURE__*/React.createElement("aside", {
    className: "qb-panel",
    "aria-label": `Conceito: ${title}`,
    style: {
      display: 'flex',
      flexDirection: 'column',
      padding: 0,
      overflow: 'hidden',
      ...style
    }
  }, returnTo && /*#__PURE__*/React.createElement("button", {
    onClick: onReturn,
    className: "qb-navlink",
    style: {
      height: 44,
      borderRadius: 0,
      justifyContent: 'flex-start',
      padding: '0 20px',
      borderBottom: '1px solid var(--divider)',
      background: 'rgba(242,199,110,.06)',
      color: 'var(--qb-gold-bright)',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "corner-up-left",
    size: 16
  }), "Voltar \xE0 ", returnTo), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      padding: 24,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 4,
      font: '400 13px/1.4 var(--font-body)',
      color: 'var(--text-muted)'
    }
  }, path.map((p, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, p)))), onClose && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "Fechar painel",
    size: "sm",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      font: '400 26px/1.2 var(--font-heading)',
      color: 'var(--text-primary)'
    }
  }, title), mastery && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: tone === 'progress' ? 'attention' : tone
  }, mastery.text))), summary && /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(H, null, "Resumo"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: '400 16px/1.65 var(--font-body)',
      color: 'var(--text-secondary)',
      maxWidth: 'var(--measure)'
    }
  }, summary)), example && /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(H, null, "Exemplo"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      borderRadius: 12,
      background: 'var(--surface-sunken)',
      font: '400 15px/1.6 var(--font-body)',
      color: 'var(--text-secondary)'
    }
  }, example)), connections.length > 0 && /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(H, null, "Conex\xF5es"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, connections.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    className: "qb-chip",
    onClick: () => onNavigate && onNavigate(c.id)
  }, c.relation && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, c.relation), c.label, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrow-right",
    size: 14
  }))))), onReview && /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(H, null, "Revis\xE3o ativa"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    icon: "layers",
    onClick: onReview,
    fullWidth: true
  }, reviewCount ? `Revisar ${reviewCount} flashcards deste conceito` : 'Revisar este conceito')), sources.length > 0 && /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(H, null, "Fontes"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, sources.map((s, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
      font: '400 13px/1.45 var(--font-mono)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "file-text",
    size: 14,
    style: {
      marginTop: 2
    }
  }), s))))));
}
Object.assign(__ds_scope, { ConceptPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mindmap/ConceptPanel.jsx", error: String((e && e.message) || e) }); }

// components/mindmap/MindMapCanvas.jsx
try { (() => {
const MASTERY = {
  correct: ['circle-check', 'var(--state-correct)', 'Domínio demonstrado'],
  incorrect: ['circle-x', 'var(--state-incorrect)', 'Erros recentes'],
  'no-evidence': ['circle-dashed', 'var(--state-no-evidence)', 'Sem evidência'],
  progress: ['loader-circle', 'var(--state-progress)', 'Em estudo']
};
const RADII = [0, 175, 330, 470];
function buildTree(nodes) {
  const byId = {},
    kids = {};
  nodes.forEach(n => {
    byId[n.id] = n;
    kids[n.id] = [];
  });
  let root = null;
  nodes.forEach(n => {
    if (n.parent && kids[n.parent]) kids[n.parent].push(n.id);else if (!n.parent) root = n.id;
  });
  return {
    byId,
    kids,
    root
  };
}
function layout(tree, expanded) {
  const pos = {};
  const leaves = id => expanded.has(id) && tree.kids[id].length ? tree.kids[id].reduce((s, k) => s + leaves(k), 0) : 1;
  const place = (id, depth, a0, a1) => {
    const a = (a0 + a1) / 2,
      r = RADII[Math.min(depth, 3)] + Math.max(0, depth - 3) * 140;
    pos[id] = {
      x: r * Math.cos(a),
      y: r * Math.sin(a) * 0.74,
      depth
    };
    if (!expanded.has(id)) return;
    const total = leaves(id);
    let cur = a0;
    tree.kids[id].forEach(k => {
      const span = (a1 - a0) * leaves(k) / total;
      place(k, depth + 1, cur, cur + span);
      cur += span;
    });
  };
  if (tree.root) place(tree.root, 0, -Math.PI / 2, Math.PI * 1.5);
  pos[tree.root] = {
    x: 0,
    y: 0,
    depth: 0
  };
  return pos;
}
function MindMapCanvas({
  nodes = [],
  selectedId,
  onSelect,
  defaultExpanded,
  view: viewProp,
  onViewChange,
  focusPath = true,
  height = 560,
  style
}) {
  const tree = React.useMemo(() => buildTree(nodes), [nodes]);
  const [expanded, setExpanded] = React.useState(() => new Set(defaultExpanded || nodes.filter(n => !n.parent || !nodes.find(p => p.id === n.parent)?.parent).map(n => n.id)));
  const [viewState, setViewState] = React.useState('map');
  const view = viewProp || viewState;
  const setView = v => {
    setViewState(v);
    onViewChange && onViewChange(v);
  };
  const [userZoom, setUserZoom] = React.useState(1);
  const [pan, setPan] = React.useState({
    x: 0,
    y: 0
  });
  const [box, setBox] = React.useState({
    w: 800,
    h: height
  });
  const drag = React.useRef(null);
  const wrapRef = React.useRef(null);
  const pos = React.useMemo(() => layout(tree, expanded), [tree, expanded]);
  React.useEffect(() => {
    if (!wrapRef.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setBox({
      w: e.contentRect.width,
      h: e.contentRect.height
    }));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [view]);
  const pathSet = React.useMemo(() => {
    const s = new Set();
    let c = selectedId;
    while (c && tree.byId[c]) {
      s.add(c);
      c = tree.byId[c].parent;
    }
    return s;
  }, [selectedId, tree]);
  const isVisible = id => {
    let p = tree.byId[id] && tree.byId[id].parent;
    while (p) {
      if (!expanded.has(p)) return false;
      p = tree.byId[p].parent;
    }
    return true;
  };
  const visible = nodes.filter(n => isVisible(n.id) && pos[n.id]);
  const bb = visible.reduce((b, n) => {
    const p = pos[n.id];
    return {
      x0: Math.min(b.x0, p.x - 100),
      x1: Math.max(b.x1, p.x + 100),
      y0: Math.min(b.y0, p.y - 26),
      y1: Math.max(b.y1, p.y + 26)
    };
  }, {
    x0: 0,
    x1: 0,
    y0: 0,
    y1: 0
  });
  const fit = Math.max(0.7, Math.min(1.15, (box.w - 32) / (bb.x1 - bb.x0), (box.h - 110) / (bb.y1 - bb.y0)));
  const zoom = fit * userZoom;
  const off = {
    x: -(bb.x0 + bb.x1) / 2 * zoom,
    y: -(bb.y0 + bb.y1) / 2 * zoom + 4
  };
  const related = id => !focusPath || !selectedId || pathSet.has(id) || tree.byId[id].parent === selectedId || tree.byId[selectedId] && tree.byId[id].parent === tree.byId[selectedId].parent;
  const click = n => {
    if (tree.kids[n.id].length && (n.id === selectedId || !expanded.has(n.id))) {
      setExpanded(prev => {
        const s = new Set(prev);
        s.has(n.id) && n.id === selectedId ? s.delete(n.id) : s.add(n.id);
        return s;
      });
    }
    onSelect && onSelect(n.id);
  };
  const centerOn = id => {
    const p = pos[id];
    if (p) setPan({
      x: -p.x * zoom - off.x,
      y: -p.y * zoom - off.y
    });
  };
  const reset = () => {
    setUserZoom(1);
    setPan({
      x: 0,
      y: 0
    });
  };
  const toolbar = /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      right: 12,
      display: 'flex',
      gap: 6,
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "qb-seg",
    role: "group",
    "aria-label": "Visualiza\xE7\xE3o"
  }, /*#__PURE__*/React.createElement("button", {
    className: "qb-seg__opt",
    "aria-pressed": view === 'map',
    onClick: () => setView('map'),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "network",
    size: 16
  }), "Mapa"), /*#__PURE__*/React.createElement("button", {
    className: "qb-seg__opt",
    "aria-pressed": view === 'list',
    onClick: () => setView('list'),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "list",
    size: 16
  }), "Lista")));
  if (view === 'list') {
    const Row = ({
      id,
      depth
    }) => {
      const n = tree.byId[id],
        k = tree.kids[id],
        open = expanded.has(id),
        m = n.mastery && MASTERY[n.mastery];
      return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          paddingLeft: depth * 22
        }
      }, k.length ? /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
        size: "sm",
        icon: open ? 'chevron-down' : 'chevron-right',
        label: open ? 'Recolher' : 'Expandir',
        onClick: () => setExpanded(p => {
          const s = new Set(p);
          open ? s.delete(id) : s.add(id);
          return s;
        })
      }) : /*#__PURE__*/React.createElement("span", {
        style: {
          width: 36
        }
      }), /*#__PURE__*/React.createElement("button", {
        className: "qb-navlink",
        "aria-current": id === selectedId ? 'page' : undefined,
        onClick: () => onSelect && onSelect(id),
        style: {
          color: id === selectedId ? undefined : 'var(--text-primary)',
          fontWeight: depth < 2 ? 600 : 500
        }
      }, m && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
        name: m[0],
        size: 15,
        color: m[1],
        label: m[2]
      }), n.label)), open && k.length > 0 && /*#__PURE__*/React.createElement("ul", {
        style: {
          listStyle: 'none',
          margin: 0,
          padding: 0
        }
      }, k.map(c => /*#__PURE__*/React.createElement(Row, {
        key: c,
        id: c,
        depth: depth + 1
      }))));
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "qb-panel qb-panel--sunken",
      style: {
        position: 'relative',
        height,
        overflow: 'auto',
        padding: '64px 16px 16px',
        ...style
      }
    }, toolbar, /*#__PURE__*/React.createElement("ul", {
      role: "tree",
      style: {
        listStyle: 'none',
        margin: 0,
        padding: 0
      }
    }, tree.root && /*#__PURE__*/React.createElement(Row, {
      id: tree.root,
      depth: 0
    })));
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    className: "qb-panel qb-panel--sunken",
    style: {
      position: 'relative',
      height,
      overflow: 'hidden',
      padding: 0,
      touchAction: 'none',
      cursor: drag.current ? 'grabbing' : 'grab',
      backgroundImage: 'radial-gradient(circle at 50% 50%,rgba(30,65,102,.55) 0%,rgba(16,28,45,0) 65%),radial-gradient(rgba(165,138,103,.14) 1px,transparent 1px)',
      backgroundSize: '100% 100%,28px 28px',
      ...style
    },
    onPointerDown: e => {
      if (e.target.closest('button')) return;
      drag.current = {
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: e => {
      if (drag.current) setPan({
        x: e.clientX - drag.current.x,
        y: e.clientY - drag.current.y
      });
    },
    onPointerUp: () => {
      drag.current = null;
    }
  }, toolbar, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    variant: "solid",
    size: "sm",
    icon: "zoom-in",
    label: "Aproximar",
    onClick: () => setUserZoom(z => Math.min(2.2, z + 0.2))
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    variant: "solid",
    size: "sm",
    icon: "zoom-out",
    label: "Afastar",
    onClick: () => setUserZoom(z => Math.max(0.5, z - 0.2))
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    variant: "solid",
    size: "sm",
    icon: "maximize",
    label: "Enquadrar mapa",
    onClick: reset
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    variant: "solid",
    size: "sm",
    icon: "locate-fixed",
    label: "Centralizar no n\xF3 selecionado",
    onClick: () => centerOn(selectedId || tree.root)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 14,
      left: 16,
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap',
      zIndex: 2,
      font: '400 12px/1 var(--font-body)',
      color: 'var(--text-muted)'
    }
  }, ['correct', 'incorrect', 'no-evidence'].map(k => /*#__PURE__*/React.createElement("span", {
    key: k,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: MASTERY[k][0],
    size: 14,
    color: MASTERY[k][1]
  }), MASTERY[k][2]))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(${pan.x + off.x}px,${pan.y + off.y}px) scale(${zoom})`,
      transition: drag.current ? 'none' : 'transform var(--dur-slow) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "1",
    height: "1",
    style: {
      position: 'absolute',
      overflow: 'visible'
    },
    "aria-hidden": "true"
  }, visible.filter(n => n.parent && pos[n.parent]).map(n => {
    const a = pos[n.parent],
      b = pos[n.id],
      on = pathSet.has(n.id) && pathSet.has(n.parent);
    const mx = (a.x + b.x) / 2,
      my = (a.y + b.y) / 2;
    return /*#__PURE__*/React.createElement("path", {
      key: n.id,
      d: `M${a.x},${a.y} Q${mx * 1.05},${my * 0.95} ${b.x},${b.y}`,
      fill: "none",
      stroke: on ? 'var(--qb-gold-bright)' : 'rgba(165,138,103,.45)',
      strokeWidth: on ? 2 : 1.25,
      opacity: related(n.id) ? 1 : 0.35
    });
  })), visible.map(n => {
    const p = pos[n.id],
      m = n.mastery && MASTERY[n.mastery],
      hidden = !expanded.has(n.id) ? tree.kids[n.id].length : 0;
    const cls = ['qb-mm__node', p.depth === 0 && 'qb-mm__node--root', p.depth === 1 && 'qb-mm__node--l1', !related(n.id) && 'is-dim'].filter(Boolean).join(' ');
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      className: cls,
      "aria-selected": n.id === selectedId,
      "aria-expanded": tree.kids[n.id].length ? expanded.has(n.id) : undefined,
      style: {
        left: p.x,
        top: p.y,
        width: 'max-content'
      },
      onClick: () => click(n)
    }, m && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: m[0],
      size: 15,
      color: m[1],
      label: m[2]
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        whiteSpace: n.label.length > 24 ? 'normal' : 'nowrap'
      }
    }, n.label), hidden > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 11px/1 var(--font-mono)',
        color: 'var(--qb-gold)',
        padding: '3px 6px',
        borderRadius: 6,
        background: 'rgba(208,179,134,.12)'
      }
    }, "+", hidden));
  })));
}
Object.assign(__ds_scope, { MindMapCanvas });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mindmap/MindMapCanvas.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BrandHeader.jsx
try { (() => {
function useWidth(ref) {
  const [w, setW] = React.useState(1200);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    setW(ref.current.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return w;
}
const Divider = () => /*#__PURE__*/React.createElement("span", {
  "aria-hidden": "true",
  style: {
    width: 1,
    alignSelf: 'stretch',
    margin: '14px 0',
    background: 'linear-gradient(180deg,rgba(208,179,134,0),rgba(208,179,134,.55),rgba(208,179,134,0))'
  }
});
function BrandHeader({
  variant = 'full',
  items = [],
  activeId,
  onNavigate,
  notifications = 0,
  user,
  onSearch,
  onNotifications,
  onStats,
  onProfile,
  onExit,
  children,
  floating = true,
  style
}) {
  const ref = React.useRef(null);
  const w = useWidth(ref);
  const narrow = w < 760;
  const iconNav = !narrow && w < 1100;
  const showArt = w >= 900;
  const shell = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    overflow: 'hidden',
    background: 'linear-gradient(180deg,#0F2640 0%,#0A1E34 100%)',
    border: floating ? '1px solid rgba(208,179,134,.45)' : 0,
    borderBottom: '1px solid rgba(208,179,134,.35)',
    borderRadius: floating ? 'var(--radius-card)' : 0,
    boxShadow: floating ? 'var(--shadow-raised)' : 'none',
    ...style
  };
  if (variant === 'compact') {
    return /*#__PURE__*/React.createElement("header", {
      ref: ref,
      style: {
        ...shell,
        height: 'var(--header-h-compact)',
        padding: '0 12px 0 16px'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.BrandLogo, {
      variant: "mark",
      mark: "q-sword",
      size: 30
    }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }
    }, children), onExit && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
      icon: "x",
      label: "Sair da sess\xE3o",
      onClick: onExit
    }));
  }
  return /*#__PURE__*/React.createElement("header", {
    ref: ref,
    style: {
      ...shell,
      height: 'var(--header-h)',
      gap: narrow ? 8 : 16,
      padding: narrow ? '0 8px 0 0' : '0 12px 0 0'
    }
  }, showArt && /*#__PURE__*/React.createElement("div", {
    className: "qb-img qb-scene-sword-ribbon",
    "aria-hidden": "true",
    style: {
      width: 200,
      alignSelf: 'stretch',
      backgroundPosition: '20% 40%',
      WebkitMaskImage: 'linear-gradient(90deg,#000 55%,transparent)',
      maskImage: 'linear-gradient(90deg,#000 55%,transparent)',
      flexShrink: 0,
      marginRight: -40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: narrow ? 8 : 16,
      paddingLeft: showArt ? 0 : (narrow ? 12 : 16),
      flexShrink: 0
    }
  }, !showArt && /*#__PURE__*/React.createElement(__ds_scope.BrandLogo, {
    variant: "mark",
    mark: "q-sword",
    size: narrow ? 26 : 32
  }), showArt && /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: narrow ? '600 16px/1 var(--font-serif)' : '600 24px/1 var(--font-serif)',
      color: 'var(--qb-ivory)',
      whiteSpace: 'nowrap'
    }
  }, "Quebrando a Banca"))), !narrow && items.length > 0 && /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Principal",
    style: {
      display: 'flex',
      gap: 4,
      marginLeft: 8,
      flexShrink: 0
    }
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    className: "qb-navlink",
    "aria-current": it.id === activeId ? 'page' : undefined,
    "aria-label": iconNav ? it.label : undefined,
    title: iconNav ? it.label : undefined,
    onClick: () => onNavigate && onNavigate(it.id),
    style: iconNav ? {
      width: 44,
      padding: 0,
      justifyContent: 'center'
    } : undefined
  }, it.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: it.icon,
    size: 18
  }), !iconNav && it.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), !narrow && /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: narrow ? 2 : 4
    }
  }, !narrow && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "search",
    label: "Buscar",
    onClick: onSearch
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "bell",
    label: "Notifica\xE7\xF5es",
    count: notifications,
    onClick: onNotifications
  }), !narrow && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "chart-column",
    label: "Desempenho",
    onClick: onStats
  }), narrow && items.length > 0 && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "menu",
    label: "Menu"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onProfile,
    "aria-label": user ? `Perfil de ${user.name}` : 'Perfil',
    className: "qb-iconbtn qb-iconbtn--round",
    style: {
      marginLeft: narrow ? 0 : 4
    }
  }, user && user.initials ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: '50%',
      border: '1.5px solid var(--qb-gold)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      font: '600 14px/1 var(--font-display)',
      color: 'var(--qb-gold)',
      background: 'var(--qb-navy-raised)'
    }
  }, user.initials) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "circle-user",
    size: 30
  }))));
}
Object.assign(__ds_scope, { BrandHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BrandHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/RadialNavigation.jsx
try { (() => {
function Ring({
  value = 0,
  size,
  stroke = 6
}) {
  const r = (size - stroke) / 2,
    c = 2 * Math.PI * r,
    v = Math.max(0, Math.min(1, value));
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "rgba(208,179,134,.18)",
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--qb-gold-bright)",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeDasharray: c,
    strokeDashoffset: c * (1 - v),
    style: {
      transition: 'stroke-dashoffset var(--dur-scene) var(--ease-enter)'
    }
  }));
}
function RadialNavigation({
  items = [],
  activeId,
  onSelect,
  center = {},
  size = 520,
  layout = 'auto',
  artifact = true,
  style
}) {
  const ref = React.useRef(null);
  const [avail, setAvail] = React.useState(size);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    setAvail(ref.current.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setAvail(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const mode = layout === 'auto' ? avail < size ? 'list' : 'radial' : layout;
  const cs = size * 0.38;
  const pct = center.value != null ? Math.round(center.value * 100) : null;
  const Center = /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: cs,
      height: cs,
      borderRadius: '50%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      background: 'radial-gradient(circle at 50% 35%,#173653 0%,#0A1E34 75%)',
      boxShadow: 'inset 0 0 0 1px rgba(208,179,134,.4), 0 20px 50px -20px rgba(8,10,15,.9)'
    }
  }, artifact && /*#__PURE__*/React.createElement("div", {
    className: "qb-img qb-artifact-disc",
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 10,
      borderRadius: '50%',
      opacity: .16,
      mixBlendMode: 'luminosity'
    }
  }), center.value != null && /*#__PURE__*/React.createElement(Ring, {
    value: center.value,
    size: cs
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      font: '600 12px/1.2 var(--font-body)',
      letterSpacing: '.16em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, center.overline || 'Edital'), pct != null && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      font: '600 44px/1 var(--font-display)',
      color: 'var(--qb-ivory)',
      marginTop: 6
    }
  }, pct, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      color: 'var(--qb-gold)'
    }
  }, "%")), center.label && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      font: 'italic 500 16px/1.25 var(--font-serif)',
      color: 'var(--text-secondary)',
      marginTop: 6,
      maxWidth: cs * 0.7
    }
  }, center.label));
  if (mode === 'list') {
    return /*#__PURE__*/React.createElement("nav", {
      ref: ref,
      "aria-label": "Atalhos de estudo",
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'center',
        width: '100%',
        ...style
      }
    }, Center, /*#__PURE__*/React.createElement("ul", {
      style: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%'
      }
    }, items.map(it => /*#__PURE__*/React.createElement("li", {
      key: it.id
    }, /*#__PURE__*/React.createElement("button", {
      className: "qb-radial__row",
      "aria-current": it.id === activeId ? 'true' : undefined,
      onClick: () => onSelect && onSelect(it.id)
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '1px solid rgba(208,179,134,.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--qb-gold)'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 20
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 15px/1.2 var(--font-body)'
      }
    }, it.label), it.meta && /*#__PURE__*/React.createElement("span", {
      style: {
        font: '400 13px/1.2 var(--font-body)',
        color: 'var(--text-muted)'
      }
    }, it.meta)), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "chevron-right",
      size: 18,
      color: "var(--text-muted)"
    }))))));
  }
  const R = size / 2 - 64;
  return /*#__PURE__*/React.createElement("nav", {
    ref: ref,
    "aria-label": "Atalhos de estudo",
    style: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 64 - 2,
      borderRadius: '50%',
      border: '1px solid rgba(165,138,103,.35)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 64 + 30,
      borderRadius: '50%',
      border: '1px dashed rgba(165,138,103,.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 18,
      borderRadius: '50%',
      border: '1px solid rgba(165,138,103,.12)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%,-50%)'
    }
  }, Center), items.map((it, i) => {
    const a = (-90 + 360 / items.length * i) * Math.PI / 180;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      className: "qb-radial__node",
      "aria-current": it.id === activeId ? 'true' : undefined,
      onClick: () => onSelect && onSelect(it.id),
      style: {
        left: size / 2 + R * Math.cos(a),
        top: size / 2 + R * Math.sin(a)
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "qb-radial__orb"
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 28,
      strokeWidth: 1.5
    })), /*#__PURE__*/React.createElement("span", {
      className: "qb-radial__label"
    }, it.label), it.meta && /*#__PURE__*/React.createElement("span", {
      className: "qb-radial__meta"
    }, it.meta));
  })));
}
Object.assign(__ds_scope, { RadialNavigation });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/RadialNavigation.jsx", error: String((e && e.message) || e) }); }

// components/questions/AnswerActionBar.jsx
try { (() => {
function AnswerActionBar({
  state = 'idle',
  allowSkip = true,
  onConfirm,
  onNext,
  onSkip,
  onReview,
  onOpenFeedback,
  reviewMarked = false,
  showHints = true,
  sticky = false,
  style
}) {
  const answered = state === 'answered';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      padding: '12px 16px',
      borderTop: '1px solid var(--divider)',
      background: 'rgba(10,30,52,.92)',
      backdropFilter: 'blur(8px)',
      ...(sticky ? {
        position: 'sticky',
        bottom: 0,
        zIndex: 'var(--z-header)'
      } : {}),
      ...style
    }
  }, onReview && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    size: "sm",
    icon: "bookmark",
    onClick: onReview,
    "aria-pressed": reviewMarked
  }, reviewMarked ? 'Na revisão' : 'Marcar para revisão'), allowSkip && !answered && onSkip && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    size: "sm",
    icon: "skip-forward",
    onClick: onSkip
  }, "Pular"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), showHints && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      font: '400 12px/1 var(--font-mono)',
      color: 'var(--text-muted)'
    }
  }, answered ? 'Enter · próxima' : 'C / E · responder   Enter · confirmar'), answered && onOpenFeedback && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    icon: "book-open",
    onClick: onOpenFeedback
  }, "Ver fundamento"), answered ? /*#__PURE__*/React.createElement(__ds_scope.Button, {
    iconRight: "arrow-right",
    onClick: onNext
  }, "Pr\xF3xima quest\xE3o") : /*#__PURE__*/React.createElement(__ds_scope.Button, {
    iconRight: "check",
    onClick: onConfirm,
    disabled: state === 'idle',
    loading: state === 'loading'
  }, "Confirmar resposta"));
}
Object.assign(__ds_scope, { AnswerActionBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/questions/AnswerActionBar.jsx", error: String((e && e.message) || e) }); }

// components/questions/FeedbackDrawer.jsx
try { (() => {
function Section({
  title,
  icon,
  children
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      font: '600 12px/1.2 var(--font-body)',
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--qb-gold)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16
  }), title), children);
}
function FeedbackDrawer({
  open = true,
  mode = 'drawer',
  onClose,
  result,
  answerKey,
  explanation,
  legalBasis,
  trap,
  concept,
  onOpenConcept,
  onFlashcards,
  style
}) {
  const [showTrap, setShowTrap] = React.useState(result === 'incorrect');
  React.useEffect(() => {
    setShowTrap(result === 'incorrect');
  }, [result]);
  if (!open) return null;
  const body = /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      padding: 24,
      overflowY: 'auto',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid var(--qb-gold)',
      font: '600 26px/1 var(--font-display)',
      color: 'var(--qb-gold)',
      flexShrink: 0
    },
    "aria-hidden": "true"
  }, answerKey), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 22px/1.2 var(--font-heading)',
      color: 'var(--text-primary)'
    }
  }, "Gabarito: ", answerKey === 'C' ? 'Certo' : 'Errado'), result && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: result
  }, result === 'correct' ? 'Você acertou' : 'Você errou'))), explanation && /*#__PURE__*/React.createElement(Section, {
    title: "Fundamento",
    icon: "scale"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      font: '400 16px/1.65 var(--font-body)',
      color: 'var(--text-secondary)'
    }
  }, explanation), legalBasis && /*#__PURE__*/React.createElement("span", {
    style: {
      font: '500 13px/1.4 var(--font-mono)',
      color: 'var(--text-muted)'
    }
  }, legalBasis)), trap && /*#__PURE__*/React.createElement(Section, {
    title: "Mecanismo da pegadinha",
    icon: "shield-alert"
  }, showTrap ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      borderRadius: 12,
      background: 'var(--surface-sunken)',
      border: '1px solid var(--divider)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 15px/1.3 var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, trap.name), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 15px/1.6 var(--font-body)',
      color: 'var(--text-secondary)'
    }
  }, trap.description)) : /*#__PURE__*/React.createElement("button", {
    className: "qb-linkbtn",
    onClick: () => setShowTrap(true)
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16
  }), "Ver como o item tenta induzir ao erro")), concept && /*#__PURE__*/React.createElement(Section, {
    title: "Conceito no mapa",
    icon: "network"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 6,
      font: '400 14px/1.4 var(--font-body)',
      color: 'var(--text-muted)'
    }
  }, concept.path.map((p, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    style: i === concept.path.length - 1 ? {
      color: 'var(--text-primary)',
      fontWeight: 500
    } : null
  }, p)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    size: "sm",
    icon: "locate-fixed",
    onClick: onOpenConcept
  }, "Abrir n\xF3 exato"), onFlashcards && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    size: "sm",
    icon: "layers",
    onClick: onFlashcards
  }, "Criar flashcard"))));
  if (mode === 'inline') return /*#__PURE__*/React.createElement("div", {
    className: "qb-panel",
    style: {
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, body);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 'var(--z-drawer)',
      display: 'flex',
      justifyContent: 'flex-end',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(8,10,15,.55)'
    }
  }), /*#__PURE__*/React.createElement("aside", {
    role: "dialog",
    "aria-label": "Corre\xE7\xE3o da quest\xE3o",
    style: {
      position: 'relative',
      width: 'min(460px,100%)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface)',
      borderLeft: '1px solid rgba(208,179,134,.45)',
      boxShadow: 'var(--shadow-drawer)',
      animation: 'qb-rise var(--dur-slow) var(--ease-enter)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 12px 12px 24px',
      borderBottom: '1px solid var(--divider)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "qb-overline"
  }, "Corre\xE7\xE3o"), onClose && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "Fechar corre\xE7\xE3o",
    onClick: onClose
  })), body));
}
Object.assign(__ds_scope, { FeedbackDrawer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/questions/FeedbackDrawer.jsx", error: String((e && e.message) || e) }); }

// components/questions/QuestionCard.jsx
try { (() => {
const CONF = [['baixa', 'Baixa'], ['media', 'Média'], ['alta', 'Alta']];
function QuestionCard({
  code,
  board = 'CEBRASPE',
  year,
  exam,
  tags = [],
  statement,
  context,
  answer = null,
  onAnswer,
  confidence = null,
  onConfidence,
  showConfidence = true,
  answerKey = null,
  conceptLink,
  bookmarked = false,
  onBookmark,
  style
}) {
  const revealed = answerKey != null;
  const choice = (k, label) => {
    let cls = 'qb-choice';
    let status = null;
    if (revealed) {
      if (k === answerKey) {
        cls += ' is-correct';
        status = answer === k ? 'Sua resposta · correta' : 'Gabarito';
      } else if (k === answer) {
        cls += ' is-incorrect';
        status = 'Sua resposta · incorreta';
      }
    }
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      className: cls,
      "aria-pressed": !revealed && answer === k,
      disabled: revealed,
      onClick: () => onAnswer && onAnswer(k)
    }, /*#__PURE__*/React.createElement("span", {
      className: "qb-choice__key",
      style: revealed && k === answerKey ? {
        color: 'var(--state-correct)'
      } : revealed && k === answer ? {
        color: 'var(--state-incorrect)'
      } : null
    }, k), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }
    }, /*#__PURE__*/React.createElement("span", null, label), status && /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 12px/1.2 var(--font-body)',
        color: k === answerKey ? 'var(--state-correct)' : 'var(--state-incorrect)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: k === answerKey ? 'circle-check' : 'circle-x',
      size: 13,
      strokeWidth: 2
    }), status)));
  };
  return /*#__PURE__*/React.createElement("article", {
    className: "qb-panel",
    style: {
      padding: 'clamp(20px,3vw,32px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      ...style
    },
    "aria-label": `Questão ${code || ''}`
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, code && /*#__PURE__*/React.createElement("span", {
    style: {
      font: '500 13px/1 var(--font-mono)',
      color: 'var(--text-muted)'
    }
  }, code), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "gold",
    icon: null
  }, [board, year].filter(Boolean).join(' · ')), tags.map(t => /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    key: t,
    tone: "neutral",
    icon: null
  }, t)), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), onBookmark && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "bookmark",
    label: bookmarked ? 'Remover da revisão' : 'Marcar para revisão',
    pressed: bookmarked,
    size: "sm",
    onClick: onBookmark
  })), exam && /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 13px/1.4 var(--font-body)',
      color: 'var(--text-muted)',
      marginTop: -10
    }
  }, exam), context && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      borderRadius: 12,
      background: 'var(--surface-sunken)',
      font: '400 15px/1.6 var(--font-body)',
      color: 'var(--text-secondary)',
      maxWidth: 'var(--measure)'
    }
  }, context), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-reading)',
      color: 'var(--text-primary)',
      maxWidth: 'var(--measure)'
    }
  }, statement), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '500 13px/1.2 var(--font-body)',
      color: 'var(--text-muted)'
    }
  }, "Julgue o item."), /*#__PURE__*/React.createElement("div", {
    role: "group",
    "aria-label": "Resposta",
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, choice('C', 'Certo'), choice('E', 'Errado'))), showConfidence && answer && !revealed && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '500 14px/1.2 var(--font-body)',
      color: 'var(--text-secondary)'
    }
  }, "Sua confian\xE7a"), /*#__PURE__*/React.createElement("div", {
    className: "qb-seg",
    role: "group",
    "aria-label": "Confian\xE7a"
  }, CONF.map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: "qb-seg__opt",
    "aria-pressed": confidence === v,
    onClick: () => onConfidence && onConfidence(v)
  }, l)))), revealed && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
      paddingTop: 16,
      borderTop: '1px solid var(--divider)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: answer === answerKey ? 'correct' : 'incorrect'
  }, answer === answerKey ? 'Você acertou' : 'Você errou'), confidence && /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 13px/1.2 var(--font-body)',
      color: 'var(--text-muted)'
    }
  }, "Confian\xE7a: ", CONF.find(c => c[0] === confidence)[1].toLowerCase()), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), conceptLink && /*#__PURE__*/React.createElement("button", {
    className: "qb-linkbtn",
    onClick: conceptLink.onClick
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "network",
    size: 16
  }), conceptLink.label)));
}
Object.assign(__ds_scope, { QuestionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/questions/QuestionCard.jsx", error: String((e && e.message) || e) }); }

// components/study/CognitiveAlertBanner.jsx
try { (() => {
const TONES = {
  fatigue: {
    icon: 'coffee',
    color: 'var(--qb-gold-bright)',
    bg: 'rgba(242,199,110,.07)',
    border: 'rgba(242,199,110,.45)',
    label: 'Pausa sugerida'
  },
  attention: {
    icon: 'eye',
    color: 'var(--qb-moonlight)',
    bg: 'rgba(200,217,234,.06)',
    border: 'rgba(200,217,234,.35)',
    label: 'Atenção'
  },
  trap: {
    icon: 'shield-alert',
    color: 'var(--state-incorrect)',
    bg: 'rgba(238,138,124,.07)',
    border: 'rgba(238,138,124,.45)',
    label: 'Pegadinha frequente'
  },
  info: {
    icon: 'info',
    color: 'var(--qb-gold)',
    bg: 'rgba(208,179,134,.06)',
    border: 'rgba(208,179,134,.4)',
    label: 'Dica'
  }
};
function CognitiveAlertBanner({
  tone = 'fatigue',
  title,
  children,
  actions,
  onDismiss,
  style
}) {
  const t = TONES[tone] || TONES.info;
  return /*#__PURE__*/React.createElement("div", {
    role: tone === 'trap' ? 'alert' : 'status',
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: '14px 12px 14px 16px',
      borderRadius: 14,
      background: t.bg,
      border: `1px solid ${t.border}`,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: t.color,
      border: `1px solid ${t.border}`,
      background: 'rgba(10,30,52,.5)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px/1.2 var(--font-body)',
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: t.color
    }
  }, t.label), title && /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 15px/1.35 var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 14px/1.5 var(--font-body)',
      color: 'var(--text-secondary)'
    }
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8
    }
  }, actions)), onDismiss && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "Dispensar aviso",
    size: "sm",
    onClick: onDismiss
  }));
}
Object.assign(__ds_scope, { CognitiveAlertBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/study/CognitiveAlertBanner.jsx", error: String((e && e.message) || e) }); }

// components/study/StudySessionHeader.jsx
try { (() => {
function fmt(s) {
  const m = Math.floor(s / 60),
    r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}
function StudySessionHeader({
  subject,
  topic,
  current = 0,
  total = 0,
  unit = 'Questão',
  elapsed = 0,
  focusMode = false,
  onToggleFocus,
  onBack,
  paused = false,
  onTogglePause,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      minHeight: 64,
      padding: '8px 12px',
      borderBottom: '1px solid var(--divider)',
      background: 'var(--canvas)',
      flexWrap: 'wrap',
      ...style
    }
  }, onBack && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "arrow-left",
    label: "Voltar",
    onClick: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 0,
      flex: '1 1 180px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "qb-overline",
    style: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, subject), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 18px/1.25 var(--font-heading)',
      color: 'var(--text-primary)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, topic)), total > 0 && /*#__PURE__*/React.createElement(__ds_scope.ProgressBar, {
    value: current / total,
    label: unit,
    valueText: `${current} de ${total}`,
    style: {
      flex: '1 1 150px',
      maxWidth: 320
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "timer",
    "aria-label": `Tempo de sessão ${fmt(elapsed)}`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 36,
      padding: '0 12px',
      borderRadius: 10,
      background: 'var(--surface-sunken)',
      border: 'var(--border-hairline)',
      font: '500 14px/1 var(--font-mono)',
      color: paused ? 'var(--text-muted)' : 'var(--text-primary)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "timer",
    size: 16,
    color: "var(--qb-gold)"
  }), fmt(elapsed)), onTogglePause && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: paused ? 'play' : 'pause',
    label: paused ? 'Retomar' : 'Pausar',
    onClick: onTogglePause
  }), onToggleFocus && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "focus",
    label: "Modo foco",
    pressed: focusMode,
    onClick: onToggleFocus
  })));
}
Object.assign(__ds_scope, { StudySessionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/study/StudySessionHeader.jsx", error: String((e && e.message) || e) }); }

// components/tutor/TutorPanel.jsx
try { (() => {
function Bubble({
  m,
  onRef
}) {
  const tutor = m.role === 'tutor';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: tutor ? 'flex-start' : 'flex-end'
    }
  }, tutor && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      flexShrink: 0,
      border: '1px solid rgba(208,179,134,.6)',
      background: 'var(--qb-navy-deep)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "qb-img qb-mark-q-sword",
    style: {
      width: 20,
      height: 22,
      backgroundSize: 'contain'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '78%',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '12px 14px',
      borderRadius: tutor ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
      background: tutor ? 'var(--surface)' : 'var(--qb-navy-hover)',
      border: tutor ? 'var(--border-hairline)' : '1px solid rgba(208,179,134,.5)',
      font: '400 15px/1.6 var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, /*#__PURE__*/React.createElement("div", null, m.text), m.refs && m.refs.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, m.refs.map(r => /*#__PURE__*/React.createElement("button", {
    key: r.id,
    className: "qb-chip",
    style: {
      minHeight: 28,
      fontSize: 12
    },
    onClick: () => onRef && onRef(r.id)
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: r.kind === 'question' ? 'list-checks' : 'network',
    size: 13
  }), r.label)))));
}
function TutorPanel({
  messages = [],
  onSend,
  suggestions = [],
  contextLabel,
  demo = true,
  thinking = false,
  onRef,
  onClose,
  title = 'Tutor',
  style
}) {
  const [text, setText] = React.useState('');
  const listRef = React.useRef(null);
  React.useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length, thinking]);
  const send = v => {
    const t = (v ?? text).trim();
    if (!t) return;
    onSend && onSend(t);
    setText('');
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "qb-panel",
    "aria-label": title,
    style: {
      display: 'flex',
      flexDirection: 'column',
      padding: 0,
      overflow: 'hidden',
      minHeight: 420,
      ...style
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 12px 12px 20px',
      borderBottom: '1px solid var(--divider)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "message-circle",
    size: 18,
    color: "var(--qb-gold)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 16px/1.2 var(--font-serif)',
      fontSize: 19,
      color: 'var(--text-primary)'
    }
  }, title), demo && /*#__PURE__*/React.createElement("span", {
    className: "qb-badge qb-badge--neutral",
    title: "Respostas simuladas; sem conex\xE3o com IA real nem mem\xF3ria persistente"
  }, "Demonstra\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), onClose && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "Fechar tutor",
    size: "sm",
    onClick: onClose
  })), contextLabel && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 20px',
      background: 'var(--surface-sunken)',
      borderBottom: '1px solid var(--divider)',
      font: '400 13px/1.3 var(--font-body)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "link",
    size: 14
  }), "Contexto: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, contextLabel)), /*#__PURE__*/React.createElement("div", {
    ref: listRef,
    role: "log",
    "aria-live": "polite",
    style: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: 20
    }
  }, messages.map((m, i) => /*#__PURE__*/React.createElement(Bubble, {
    key: i,
    m: m,
    onRef: onRef
  })), thinking && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      font: '400 13px/1 var(--font-body)',
      color: 'var(--text-muted)',
      paddingLeft: 42
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "loader-circle",
    size: 14,
    className: "qb-spin"
  }), "Elaborando resposta\u2026")), suggestions.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      padding: '0 20px 12px'
    }
  }, suggestions.map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    className: "qb-chip",
    onClick: () => send(s)
  }, s))), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      send();
    },
    style: {
      display: 'flex',
      gap: 8,
      padding: 12,
      borderTop: '1px solid var(--divider)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "qb-input",
    value: text,
    onChange: e => setText(e.target.value),
    placeholder: "Pergunte sobre o conceito ou a quest\xE3o\u2026",
    "aria-label": "Mensagem ao tutor"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "qb-btn qb-btn--primary",
    style: {
      width: 44,
      padding: 0,
      flexShrink: 0
    },
    "aria-label": "Enviar",
    disabled: !text.trim()
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "send",
    size: 18
  }))), demo && /*#__PURE__*/React.createElement("p", {
    style: {
      padding: '0 20px 12px',
      font: '400 12px/1.4 var(--font-body)',
      color: 'var(--text-muted)'
    }
  }, "Respostas simuladas para demonstra\xE7\xE3o. Confira sempre a fonte legal."));
}
Object.assign(__ds_scope, { TutorPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tutor/TutorPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/App.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
(() => {
  const KEY = 'qb-uikit-view';
  function App() {
    const [view, setView] = React.useState(() => new URLSearchParams(location.search).get('view') || localStorage.getItem(KEY) || 'dashboard');
    const [session, setSession] = React.useState({
      idx: 0,
      answers: {},
      drawer: false,
      focus: false,
      bannerDismissed: false
    });
    const [cards, setCards] = React.useState({
      idx: 0,
      flipped: false,
      ratings: []
    });
    const [mapSel, setMapSel] = React.useState('em');
    const [returnTo, setReturnTo] = React.useState(null);
    const [elapsed, setElapsed] = React.useState(0);
    const [paused, setPaused] = React.useState(false);
    React.useEffect(() => {
      localStorage.setItem(KEY, view);
      window.scrollTo(0, 0);
    }, [view]);
    React.useEffect(() => {
      if (!['questions', 'flashcards'].includes(view) || paused) return;
      const t = setInterval(() => setElapsed(e => e + 1), 1000);
      return () => clearInterval(t);
    }, [view, paused]);
    const go = (v, opts = {}) => {
      if (v === 'map') {
        if (opts.node) setMapSel(opts.node);
        setReturnTo(opts.returnTo || null);
      }
      setView(v);
    };
    const progress = {
      answered: Object.values(session.answers).filter(a => a.revealed).length,
      cards: cards.ratings.length
    };
    const timer = {
      elapsed,
      paused,
      onTogglePause: () => setPaused(p => !p)
    };
    if (view === 'welcome') return /*#__PURE__*/React.createElement(Welcome, {
      onEnter: () => go('dashboard')
    });
    if (view === 'questions') return /*#__PURE__*/React.createElement(QuestionSession, _extends({
      session: session,
      setSession: setSession,
      go: go
    }, timer));
    if (view === 'flashcards') return /*#__PURE__*/React.createElement(FlashcardSession, _extends({
      cards: cards,
      setCards: setCards,
      go: go
    }, timer));
    return /*#__PURE__*/React.createElement(AppShell, {
      active: view,
      onNavigate: go,
      onProfile: () => go('welcome'),
      wide: view === 'map'
    }, view === 'dashboard' && /*#__PURE__*/React.createElement(Dashboard, {
      go: go,
      progress: progress
    }), view === 'map' && /*#__PURE__*/React.createElement(MindMapScreen, {
      selected: mapSel,
      setSelected: setMapSel,
      returnTo: returnTo,
      onReturn: () => {
        const r = returnTo;
        setReturnTo(null);
        go(r.view);
      },
      go: go
    }), view === 'tutor' && /*#__PURE__*/React.createElement(TutorScreen, {
      session: session,
      go: go
    }));
  }
  ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppShell.jsx
try { (() => {
(() => {
  const {
    BrandHeader
  } = window.QuebrandoABancaDesignSystem_3e4054;
  const QB_NAV = [{
    id: 'dashboard',
    label: 'Início',
    icon: 'house'
  }, {
    id: 'questions',
    label: 'Questões',
    icon: 'list-checks'
  }, {
    id: 'map',
    label: 'Mapas',
    icon: 'network'
  }, {
    id: 'flashcards',
    label: 'Flashcards',
    icon: 'layers'
  }, {
    id: 'tutor',
    label: 'Tutor',
    icon: 'message-circle'
  }];
  function AppShell({
    active,
    onNavigate,
    onProfile,
    children,
    wide
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '16px 16px 0',
        maxWidth: 1312,
        width: '100%',
        margin: '0 auto'
      }
    }, /*#__PURE__*/React.createElement(BrandHeader, {
      items: QB_NAV,
      activeId: active,
      onNavigate: onNavigate,
      notifications: 1,
      user: window.QB_DATA.user,
      onStats: () => onNavigate('dashboard'),
      onProfile: onProfile
    })), /*#__PURE__*/React.createElement("main", {
      style: {
        flex: 1,
        width: '100%',
        maxWidth: wide ? 1312 : 1272,
        margin: '0 auto',
        padding: '24px 16px 48px'
      }
    }, children));
  }
  Object.assign(window, {
    AppShell,
    QB_NAV
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Dashboard.jsx
try { (() => {
(() => {
  const {
    HeroAscension,
    RadialNavigation,
    Panel,
    ProgressBar,
    AchievementEmblem,
    Button,
    Icon,
    Badge
  } = window.QuebrandoABancaDesignSystem_3e4054;
  function PlanItem({
    icon,
    title,
    meta,
    done,
    onClick
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: onClick,
      className: "qb-radial__row",
      style: {
        background: 'transparent',
        minHeight: 60
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${done ? 'var(--state-correct)' : 'rgba(208,179,134,.55)'}`,
        color: done ? 'var(--state-correct)' : 'var(--qb-gold)',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: done ? 'check' : icon,
      size: 18
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 15px/1.3 var(--font-body)',
        textDecoration: done ? 'line-through' : 'none',
        color: done ? 'var(--text-muted)' : 'var(--text-primary)'
      }
    }, title), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '400 13px/1.3 var(--font-body)',
        color: 'var(--text-muted)'
      }
    }, done ? 'Concluído' : meta)), !done && /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 18,
      color: "var(--text-muted)"
    }));
  }
  function Dashboard({
    go,
    progress
  }) {
    const answered = progress.answered;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }
    }, /*#__PURE__*/React.createElement(HeroAscension, {
      scene: "sunset",
      height: 260,
      focal: "right",
      eyebrow: window.QB_DATA.exam,
      title: "A Ascens\xE3o continua",
      subtitle: "Hoje: processo legislativo \u2014 5 quest\xF5es e 5 flashcards."
    }, /*#__PURE__*/React.createElement(Button, {
      iconRight: "arrow-right",
      onClick: () => go('questions')
    }, answered ? 'Continuar sessão' : 'Iniciar sessão'), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      icon: "network",
      onClick: () => go('map')
    }, "Abrir mapa do tema")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.35fr) minmax(300px,1fr)',
        gap: 24,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center'
      },
      padding: "24px 16px 28px"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: 'stretch',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 8px'
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        font: 'var(--type-h2)'
      }
    }, "Sua jornada"), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      icon: "info"
    }, "Dados de demonstra\xE7\xE3o")), /*#__PURE__*/React.createElement(RadialNavigation, {
      size: 500,
      onSelect: go,
      center: {
        value: 0.42,
        overline: 'Edital',
        label: 'Analista Legislativo'
      },
      items: [{
        id: 'questions',
        label: 'Questões',
        icon: 'list-checks',
        meta: `${5 - answered} restantes`
      }, {
        id: 'map',
        label: 'Mapas mentais',
        icon: 'network',
        meta: '2 nós com erro'
      }, {
        id: 'flashcards',
        label: 'Flashcards',
        icon: 'layers',
        meta: `${5 - progress.cards} pendentes`
      }, {
        id: 'tutor',
        label: 'Tutor',
        icon: 'message-circle',
        meta: 'Demonstração'
      }, {
        id: 'dashboard',
        label: 'Revisão',
        icon: 'history',
        meta: '12 itens'
      }]
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        font: 'var(--type-h2)',
        marginBottom: 8
      }
    }, "Plano de hoje"), /*#__PURE__*/React.createElement(PlanItem, {
      icon: "list-checks",
      title: "Quest\xF5es \xB7 Emendas e MPs",
      meta: "5 itens Cebraspe \xB7 ~10 min",
      done: answered >= 5,
      onClick: () => go('questions')
    }), /*#__PURE__*/React.createElement(PlanItem, {
      icon: "layers",
      title: "Flashcards \xB7 Processo legislativo",
      meta: "5 cart\xF5es \xB7 ~5 min",
      done: progress.cards >= 5,
      onClick: () => go('flashcards')
    }), /*#__PURE__*/React.createElement(PlanItem, {
      icon: "network",
      title: "Revisar n\xF3 \u201CLimites formais\u201D",
      meta: "2 erros recentes",
      onClick: () => go('map', {
        node: 'lf'
      })
    })), /*#__PURE__*/React.createElement(Panel, {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        font: 'var(--type-h2)'
      }
    }, "Desempenho por tema"), /*#__PURE__*/React.createElement(ProgressBar, {
      value: 0.68,
      label: "Direito Constitucional",
      tone: "correct"
    }), /*#__PURE__*/React.createElement(ProgressBar, {
      value: 0.54,
      label: "Regimento Interno da C\xE2mara",
      tone: "correct"
    }), /*#__PURE__*/React.createElement(ProgressBar, {
      value: 0.31,
      label: "L\xEDngua Portuguesa",
      tone: "correct"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-caption)',
        color: 'var(--text-muted)'
      }
    }, "Percentual de acertos nos \xFAltimos 30 dias.")), /*#__PURE__*/React.createElement(Panel, {
      variant: "ornate",
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        font: '600 15px/1.2 var(--font-display)',
        letterSpacing: '.12em',
        color: 'var(--qb-gold)'
      }
    }, "MARCOS DA ASCENS\xC3O"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(AchievementEmblem, {
      variant: "soldado",
      state: "earned",
      size: 80,
      rule: "7 dias seguidos",
      style: {
        width: 110
      }
    }), /*#__PURE__*/React.createElement(AchievementEmblem, {
      variant: "sabio",
      state: "in-progress",
      progress: 0.6,
      size: 80,
      rule: "200 flashcards",
      style: {
        width: 110
      }
    }), /*#__PURE__*/React.createElement(AchievementEmblem, {
      variant: "estrategista",
      state: "locked",
      size: 80,
      rule: "1 simulado completo",
      style: {
        width: 110
      }
    }))))));
  }
  Object.assign(window, {
    Dashboard
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/FlashcardSession.jsx
try { (() => {
(() => {
  const {
    BrandHeader,
    StudySessionHeader,
    Flashcard,
    Panel,
    AchievementEmblem,
    Button
  } = window.QuebrandoABancaDesignSystem_3e4054;
  function FlashcardSession({
    cards,
    setCards,
    elapsed,
    paused,
    onTogglePause,
    go
  }) {
    const D = window.QB_DATA;
    const {
      idx,
      flipped,
      ratings
    } = cards;
    const done = idx >= D.flashcards.length;
    const card = D.flashcards[Math.min(idx, D.flashcards.length - 1)];
    const node = D.mapNodes.find(n => n.id === card.node);
    const parent = node && D.mapNodes.find(n => n.id === node.parent);
    const rate = r => setCards(c => ({
      idx: c.idx + 1,
      flipped: false,
      ratings: [...c.ratings, r]
    }));
    React.useEffect(() => {
      const onKey = e => {
        if (!done && e.key === ' ') {
          e.preventDefault();
          setCards(c => ({
            ...c,
            flipped: !c.flipped
          }));
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(BrandHeader, {
      variant: "compact",
      floating: false,
      onExit: () => go('dashboard')
    }, /*#__PURE__*/React.createElement("span", {
      className: "qb-overline"
    }, "Revis\xE3o espa\xE7ada"), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '400 16px/1.2 var(--font-heading)',
        color: 'var(--text-primary)'
      }
    }, "Processo legislativo")), /*#__PURE__*/React.createElement(StudySessionHeader, {
      subject: "Flashcards \xB7 Direito Constitucional",
      topic: "Processo legislativo",
      unit: "Cart\xE3o",
      current: Math.min(idx + 1, D.flashcards.length),
      total: D.flashcards.length,
      elapsed: elapsed,
      paused: paused,
      onTogglePause: onTogglePause,
      onBack: () => go('dashboard')
    }), /*#__PURE__*/React.createElement("main", {
      style: {
        width: '100%',
        maxWidth: 720,
        margin: '0 auto',
        padding: '40px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, done ? /*#__PURE__*/React.createElement(Panel, {
      variant: "ornate",
      padding: 32,
      style: {
        display: 'flex',
        gap: 28,
        alignItems: 'center',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(AchievementEmblem, {
      variant: "sabio",
      state: "in-progress",
      progress: 0.62,
      size: 110,
      rule: "Rumo a 200 flashcards revisados"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 240,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "qb-overline",
      style: {
        color: 'var(--qb-gold)'
      }
    }, "Revis\xE3o conclu\xEDda"), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: 'var(--type-h1)'
      }
    }, ratings.length, " cart\xF5es revisados"), /*#__PURE__*/React.createElement("p", {
      style: {
        font: 'var(--type-body)',
        color: 'var(--text-secondary)'
      }
    }, ratings.filter(r => r === 'errei').length, " marcados como \u201CErrei\u201D voltam ainda nesta sess\xE3o. Os intervalos s\xE3o ilustrativos nesta demonstra\xE7\xE3o."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement(Button, {
      icon: "house",
      onClick: () => go('dashboard')
    }, "Voltar ao in\xEDcio"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      icon: "rotate-ccw",
      onClick: () => setCards({
        idx: 0,
        flipped: false,
        ratings: []
      })
    }, "Revisar de novo")))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Flashcard, {
      key: idx,
      deck: "Constitucional",
      height: 380,
      front: card.front,
      back: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
        style: {
          margin: 0,
          color: 'var(--text-primary)',
          fontSize: 19,
          lineHeight: 1.5
        }
      }, card.back), /*#__PURE__*/React.createElement("p", {
        style: {
          margin: '14px 0 0',
          font: '400 13px/1.4 var(--font-mono)',
          color: 'var(--text-muted)'
        }
      }, card.basis)),
      origin: node && `${parent ? parent.label + ' › ' : ''}${node.label}`,
      onOpenOrigin: () => go('map', {
        node: card.node,
        returnTo: {
          label: 'revisão de flashcards',
          view: 'flashcards'
        }
      }),
      flipped: flipped,
      onFlip: () => setCards(c => ({
        ...c,
        flipped: !c.flipped
      })),
      onRate: rate
    }), !flipped && /*#__PURE__*/React.createElement("span", {
      style: {
        textAlign: 'center',
        font: '400 12px/1 var(--font-mono)',
        color: 'var(--text-muted)'
      }
    }, "Espa\xE7o \xB7 virar cart\xE3o"))));
  }
  Object.assign(window, {
    FlashcardSession
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/FlashcardSession.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/MindMapScreen.jsx
try { (() => {
(() => {
  const {
    MindMapCanvas,
    ConceptPanel,
    Badge
  } = window.QuebrandoABancaDesignSystem_3e4054;
  function MindMapScreen({
    selected,
    setSelected,
    returnTo,
    onReturn,
    go
  }) {
    const D = window.QB_DATA;
    const node = D.mapNodes.find(n => n.id === selected) || D.mapNodes[0];
    const c = D.concepts[node.id] || {
      summary: 'Conteúdo deste nó ainda não preenchido na demonstração.'
    };
    const path = [];
    let p = D.mapNodes.find(n => n.id === node.parent);
    while (p) {
      path.unshift(p.label);
      p = D.mapNodes.find(n => n.id === p.parent);
    }
    const card = D.flashcards.filter(f => f.node === node.id).length;
    const expanded = ['pl', 'em', 'lo', 'mp'];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "qb-overline"
    }, "Direito Constitucional \xB7 Mapa mental"), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: 'var(--type-h1)'
      }
    }, "Processo legislativo")), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      icon: "info"
    }, "Dom\xEDnio baseado nas suas respostas (demonstra\xE7\xE3o)")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 380px',
        gap: 20,
        alignItems: 'stretch'
      }
    }, /*#__PURE__*/React.createElement(MindMapCanvas, {
      key: returnTo ? 'r' : 'n',
      nodes: D.mapNodes,
      selectedId: node.id,
      onSelect: setSelected,
      defaultExpanded: expanded,
      height: 620
    }), /*#__PURE__*/React.createElement(ConceptPanel, {
      key: node.id,
      title: node.label,
      path: path,
      mastery: node.mastery ? {
        state: node.mastery,
        text: D.masteryText[node.mastery]
      } : undefined,
      summary: c.summary,
      example: c.example,
      connections: c.connections || [],
      sources: c.sources || [],
      onNavigate: setSelected,
      reviewCount: card || undefined,
      onReview: () => go('flashcards'),
      returnTo: returnTo && returnTo.label,
      onReturn: onReturn,
      style: {
        height: 620
      }
    })));
  }
  Object.assign(window, {
    MindMapScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/MindMapScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/QuestionSession.jsx
try { (() => {
(() => {
  const {
    BrandHeader,
    StudySessionHeader,
    QuestionCard,
    AnswerActionBar,
    FeedbackDrawer,
    CognitiveAlertBanner,
    Panel,
    Badge,
    Button
  } = window.QuebrandoABancaDesignSystem_3e4054;
  function SessionSummary({
    answers,
    go
  }) {
    const qs = window.QB_DATA.questions;
    const right = qs.filter(q => answers[q.id] && answers[q.id].answer === q.key).length;
    return /*#__PURE__*/React.createElement(Panel, {
      variant: "ornate",
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      },
      padding: 32
    }, /*#__PURE__*/React.createElement("span", {
      className: "qb-overline",
      style: {
        color: 'var(--qb-gold)'
      }
    }, "Sess\xE3o conclu\xEDda"), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: 'var(--type-h1)'
      }
    }, right, " de ", qs.length, " acertos"), /*#__PURE__*/React.createElement("ul", {
      style: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, qs.map(q => {
      const a = answers[q.id];
      const ok = a && a.answer === q.key;
      return /*#__PURE__*/React.createElement("li", {
        key: q.id,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 0',
          borderBottom: '1px solid var(--divider)'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: '500 13px/1 var(--font-mono)',
          color: 'var(--text-muted)',
          width: 56
        }
      }, q.code), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          font: '400 14px/1.4 var(--font-body)',
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, q.statement), /*#__PURE__*/React.createElement(Badge, {
        tone: !a ? 'no-evidence' : ok ? 'correct' : 'incorrect'
      }, !a ? 'Pulada' : ok ? 'Acertou' : 'Errou'));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      iconRight: "arrow-right",
      onClick: () => go('flashcards')
    }, "Seguir para flashcards"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      icon: "house",
      onClick: () => go('dashboard')
    }, "Voltar ao in\xEDcio")));
  }
  function QuestionSession({
    session,
    setSession,
    elapsed,
    paused,
    onTogglePause,
    go
  }) {
    const qs = window.QB_DATA.questions;
    const {
      idx,
      answers,
      drawer,
      focus,
      bannerDismissed
    } = session;
    const done = idx >= qs.length;
    const q = qs[Math.min(idx, qs.length - 1)];
    const st = answers[q.id] || {};
    const [loading, setLoading] = React.useState(false);
    const patch = p => setSession(s => ({
      ...s,
      ...p
    }));
    const setAns = p => setSession(s => ({
      ...s,
      answers: {
        ...s.answers,
        [q.id]: {
          ...(s.answers[q.id] || {}),
          ...p
        }
      }
    }));
    const confirm = () => {
      if (!st.answer) return;
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setAns({
          revealed: true
        });
        patch({
          drawer: true
        });
      }, 450);
    };
    const next = () => patch({
      idx: idx + 1,
      drawer: false
    });
    const openConcept = () => go('map', {
      node: q.node,
      returnTo: {
        label: `questão ${q.code}`,
        view: 'questions'
      }
    });
    const wrong = qs.filter(x => answers[x.id] && answers[x.id].revealed && answers[x.id].answer !== x.key);
    React.useEffect(() => {
      const onKey = e => {
        if (done || e.target.tagName === 'INPUT') return;
        const k = e.key.toLowerCase();
        if (!st.revealed && (k === 'c' || k === 'e')) setAns({
          answer: k.toUpperCase()
        });
        if (e.key === 'Enter') {
          st.revealed ? next() : confirm();
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }
    }, !focus && /*#__PURE__*/React.createElement(BrandHeader, {
      variant: "compact",
      floating: false,
      onExit: () => go('dashboard')
    }, /*#__PURE__*/React.createElement("span", {
      className: "qb-overline"
    }, "Sess\xE3o de quest\xF5es"), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '400 16px/1.2 var(--font-heading)',
        color: 'var(--text-primary)'
      }
    }, "Processo legislativo")), /*#__PURE__*/React.createElement(StudySessionHeader, {
      subject: "Direito Constitucional",
      topic: "Processo legislativo \u2014 emendas e medidas provis\xF3rias",
      current: Math.min(idx + 1, qs.length),
      total: qs.length,
      elapsed: elapsed,
      paused: paused,
      onTogglePause: onTogglePause,
      focusMode: focus,
      onToggleFocus: () => patch({
        focus: !focus
      }),
      onBack: () => go('dashboard')
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("main", {
      style: {
        width: '100%',
        maxWidth: 820,
        margin: '0 auto',
        padding: '28px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, done ? /*#__PURE__*/React.createElement(SessionSummary, {
      answers: answers,
      go: go
    }) : /*#__PURE__*/React.createElement(React.Fragment, null, !focus && wrong.length > 0 && !bannerDismissed && /*#__PURE__*/React.createElement(CognitiveAlertBanner, {
      tone: "attention",
      title: `${wrong.length} ${wrong.length > 1 ? 'erros' : 'erro'} nesta sessão`,
      onDismiss: () => patch({
        bannerDismissed: true
      }),
      actions: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        icon: "network",
        onClick: () => go('map', {
          node: wrong[wrong.length - 1].node,
          returnTo: {
            label: `questão ${q.code}`,
            view: 'questions'
          }
        })
      }, "Revisar o conceito no mapa")
    }, "O \xFAltimo erro foi em \u201C", window.QB_DATA.mapNodes.find(n => n.id === wrong[wrong.length - 1].node).label, "\u201D."), /*#__PURE__*/React.createElement(QuestionCard, {
      key: q.id,
      code: q.code,
      year: q.year,
      exam: window.QB_DATA.exam,
      tags: q.tags,
      statement: q.statement,
      answer: st.answer || null,
      onAnswer: a => setAns({
        answer: a
      }),
      confidence: st.confidence || null,
      onConfidence: c => setAns({
        confidence: c
      }),
      answerKey: st.revealed ? q.key : null,
      bookmarked: !!st.bookmarked,
      onBookmark: () => setAns({
        bookmarked: !st.bookmarked
      }),
      conceptLink: {
        label: `Ver no mapa: ${window.QB_DATA.mapNodes.find(n => n.id === q.node).label}`,
        onClick: openConcept
      }
    }))), !done && /*#__PURE__*/React.createElement(FeedbackDrawer, {
      open: drawer && st.revealed,
      onClose: () => patch({
        drawer: false
      }),
      result: st.answer === q.key ? 'correct' : 'incorrect',
      answerKey: q.key,
      explanation: q.explanation,
      legalBasis: q.basis,
      trap: q.trap,
      concept: {
        path: (() => {
          const p = [];
          let n = window.QB_DATA.mapNodes.find(x => x.id === q.node);
          while (n) {
            p.unshift(n.label);
            n = window.QB_DATA.mapNodes.find(x => x.id === n.parent);
          }
          return p;
        })()
      },
      onOpenConcept: openConcept,
      onFlashcards: () => go('flashcards')
    })), !done && /*#__PURE__*/React.createElement(AnswerActionBar, {
      sticky: true,
      state: st.revealed ? 'answered' : loading ? 'loading' : st.answer ? 'ready' : 'idle',
      onConfirm: confirm,
      onNext: next,
      onSkip: next,
      onReview: () => setAns({
        bookmarked: !st.bookmarked
      }),
      reviewMarked: !!st.bookmarked,
      onOpenFeedback: () => patch({
        drawer: true
      })
    }));
  }
  Object.assign(window, {
    QuestionSession
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/QuestionSession.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/TutorScreen.jsx
try { (() => {
(() => {
  const {
    TutorPanel,
    Panel,
    Badge,
    Button,
    Icon
  } = window.QuebrandoABancaDesignSystem_3e4054;
  function TutorScreen({
    session,
    go
  }) {
    const D = window.QB_DATA;
    const q = D.questions[Math.min(session.idx, D.questions.length - 1)];
    const st = session.answers[q.id] || {};
    const node = D.mapNodes.find(n => n.id === q.node);
    const [messages, setMessages] = React.useState([{
      role: 'tutor',
      text: `Estou com a ${q.code} e o conceito “${node.label}” como contexto. O que você quer entender?`
    }]);
    const [thinking, setThinking] = React.useState(false);
    const send = t => {
      setMessages(m => [...m, {
        role: 'user',
        text: t
      }]);
      setThinking(true);
      setTimeout(() => {
        setThinking(false);
        setMessages(m => [...m, {
          role: 'tutor',
          text: D.tutorReplies[t] || 'Na demonstração, só as sugestões abaixo têm resposta preparada. Em produção, a resposta citaria a fonte legal do conceito.',
          refs: [{
            id: node.id,
            label: node.label,
            kind: 'concept'
          }]
        }]);
      }, 900);
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(260px,340px) minmax(0,1fr)',
        gap: 24,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "qb-overline"
    }, "Contexto da conversa"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 13px/1 var(--font-mono)',
        color: 'var(--text-muted)'
      }
    }, q.code), st.revealed ? /*#__PURE__*/React.createElement(Badge, {
      tone: st.answer === q.key ? 'correct' : 'incorrect'
    }, st.answer === q.key ? 'Acertou' : 'Errou') : /*#__PURE__*/React.createElement(Badge, {
      tone: "no-evidence"
    }, "N\xE3o respondida")), /*#__PURE__*/React.createElement("p", {
      style: {
        font: '400 15px/1.6 var(--font-body)',
        color: 'var(--text-secondary)'
      }
    }, q.statement), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--divider)'
      }
    }), /*#__PURE__*/React.createElement("button", {
      className: "qb-linkbtn",
      onClick: () => go('map', {
        node: node.id,
        returnTo: {
          label: 'conversa com o tutor',
          view: 'tutor'
        }
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "network",
      size: 16
    }), "Conceito: ", node.label), /*#__PURE__*/React.createElement("button", {
      className: "qb-linkbtn",
      onClick: () => go('questions')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "list-checks",
      size: 16
    }), "Voltar \xE0 quest\xE3o")), /*#__PURE__*/React.createElement(TutorPanel, {
      style: {
        height: 'min(680px, calc(100vh - 160px))'
      },
      contextLabel: `${q.code} · ${node.label}`,
      messages: messages,
      thinking: thinking,
      suggestions: Object.keys(D.tutorReplies),
      onSend: send,
      onRef: id => go('map', {
        node: id,
        returnTo: {
          label: 'conversa com o tutor',
          view: 'tutor'
        }
      })
    }));
  }
  Object.assign(window, {
    TutorScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/TutorScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Welcome.jsx
try { (() => {
(() => {
  const {
    BrandLogo,
    Button
  } = window.QuebrandoABancaDesignSystem_3e4054;
  function Welcome({
    onEnter
  }) {
    const [email, setEmail] = React.useState('lucas@exemplo.com');
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        isolation: 'isolate',
        display: 'flex',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "qb-img qb-scene-night",
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        inset: 0,
        backgroundPosition: '65% 40%',
        zIndex: -2
      }
    }), /*#__PURE__*/React.createElement("div", {
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        background: 'linear-gradient(90deg,rgba(10,30,52,.97) 0%,rgba(10,30,52,.9) 32%,rgba(10,30,52,.4) 60%,rgba(10,30,52,.1) 100%),linear-gradient(180deg,rgba(10,30,52,0) 60%,rgba(10,30,52,.8) 100%)'
      }
    }), /*#__PURE__*/React.createElement("main", {
      style: {
        width: '100%',
        maxWidth: 1240,
        margin: '0 auto',
        padding: 'clamp(24px,5vw,64px)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 440,
        display: 'flex',
        flexDirection: 'column',
        gap: 28
      }
    }, /*#__PURE__*/React.createElement(BrandLogo, {
      variant: "vertical",
      size: 220,
      style: {
        marginLeft: -16
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        font: 'italic 500 22px/1.35 var(--font-serif)',
        color: 'var(--qb-parchment)'
      }
    }, "Conhecimento \xB7 Estrat\xE9gia \xB7 Disciplina \xB7 Conquista"), /*#__PURE__*/React.createElement("form", {
      onSubmit: e => {
        e.preventDefault();
        onEnter();
      },
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-label)',
        color: 'var(--text-secondary)'
      }
    }, "E-mail"), /*#__PURE__*/React.createElement("input", {
      className: "qb-input",
      type: "email",
      value: email,
      onChange: e => setEmail(e.target.value)
    })), /*#__PURE__*/React.createElement(Button, {
      type: "submit",
      size: "lg",
      iconRight: "arrow-right",
      fullWidth: true
    }, "Entrar"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm"
    }, "Criar conta")), /*#__PURE__*/React.createElement("p", {
      style: {
        font: 'var(--type-caption)',
        color: 'var(--text-muted)'
      }
    }, "Prot\xF3tipo de demonstra\xE7\xE3o \u2014 nenhum dado \xE9 enviado."))));
  }
  Object.assign(window, {
    Welcome
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Welcome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/data.js
try { (() => {
// Demo content for the UI kit. Legal statements follow CF/88 (arts. 60, 62, 66, 67). Performance numbers are illustrative.
window.QB_DATA = {
  user: {
    name: 'Lucas',
    initials: 'LM'
  },
  exam: 'Câmara dos Deputados · Analista Legislativo',
  questions: [{
    id: 'q412',
    code: 'Q 0412',
    year: 2023,
    tags: ['Processo legislativo'],
    key: 'C',
    node: 'lf',
    statement: 'A matéria constante de proposta de emenda à Constituição rejeitada ou havida por prejudicada não pode ser objeto de nova proposta na mesma sessão legislativa.',
    explanation: 'O art. 60, § 5º, veda a reapresentação, na mesma sessão legislativa, de matéria constante de PEC rejeitada ou havida por prejudicada. Não há exceção.',
    basis: 'CF/88, art. 60, § 5º',
    trap: {
      name: 'Confusão com projeto de lei',
      description: 'Para projetos de lei rejeitados, a reapresentação na mesma sessão é possível mediante proposta da maioria absoluta dos membros de qualquer das Casas (art. 67). Para PEC, não.'
    }
  }, {
    id: 'q413',
    code: 'Q 0413',
    year: 2022,
    tags: ['Emendas'],
    key: 'E',
    node: 'lc',
    statement: 'Durante a vigência de estado de defesa, a Constituição poderá ser emendada, desde que a proposta seja de iniciativa do Presidente da República.',
    explanation: 'A Constituição não pode ser emendada na vigência de intervenção federal, de estado de defesa ou de estado de sítio — independentemente de quem proponha.',
    basis: 'CF/88, art. 60, § 1º',
    trap: {
      name: 'Exceção inventada',
      description: 'O item cria uma condição (“desde que por iniciativa do Presidente”) que não existe. Limite circunstancial não admite exceção.'
    }
  }, {
    id: 'q414',
    code: 'Q 0414',
    year: 2021,
    tags: ['Emendas'],
    key: 'C',
    node: 'lf',
    statement: 'A proposta de emenda à Constituição será discutida e votada em cada Casa do Congresso Nacional, em dois turnos, considerando-se aprovada se obtiver, em ambos, três quintos dos votos dos respectivos membros.',
    explanation: 'Reprodução fiel do art. 60, § 2º: dois turnos em cada Casa e aprovação por três quintos dos votos dos respectivos membros.',
    basis: 'CF/88, art. 60, § 2º',
    trap: {
      name: 'Troca de quórum',
      description: 'Itens semelhantes trocam “três quintos” por “dois terços” ou “maioria absoluta”. Aqui o quórum está correto.'
    }
  }, {
    id: 'q415',
    code: 'Q 0415',
    year: 2023,
    tags: ['Emendas'],
    key: 'E',
    node: 'prom',
    statement: 'A emenda à Constituição será promulgada pelo Presidente da República, após a sanção.',
    explanation: 'A emenda é promulgada pelas Mesas da Câmara dos Deputados e do Senado Federal, com o respectivo número de ordem. Não há sanção nem veto no rito de PEC.',
    basis: 'CF/88, art. 60, § 3º',
    trap: {
      name: 'Transposição de rito',
      description: 'O item aplica à PEC etapas do processo legislativo ordinário (sanção presidencial).'
    }
  }, {
    id: 'q416',
    code: 'Q 0416',
    year: 2022,
    tags: ['Medidas provisórias'],
    key: 'C',
    node: 'pz',
    statement: 'Se a medida provisória não for apreciada em até quarenta e cinco dias contados de sua publicação, entrará em regime de urgência, sobrestando as demais deliberações legislativas da Casa em que estiver tramitando.',
    explanation: 'Texto do art. 62, § 6º. O trancamento de pauta ocorre a partir do 46º dia.',
    basis: 'CF/88, art. 62, § 6º',
    trap: {
      name: 'Troca de prazo',
      description: 'Itens semelhantes usam 60 dias (prazo de vigência) no lugar de 45 dias (regime de urgência).'
    }
  }],
  mapNodes: [{
    id: 'pl',
    label: 'Processo legislativo'
  }, {
    id: 'em',
    label: 'Emendas à Constituição',
    parent: 'pl',
    mastery: 'incorrect'
  }, {
    id: 'lo',
    label: 'Leis ordinárias e complementares',
    parent: 'pl',
    mastery: 'progress'
  }, {
    id: 'mp',
    label: 'Medidas provisórias',
    parent: 'pl',
    mastery: 'correct'
  }, {
    id: 'ld',
    label: 'Leis delegadas',
    parent: 'pl',
    mastery: 'no-evidence'
  }, {
    id: 'dl',
    label: 'Decretos e resoluções',
    parent: 'pl',
    mastery: 'no-evidence'
  }, {
    id: 'ini',
    label: 'Iniciativa',
    parent: 'em',
    mastery: 'correct'
  }, {
    id: 'lf',
    label: 'Limites formais',
    parent: 'em',
    mastery: 'incorrect'
  }, {
    id: 'lm',
    label: 'Cláusulas pétreas',
    parent: 'em',
    mastery: 'correct'
  }, {
    id: 'lc',
    label: 'Limites circunstanciais',
    parent: 'em',
    mastery: 'incorrect'
  }, {
    id: 'prom',
    label: 'Promulgação',
    parent: 'em',
    mastery: 'no-evidence'
  }, {
    id: 'quo',
    label: 'Quórum',
    parent: 'lo',
    mastery: 'progress'
  }, {
    id: 'san',
    label: 'Sanção e veto',
    parent: 'lo',
    mastery: 'no-evidence'
  }, {
    id: 'req',
    label: 'Relevância e urgência',
    parent: 'mp',
    mastery: 'correct'
  }, {
    id: 'pz',
    label: 'Prazos',
    parent: 'mp',
    mastery: 'correct'
  }, {
    id: 'ved',
    label: 'Vedações materiais',
    parent: 'mp',
    mastery: 'no-evidence'
  }],
  concepts: {
    em: {
      summary: 'Rito especial de alteração do texto constitucional, com limites formais, materiais e circunstanciais.',
      sources: ['CF/88, art. 60']
    },
    ini: {
      summary: 'A PEC pode ser proposta por um terço, no mínimo, dos membros da Câmara ou do Senado; pelo Presidente da República; ou por mais da metade das Assembleias Legislativas, cada uma pela maioria relativa de seus membros.',
      sources: ['CF/88, art. 60, I a III']
    },
    lf: {
      summary: 'Regras de procedimento da PEC: discussão e votação em dois turnos em cada Casa, aprovação por três quintos e vedação de reapresentação, na mesma sessão legislativa, de matéria rejeitada ou prejudicada.',
      example: 'PEC rejeitada em maio não pode ter a mesma matéria reapresentada antes da sessão legislativa seguinte.',
      sources: ['CF/88, art. 60, §§ 2º e 5º'],
      connections: [{
        id: 'lm',
        label: 'Cláusulas pétreas',
        relation: 'difere de'
      }, {
        id: 'prom',
        label: 'Promulgação'
      }]
    },
    lm: {
      summary: 'Não será objeto de deliberação a proposta tendente a abolir a forma federativa de Estado; o voto direto, secreto, universal e periódico; a separação dos Poderes; os direitos e garantias individuais.',
      sources: ['CF/88, art. 60, § 4º'],
      connections: [{
        id: 'lf',
        label: 'Limites formais',
        relation: 'difere de'
      }]
    },
    lc: {
      summary: 'A Constituição não poderá ser emendada na vigência de intervenção federal, de estado de defesa ou de estado de sítio.',
      example: 'Decretado estado de defesa, nenhuma PEC pode ser votada até o fim da medida — seja qual for o autor.',
      sources: ['CF/88, art. 60, § 1º'],
      connections: [{
        id: 'lf',
        label: 'Limites formais'
      }]
    },
    prom: {
      summary: 'A emenda é promulgada pelas Mesas da Câmara dos Deputados e do Senado Federal, com o respectivo número de ordem. Não há sanção nem veto.',
      sources: ['CF/88, art. 60, § 3º'],
      connections: [{
        id: 'san',
        label: 'Sanção e veto',
        relation: 'não se aplica'
      }]
    },
    quo: {
      summary: 'Lei complementar exige maioria absoluta; lei ordinária, maioria simples, presente a maioria absoluta dos membros.',
      sources: ['CF/88, arts. 47 e 69']
    },
    san: {
      summary: 'O Presidente tem quinze dias úteis para sancionar ou vetar; o silêncio importa sanção. O veto é apreciado em sessão conjunta e só pode ser rejeitado pela maioria absoluta de Deputados e Senadores.',
      sources: ['CF/88, art. 66, §§ 1º, 3º e 4º']
    },
    req: {
      summary: 'Em caso de relevância e urgência, o Presidente pode adotar medidas provisórias com força de lei, submetendo-as de imediato ao Congresso.',
      sources: ['CF/88, art. 62, caput']
    },
    pz: {
      summary: 'A MP vigora por sessenta dias, prorrogáveis uma vez por igual período. Se não apreciada em quarenta e cinco dias, entra em regime de urgência e tranca a pauta da Casa.',
      example: 'Publicada a MP, o 46º dia sem apreciação já sobresta as demais deliberações.',
      sources: ['CF/88, art. 62, §§ 3º, 6º e 7º'],
      connections: [{
        id: 'req',
        label: 'Relevância e urgência'
      }]
    },
    ved: {
      summary: 'É vedada MP sobre nacionalidade, cidadania, direitos políticos, partidos políticos e direito eleitoral; direito penal, processual penal e processual civil, entre outras matérias.',
      sources: ['CF/88, art. 62, § 1º']
    }
  },
  masteryText: {
    correct: 'Acertos consistentes nas últimas questões',
    incorrect: '2 erros nas últimas 5 questões',
    'no-evidence': 'Ainda sem questões respondidas',
    progress: 'Em estudo — 3 de 6 corretas'
  },
  flashcards: [{
    front: 'Qual o quórum de aprovação de uma PEC?',
    back: 'Três quintos dos votos dos membros de cada Casa, em dois turnos.',
    basis: 'CF/88, art. 60, § 2º',
    node: 'lf'
  }, {
    front: 'Quem promulga a emenda constitucional?',
    back: 'As Mesas da Câmara dos Deputados e do Senado Federal, com o respectivo número de ordem.',
    basis: 'CF/88, art. 60, § 3º',
    node: 'prom'
  }, {
    front: 'Em que situações a Constituição não pode ser emendada?',
    back: 'Na vigência de intervenção federal, estado de defesa ou estado de sítio.',
    basis: 'CF/88, art. 60, § 1º',
    node: 'lc'
  }, {
    front: 'Qual o prazo de vigência de uma medida provisória?',
    back: 'Sessenta dias, prorrogáveis uma única vez por igual período.',
    basis: 'CF/88, art. 62, §§ 3º e 7º',
    node: 'pz'
  }, {
    front: 'O que significa o silêncio do Presidente após quinze dias úteis?',
    back: 'Sanção tácita.',
    basis: 'CF/88, art. 66, § 3º',
    node: 'san'
  }],
  tutorReplies: {
    'Explique com um exemplo': 'Imagine uma PEC rejeitada em maio. A mesma matéria só poderá ser proposta de novo a partir de fevereiro do ano seguinte, quando começa a nova sessão legislativa.',
    'Qual a pegadinha?': 'A Cebraspe costuma misturar o rito da PEC com o dos projetos de lei: para PL rejeitado, a maioria absoluta de uma das Casas pode reapresentar na mesma sessão (art. 67). Para PEC, não existe essa saída.',
    'Gerar 3 flashcards': 'Sugeri 3 cartões sobre limites formais. Na demonstração eles não são salvos — revise o texto antes de usá-los.'
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.AchievementEmblem = __ds_scope.AchievementEmblem;

__ds_ns.BrandLogo = __ds_scope.BrandLogo;

__ds_ns.HeroAscension = __ds_scope.HeroAscension;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Panel = __ds_scope.Panel;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Flashcard = __ds_scope.Flashcard;

__ds_ns.ConceptPanel = __ds_scope.ConceptPanel;

__ds_ns.MindMapCanvas = __ds_scope.MindMapCanvas;

__ds_ns.BrandHeader = __ds_scope.BrandHeader;

__ds_ns.RadialNavigation = __ds_scope.RadialNavigation;

__ds_ns.AnswerActionBar = __ds_scope.AnswerActionBar;

__ds_ns.FeedbackDrawer = __ds_scope.FeedbackDrawer;

__ds_ns.QuestionCard = __ds_scope.QuestionCard;

__ds_ns.CognitiveAlertBanner = __ds_scope.CognitiveAlertBanner;

__ds_ns.StudySessionHeader = __ds_scope.StudySessionHeader;

__ds_ns.TutorPanel = __ds_scope.TutorPanel;

})();
