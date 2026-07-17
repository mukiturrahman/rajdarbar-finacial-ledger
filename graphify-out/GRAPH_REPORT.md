# Graph Report - .  (2026-07-17)

## Corpus Check
- Corpus is ~30,690 words - fits in a single context window. You may not need a graph.

## Summary
- 437 nodes · 863 edges · 23 communities (16 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard and Events|Dashboard and Events]]
- [[_COMMUNITY_Application Shell and UI|Application Shell and UI]]
- [[_COMMUNITY_Authentication and Editing|Authentication and Editing]]
- [[_COMMUNITY_Caveman Agent Skills|Caveman Agent Skills]]
- [[_COMMUNITY_Design System Generator|Design System Generator]]
- [[_COMMUNITY_Server Actions and Receipts|Server Actions and Receipts]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Compression Validation|Compression Validation]]
- [[_COMMUNITY_Compression CLI Pipeline|Compression CLI Pipeline]]
- [[_COMMUNITY_Design Search Core|Design Search Core]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Forms and UI Components|Forms and UI Components]]
- [[_COMMUNITY_Database Types|Database Types]]
- [[_COMMUNITY_Project and UX Docs|Project and UX Docs]]
- [[_COMMUNITY_Token Usage Tracking|Token Usage Tracking]]
- [[_COMMUNITY_Request Proxy|Request Proxy]]
- [[_COMMUNITY_Design Search Output|Design Search Output]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_Next.js Configuration|Next.js Configuration]]
- [[_COMMUNITY_PostCSS Configuration|PostCSS Configuration]]
- [[_COMMUNITY_Design Tool Initialization|Design Tool Initialization]]
- [[_COMMUNITY_UX Delivery Standards|UX Delivery Standards]]

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 33 edges
2. `getSupabaseServer()` - 28 edges
3. `EventClient` - 21 edges
4. `formatTaka()` - 20 edges
5. `useToast()` - 17 edges
6. `Transaction` - 17 edges
7. `compilerOptions` - 16 edges
8. `validate()` - 14 edges
9. `DesignSystemGenerator` - 11 edges
10. `compress_file()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `SettingsPage()` --calls--> `getSupabaseServer()`  [EXTRACTED]
  app/(dashboard)/settings/page.tsx → lib/supabase/server.ts
- `TransactionsPage()` --calls--> `getSupabaseServer()`  [EXTRACTED]
  app/(dashboard)/transactions/page.tsx → lib/supabase/server.ts
- `NewEventPage()` --calls--> `useLanguage()`  [EXTRACTED]
  app/(dashboard)/events/new/page.tsx → components/LanguageProvider.tsx
- `EventsPage()` --calls--> `getSupabaseServer()`  [EXTRACTED]
  app/(dashboard)/events/page.tsx → lib/supabase/server.ts
- `DashboardPage()` --calls--> `getSupabaseServer()`  [EXTRACTED]
  app/(dashboard)/page.tsx → lib/supabase/server.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cavecrew Delegation Presets** — cavecrew_skill_cavecrew_investigator, cavecrew_skill_cavecrew_builder, cavecrew_skill_cavecrew_reviewer [EXTRACTED 1.00]
- **Caveman Toolkit Skills** — caveman_skill_caveman, caveman_commit_skill_caveman_commit, caveman_compress_skill_caveman_compress, caveman_review_skill_caveman_review, caveman_help_skill_caveman_help, caveman_stats_skill_caveman_stats [EXTRACTED 1.00]
- **UI UX Delivery Workflow** — ui_ux_pro_max_skill_design_system_generation, ui_ux_pro_max_skill_domain_search, ui_ux_pro_max_skill_stack_guidelines, ui_ux_pro_max_skill_pre_delivery_checklist [EXTRACTED 1.00]

## Communities (23 total, 7 thin omitted)

### Community 0 - "Dashboard and Events"
Cohesion: 0.07
Nodes (51): ActiveEventsPanel(), KpiGrid(), DashboardPage(), RecentTransactions(), UpcomingEventsTracker(), Props, EventCard(), Props (+43 more)

### Community 1 - "Application Shell and UI"
Cohesion: 0.08
Nodes (27): metadata, poppins, viewport, ErrorBoundary, LanguageContext, LanguageContextType, LanguageProvider(), useLanguage() (+19 more)

### Community 2 - "Authentication and Editing"
Cohesion: 0.10
Nodes (22): LoginForm(), PendingScreen(), SignupForm(), ProfileContext, useProfile(), EditEventModal(), getInitialForm(), EventsView() (+14 more)

### Community 3 - "Caveman Agent Skills"
Cohesion: 0.07
Nodes (34): Cavecrew, Compressed Subagent Delegation, Locate Fix Verify Chain, Cavecrew Auto-Clarity, Cavecrew Decision Guide, Cavecrew Builder, Cavecrew Investigator, Cavecrew Reviewer (+26 more)

### Community 4 - "Design System Generator"
Cohesion: 0.09
Nodes (25): DesignSystemGenerator, _detect_page_type(), format_ascii_box(), format_markdown(), format_master_md(), format_page_override_md(), generate_design_system(), _generate_intelligent_overrides() (+17 more)

### Community 5 - "Server Actions and Receipts"
Cohesion: 0.13
Nodes (22): createReceiptAndEvent(), EventFormSchema, getBookingSettings(), getEventTypes(), deleteReceiptAction(), saveReceiptAction(), updateReceiptStatusAction(), logReceiptExpense() (+14 more)

### Community 6 - "Project Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, lucide-react, next, react, react-dom, @supabase/ssr, @supabase/supabase-js, zod (+19 more)

### Community 7 - "Compression Validation"
Cohesion: 0.16
Nodes (22): Path, Path, benchmark_pair(), count_tokens(), main(), print_table(), count_bullets(), extract_code_blocks() (+14 more)

### Community 8 - "Compression CLI Pipeline"
Cohesion: 0.14
Nodes (22): Path, Path, main(), print_usage(), build_compress_prompt(), build_fix_prompt(), call_claude(), compress_file() (+14 more)

### Community 9 - "Design Search Core"
Cohesion: 0.15
Nodes (15): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+7 more)

### Community 10 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 11 - "Forms and UI Components"
Cohesion: 0.33
Nodes (8): Button, ButtonProps, Card(), CardContent(), CardHeader(), CardTitle(), Input, InputProps

### Community 12 - "Database Types"
Cohesion: 0.18
Nodes (10): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+2 more)

### Community 13 - "Project and UX Docs"
Cohesion: 0.22
Nodes (10): create-next-app, Next.js Development Server, Next.js, Rajdarbar Ledger Next.js Project, Vercel Deployment, Design System Generation, Domain-Specific Design Search, Master and Page Override Pattern (+2 more)

### Community 14 - "Token Usage Tracking"
Cohesion: 0.40
Nodes (5): Caveman Stats, Session Log Token Measurement, Caveman Stats Skill, caveman-stats.js Hook, caveman-mode-tracker.js Hook

## Knowledge Gaps
- **100 isolated node(s):** `EventFormSchema`, `poppins`, `viewport`, `metadata`, `LanguageContextType` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseServer()` connect `Server Actions and Receipts` to `Dashboard and Events`, `Application Shell and UI`, `Authentication and Editing`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `useLanguage()` connect `Application Shell and UI` to `Dashboard and Events`, `Authentication and Editing`, `Forms and UI Components`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `getSupabaseClient()` connect `Authentication and Editing` to `Application Shell and UI`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `BM25 ranking algorithm for text search`, `Lowercase, split, remove punctuation, filter short words`, `Build BM25 index from documents` to the rest of the system?**
  _138 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard and Events` be split into smaller, more focused modules?**
  _Cohesion score 0.06954954954954955 - nodes in this community are weakly interconnected._
- **Should `Application Shell and UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07729468599033816 - nodes in this community are weakly interconnected._
- **Should `Authentication and Editing` be split into smaller, more focused modules?**
  _Cohesion score 0.0953058321479374 - nodes in this community are weakly interconnected._