"use strict";

const db = require("./database");

function getAllCategories() {
    return db.prepare(`
        SELECT
            id,
            name,
            created_at AS createdAt
        FROM categories
        ORDER BY name COLLATE NOCASE ASC
    `).all();
}

function getCategoryById(id) {
    return db.prepare(`
        SELECT
            id,
            name,
            created_at AS createdAt
        FROM categories
        WHERE id = ?
    `).get(Number(id));
}

function findCategoryByName(name) {
    return db.prepare(`
        SELECT
            id,
            name,
            created_at AS createdAt
        FROM categories
        WHERE LOWER(name) = LOWER(?)
        LIMIT 1
    `).get(name);
}

function createCategory(name) {
    const result = db.prepare(`
        INSERT INTO categories (name)
        VALUES (?)
    `).run(name);

    return getCategoryById(result.lastInsertRowid);
}

function deleteCategory(id) {
    const category = getCategoryById(id);

    if (!category) return null;

    db.prepare(`
        DELETE FROM categories
        WHERE id = ?
    `).run(Number(id));

    return category;
}

function countMoviesUsingCategory(name) {
    const result = db.prepare(`
        SELECT COUNT(*) AS count
        FROM movies
        WHERE LOWER(category) = LOWER(?)
    `).get(name);

    return Number(result.count);
}

module.exports = {
    getAllCategories,
    getCategoryById,
    findCategoryByName,
    createCategory,
    deleteCategory,
    countMoviesUsingCategory
};