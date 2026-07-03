import { useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  Code2,
  FileText,
  Gauge,
  Layers,
  Lightbulb,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TerminalSquare
} from "lucide-react";

type Page = "dashboard" | "category" | "note" | "recollection" | "insights" | "cheatsheet";
type RecallTab = "Quick Recall" | "Deep Explain" | "Scenario" | "Code Output" | "Compare";

const categories = [
  { name: "Java Core", notes: 42, questions: 120, progress: 68, summary: "Collections, JVM, streams, exceptions, threads" },
  { name: "Spring Boot", notes: 35, questions: 90, progress: 54, summary: "Beans, transactions, REST, security, production issues" },
  { name: "Microservices", notes: 28, questions: 70, progress: 46, summary: "Resilience, messaging, Saga, API gateway, tracing" },
  { name: "SQL", notes: 25, questions: 62, progress: 61, summary: "Joins, indexes, isolation, query tuning" },
  { name: "DSA", notes: 40, questions: 140, progress: 39, summary: "Patterns, arrays, trees, graphs, DP" },
  { name: "Frontend", notes: 30, questions: 84, progress: 57, summary: "React, browser, accessibility, performance" }
];

const topics = [
  {
    title: "HashMap Internals",
    category: "Java Core",
    area: "Collections",
    tags: ["Interview Favorite", "Tricky", "Must Know"],
    summary: "HashMap uses hashing to store and retrieve key-value pairs, with collision handling and resizing details that matter in interviews.",
    difficulty: "Medium",
    recallCount: 7,
    weak: true
  },
  {
    title: "equals() and hashCode()",
    category: "Java Core",
    area: "OOP",
    tags: ["Must Know", "Code", "Scenario"],
    summary: "Objects used in hash-based collections must keep equality and hash contracts consistent.",
    difficulty: "Easy-Medium",
    recallCount: 5,
    weak: false
  },
  {
    title: "@Transactional Boundaries",
    category: "Spring Boot",
    area: "Transactions",
    tags: ["Interview Favorite", "Scenario", "Weak Area"],
    summary: "Transaction behavior depends on proxies, propagation, checked exceptions, and where the method is called from.",
    difficulty: "Medium-Hard",
    recallCount: 9,
    weak: true
  },
  {
    title: "BFS on Grid",
    category: "DSA",
    area: "Graphs",
    tags: ["Code", "Must Know"],
    summary: "Use a queue, visited matrix, direction arrays, and level-order traversal for shortest path style problems.",
    difficulty: "Medium",
    recallCount: 6,
    weak: false
  }
];

