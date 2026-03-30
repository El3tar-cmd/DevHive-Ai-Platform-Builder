/* ══════════════════════════════════════════════════════
   Constants — App configuration, types, file plans
   ══════════════════════════════════════════════════════ */

export const OLLAMA_BASE_URL = "http://localhost:11434";

export const PROVIDERS = [
  { id: "ollama", label: "Ollama Local", icon: "🟢" },
  { id: "gemini", label: "Gemini API", icon: "🔵" },
  { id: "openrouter", label: "OpenRouter (Free)", icon: "🟣" }
];

/* ── App Types ── */
export const APP_TYPES = [
  {
    id: "nextjs",
    icon: "▲",
    label: "Next.js App",
    desc: "Next 14 · TS · SQLite · Auth · Middleware",
    color: "#00d4ff",
    stack: ["Next.js 14", "TypeScript", "SQLite", "JWT Auth", "Middleware", "Tailwind"],
  },
  {
    id: "react-node",
    icon: "⚛",
    label: "React + Node",
    desc: "Vite · Express · TS · SQLite · REST API",
    color: "#61dafb",
    stack: ["React", "Vite", "Express", "TypeScript", "SQLite", "JWT"],
  },
  {
    id: "api",
    icon: "🔌",
    label: "REST API",
    desc: "Express · TS · SQLite · JWT · Swagger",
    color: "#f59e0b",
    stack: ["Express", "TypeScript", "SQLite", "JWT", "Zod", "Swagger"],
  },
  {
    id: "saas",
    icon: "🚀",
    label: "SaaS Starter",
    desc: "Next.js · Auth · DB · Dashboard · Billing",
    color: "#8b5cf6",
    stack: ["Next.js", "Auth.js", "SQLite", "Stripe", "TypeScript", "Tailwind"],
  },
  {
    id: "website",
    icon: "🌐",
    label: "موقع ويب",
    desc: "HTML · CSS · JS · Animations · Responsive",
    color: "#10b981",
    stack: ["HTML5", "CSS3", "JavaScript", "GSAP", "Responsive"],
  },
  {
    id: "pwa",
    icon: "📱",
    label: "PWA App",
    desc: "React · Service Worker · Offline · Install",
    color: "#f472b6",
    stack: ["React", "Vite", "PWA", "TypeScript", "SQLite"],
  },
];

