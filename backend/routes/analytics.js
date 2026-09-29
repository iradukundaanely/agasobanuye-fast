"use strict";

const express = require("express");

const db = require("../models/database");
const protectAdmin = require("../middleware/auth");

const router = express.Router();

/*
    GET /api/analytics

    Returns all dashboard statistics.
*/
router.get("/", protectAdmin, (req, res) => {
    try {
        // Total movies
        const totalMovies = Number(
            db.prepare(`
                SELECT COUNT(*) AS count
                FROM movies
            `).get().count || 0
        );

        // Total movie views
        const totalViews = Number(
            db.prepare(`
                SELECT COALESCE(SUM(views), 0) AS total
                FROM movies
            `).get().total || 0
        );

        // Total downloads
        const totalDownloads = Number(
            db.prepare(`
                SELECT COALESCE(SUM(downloads), 0) AS total
                FROM movies
            `).get().total || 0
        );

        // Total recorded view events
        const recordedViews = Number(
            db.prepare(`
                SELECT COUNT(*) AS count
                FROM views
            `).get().count || 0
        );

        // Unique visitors
        const uniqueVisitors = Number(
            db.prepare(`
                SELECT COUNT(DISTINCT visitor_id) AS count
                FROM views
            `).get().count || 0
        );

        // Categories
        const totalCategories = Number(
            db.prepare(`
                SELECT COUNT(*) AS count
                FROM categories
            `).get().count || 0
        );

        // Top movies
        const topMovies = db.prepare(`
            SELECT
                id,
                title,
                year,
                category,
                views,
                downloads,
                cover
            FROM movies
            ORDER BY views DESC, id DESC
            LIMIT 10
        `).all();

        const result = {
            success: true,

            totalMovies,
            totalViews,
            totalDownloads,

            recordedViews,
            uniqueVisitors,

            totalCategories,

            // Compatibility names
            movieCount: totalMovies,
            viewCount: totalViews,
            downloadCount: totalDownloads,
            visitorCount: uniqueVisitors,
            categoryCount: totalCategories,

            topMovies
        };

        console.log("Analytics:", {
            movies: totalMovies,
            views: totalViews,
            recordedViews,
            visitors: uniqueVisitors,
            downloads: totalDownloads,
            categories: totalCategories
        });

        res.json(result);

    } catch (error) {
        console.error("Analytics error:", error);

        res.status(500).json({
            success: false,
            message: "Could not load analytics.",
            error: error.message
        });
    }
});

module.exports = router;