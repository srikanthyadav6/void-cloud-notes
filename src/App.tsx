import { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Bookmark,
  Boxes,
  Brain,
  Braces,
  Check,
  Circle,
  Code2,
  Coffee,
  Database,
  Eye,
  Flame,
  Grid2X2,
  HelpCircle,
  Home,
  Layers,
  Leaf,
  Lightbulb,
  Menu,
  Monitor,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  Sun,
  Target,
  UserRound
} from "lucide-react";

type Page = "dashboard" | "category" | "note" | "recollection" | "insights" | "cheatsheet";
type RecallTab = "Quick Recall" | "Deep Explain" | "Scenario" | "Code Output" | "Compare";
type Tone = "blue" | "green" | "purple" | "amber" | "cyan";

const categories = [
  { name: "Java Core", notes: 42, questions: 120, progress: 75, summary: "Collections, JVM, streams, exceptions", tag: "Interview Favorite", tone: "blue" as Tone, icon: Coffee },
  { name: "Spring Boot", notes: 38, questions: 98, progress: 68, summary: "Beans, transactions, REST, security", tag: "Must Know", tone: "green" as Tone, icon: Leaf },
  { name: "Microservices", notes: 26, questions: 74, progress: 62, summary: "Resilience, messaging, Saga, tracing", tag: "Scenario", tone: "cyan" as Tone, icon: Boxes },
  { name: "SQL", notes: 30, questions: 85, progress: 70, summary: "Joins, indexes, isolation, tuning", tag: "Interview Favorite", tone: "blue" as Tone, icon: Database },
  { name: "DSA", notes: 34, questions: 110, progress: 65, summary: "Arrays, trees, graphs, DP", tag: "Must Know", tone: "purple" as Tone, icon: Code2 },
  { name: "Frontend", notes: 24, questions: 60, progress: 55, summary: "React, browser, a11y, performance", tag: "Tricky", tone: "blue" as Tone, icon: Monitor }
];

const topics = [
  {
    title: "HashMap Internals",
    category: "Java Core",
    area: "Collections",
    tags: ["Interview Favorite"],
    summary: "Understand underlying structure, hashing, collisions, load factor and rehashing.",
    difficulty: "Medium",
    recallCount: 7,
    tone: "blue" as Tone,
    icon: Braces,
    action: "Revise"
  },
  {
    title: "@Transactional",
    category: "Spring Boot",
    area: "Transactions",
    tags: ["Tricky"],
    summary: "Propagation, isolation, rollback rules and common pitfalls.",
    difficulty: "Medium-Hard",
    recallCount: 9,
    tone: "green" as Tone,
    icon: Leaf,
    action: "Revise"
  },
  {
    title: "BFS Grid",
    category: "DSA",
    area: "Graphs",
    tags: ["Must Know"],
    summary: "Solve shortest path in grid using BFS with examples and variations.",
    difficulty: "Medium",
    recallCount: 6,
    tone: "purple" as Tone,
    icon: Boxes,
    action: "Practice"
  },
  {
    title: "equals() and hashCode()",
    category: "Java Core",
    area: "OOP",
    tags: ["Scenario"],
    summary: "Objects in hash collections must keep equality and hash contracts consistent.",
    difficulty: "Easy-Medium",
    recallCount: 5,
    tone: "amber" as Tone,
    icon: Braces,
    action: "Revise"
  }
];

