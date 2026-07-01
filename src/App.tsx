import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import MiniSearch from "minisearch";
import {
  Archive,
  Bold,
  CheckCircle2,
  Download,
  FilePlus2,
  FileText,
  FolderPlus,
  Hash,
  Italic,
  List,
  Plus,
  RotateCw,
  Search,
  Star,
  Trash2,
  Wifi,
  WifiOff
} from "lucide-react";
import { createId, db, ensureSeedData, nowIso, queueSync, starterContent } from "./db";
import type { Folder, InterviewPrepItem, Note, NoteTag, Tag } from "./types";

type View = "notes" | "prep";
type Filter = { folderId?: string; tagId?: string };

const tagColors = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c", "#0891b2"];

export function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [noteTags, setNoteTags] = useState<NoteTag[]>([]);
  const [prepItems, setPrepItems] = useState<InterviewPrepItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>();
  const [view, setView] = useState<View>("notes");
  const [filter, setFilter] = useState<Filter>({});
  const [query, setQuery] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [syncCount, setSyncCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      setStatusMessage("");
      await action();
      setStatusMessage(successMessage);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setStatusMessage(`Action failed: ${message}`);
    }
  };

  const refresh = async () => {
    const [nextNotes, nextFolders, nextTags, nextNoteTags, nextPrepItems, nextSyncCount] = await Promise.all([
      db.notes.orderBy("updatedAt").reverse().toArray(),
      db.folders.orderBy("sortOrder").toArray(),
      db.tags.orderBy("name").toArray(),
      db.noteTags.toArray(),
      db.interviewPrepItems.orderBy("updatedAt").reverse().toArray(),
      db.syncQueue.count()
    ]);

    const activeNotes = nextNotes.filter((note) => !note.deletedAt && !note.archived);
    setNotes(activeNotes);
    setFolders(nextFolders.filter((folder) => !folder.deletedAt));
    setTags(nextTags.filter((tag) => !tag.deletedAt));
    setNoteTags(nextNoteTags);
    setPrepItems(nextPrepItems.filter((item) => !item.deletedAt));
    setSyncCount(nextSyncCount);

    if (!selectedNoteId && activeNotes[0]) {
      setSelectedNoteId(activeNotes[0].id);
    }
  };

  useEffect(() => {
    void ensureSeedData().then(refresh);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const search = useMemo(() => {
    const index = new MiniSearch<Note>({
      fields: ["title", "contentText"],
      storeFields: ["id"]
    });
    index.addAll(notes);
    return index;
  }, [notes]);

  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? notes[0];

  const filteredNotes = useMemo(() => {
    let next = [...notes];

    if (query.trim()) {
      const ids = new Set(search.search(query, { prefix: true, fuzzy: 0.2 }).map((result) => result.id));
      next = next.filter((note) => ids.has(note.id));
    }

    if (filter.folderId) {
      next = next.filter((note) => note.folderId === filter.folderId);
    }

    if (filter.tagId) {
      const taggedIds = new Set(noteTags.filter((item) => item.tagId === filter.tagId).map((item) => item.noteId));
      next = next.filter((note) => taggedIds.has(note.id));
    }

    return next.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  }, [filter.folderId, filter.tagId, noteTags, notes, query, search]);

  const createNote = async () => {
    await ensureSeedData();
    const refreshedFolders = (await db.folders.toArray()).filter((folder) => !folder.deletedAt);
    const timestamp = nowIso();
    const note: Note = {
      id: createId(),
      title: "Untitled note",
      contentJson: starterContent(),
      contentText: "",
      folderId: filter.folderId ?? refreshedFolders[0]?.id,
      pinned: false,
      archived: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      version: 1,
      syncStatus: "pending"
    };

    await db.notes.add(note);
    await queueSync({ entityType: "note", entityId: note.id, operation: "create", payload: note });
    setSelectedNoteId(note.id);
    await refresh();
  };

  const updateNote = async (note: Note, patch: Partial<Note>) => {
    const next = {
      ...note,
      ...patch,
      updatedAt: nowIso(),
      version: note.version + 1,
      syncStatus: "pending" as const
    };

    await db.notes.put(next);
    await queueSync({ entityType: "note", entityId: note.id, operation: "update", payload: next });
    await refresh();
  };

  const createFolder = async () => {
    const name = window.prompt("Folder name");
    if (!name?.trim()) return;

    const timestamp = nowIso();
    const folder: Folder = {
      id: createId(),
      name: name.trim(),
      sortOrder: folders.length + 1,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await db.folders.add(folder);
    await queueSync({ entityType: "folder", entityId: folder.id, operation: "create", payload: folder });
    await refresh();
  };

  const createTag = async () => {
    const name = window.prompt("Tag name");
    if (!name?.trim()) return;

    const timestamp = nowIso();
    const tag: Tag = {
      id: createId(),
      name: name.trim(),
      color: tagColors[tags.length % tagColors.length],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await db.tags.add(tag);
    await queueSync({ entityType: "tag", entityId: tag.id, operation: "create", payload: tag });
    await refresh();
  };

  const toggleNoteTag = async (note: Note, tag: Tag) => {
    const existing = noteTags.find((item) => item.noteId === note.id && item.tagId === tag.id);
    if (existing) {
      await db.noteTags.delete([note.id, tag.id]);
      await queueSync({ entityType: "noteTag", entityId: `${note.id}:${tag.id}`, operation: "delete", payload: existing });
    } else {
      const next = { noteId: note.id, tagId: tag.id, createdAt: nowIso() };
      await db.noteTags.add(next);
      await queueSync({ entityType: "noteTag", entityId: `${note.id}:${tag.id}`, operation: "create", payload: next });
    }
    await refresh();
  };

  const addPrepItem = async () => {
    const timestamp = nowIso();
    const item: InterviewPrepItem = {
      id: createId(),
      question: "New interview question",
      answer: "",
      topic: "General",
      difficulty: "Medium",
      company: "",
      role: "",
      noteId: selectedNote?.id,
      confidence: 1,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await db.interviewPrepItems.add(item);
    await queueSync({ entityType: "interviewPrepItem", entityId: item.id, operation: "create", payload: item });
    setView("prep");
    await refresh();
  };

  const addSampleNotes = async () => {
    await ensureSeedData();
    const [currentFolders, currentTags] = await Promise.all([db.folders.toArray(), db.tags.toArray()]);
    const timestamp = nowIso();
    const inboxId = currentFolders.find((folder) => folder.name === "Inbox")?.id ?? "folder-inbox";
    const prepFolderId = currentFolders.find((folder) => folder.name === "Interview Prep")?.id ?? "folder-interview-prep";
    const reactTagId = currentTags.find((tag) => tag.name === "React")?.id ?? "tag-react";
    const systemDesignTagId = currentTags.find((tag) => tag.name === "System Design")?.id ?? "tag-system-design";
    const dsaTagId = currentTags.find((tag) => tag.name === "DSA")?.id ?? "tag-dsa";

    const samples: Array<{ note: Note; tagIds: string[] }> = [
      {
        note: {
          id: createId(),
          title: "React interview checklist",
          contentJson: starterContent("Review rendering, hooks, memoization, forms, state management, and accessibility examples."),
          contentText: "Review rendering, hooks, memoization, forms, state management, and accessibility examples.",
          folderId: prepFolderId,
          pinned: true,
          archived: false,
          createdAt: timestamp,
          updatedAt: timestamp,
          version: 1,
          syncStatus: "pending"
        },
        tagIds: [reactTagId]
      },
      {
        note: {
          id: createId(),
          title: "System design prompts",
          contentJson: starterContent("Practice requirements, APIs, data model, caching, consistency, scale, and failure modes."),
          contentText: "Practice requirements, APIs, data model, caching, consistency, scale, and failure modes.",
          folderId: prepFolderId,
          pinned: false,
          archived: false,
          createdAt: timestamp,
          updatedAt: timestamp,
          version: 1,
          syncStatus: "pending"
        },
        tagIds: [systemDesignTagId]
      },
      {
        note: {
          id: createId(),
          title: "DSA revision plan",
          contentJson: starterContent("Arrays, strings, binary search, trees, graphs, heaps, dynamic programming, and timed practice."),
          contentText: "Arrays, strings, binary search, trees, graphs, heaps, dynamic programming, and timed practice.",
          folderId: inboxId,
          pinned: false,
          archived: false,
          createdAt: timestamp,
          updatedAt: timestamp,
          version: 1,
          syncStatus: "pending"
        },
        tagIds: [dsaTagId]
      }
    ];

    await db.transaction("rw", db.notes, db.noteTags, db.syncQueue, async () => {
      for (const sample of samples) {
        await db.notes.add(sample.note);
        await queueSync({ entityType: "note", entityId: sample.note.id, operation: "create", payload: sample.note });

        for (const tagId of sample.tagIds) {
          const noteTag = { noteId: sample.note.id, tagId, createdAt: timestamp };
          await db.noteTags.put(noteTag);
          await queueSync({ entityType: "noteTag", entityId: `${sample.note.id}:${tagId}`, operation: "create", payload: noteTag });
        }
      }
    });

    setSelectedNoteId(samples[0].note.id);
    setView("notes");
    await refresh();
  };

  const updatePrepItem = async (item: InterviewPrepItem, patch: Partial<InterviewPrepItem>) => {
    const next = { ...item, ...patch, updatedAt: nowIso() };
    await db.interviewPrepItems.put(next);
    await queueSync({ entityType: "interviewPrepItem", entityId: item.id, operation: "update", payload: next });
    await refresh();
  };

  const exportData = async () => {
    const payload = {
      exportedAt: nowIso(),
      notes: await db.notes.toArray(),
      folders: await db.folders.toArray(),
      tags: await db.tags.toArray(),
      noteTags: await db.noteTags.toArray(),
      interviewPrepItems: await db.interviewPrepItems.toArray()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "void-cloud-notes-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">V</div>
          <div>
            <strong>Void Notes</strong>
            <span>{online ? "Online" : "Offline"} local-first</span>
          </div>
        </div>

        <div className="search-box">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes" />
        </div>

        <nav className="nav-tabs">
          <button className={view === "notes" ? "active" : ""} onClick={() => setView("notes")}>
            <FileText size={16} /> Notes
          </button>
          <button className={view === "prep" ? "active" : ""} onClick={() => setView("prep")}>
            <CheckCircle2 size={16} /> Prep
          </button>
        </nav>

        <section className="side-section">
          <div className="section-title">
            <span>Folders</span>
            <button aria-label="Create folder" onClick={createFolder}>
              <FolderPlus size={15} />
            </button>
          </div>
          <button className={!filter.folderId ? "filter active" : "filter"} onClick={() => setFilter((next) => ({ ...next, folderId: undefined }))}>
            All notes
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              className={filter.folderId === folder.id ? "filter active" : "filter"}
              onClick={() => setFilter((next) => ({ ...next, folderId: folder.id }))}
            >
              {folder.name}
            </button>
          ))}
        </section>

        <section className="side-section">
          <div className="section-title">
            <span>Tags</span>
            <button aria-label="Create tag" onClick={createTag}>
              <Hash size={15} />
            </button>
          </div>
          <button className={!filter.tagId ? "filter active" : "filter"} onClick={() => setFilter((next) => ({ ...next, tagId: undefined }))}>
            Any tag
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              className={filter.tagId === tag.id ? "filter active" : "filter"}
              onClick={() => setFilter((next) => ({ ...next, tagId: tag.id }))}
            >
              <span className="tag-dot" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </button>
          ))}
        </section>

        <footer className="sync-panel">
          <span>{online ? <Wifi size={16} /> : <WifiOff size={16} />} Void Cloud sync</span>
          <strong>{syncCount} queued</strong>
        </footer>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <h1>{view === "notes" ? "Notes" : "Interview Prep"}</h1>
            <p>{view === "notes" ? "Offline drafts with folders, tags, search, and export." : "Question bank linked back to your notes."}</p>
          </div>
          <div className="topbar-actions">
            <button onClick={exportData}>
              <Download size={16} /> Export
            </button>
            <button onClick={() => void runAction(addPrepItem, "Prep item added")}>
              <CheckCircle2 size={16} /> Prep item
            </button>
            <button onClick={() => void runAction(addSampleNotes, "Sample notes added")}>
              <FilePlus2 size={16} /> Add samples
            </button>
            <button className="primary" onClick={() => void runAction(createNote, "Note added")}>
              <Plus size={16} /> Note
            </button>
          </div>
        </header>

        {statusMessage && <div className={statusMessage.startsWith("Action failed") ? "status-message error" : "status-message"}>{statusMessage}</div>}

        {view === "notes" ? (
          <section className="notes-layout">
            <div className="note-list">
              {filteredNotes.map((note) => (
                <button key={note.id} className={selectedNote?.id === note.id ? "note-card active" : "note-card"} onClick={() => setSelectedNoteId(note.id)}>
                  <span>{note.pinned && <Star size={14} fill="currentColor" />} {note.title}</span>
                  <small>{note.contentText || "No body text yet"}</small>
                </button>
              ))}
            </div>

            {selectedNote ? (
              <NoteEditor
                key={selectedNote.id}
                folders={folders}
                note={selectedNote}
                noteTags={noteTags.filter((item) => item.noteId === selectedNote.id)}
                tags={tags}
                onChange={(patch) => updateNote(selectedNote, patch)}
                onToggleTag={(tag) => toggleNoteTag(selectedNote, tag)}
              />
            ) : (
              <div className="empty-state">Create your first note.</div>
            )}
          </section>
        ) : (
          <PrepBoard items={prepItems} notes={notes} onUpdate={updatePrepItem} />
        )}
      </main>
    </div>
  );
}

