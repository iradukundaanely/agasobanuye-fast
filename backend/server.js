"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();


// ======================================================
// DATABASE
// ======================================================

require("./models/database");


// ======================================================
// ROUTES
// ======================================================

const authRoutes =
    require("./routes/auth");

const movieRoutes =
    require("./routes/movies");

const categoryRoutes =
    require("./routes/categories");

const analyticsRoutes =
    require("./routes/analytics");


// ======================================================
// PORT
// ======================================================

const PORT =
    Number(
        process.env.PORT || 5000
    );


// ======================================================
// STORAGE PATH
// ======================================================

const storageRoot =
    path.join(
        __dirname,
        "..",
        "storage"
    );

const uploadsRoot =
    path.join(
        storageRoot,
        "uploads"
    );


// ======================================================
// CORS
// ======================================================

app.use(
    cors({
        origin: true,
        credentials: true
    })
);


// ======================================================
// BODY PARSING
// ======================================================

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
    })
);


// ======================================================
// PERSISTENT UPLOADS
// ======================================================
//
// Public URLs remain:
//
// /uploads/movies/...
// /uploads/covers/...
//
// Physical files are stored in:
//
// storage/uploads/movies
// storage/uploads/covers
//
// ======================================================

app.use(
    "/uploads",
    express.static(
        uploadsRoot,
        {
            acceptRanges: true,
            cacheControl: true,
            maxAge: "1h"
        }
    )
);


// ======================================================
// FRONTEND
// ======================================================

const frontendRoot =
    path.join(
        __dirname,
        "..",
        "frontend"
    );

app.use(
    express.static(
        frontendRoot
    )
);


// ======================================================
// API ROUTES
// ======================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/movies",
    movieRoutes
);

app.use(
    "/api/categories",
    categoryRoutes
);

app.use(
    "/api/analytics",
    analyticsRoutes
);


// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            status: "OK",

            application:
                "Agasobanuye Fast",

            database:
                "SQLite",

            storage:
                "Persistent storage",

            maxMovieUpload:
                "100 GB",

            resumableUploads:
                true,

            chunkSize:
                "25 MB"
        });
    }
);


// ======================================================
// HOME PAGE
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendRoot,
                "index.html"
            )
        );
    }
);


// ======================================================
// 404
// ======================================================

app.use(
    (req, res) => {

        res.status(404).json({

            message:
                "Route not found."
        });
    }
);


// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "SERVER ERROR:",
            error
        );

        if (
            res.headersSent
        ) {

            return next(
                error
            );
        }

        res.status(
            error.status || 500
        ).json({

            message:
                error.message ||
                "Internal server error."
        });
    }
);


// ======================================================
// START SERVER
// ======================================================
//
// 0.0.0.0 is important for Render.
// Render provides the PORT through environment variables.
//
// ======================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");
        console.log(
            "================================="
        );
        console.log(
            "       AGASOBANUYE FAST"
        );
        console.log(
            "================================="
        );

        console.log(
            `Server: http://localhost:${PORT}`
        );

        console.log(
            "Database: SQLite"
        );

        console.log(
            "Storage:",
            storageRoot
        );

        console.log(
            "Uploads:",
            uploadsRoot
        );

        console.log(
            "MongoDB: NOT REQUIRED"
        );

        console.log(
            "Maximum movie upload: 100 GB"
        );

        console.log(
            "Upload mode: RESUMABLE CHUNKS"
        );

        console.log(
            "Chunk size: 25 MB"
        );

        console.log(
            "================================="
        );
        console.log("");
    }
);