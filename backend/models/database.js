"use strict";

const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

/*
=========================================================
AGASOBANUYE FAST
PERSISTENT SQLITE DATABASE
=========================================================

Local:
E:\project in vs code\Agasobanuye fast\storage\agasobanuye_fast.db

Render:
/opt/render/project/src/storage/agasobanuye_fast.db
=========================================================
*/


/*
=========================================================
STORAGE FOLDER
=========================================================
*/

const storageFolder = path.join(
    __dirname,
    "..",
    "..",
    "storage"
);


/*
=========================================================
CREATE STORAGE FOLDER
=========================================================
*/

fs.mkdirSync(
    storageFolder,
    {
        recursive: true
    }
);


/*
=========================================================
DATABASE PATH
=========================================================
*/

const dbPath = path.join(
    storageFolder,
    "agasobanuye_fast.db"
);


/*
=========================================================
OPEN SQLITE DATABASE
=========================================================
*/

const db = new DatabaseSync(
    dbPath
);


/*
=========================================================
SQLITE SETTINGS
=========================================================
*/

db.exec(`
    PRAGMA foreign_keys = ON;

    PRAGMA journal_mode = WAL;

    PRAGMA busy_timeout = 5000;
`);


/*
=========================================================
MOVIES TABLE
=========================================================
*/

db.exec(`
    CREATE TABLE IF NOT EXISTS movies (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        title TEXT NOT NULL,

        year INTEGER NOT NULL,

        category TEXT NOT NULL,

        actors TEXT DEFAULT '',

        description TEXT DEFAULT '',

        language TEXT DEFAULT 'Kinyarwanda',

        cover TEXT NOT NULL,

        video TEXT NOT NULL,

        views INTEGER DEFAULT 0,

        downloads INTEGER DEFAULT 0,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);


/*
=========================================================
CATEGORIES TABLE
=========================================================
*/

db.exec(`
    CREATE TABLE IF NOT EXISTS categories (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        name TEXT NOT NULL UNIQUE,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);


/*
=========================================================
VIEWS TABLE
=========================================================
*/

db.exec(`
    CREATE TABLE IF NOT EXISTS views (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        movie_id INTEGER NOT NULL,

        visitor_id TEXT NOT NULL,

        ip TEXT DEFAULT '',

        created_at TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (movie_id)

        REFERENCES movies(id)

        ON DELETE CASCADE
    );
`);


/*
=========================================================
USERS TABLE
=========================================================
*/

db.exec(`
    CREATE TABLE IF NOT EXISTS users (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        username TEXT NOT NULL UNIQUE,

        password TEXT NOT NULL,

        role TEXT DEFAULT 'user',

        active INTEGER DEFAULT 1,

        last_login TEXT DEFAULT NULL,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);


/*
=========================================================
INDEXES
=========================================================
*/

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_movies_category

    ON movies(category);
`);


db.exec(`
    CREATE INDEX IF NOT EXISTS idx_movies_created

    ON movies(created_at);
`);


db.exec(`
    CREATE INDEX IF NOT EXISTS idx_views_movie

    ON views(movie_id);
`);


db.exec(`
    CREATE INDEX IF NOT EXISTS idx_views_visitor

    ON views(visitor_id);
`);


/*
=========================================================
DATABASE READY
=========================================================
*/

console.log("");
console.log("=================================");
console.log("   AGASOBANUYE FAST DATABASE");
console.log("=================================");
console.log("Database: SQLite");
console.log("Storage:", storageFolder);
console.log("Database file:", dbPath);
console.log("Status: READY");
console.log("=================================");
console.log("");


/*
=========================================================
EXPORT DATABASE
=========================================================
*/

module.exports = db;