function NoteEditor({
  folders,
  note,
  noteTags,
  tags,
  onChange,
  onToggleTag
}: {
  folders: Folder[];
  note: Note;
  noteTags: NoteTag[];
  tags: Tag[];
  onChange: (patch: Partial<Note>) => Promise<void>;
  onToggleTag: (tag: Tag) => Promise<void>;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write the note..."
      })
    ],
    content: note.contentJson,
    editorProps: {
      attributes: {
        class: "editor-surface"
      }
    },
    onUpdate: ({ editor: currentEditor }) => {
      void onChange({
        contentJson: currentEditor.getJSON() as Record<string, unknown>,
        contentText: currentEditor.getText()
      });
    }
  });

  return (
    <article className="editor-panel">
      <input className="title-input" value={note.title} onChange={(event) => void onChange({ title: event.target.value })} />

      <div className="metadata-row">
        <select value={note.folderId ?? ""} onChange={(event) => void onChange({ folderId: event.target.value || undefined })}>
          <option value="">No folder</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
        <button className={note.pinned ? "active" : ""} onClick={() => void onChange({ pinned: !note.pinned })}>
          <Star size={16} /> Pin
        </button>
        <button onClick={() => void onChange({ archived: true })}>
          <Archive size={16} /> Archive
        </button>
        <button className="danger" onClick={() => void onChange({ deletedAt: nowIso() })}>
          <Trash2 size={16} /> Trash
        </button>
      </div>

      <div className="tag-row">
        {tags.map((tag) => {
          const active = noteTags.some((item) => item.tagId === tag.id);
          return (
            <button key={tag.id} className={active ? "tag-pill active" : "tag-pill"} onClick={() => void onToggleTag(tag)}>
              <span style={{ backgroundColor: tag.color }} />
              {tag.name}
            </button>
          );
        })}
      </div>

      <div className="toolbar">
        <button className={editor?.isActive("bold") ? "active" : ""} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </button>
        <button className={editor?.isActive("italic") ? "active" : ""} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </button>
        <button className={editor?.isActive("bulletList") ? "active" : ""} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </button>
        <span>{note.syncStatus === "pending" ? "Pending sync" : "Synced"}</span>
      </div>

      <EditorContent editor={editor} />
    </article>
  );
}