const recallQuestions: Record<RecallTab, { question: string; hint: string; answer: string }> = {
  "Quick Recall": {
    question: "What happens when two keys produce the same HashMap bucket?",
    hint: "Think collision handling, equals(), and Java 8 treeification.",
    answer: "HashMap stores colliding entries in the same bucket, compares keys using equals(), and may treeify a long bucket after thresholds are met."
  },
  "Deep Explain": {
    question: "Explain put() and get() in HashMap without looking at notes.",
    hint: "Move from hashCode to bucket index to equals comparison.",
    answer: "put() computes a spread hash, finds a bucket, updates an equal key or appends a node, and may resize. get() repeats the hash/bucket lookup and compares keys."
  },
  Scenario: {
    question: "A HashMap lookup fails after inserting a custom object as key. What could be wrong?",
    hint: "Mutable key fields and equality contract.",
    answer: "The key may have changed after insertion, or equals/hashCode may be inconsistent, so the lookup goes to the wrong bucket or cannot match the key."
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

const weakAreas = ["@Transactional rollback rules", "HashMap resizing", "SQL isolation levels", "Graph BFS edge cases"];
const bookmarks = ["HashMap Internals", "Spring Boot Backend Round", "Java Cheat Sheet"];

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

  const activeQuestion = recallQuestions[recallTab];

  const go = (nextPage: Page) => {
    setPage(nextPage);
    setShowAnswer(false);
  };

  return (
    <div className="shell">
      <header className="topbar">
        <button className="brand" onClick={() => go("dashboard")}>
          <Brain size={22} />
          <span>RecallStack</span>
        </button>
        <div className="search">
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search topics, traps, questions..." />
        </div>
        <div className="topbar-meta">Dark</div>
      </header>

      <aside className="sidebar">
        <NavButton active={page === "dashboard"} icon={<Gauge size={17} />} label="Dashboard" onClick={() => go("dashboard")} />
        <NavButton active={page === "category"} icon={<Layers size={17} />} label="Java Core" onClick={() => go("category")} />
        <NavButton active={page === "category"} icon={<Sparkles size={17} />} label="Spring Boot" onClick={() => go("category")} />
        <NavButton active={page === "category"} icon={<TerminalSquare size={17} />} label="Microservices" onClick={() => go("category")} />
        <NavButton active={page === "category"} icon={<FileText size={17} />} label="SQL" onClick={() => go("category")} />
        <NavButton active={page === "category"} icon={<Code2 size={17} />} label="DSA" onClick={() => go("category")} />
        <NavButton active={page === "recollection"} icon={<Target size={17} />} label="Recollection" onClick={() => go("recollection")} />
        <NavButton active={page === "insights"} icon={<Lightbulb size={17} />} label="Interview Insights" onClick={() => go("insights")} />
        <NavButton active={page === "cheatsheet"} icon={<BookOpen size={17} />} label="Cheat Sheets" onClick={() => go("cheatsheet")} />
      </aside>

      <main className="content">
        {searchResults.length > 0 && <SearchResults results={searchResults} openTopic={() => go("note")} startRecall={() => go("recollection")} />}
        {searchResults.length === 0 && page === "dashboard" && <Dashboard go={go} />}
        {searchResults.length === 0 && page === "category" && <CategoryPage go={go} />}
        {searchResults.length === 0 && page === "note" && <NoteDetail go={go} />}
        {searchResults.length === 0 && page === "recollection" && (
          <RecollectionPage
            activeQuestion={activeQuestion}
            recallTab={recallTab}
            setRecallTab={setRecallTab}
            showAnswer={showAnswer}
            setShowAnswer={setShowAnswer}
          />
        )}
        {searchResults.length === 0 && page === "insights" && <InsightsPage go={go} />}
        {searchResults.length === 0 && page === "cheatsheet" && <CheatSheetPage />}
      </main>

      <aside className="right-panel">
        <section className="panel-card">
          <h2>Recall Box</h2>
          <p>Can I explain this without looking?</p>
          <div className="button-row">
            <button className="success">Know</button>
            <button className="danger">Weak</button>
          </div>
        </section>
        <section className="panel-card">
          <h2>Weak Areas</h2>
          <ul className="compact-list">
            {weakAreas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="panel-card">
          <h2>Bookmarks</h2>
          <ul className="compact-list">
            {bookmarks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
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
        <div>
          <p className="eyebrow">Read less. Recall more. Explain better.</p>
          <h1>Prepare smarter. Recall faster. Explain better.</h1>
          <p>Java Full Stack interview prep notes built around active recall, interview traps, and polished explanations.</p>
        </div>
        <div className="hero-actions">
          <button className="primary" onClick={() => go("recollection")}>Start Recollection</button>
          <button onClick={() => go("category")}>Browse Topics</button>
          <button onClick={() => go("insights")}>Interview Insights</button>
        </div>
      </section>

      <SectionHeader title="Today's Focus" subtitle="Three prompts worth revising before anything else." />
      <div className="card-grid three">
        {topics.slice(0, 3).map((topic) => (
          <TopicCard key={topic.title} topic={topic} open={() => go("note")} recall={() => go("recollection")} />
        ))}
      </div>

      <SectionHeader title="Categories" subtitle="Pick a track and study by explanation quality, not page count." />
      <div className="card-grid">
        {categories.map((category) => (
          <button className="category-card" key={category.name} onClick={() => go("category")}>
            <span>{category.name}</span>
            <small>{category.summary}</small>
            <strong>{category.notes} notes · {category.questions} Qs</strong>
            <Progress value={category.progress} />
          </button>
        ))}
      </div>

      <div className="split-grid">
        <InfoBlock title="Weak Areas" items={weakAreas} tone="warning" />
        <InfoBlock title="Recently Revised" items={["equals() and hashCode()", "BFS Grid", "REST idempotency"]} />
        <InfoBlock title="Insight of the Day" items={["Definitions are not enough. Interviewers check tradeoffs, failure modes, and scenario handling."]} tone="accent" />
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
      <NoteSection title="Deep Explanation">
        HashMap performance depends on hash distribution, collision count, resizing cost, and key immutability. Since Java 8, very long collision chains can become balanced trees under specific conditions.
      </NoteSection>
      <NoteSection title="Code Example">
        <pre>{`Map<String, Integer> map = new HashMap<>();
map.put("Java", 1);
Integer score = map.get("Java");`}</pre>
      </NoteSection>
      <NoteSection title="Common Follow-ups">
        <ul>
          <li>What happens during collision?</li>
          <li>Why override equals and hashCode together?</li>
          <li>What changed after Java 8?</li>
        </ul>
      </NoteSection>
      <NoteSection title="Common Mistakes">
        <ul>
          <li>Do not say HashMap is always O(1).</li>
          <li>Do not ignore the equals/hashCode contract.</li>
          <li>Do not use mutable objects as keys.</li>
        </ul>
      </NoteSection>
      <NoteSection title="Recollection Checklist">
        <div className="checklist">
          {["Can I explain put()?", "Can I explain get()?", "Can I explain collision?", "Can I compare HashMap and ConcurrentHashMap?"].map((item) => (
            <label key={item}><input type="checkbox" /> {item}</label>
          ))}
        </div>
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
          <button>Show Hint</button>
          <button className="primary" onClick={() => setShowAnswer(!showAnswer)}>{showAnswer ? "Hide Answer" : "Show Answer"}</button>
        </div>
        <div className="hint">
          <strong>Hint</strong>
          <p>{activeQuestion.hint}</p>
        </div>
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
        <section className="insight-detail">
          <h2>What strong answers sound like</h2>
          <p><strong>Weak:</strong> HashMap is key-value and has O(1) lookup.</p>
          <p><strong>Strong:</strong> HashMap usually gives average O(1) lookup using hashing, but collision handling, equals/hashCode, resizing, and Java 8 treeification matter in deeper interviews.</p>
        </section>
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
        <h2>Java 8</h2>
        <ul>
          <li><strong>Stream:</strong> declarative data processing pipeline.</li>
          <li><strong>map:</strong> transform each element.</li>
          <li><strong>filter:</strong> select matching elements.</li>
          <li><strong>reduce:</strong> combine values into one result.</li>
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
    <article className={wide ? "topic-card wide" : "topic-card"}>
      <div>
        <h3>{topic.title}</h3>
        <p className="muted">{topic.category} · {topic.area}</p>
      </div>
      <div className="tag-row">
        {topic.tags.map((tag) => <span className={tag === "Weak Area" ? "tag weak" : "tag"} key={tag}>{tag}</span>)}
      </div>
      <p>{topic.summary}</p>
      <div className="card-meta">
        <span>Difficulty: {topic.difficulty}</span>
        <span>Recall: {topic.recallCount} questions</span>
      </div>
      <div className="button-row">
        <button onClick={open}>Open Note</button>
        <button className="primary" onClick={recall}>Start Recall</button>
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

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <p>{subtitle}</p>
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

function Progress({ value }: { value: number }) {
  return (
    <div className="progress" aria-label={`${value}% revised`}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function InfoBlock({ title, items, tone = "default" }: { title: string; items: string[]; tone?: "default" | "warning" | "accent" }) {
  return (
    <section className={`info-block ${tone}`}>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

function InsightCard({ title, text, open }: { title: string; text: string; open: () => void }) {
  return (
    <article className="insight-card">
      <ShieldAlert size={20} />
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
        <button onClick={open}>Open</button>
      </div>
    </article>
  );
}
