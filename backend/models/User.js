"use strict";

const db = require("./database");

function findUser(username) {
    return db.prepare(`
        SELECT
            id,
            username,
            password,
            role,
            active,
            last_login AS lastLogin,
            created_at AS createdAt
        FROM users
        WHERE username = ?
        LIMIT 1
    `).get(username);
}

function createUser(
    username,
    password,
    role = "user"
) {
    const result = db.prepare(`
        INSERT INTO users (
            username,
            password,
            role,
            active
        )
        VALUES (?, ?, ?, 1)
    `).run(
        username,
        password,
        role
    );

    return db.prepare(`
        SELECT
            id,
            username,
            password,
            role,
            active,
            last_login AS lastLogin,
            created_at AS createdAt
        FROM users
        WHERE id = ?
    `).get(result.lastInsertRowid);
}

function updateLastLogin(id) {
    db.prepare(`
        UPDATE users
        SET last_login = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(Number(id));
}

module.exports = {
    findUser,
    createUser,
    updateLastLogin
};