/* ── Files to generate per app type ── */
/* ── Files to generate per app type ── */
export const FILE_PLANS = {
  nextjs: [
    { path: "package.json",              role: "deps",       icon: "📦", desc: "Dependencies & scripts" },
    { path: "tsconfig.json",             role: "config",     icon: "⚙️", desc: "TypeScript config" },
    { path: "next.config.mjs",           role: "config",     icon: "▲",  desc: "Next.js configuration" },
    { path: "tailwind.config.ts",        role: "config",     icon: "🎨", desc: "Tailwind CSS config" },
    { path: "postcss.config.js",         role: "config",     icon: "🎨", desc: "PostCSS config" },
    { path: ".env.example",              role: "config",     icon: "🔑", desc: "Environment variables" },
    { path: "middleware.ts",             role: "middleware", icon: "🛡️", desc: "Next.js Edge Middleware for Auth/RBAC" },
    { path: "src/lib/db/index.ts",       role: "database",   icon: "🗄️", desc: "Database connection (SQLite/PostgreSQL)" },
    { path: "src/lib/db/schema.ts",      role: "database",   icon: "🏗️", desc: "Drizzle / Prisma schema definition" },
    { path: "src/lib/auth/options.ts",   role: "auth",       icon: "🔐", desc: "NextAuth.js / Auth.js configuration" },
    { path: "src/lib/utils/format.ts",   role: "logic",      icon: "🧰", desc: "Formatting utility functions" },
    { path: "src/lib/types/index.ts",    role: "types",      icon: "🔷", desc: "Global TypeScript interfaces" },
    { path: "src/lib/validations/auth.ts",role: "validation",icon: "✅", desc: "Zod schemas for authentication" },
    { path: "src/app/layout.tsx",        role: "ui",         icon: "🎨", desc: "Root layout & Theme Providers" },
    { path: "src/app/globals.css",       role: "styles",     icon: "💅", desc: "Global styles & Tailwind directives" },
    { path: "src/app/page.tsx",          role: "ui",         icon: "🏠", desc: "Landing page (Marketing)" },
    { path: "src/app/api/auth/[...nextauth]/route.ts", role: "api", icon: "🔑", desc: "Auth Catch-all Route" },
    { path: "src/app/api/health/route.ts",role: "api",       icon: "💓", desc: "API Health Check endpoint" },
    { path: "src/app/(dashboard)/layout.tsx", role: "ui",    icon: "🧭", desc: "Dashboard layout & sidebar" },
    { path: "src/app/(dashboard)/dashboard/page.tsx", role: "ui", icon: "📊", desc: "Protected dashboard overview" },
    { path: "src/components/ui/button.tsx", role: "ui",      icon: "🧩", desc: "Reusable Button component" },
    { path: "src/components/ui/input.tsx",  role: "ui",      icon: "🧩", desc: "Reusable Input component" },
    { path: "Dockerfile",                role: "config",     icon: "🐳", desc: "Docker multi-stage build" },
    { path: "README.md",                 role: "docs",       icon: "📖", desc: "Enterprise Setup & documentation" },
  ],
  "react-node": [
    { path: "package.json",                       role: "deps",     icon: "📦", desc: "Root monorepo workspace config" },
    // Client
    { path: "client/package.json",                role: "deps",     icon: "📦", desc: "Client dependencies" },
    { path: "client/vite.config.ts",              role: "config",   icon: "⚡", desc: "Vite + React config" },
    { path: "client/tsconfig.json",               role: "config",   icon: "⚙️", desc: "TypeScript config" },
    { path: "client/src/main.tsx",                role: "ui",       icon: "🏁", desc: "React DOM entry point" },
    { path: "client/src/App.tsx",                 role: "ui",       icon: "⚛", desc: "Root RouterProvider component" },
    { path: "client/src/lib/axios.ts",            role: "client",   icon: "🔗", desc: "Axios instance & interceptors" },
    { path: "client/src/hooks/useAuth.ts",        role: "auth",     icon: "🔐", desc: "Authentication Context Hook" },
    { path: "client/src/store/index.ts",          role: "logic",    icon: "🧠", desc: "Zustand / Redux global store" },
    { path: "client/src/pages/Login.tsx",         role: "ui",       icon: "🔑", desc: "Login & Signup page" },
    { path: "client/src/pages/Dashboard.tsx",     role: "ui",       icon: "📊", desc: "Main Dashboard page" },
    { path: "client/src/components/Layout.tsx",   role: "ui",       icon: "🧭", desc: "Main app layout with sidebar" },
    // Server
    { path: "server/package.json",                role: "deps",     icon: "📦", desc: "Server dependencies" },
    { path: "server/tsconfig.json",               role: "config",   icon: "⚙️", desc: "TypeScript config" },
    { path: "server/src/server.ts",               role: "server",   icon: "🖥️", desc: "Express app initialization" },
    { path: "server/src/middleware/auth.ts",      role: "middleware", icon: "🛡️", desc: "JWT verification & RBAC" },
    { path: "server/src/middleware/error.ts",     role: "middleware", icon: "⚠️", desc: "Global error & crash handler" },
    { path: "server/src/middleware/logger.ts",    role: "middleware", icon: "📝", desc: "Request logging (Winston/Morgan)" },
    { path: "server/src/db/connection.ts",        role: "database", icon: "🔌", desc: "Database connection pool" },
    { path: "server/src/db/models/User.ts",       role: "database", icon: "👤", desc: "User database model" },
    { path: "server/src/routes/v1/index.ts",      role: "api",      icon: "🛣️", desc: "v1 API router hub" },
    { path: "server/src/routes/v1/auth.route.ts", role: "api",      icon: "🔑", desc: "Authentication routes" },
    { path: "server/src/controllers/auth.controller.ts", role: "logic", icon: "🎮", desc: "Auth business logic" },
    { path: "docker-compose.yml",                 role: "config",   icon: "🐳", desc: "Full stack docker-compose" },
    { path: "README.md",                          role: "docs",     icon: "📖", desc: "Full documentation" },
  ],
  api: [
    { path: "package.json",                    role: "deps",       icon: "📦", desc: "Dependencies & scripts" },
    { path: "tsconfig.json",                   role: "config",     icon: "⚙️", desc: "TypeScript config" },
    { path: ".env.example",                    role: "config",     icon: "🔑", desc: "Environment variables" },
    { path: "src/server.ts",                   role: "server",     icon: "🖥️", desc: "Server bootstrap & startup logic" },
    { path: "src/app.ts",                      role: "server",     icon: "⚙️", desc: "Express application setup" },
    { path: "src/config/env.ts",               role: "config",     icon: "🔐", desc: "Validated environment variables" },
    { path: "src/db/init.ts",                  role: "database",   icon: "🗄️", desc: "Database connection & migrations" },
    { path: "src/middleware/auth.middleware.ts", role: "middleware", icon: "🛡️", desc: "JWT & Role-based authentication" },
    { path: "src/middleware/error.middleware.ts", role: "middleware", icon: "⚠️", desc: "Standardized error response handler" },
    { path: "src/middleware/rate-limit.ts",    role: "middleware", icon: "⏱️", desc: "DDoS protection via Rate Limiting" },
    { path: "src/routes/v1/index.ts",          role: "api",         icon: "🛣️", desc: "API v1 router orchestrator" },
    { path: "src/routes/v1/users.route.ts",    role: "api",         icon: "👥", desc: "Users REST endpoints" },
    { path: "src/controllers/user.controller.ts", role: "logic",   icon: "🎮", desc: "User request handling" },
    { path: "src/services/user.service.ts",    role: "service",     icon: "⚙️", desc: "User business logic & DB calls" },
    { path: "src/utils/logger.ts",            role: "logic",       icon: "📝", desc: "Winston structured logging" },
    { path: "src/utils/catchAsync.ts",        role: "logic",       icon: "🎣", desc: "Async error catching wrapper" },
    { path: "src/docs/swagger.ts",            role: "docs",        icon: "📘", desc: "OpenAPI/Swagger specs configuration" },
    { path: "Dockerfile",                     role: "config",      icon: "🐳", desc: "Optimized Dockerfile container" },
    { path: "README.md",                      role: "docs",        icon: "📖", desc: "API documentation" },
  ],
  saas: [
    { path: "package.json",                   role: "deps",       icon: "📦", desc: "Dependencies" },
    { path: "tsconfig.json",                  role: "config",     icon: "⚙️", desc: "TypeScript" },
    { path: "next.config.mjs",                role: "config",     icon: "▲",  desc: "Next.js config" },
    { path: ".env.example",                   role: "config",     icon: "🔑", desc: "Required Env vars setup" },
    { path: "middleware.ts",                  role: "middleware", icon: "🛡️", desc: "Auth, Sub Guard & i18n routing" },
    { path: "src/lib/db.ts",                  role: "database",   icon: "🗄️", desc: "Database + Pooling connection" },
    { path: "src/lib/auth.ts",                role: "auth",       icon: "🔐", desc: "NextAuth with OAuth & Email Magic Links" },
    { path: "src/lib/stripe/client.ts",       role: "billing",    icon: "💳", desc: "Stripe client initialization" },
    { path: "src/lib/stripe/actions.ts",      role: "billing",    icon: "⚙️", desc: "Server actions for billing (checkout, portal)" },
    { path: "src/app/layout.tsx",             role: "ui",         icon: "🎨", desc: "Root layout & generic providers" },
    { path: "src/app/(marketing)/page.tsx",   role: "ui",         icon: "🏠", desc: "Marketing landing page" },
    { path: "src/app/(marketing)/pricing/page.tsx", role: "ui",   icon: "💰", desc: "Pricing tiers page" },
    { path: "src/app/(dashboard)/layout.tsx", role: "ui",         icon: "🧭", desc: "Protected dashboard shell" },
    { path: "src/app/(dashboard)/dashboard/page.tsx", role: "ui", icon: "📊", desc: "User statistics & limits overview" },
    { path: "src/app/(dashboard)/billing/page.tsx", role: "ui",   icon: "🧾", desc: "Subscription & billing management" },
    { path: "src/app/api/webhooks/stripe/route.ts", role: "api",  icon: "💳", desc: "Stripe webhook handler (security verification)" },
    { path: "src/components/billing/PricingCard.tsx", role: "ui", icon: "💎", desc: "Tier pricing card component" },
    { path: "src/components/shared/CheckoutButton.tsx", role: "ui", icon: "🛒", desc: "Secure checkout button" },
    { path: "README.md",                      role: "docs",       icon: "📖", desc: "SaaS setup & Stripe guide" },
  ],
  website: [
    { path: "index.html",      role: "ui",     icon: "🏠", desc: "Home page with semantic HTML5" },
    { path: "about.html",      role: "ui",     icon: "📄", desc: "About Us page" },
    { path: "contact.html",    role: "ui",     icon: "📬", desc: "Contact form page" },
    { path: "css/variables.css", role: "styles", icon: "🎨", desc: "CSS Custom Properties (Design Tokens)" },
    { path: "css/style.css",   role: "styles", icon: "💅", desc: "Main stylesheet & layouts" },
    { path: "css/responsive.css", role: "styles", icon: "📱", desc: "Media queries & mobile adaptations" },
    { path: "js/main.js",      role: "logic",  icon: "⚙️", desc: "Core JavaScript logic & DOM handling" },
    { path: "js/animations.js", role: "logic", icon: "✨", desc: "GSAP or native scroll animations" },
    { path: "js/contact-form.js", role: "logic", icon: "✉️", desc: "Form validation & AJAX submission" },
    { path: "README.md",       role: "docs",   icon: "📖", desc: "Deployment & editing guide" },
  ],
  pwa: [
    { path: "package.json",               role: "deps",    icon: "📦", desc: "Dependencies" },
    { path: "vite.config.ts",             role: "config",  icon: "⚡", desc: "Vite + Vite PWA Plugin config" },
    { path: "public/manifest.json",       role: "pwa",     icon: "📱", desc: "W3C Web App Manifest" },
    { path: "public/sw.js",               role: "pwa",     icon: "⚙️", desc: "Custom Service Worker logic (Cache & Sync)" },
    { path: "src/main.tsx",               role: "ui",      icon: "🏁", desc: "React DOM & SW registration" },
    { path: "src/App.tsx",                role: "ui",      icon: "⚛", desc: "Root component & offline providers" },
    { path: "src/db/indexedDB.ts",        role: "database", icon: "🗄️", desc: "Local database wrapper (IDB)" },
    { path: "src/hooks/useOffline.ts",    role: "pwa",     icon: "📶", desc: "Hook for offline online state tracking" },
    { path: "src/hooks/useInstallPrompt.ts", role: "pwa",  icon: "⬇️", desc: "Hook for custom A2HS prompt" },
    { path: "src/components/OfflineBanner.tsx", role: "ui", icon: "⚠️", desc: "Offline warning UI component" },
    { path: "src/pages/Home.tsx",         role: "ui",      icon: "🏠", desc: "Main application view" },
    { path: "README.md",                  role: "docs",    icon: "📖", desc: "PWA testing & deployment guide" },
  ],
};

