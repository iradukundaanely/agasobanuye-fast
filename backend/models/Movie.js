"use strict";

const db = require("./database");

function formatMovie(movie) {
    if (!movie) return null;

    return {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        category: movie.category,
        actors: movie.actors || "",
        description: movie.description || "",
        language: movie.language || "Kinyarwanda",
        cover: movie.cover,
        video: movie.video,
        views: movie.views || 0,
        downloads: movie.downloads || 0,
        createdAt: movie.created_at
    };
}

function getAllMovies() {
    const rows = db.prepare(`
        SELECT *
        FROM movies
        ORDER BY id DESC
    `).all();

    return rows.map(formatMovie);
}

function getMovieById(id) {
    const row = db.prepare(`
        SELECT *
        FROM movies
        WHERE id = ?
    `).get(Number(id));

    return formatMovie(row);
}

function createMovie(data) {
    const result = db.prepare(`
        INSERT INTO movies (
            title,
            year,
            category,
            actors,
            description,
            language,
            cover,
            video
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        data.title,
        Number(data.year),
        data.category,
        data.actors || "",
        data.description || "",
        data.language || "Kinyarwanda",
        data.cover,
        data.video
    );

    return getMovieById(result.lastInsertRowid);
}

function deleteMovie(id) {
    const movie = getMovieById(id);

    if (!movie) return null;

    db.prepare(`
        DELETE FROM movies
        WHERE id = ?
    `).run(Number(id));

    return movie;
}

function incrementViews(id) {
    db.prepare(`
        UPDATE movies
        SET views = views + 1
        WHERE id = ?
    `).run(Number(id));

    return getMovieById(id);
}

function incrementDownloads(id) {
    db.prepare(`
        UPDATE movies
        SET downloads = downloads + 1
        WHERE id = ?
    `).run(Number(id));

    return getMovieById(id);
}

function countMovies() {
    const result = db.prepare(`
        SELECT COUNT(*) AS count
        FROM movies
    `).get();

    return Number(result.count);
}

module.exports = {
    getAllMovies,
    getMovieById,
    createMovie,
    deleteMovie,
    incrementViews,
    incrementDownloads,
    countMovies
};