function PrepBoard({
  items,
  notes,
  onUpdate
}: {
  items: InterviewPrepItem[];
  notes: Note[];
  onUpdate: (item: InterviewPrepItem, patch: Partial<InterviewPrepItem>) => Promise<void>;
}) {
  return (
    <section className="prep-grid">
      {items.map((item) => (
        <article className="prep-card" key={item.id}>
          <input value={item.question} onChange={(event) => void onUpdate(item, { question: event.target.value })} />
          <textarea value={item.answer} onChange={(event) => void onUpdate(item, { answer: event.target.value })} placeholder="Answer notes" />
          <div className="prep-fields">
            <input value={item.topic} onChange={(event) => void onUpdate(item, { topic: event.target.value })} placeholder="Topic" />
            <select value={item.difficulty} onChange={(event) => void onUpdate(item, { difficulty: event.target.value as InterviewPrepItem["difficulty"] })}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <input value={item.role} onChange={(event) => void onUpdate(item, { role: event.target.value })} placeholder="Role" />
            <select value={item.noteId ?? ""} onChange={(event) => void onUpdate(item, { noteId: event.target.value || undefined })}>
              <option value="">No linked note</option>
              {notes.map((note) => (
                <option key={note.id} value={note.id}>
                  {note.title}
                </option>
              ))}
            </select>
          </div>
          <label className="confidence">
            <RotateCw size={15} />
            <input
              type="range"
              min="1"
              max="5"
              value={item.confidence}
              onChange={(event) => void onUpdate(item, { confidence: Number(event.target.value) })}
            />
            <span>{item.confidence}/5</span>
          </label>
        </article>
      ))}
    </section>
  );
}