/* ── Role Colors for file tree ── */
export const ROLE_COLORS = {
  deps: "#f59e0b",
  config: "#6b7280",
  middleware: "#ef4444",
  database: "#10b981",
  auth: "#8b5cf6",
  types: "#3b82f6",
  validation: "#06b6d4",
  ui: "#ec4899",
  api: "#00d4ff",
  client: "#61dafb",
  server: "#f97316",
  service: "#a78bfa",
  billing: "#fbbf24",
  pwa: "#14b8a6",
  styles: "#f472b6",
  logic: "#fb923c",
  docs: "#94a3b8",
};

/* ── Features List ── */
export const FEATURES_LIST = [
  "Authentication", "RTL Arabic", "Dark Mode", "Rate Limiting",
  "Role-based Auth", "File Upload", "Email System", "Redis Caching",
  "WebSockets", "Swagger Docs", "Unit Tests", "Docker Setup",
  "Stripe Billing", "SEO Metadata", "I18n Translation"
];

/* ── Step icons for timeline ── */
export const STEP_ICONS = {
  info: "ℹ",
  think: "◈",
  build: "⚙",
  warn: "▲",
  done: "✓",
  error: "✕",
};

/* ── Phase display config ── */
export const PHASE_COLORS = {
  idle: "mu",
  generating: "c",
  done: "g",
  stopped: "a",
  error: "r",
};

export const PHASE_LABELS = {
  idle: "جاهز",
  generating: "يولّد...",
  done: "اكتمل ✓",
  stopped: "موقوف",
  error: "خطأ",
};

/* ── Mobile navigation tabs ── */
export const MOBILE_TABS = [
  { id: "config", icon: "⚙", label: "إعداد" },
  { id: "files",  icon: "📂", label: "الملفات" },
  { id: "code",   icon: "💻", label: "الكود" },
  { id: "stats",  icon: "📊", label: "الإحصاء" },
];
