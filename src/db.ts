import Dexie, { type Table } from "dexie";
import type { Folder, InterviewPrepItem, Note, NoteTag, SyncQueueItem, Tag } from "./types";

class VoidNotesDatabase extends Dexie {
  notes!: Table<Note, string>;
  folders!: Table<Folder, string>;
  tags!: Table<Tag, string>;
  noteTags!: Table<NoteTag, [string, string]>;
  interviewPrepItems!: Table<InterviewPrepItem, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super("void-cloud-notes");

    this.version(1).stores({
      notes: "id, title, folderId, pinned, archived, deletedAt, updatedAt, syncStatus",
      folders: "id, name, parentId, sortOrder, deletedAt",
      tags: "id, name, deletedAt",
      noteTags: "[noteId+tagId], noteId, tagId",
      interviewPrepItems: "id, topic, difficulty, noteId, nextReviewAt, deletedAt",
      syncQueue: "id, entityType, entityId, createdAt"
    });

    this.version(2).stores({
      notes: "id, title, folderId, pinned, archived, deletedAt, updatedAt, syncStatus",
      folders: "id, name, parentId, sortOrder, deletedAt",
      tags: "id, name, deletedAt",
      noteTags: "[noteId+tagId], noteId, tagId",
      interviewPrepItems: "id, topic, difficulty, noteId, nextReviewAt, deletedAt, updatedAt",
      syncQueue: "id, entityType, entityId, createdAt"
    });
  }
}

export const db = new VoidNotesDatabase();

export const nowIso = () => new Date().toISOString();

export const createId = () => crypto.randomUUID();

export const starterContent = (text = "") => ({
  type: "doc",
  content: text
    ? [
        {
          type: "paragraph",
          content: [{ type: "text", text }]
        }
      ]
    : [{ type: "paragraph" }]
});

export async function ensureSeedData() {
  const [noteCount, folderCount, tagCount, prepCount] = await Promise.all([
    db.notes.count(),
    db.folders.count(),
    db.tags.count(),
    db.interviewPrepItems.count()
  ]);

  if (folderCount === 0) {
    const timestamp = nowIso();
    await db.folders.bulkPut([
      {
        id: "folder-inbox",
        name: "Inbox",
        sortOrder: 1,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        id: "folder-interview-prep",
        name: "Interview Prep",
        sortOrder: 2,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]);
  }

  if (tagCount === 0) {
    const timestamp = nowIso();
    await db.tags.bulkPut([
      { id: "tag-react", name: "React", color: "#2563eb", createdAt: timestamp, updatedAt: timestamp },
      { id: "tag-system-design", name: "System Design", color: "#16a34a", createdAt: timestamp, updatedAt: timestamp },
      { id: "tag-dsa", name: "DSA", color: "#dc2626", createdAt: timestamp, updatedAt: timestamp }
    ]);
  }

  if (noteCount === 0) {
    const timestamp = nowIso();
    await db.notes.put({
      id: "note-welcome",
      title: "Void Cloud Notes MVP",
      contentJson: starterContent("Capture notes offline, organize them with folders and tags, and sync with Void Cloud when online."),
      contentText: "Capture notes offline, organize them with folders and tags, and sync with Void Cloud when online.",
      folderId: "folder-inbox",
      pinned: true,
      archived: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      version: 1,
      syncStatus: "pending"
    });

    await db.noteTags.put({ noteId: "note-welcome", tagId: "tag-system-design", createdAt: timestamp });
  }

  if (prepCount === 0) {
    const timestamp = nowIso();
    await db.interviewPrepItems.put({
      id: "prep-react-rendering",
      question: "Explain how React rendering and reconciliation work.",
      answer: "Cover virtual tree updates, state changes, reconciliation, keys, and avoiding unnecessary renders.",
      topic: "React",
      difficulty: "Medium",
      company: "",
      role: "Frontend Engineer",
      noteId: "note-welcome",
      confidence: 2,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }
}

export async function queueSync(item: Omit<SyncQueueItem, "id" | "createdAt" | "attemptCount">) {
  await db.syncQueue.add({
    id: createId(),
    createdAt: nowIso(),
    attemptCount: 0,
    ...item
  });
}
