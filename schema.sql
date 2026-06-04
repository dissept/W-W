-- Wise & Wisdom — D1 schema
-- Run: wrangler d1 execute ww-submissions --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS contacts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  subject    TEXT    NOT NULL DEFAULT '',
  message    TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS denuncias (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo        TEXT    NOT NULL,
  empresa     TEXT,
  descripcion TEXT    NOT NULL,
  contacto    TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Retention audit: one row per table per scheduled/manual purge run
CREATE TABLE IF NOT EXISTS purge_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name      TEXT    NOT NULL,
  records_deleted INTEGER NOT NULL,
  run_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- GDPR Art. 17 manual erasure log
CREATE TABLE IF NOT EXISTS deletion_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id  TEXT NOT NULL,
  reason     TEXT NOT NULL,
  deleted_at TEXT NOT NULL DEFAULT (datetime('now'))
);