const recallQuestions: Record<RecallTab, { question: string; hint: string; answer: string }> = {
  "Quick Recall": {
    question: "What happens when two objects have same hashCode in HashMap?",
    hint: "Think bucket, collision handling, equals(), and Java 8 treeification.",
    answer: "Both entries map to the same bucket. HashMap then compares keys with equals(), stores distinct keys in that bucket, and may treeify long chains after thresholds are reached."
  },
  "Deep Explain": {
    question: "Explain put() and get() in HashMap without looking at notes.",
    hint: "Move from hashCode to bucket index to equals comparison.",
    answer: "put() computes a spread hash, finds a bucket, updates an equal key or appends a node, and may resize. get() repeats the hash/bucket lookup and compares keys."
  },
  Scenario: {
    question: "A HashMap lookup fails after inserting a custom object as key. What could be wrong?",
    hint: "Mutable key fields and equality contract.",
    answer: "The key may have changed after insertion, or equals/hashCode may be inconsistent, so lookup goes to the wrong bucket or cannot match the key."
  },
  "Code Output": {
    question: "What happens if two equal objects return different hash codes?",
    hint: "Hash collections choose bucket before equals().",
    answer: "They can land in different buckets, so HashMap/HashSet may fail to find duplicates or existing keys correctly."
  },
  Compare: {
    question: "HashMap vs ConcurrentHashMap: how would you answer in an interview?",
    hint: "Mention thread safety, locking/CAS, null handling, and use cases.",
    answer: "HashMap is not thread-safe. ConcurrentHashMap supports concurrent access with internal synchronization/CAS strategies and does not allow null keys or values."
  }
};

const weakAreas = [
  { name: "Spring AOP", value: 40 },
  { name: "SQL Joins", value: 45 },
  { name: "DP - Knapsack", value: 50 },
  { name: "React Hooks", value: 55 }
];

const bookmarks = [
  { name: "System Design - URL Shortener", tag: "Scenario" },
  { name: "TCP vs UDP", tag: "Interview Favorite" },
  { name: "@Transactional Propagation", tag: "Tricky" }
];

export function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [search, setSearch] = useState("");
  const [recallTab, setRecallTab] = useState<RecallTab>("Quick Recall");
  const [showAnswer, setShowAnswer] = useState(false);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return topics.filter((topic) => [topic.title, topic.category, topic.area, topic.summary, ...topic.tags].join(" ").toLowerCase().includes(query));
  }, [search]);

  const go = (nextPage: Page) => {
    setPage(nextPage);
    setShowAnswer(false);
  };

  return (
    <div className="shell">
      <header className="topbar">
        <button className="brand" onClick={() => go("dashboard")}>
          <Layers size={34} />
          <span>Recall<strong>Stack</strong></span>
        </button>
        <button className="icon-button menu-button" aria-label="Menu">
          <Menu size={20} />
        </button>
        <div className="search">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search topics, questions, notes..." />
          <kbd>⌘ K</kbd>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Theme">
            <Sun size={22} />
          </button>
          <div className="user-pill">
            <span>AS</span>
            <strong>Arjun S.</strong>
          </div>
        </div>
      </header>

      <aside className="sidebar">
        <nav>
          <NavButton active={page === "dashboard"} icon={<Home size={21} />} label="Dashboard" onClick={() => go("dashboard")} />
          <NavButton active={page === "category"} icon={<Coffee size={21} />} label="Java" onClick={() => go("category")} />
          <NavButton active={page === "category"} icon={<Leaf size={21} />} label="Spring Boot" onClick={() => go("category")} />
          <NavButton active={page === "category"} icon={<Boxes size={21} />} label="Microservices" onClick={() => go("category")} />
          <NavButton active={page === "category"} icon={<Database size={21} />} label="SQL" onClick={() => go("category")} />
          <NavButton active={page === "category"} icon={<Code2 size={21} />} label="DSA" onClick={() => go("category")} />
          <NavButton active={page === "category"} icon={<Monitor size={21} />} label="Frontend" onClick={() => go("category")} />
          <NavButton active={page === "insights"} icon={<BarChart3 size={21} />} label="Interview Insights" onClick={() => go("insights")} />
          <NavButton active={page === "recollection"} icon={<Brain size={21} />} label="Recollection" onClick={() => go("recollection")} />
          <NavButton active={page === "cheatsheet"} icon={<BookOpen size={21} />} label="Cheat Sheets" onClick={() => go("cheatsheet")} />
        </nav>

        <section className="progress-card">
          <div className="progress-card-head">
            <span>Overall Progress</span>
            <button>See all</button>
          </div>
          <div className="progress-card-body">
            <div className="progress-ring">68%</div>
            <div>
              <strong>Good job!</strong>
              <p>You're on track. Keep going!</p>
            </div>
          </div>
          <Progress value={68} />
          <small>136 / 200 topics mastered</small>
        </section>
      </aside>

      <main className="content">
        {searchResults.length > 0 && <SearchResults results={searchResults} openTopic={() => go("note")} startRecall={() => go("recollection")} />}
        {searchResults.length === 0 && page === "dashboard" && <Dashboard go={go} />}
        {searchResults.length === 0 && page === "category" && <CategoryPage go={go} />}
        {searchResults.length === 0 && page === "note" && <NoteDetail go={go} />}
        {searchResults.length === 0 && page === "recollection" && (
          <RecollectionPage
            activeQuestion={recallQuestions[recallTab]}
            recallTab={recallTab}
            setRecallTab={setRecallTab}
            showAnswer={showAnswer}
            setShowAnswer={setShowAnswer}
          />
        )}
        {searchResults.length === 0 && page === "insights" && <InsightsPage go={go} />}
        {searchResults.length === 0 && page === "cheatsheet" && <CheatSheetPage />}
      </main>

      <RightPanel />
    </div>
  );
}

