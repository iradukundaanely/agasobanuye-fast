"use strict";

const db = require("./database");

function createView(movieId, visitorId, ip = "") {
    const existing = db.prepare(`
        SELECT id
        FROM views
        WHERE movie_id = ?
          AND visitor_id = ?
          AND created_at >= datetime('now', '-30 minutes')
        LIMIT 1
    `).get(
        Number(movieId),
        visitorId
    );

    if (existing) {
        return {
            counted: false,
            id: existing.id
        };
    }

    const result = db.prepare(`
        INSERT INTO views (
            movie_id,
            visitor_id,
            ip
        )
        VALUES (?, ?, ?)
    `).run(
        Number(movieId),
        visitorId,
        ip
    );

    db.prepare(`
        UPDATE movies
        SET views = views + 1
        WHERE id = ?
    `).run(Number(movieId));

    return {
        counted: true,
        id: result.lastInsertRowid
    };
}

function countViews() {
    const result = db.prepare(`
        SELECT COUNT(*) AS count
        FROM views
    `).get();

    return Number(result.count);
}

function countUniqueVisitors() {
    const result = db.prepare(`
        SELECT COUNT(DISTINCT visitor_id) AS count
        FROM views
    `).get();

    return Number(result.count);
}

function getTopMovies(limit = 10) {
    return db.prepare(`
        SELECT
            id,
            title,
            category,
            views,
            downloads
        FROM movies
        ORDER BY views DESC
        LIMIT ?
    `).all(Number(limit));
}

module.exports = {
    createView,
    countViews,
    countUniqueVisitors,
    getTopMovies
};