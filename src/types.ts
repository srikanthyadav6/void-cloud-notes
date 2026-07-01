export type SyncStatus = "synced" | "pending" | "error";

export type Note = {
  id: string;
  title: string;
  contentJson: Record<string, unknown>;
  contentText: string;
  folderId?: string;
  pinned: boolean;
  archived: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  syncStatus: SyncStatus;
};

export type Folder = {
  id: string;
  name: string;
  parentId?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type NoteTag = {
  noteId: string;
  tagId: string;
  createdAt: string;
};

export type InterviewPrepItem = {
  id: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  company: string;
  role: string;
  noteId?: string;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type SyncQueueItem = {
  id: string;
  entityType: "note" | "folder" | "tag" | "noteTag" | "interviewPrepItem";
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: unknown;
  createdAt: string;
  attemptCount: number;
  lastError?: string;
};