function RightPanel() {
  return (
    <aside className="right-panel">
      <section className="panel-card recall-panel-card">
        <div className="panel-title">
          <h2><HelpCircle size={20} /> Recall Box</h2>
          <button><RefreshCw size={16} /> Refresh</button>
        </div>
        <span className="tag blue">Quick Recall</span>
        <p className="recall-question">What happens when two objects have same hashCode in HashMap?</p>
        <div className="button-row">
          <button><Lightbulb size={16} /> Show Hint</button>
          <button className="primary"><Eye size={16} /> Show Answer</button>
        </div>
        <div className="tag-row">
          <span className="tag blue">Java Core</span>
          <span className="tag green">Interview Favorite</span>
          <Bookmark size={18} className="bookmark-icon" />
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-title">
          <h2><BarChart3 size={20} /> Weak Areas</h2>
          <button>View all</button>
        </div>
        <div className="weak-list">
          {weakAreas.map((item) => (
            <div className="weak-row" key={item.name}>
              <span>{item.name}</span>
              <Progress value={item.value} danger />
              <strong>{item.value}%</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-title">
          <h2><Bookmark size={20} /> Bookmarks</h2>
          <button>View all</button>
        </div>
        <div className="bookmark-list">
          {bookmarks.map((bookmark) => (
            <div className="bookmark-row" key={bookmark.name}>
              <span>{bookmark.name}</span>
              <span className={bookmark.tag === "Tricky" ? "tag amber" : "tag green"}>{bookmark.tag}</span>
              <Bookmark size={16} />
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card streak-card">
        <h2><Flame size={20} /> Current Streak</h2>
        <div className="streak-row">
          <strong>12</strong>
          <span>days</span>
        </div>
        <div className="week-dots">
          {["M", "T", "W", "T", "F", "S"].map((day) => (
            <span key={day}><Check size={12} /></span>
          ))}
          <span className="empty"><Circle size={12} /></span>
        </div>
        <p>Longest streak: 21 days 🔥</p>
      </section>
    </aside>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button className={active ? "nav-button active" : "nav-button"} onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}

function Dashboard({ go }: { go: (page: Page) => void }) {
  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero-copy">
          <h1>Prepare <span>smarter.</span> Recall <span>faster.</span> Explain <span>better.</span></h1>
          <p>Your all-in-one Java Full Stack interview preparation hub.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => go("recollection")}><Brain size={18} /> Start Recollection</button>
            <button onClick={() => go("category")}><Grid2X2 size={18} /> Browse Topics</button>
            <button onClick={() => go("insights")}><BarChart3 size={18} /> Interview Insights</button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <Brain size={112} />
          <Layers size={100} />
        </div>
      </section>

      <SectionHeader title="Today's Focus" action="Edit Focus" />
      <div className="focus-grid">
        {topics.slice(0, 3).map((topic) => (
          <TopicCard key={topic.title} topic={topic} open={() => go("note")} recall={() => go("recollection")} />
        ))}
      </div>

      <SectionHeader title="Categories" action="View all topics" />
      <div className="category-grid">
        {categories.map((category) => (
          <button className={`category-card ${category.tone}`} key={category.name} onClick={() => go("category")}>
            <category.icon size={44} />
            <span>{category.name}</span>
            <em>{category.tag}</em>
            <small>{category.notes} Notes · {category.questions} Qs</small>
            <div className="category-progress">
              <Progress value={category.progress} />
              <strong>{category.progress}%</strong>
            </div>
          </button>
        ))}
      </div>

      <div className="daily-goal">
        <span>⚡ Daily Goal: Revise 5 topics</span>
        <strong>3 / 5 completed</strong>
        <Progress value={60} />
      </div>
    </div>
  );
}

function CategoryPage({ go }: { go: (page: Page) => void }) {
  return (
    <div className="page-stack">
      <PageHeader title="Java Core" subtitle="Collections, Streams, JVM, Exceptions, Multithreading" />
      <div className="filters">
        {["All", "Interview Favorite", "Tricky", "Weak", "Code"].map((filter) => (
          <button className={filter === "All" ? "active" : ""} key={filter}>{filter}</button>
        ))}
      </div>
      <div className="topic-list">
        {topics.map((topic) => (
          <TopicCard key={topic.title} topic={topic} open={() => go("note")} recall={() => go("recollection")} wide />
        ))}
      </div>
    </div>
  );
}

function NoteDetail({ go }: { go: (page: Page) => void }) {
  return (
    <article className="note-detail">
      <PageHeader title="HashMap Internals" subtitle="Java Core / Collections" />
      <div className="tag-row">
        {["Interview Favorite", "Tricky", "Must Know"].map((tag) => <span className="tag" key={tag}>{tag}</span>)}
        <span className="difficulty">Difficulty: Medium</span>
      </div>

      <NoteSection title="Quick Definition">
        HashMap stores key-value pairs using hashing and gives average O(1) lookup when hashing and equality are implemented correctly.
      </NoteSection>
      <NoteSection title="Mental Model">
        <code>Key -&gt; hashCode() -&gt; bucket index -&gt; equals() comparison -&gt; return value</code>
      </NoteSection>
      <NoteSection title="Interview Answer">
        In an interview, explain HashMap as a hash-table based Map. It calculates a hash from the key, finds a bucket, handles collisions, compares keys with equals(), and resizes when the load factor threshold is crossed.
      </NoteSection>
      <NoteSection title="Code Example">
        <pre>{`Map<String, Integer> map = new HashMap<>();
map.put("Java", 1);
Integer score = map.get("Java");`}</pre>
      </NoteSection>
      <button className="primary" onClick={() => go("recollection")}>Start Recall</button>
    </article>
  );
}

function RecollectionPage({
  activeQuestion,
  recallTab,
  setRecallTab,
  showAnswer,
  setShowAnswer
}: {
  activeQuestion: { question: string; hint: string; answer: string };
  recallTab: RecallTab;
  setRecallTab: (tab: RecallTab) => void;
  showAnswer: boolean;
  setShowAnswer: (value: boolean) => void;
}) {
  return (
    <div className="page-stack">
      <PageHeader title="Recollection Mode" subtitle="Answer first. Then inspect the explanation." />
      <div className="filters">
        {(Object.keys(recallQuestions) as RecallTab[]).map((tab) => (
          <button className={tab === recallTab ? "active" : ""} key={tab} onClick={() => { setRecallTab(tab); setShowAnswer(false); }}>{tab}</button>
        ))}
      </div>
      <section className="recall-card-large">
        <p className="eyebrow">Question 4 of 20</p>
        <h2>{activeQuestion.question}</h2>
        <div className="button-row centered">
          <button><Lightbulb size={16} /> Show Hint</button>
          <button className="primary" onClick={() => setShowAnswer(!showAnswer)}><Eye size={16} /> {showAnswer ? "Hide Answer" : "Show Answer"}</button>
        </div>
        <div className="hint"><strong>Hint</strong><p>{activeQuestion.hint}</p></div>
        {showAnswer && <div className="answer"><strong>Answer</strong><p>{activeQuestion.answer}</p></div>}
        <div className="button-row centered">
          <button className="success">I knew this</button>
          <button className="warning">Partially knew</button>
          <button className="danger">Weak</button>
        </div>
      </section>
    </div>
  );
}

function InsightsPage({ go }: { go: (page: Page) => void }) {
  return (
    <div className="page-stack">
      <PageHeader title="Interview Insights" subtitle="What interviewers are really checking." />
      <div className="insight-list">
        <InsightCard title="Java Developer - 5 Years Experience" text="They expect practical tradeoffs, not just definitions. You need complexity, contracts, concurrency, and production failure awareness." open={() => go("note")} />
        <InsightCard title="Spring Boot Backend Round" text="They check REST design, transaction behavior, exception handling, security basics, logging, and debugging production issues." open={() => go("category")} />
      </div>
    </div>
  );
}

function CheatSheetPage() {
  return (
    <div className="page-stack">
      <PageHeader title="Java Cheat Sheet" subtitle="Dense last-minute revision." />
      <section className="cheat-sheet">
        <h2>Collections</h2>
        <ul>
          <li><strong>HashMap:</strong> key-value, hashing, collision, equals/hashCode, resizing.</li>
          <li><strong>ArrayList:</strong> dynamic array, fast random read, slower middle insert/delete.</li>
          <li><strong>LinkedList:</strong> node-based, rarely better in real production code.</li>
        </ul>
        <h2>Spring Boot</h2>
        <ul>
          <li><strong>DI:</strong> container creates and injects dependencies.</li>
          <li><strong>@Transactional:</strong> proxy-based transaction boundary.</li>
          <li><strong>ControllerAdvice:</strong> central exception handling.</li>
        </ul>
      </section>
    </div>
  );
}

function SearchResults({ results, openTopic, startRecall }: { results: typeof topics; openTopic: () => void; startRecall: () => void }) {
  return (
    <div className="page-stack">
      <PageHeader title="Search Results" subtitle={`${results.length} matching topic${results.length === 1 ? "" : "s"}`} />
      <div className="topic-list">
        {results.map((topic) => <TopicCard key={topic.title} topic={topic} open={openTopic} recall={startRecall} wide />)}
      </div>
    </div>
  );
}

function TopicCard({ topic, open, recall, wide = false }: { topic: (typeof topics)[number]; open: () => void; recall: () => void; wide?: boolean }) {
  return (
    <article className={wide ? `topic-card wide ${topic.tone}` : `topic-card ${topic.tone}`}>
      <div className="topic-head">
        <div className="topic-icon"><topic.icon size={24} /></div>
        <div>
          <h3>{topic.title}</h3>
          {wide && <p className="muted">{topic.category} · {topic.area}</p>}
        </div>
      </div>
      <div className="tag-row">
        <span className={`tag ${topic.tone}`}>{topic.category}</span>
        {topic.tags.map((tag) => <span className={tag === "Tricky" ? "tag amber" : "tag green"} key={tag}><Star size={12} /> {tag}</span>)}
      </div>
      <p>{topic.summary}</p>
      {wide && <div className="card-meta"><span>Difficulty: {topic.difficulty}</span><span>Recall: {topic.recallCount} questions</span></div>}
      <div className="topic-actions">
        <button onClick={recall}>{topic.action === "Practice" ? <Play size={16} /> : <RefreshCw size={16} />} {topic.action}</button>
        <button className="bookmark-button" onClick={open} aria-label="Open note"><Bookmark size={18} /></button>
      </div>
    </article>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  );
}

function SectionHeader({ title, action }: { title: string; action: string }) {
  return (
    <div className="section-header">
      <h2><Target size={20} /> {title}</h2>
      <button>{action}</button>
    </div>
  );
}

function NoteSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="note-section">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function Progress({ value, danger = false }: { value: number; danger?: boolean }) {
  return (
    <div className={danger ? "progress danger-progress" : "progress"} aria-label={`${value}%`}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function InsightCard({ title, text, open }: { title: string; text: string; open: () => void }) {
  return (
    <article className="insight-card">
      <ShieldAlert size={22} />
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
        <button onClick={open}>Open</button>
      </div>
    </article>
  );
}
