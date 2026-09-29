"use strict";

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const Movie = require("../models/Movie");
const View = require("../models/View");
const protectAdmin = require("../middleware/auth");

const router = express.Router();

/*
=========================================================
AGASOBANUYE FAST
MOVIE ROUTES
PERSISTENT STORAGE VERSION
=========================================================

Local:

Agasobanuye fast/
└── storage/
    └── uploads/
        ├── movies/
        ├── covers/
        └── .chunks/

Render:

/opt/render/project/src/storage/uploads/
=========================================================
*/


/*
=========================================================
FOLDERS
=========================================================
*/

const storageRoot = path.join(
    __dirname,
    "..",
    "..",
    "storage"
);

const uploadsRoot = path.join(
    storageRoot,
    "uploads"
);

const moviesFolder = path.join(
    uploadsRoot,
    "movies"
);

const coversFolder = path.join(
    uploadsRoot,
    "covers"
);

const chunksFolder = path.join(
    uploadsRoot,
    ".chunks"
);


/*
=========================================================
CREATE FOLDERS
=========================================================
*/

fs.mkdirSync(
    moviesFolder,
    {
        recursive: true
    }
);

fs.mkdirSync(
    coversFolder,
    {
        recursive: true
    }
);

fs.mkdirSync(
    chunksFolder,
    {
        recursive: true
    }
);


/*
=========================================================
UPLOAD LIMITS
=========================================================
*/

const MAX_FILE_SIZE =
    100 * 1024 * 1024 * 1024;

const CHUNK_SIZE =
    25 * 1024 * 1024;


/*
=========================================================
COVER UPLOAD
=========================================================
*/

const coverStorage =
    multer.diskStorage({

        destination: function (
            req,
            file,
            cb
        ) {

            cb(
                null,
                coversFolder
            );
        },

        filename: function (
            req,
            file,
            cb
        ) {

            const ext =
                path.extname(
                    file.originalname
                ).toLowerCase();

            const base =
                path.basename(
                    file.originalname,
                    ext
                )
                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    "_"
                );

            const filename =
                Date.now() +
                "-" +
                Math.round(
                    Math.random() * 1000000
                ) +
                "-" +
                base +
                ext;

            cb(
                null,
                filename
            );
        }
    });


const uploadCover =
    multer({

        storage:
            coverStorage,

        limits: {
            fileSize:
                20 * 1024 * 1024
        },

        fileFilter:
            function (
                req,
                file,
                cb
            ) {

                const ext =
                    path.extname(
                        file.originalname
                    ).toLowerCase();

                const allowed = [
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".webp"
                ];

                if (
                    allowed.includes(ext)
                ) {

                    cb(
                        null,
                        true
                    );

                } else {

                    cb(
                        new Error(
                            "Cover must be JPG, JPEG, PNG or WEBP."
                        )
                    );
                }
            }
    });


/*
=========================================================
HELPERS
=========================================================
*/

function createUploadId() {

    return (
        Date.now().toString(36) +
        "-" +
        crypto
            .randomBytes(12)
            .toString("hex")
    );
}


function metadataPath(
    uploadId
) {

    return path.join(
        chunksFolder,
        `${uploadId}.json`
    );
}


function temporaryVideoPath(
    uploadId
) {

    return path.join(
        chunksFolder,
        `${uploadId}.part`
    );
}


function finalVideoName(
    originalName
) {

    const ext =
        path.extname(
            originalName
        ).toLowerCase();

    const base =
        path.basename(
            originalName,
            ext
        )
        .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        )
        .replace(
            /_+/g,
            "_"
        );

    return (
        Date.now() +
        "-" +
        crypto
            .randomBytes(6)
            .toString("hex") +
        "-" +
        base +
        ext
    );
}


function readMetadata(
    uploadId
) {

    const file =
        metadataPath(
            uploadId
        );

    if (
        !fs.existsSync(file)
    ) {

        return null;
    }

    try {

        return JSON.parse(
            fs.readFileSync(
                file,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "Metadata read error:",
            error
        );

        return null;
    }
}


function writeMetadata(
    uploadId,
    data
) {

    fs.writeFileSync(
        metadataPath(
            uploadId
        ),
        JSON.stringify(
            data,
            null,
            2
        )
    );
}


function removeUploadFiles(
    uploadId
) {

    const files = [
        metadataPath(uploadId),
        temporaryVideoPath(uploadId)
    ];

    for (
        const file of files
    ) {

        try {

            if (
                fs.existsSync(file)
            ) {

                fs.unlinkSync(
                    file
                );
            }

        } catch (error) {

            console.error(
                "Cleanup error:",
                error
            );
        }
    }
}


/*
=========================================================
GET ALL MOVIES
=========================================================
*/

router.get(
    "/",
    (req, res) => {

        try {

            let movies =
                Movie.getAllMovies();

            const search =
                String(
                    req.query.search || ""
                )
                    .trim()
                    .toLowerCase();

            const category =
                String(
                    req.query.category || ""
                )
                    .trim()
                    .toLowerCase();

            if (search) {

                movies =
                    movies.filter(
                        movie => {

                            const title =
                                String(
                                    movie.title || ""
                                )
                                    .toLowerCase();

                            const actors =
                                String(
                                    movie.actors || ""
                                )
                                    .toLowerCase();

                            const movieCategory =
                                String(
                                    movie.category || ""
                                )
                                    .toLowerCase();

                            return (
                                title.includes(search) ||
                                actors.includes(search) ||
                                movieCategory.includes(search)
                            );
                        }
                    );
            }

            if (category) {

                movies =
                    movies.filter(
                        movie => {

                            return (
                                String(
                                    movie.category || ""
                                )
                                    .toLowerCase() ===
                                category
                            );
                        }
                    );
            }

            res.json(
                movies
            );

        } catch (error) {

            console.error(
                "Get movies error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to load movies."
            });
        }
    }
);


/*
=========================================================
GET SINGLE MOVIE
=========================================================
*/

router.get(
    "/:id",
    (req, res) => {

        try {

            const movie =
                Movie.getMovieById(
                    req.params.id
                );

            if (!movie) {

                return res
                    .status(404)
                    .json({
                        message:
                            "Movie not found."
                    });
            }

            res.json(
                movie
            );

        } catch (error) {

            console.error(
                "Get movie error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to load movie."
            });
        }
    }
);


/*
=========================================================
START RESUMABLE UPLOAD
=========================================================
*/

router.post(
    "/upload/start",
    protectAdmin,
    uploadCover.single("cover"),
    (req, res) => {

        let uploadId = null;

        try {

            const {
                title,
                year,
                category,
                actors,
                description,
                language,
                fileName,
                fileSize
            } = req.body;

            if (!title) {

                return res.status(400).json({
                    message:
                        "Movie title is required."
                });
            }

            if (!year) {

                return res.status(400).json({
                    message:
                        "Movie year is required."
                });
            }

            if (!category) {

                return res.status(400).json({
                    message:
                        "Movie category is required."
                });
            }

            if (!fileName) {

                return res.status(400).json({
                    message:
                        "Movie file name is required."
                });
            }

            const totalSize =
                Number(fileSize);

            if (
                !Number.isFinite(totalSize) ||
                totalSize <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Invalid movie file size."
                });
            }

            if (
                totalSize >
                MAX_FILE_SIZE
            ) {

                return res.status(413).json({
                    message:
                        "Movie is larger than the 100 GB limit."
                });
            }

            if (!req.file) {

                return res.status(400).json({
                    message:
                        "Movie cover is required."
                });
            }

            uploadId =
                createUploadId();

            const metadata = {

                uploadId,

                title:
                    String(title)
                        .trim(),

                year:
                    Number(year),

                category:
                    String(category)
                        .trim(),

                actors:
                    String(
                        actors || ""
                    ).trim(),

                description:
                    String(
                        description || ""
                    ).trim(),

                language:
                    String(
                        language ||
                        "Kinyarwanda"
                    ).trim(),

                originalFileName:
                    String(fileName),

                totalSize,

                chunkSize:
                    CHUNK_SIZE,

                coverFile:
                    req.file.filename,

                uploadedBytes:
                    0,

                createdAt:
                    new Date().toISOString()
            };

            writeMetadata(
                uploadId,
                metadata
            );

            const tempFile =
                temporaryVideoPath(
                    uploadId
                );

            fs.closeSync(
                fs.openSync(
                    tempFile,
                    "w"
                )
            );

            console.log("");
            console.log(
                "================================="
            );
            console.log(
                "NEW RESUMABLE UPLOAD"
            );
            console.log(
                "Upload ID:",
                uploadId
            );
            console.log(
                "File:",
                fileName
            );
            console.log(
                "Size:",
                (
                    totalSize /
                    1024 /
                    1024 /
                    1024
                ).toFixed(2),
                "GB"
            );
            console.log(
                "Storage:",
                moviesFolder
            );
            console.log(
                "================================="
            );

            res.status(201).json({

                message:
                    "Upload started.",

                uploadId,

                chunkSize:
                    CHUNK_SIZE,

                totalSize,

                uploadedBytes:
                    0
            });

        } catch (error) {

            console.error(
                "Start upload error:",
                error
            );

            if (uploadId) {

                removeUploadFiles(
                    uploadId
                );
            }

            if (
                req.file &&
                req.file.path &&
                fs.existsSync(
                    req.file.path
                )
            ) {

                fs.unlinkSync(
                    req.file.path
                );
            }

            res.status(500).json({

                message:
                    error.message ||
                    "Could not start upload."
            });
        }
    }
);


/*
=========================================================
GET UPLOAD STATUS
=========================================================
*/

router.get(
    "/upload/:uploadId/status",
    protectAdmin,
    (req, res) => {

        try {

            const metadata =
                readMetadata(
                    req.params.uploadId
                );

            if (!metadata) {

                return res.status(404).json({
                    message:
                        "Upload session not found."
                });
            }

            const tempFile =
                temporaryVideoPath(
                    metadata.uploadId
                );

            let uploadedBytes = 0;

            if (
                fs.existsSync(
                    tempFile
                )
            ) {

                uploadedBytes =
                    fs.statSync(
                        tempFile
                    ).size;
            }

            metadata.uploadedBytes =
                uploadedBytes;

            writeMetadata(
                metadata.uploadId,
                metadata
            );

            res.json({

                uploadId:
                    metadata.uploadId,

                totalSize:
                    metadata.totalSize,

                chunkSize:
                    metadata.chunkSize,

                uploadedBytes,

                percent:
                    (
                        uploadedBytes /
                        metadata.totalSize *
                        100
                    ).toFixed(2),

                complete:
                    uploadedBytes >=
                    metadata.totalSize
            });

        } catch (error) {

            console.error(
                "Upload status error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not get upload status."
            });
        }
    }
);


/*
=========================================================
UPLOAD ONE CHUNK
=========================================================
*/

router.post(
    "/upload/:uploadId/chunk",
    protectAdmin,

    express.raw({
        type: "*/*",
        limit: "30mb"
    }),

    (req, res) => {

        try {

            const uploadId =
                req.params.uploadId;

            const metadata =
                readMetadata(
                    uploadId
                );

            if (!metadata) {

                return res.status(404).json({
                    message:
                        "Upload session not found."
                });
            }

            if (
                !req.body ||
                !Buffer.isBuffer(
                    req.body
                )
            ) {

                return res.status(400).json({
                    message:
                        "No upload data received."
                });
            }

            const offset =
                Number(
                    req.headers[
                        "x-upload-offset"
                    ]
                );

            if (
                !Number.isFinite(offset) ||
                offset < 0
            ) {

                return res.status(400).json({
                    message:
                        "Invalid upload offset."
                });
            }

            const tempFile =
                temporaryVideoPath(
                    uploadId
                );

            let currentSize = 0;

            if (
                fs.existsSync(
                    tempFile
                )
            ) {

                currentSize =
                    fs.statSync(
                        tempFile
                    ).size;
            }

            if (
                offset !== currentSize
            ) {

                return res.status(409).json({

                    message:
                        "Wrong upload offset.",

                    currentOffset:
                        currentSize
                });
            }

            const chunk =
                req.body;

            if (
                chunk.length === 0
            ) {

                return res.status(400).json({
                    message:
                        "Empty chunk."
                });
            }

            if (
                chunk.length >
                metadata.chunkSize
            ) {

                return res.status(400).json({
                    message:
                        "Chunk is too large."
                });
            }

            if (
                currentSize +
                chunk.length >
                metadata.totalSize
            ) {

                return res.status(400).json({
                    message:
                        "Chunk exceeds movie size."
                });
            }

            const fd =
                fs.openSync(
                    tempFile,
                    "r+"
                );

            try {

                fs.writeSync(
                    fd,
                    chunk,
                    0,
                    chunk.length,
                    currentSize
                );

            } finally {

                fs.closeSync(
                    fd
                );
            }

            const newSize =
                currentSize +
                chunk.length;

            metadata.uploadedBytes =
                newSize;

            writeMetadata(
                uploadId,
                metadata
            );

            const percent =
                (
                    newSize /
                    metadata.totalSize *
                    100
                ).toFixed(2);

            res.json({

                message:
                    "Chunk uploaded.",

                uploadId,

                uploadedBytes:
                    newSize,

                totalSize:
                    metadata.totalSize,

                percent,

                complete:
                    newSize >=
                    metadata.totalSize
            });

        } catch (error) {

            console.error(
                "Chunk upload error:",
                error
            );

            res.status(500).json({

                message:
                    error.message ||
                    "Chunk upload failed."
            });
        }
    }
);


/*
=========================================================
COMPLETE UPLOAD
=========================================================
*/

router.post(
    "/upload/:uploadId/complete",
    protectAdmin,
    (req, res) => {

        try {

            const uploadId =
                req.params.uploadId;

            const metadata =
                readMetadata(
                    uploadId
                );

            if (!metadata) {

                return res.status(404).json({
                    message:
                        "Upload session not found."
                });
            }

            const tempFile =
                temporaryVideoPath(
                    uploadId
                );

            if (
                !fs.existsSync(
                    tempFile
                )
            ) {

                return res.status(404).json({
                    message:
                        "Temporary movie file not found."
                });
            }

            const actualSize =
                fs.statSync(
                    tempFile
                ).size;

            if (
                actualSize !==
                metadata.totalSize
            ) {

                return res.status(400).json({

                    message:
                        "Upload is not complete.",

                    uploadedBytes:
                        actualSize,

                    totalSize:
                        metadata.totalSize
                });
            }

            const finalName =
                finalVideoName(
                    metadata.originalFileName
                );

            const finalPath =
                path.join(
                    moviesFolder,
                    finalName
                );

            fs.renameSync(
                tempFile,
                finalPath
            );

            /*
            IMPORTANT:
            Keep public URLs unchanged.
            Only physical storage has moved.
            */

            const videoUrl =
                "/uploads/movies/" +
                finalName;

            const coverUrl =
                "/uploads/covers/" +
                metadata.coverFile;

            let movie;

            try {

                movie =
                    Movie.createMovie({

                        title:
                            metadata.title,

                        year:
                            metadata.year,

                        category:
                            metadata.category,

                        actors:
                            metadata.actors,

                        description:
                            metadata.description,

                        language:
                            metadata.language,

                        cover:
                            coverUrl,

                        video:
                            videoUrl
                    });

            } catch (databaseError) {

                if (
                    fs.existsSync(
                        finalPath
                    )
                ) {

                    fs.unlinkSync(
                        finalPath
                    );
                }

                throw databaseError;
            }

            try {

                fs.unlinkSync(
                    metadataPath(
                        uploadId
                    )
                );

            } catch (error) {

                console.error(
                    "Metadata cleanup error:",
                    error
                );
            }

            console.log("");
            console.log(
                "MOVIE UPLOAD COMPLETE"
            );
            console.log(
                "Movie:",
                movie.title
            );
            console.log(
                "Video:",
                finalPath
            );
            console.log(
                "Size:",
                (
                    actualSize /
                    1024 /
                    1024 /
                    1024
                ).toFixed(2),
                "GB"
            );

            res.status(201).json({

                message:
                    "Movie uploaded successfully.",

                movie
            });

        } catch (error) {

            console.error(
                "Complete upload error:",
                error
            );

            res.status(500).json({

                message:
                    error.message ||
                    "Could not complete upload."
            });
        }
    }
);


/*
=========================================================
CANCEL UPLOAD
=========================================================
*/

router.delete(
    "/upload/:uploadId",
    protectAdmin,
    (req, res) => {

        try {

            const uploadId =
                req.params.uploadId;

            const metadata =
                readMetadata(
                    uploadId
                );

            if (!metadata) {

                return res.status(404).json({
                    message:
                        "Upload session not found."
                });
            }

            if (
                metadata.coverFile
            ) {

                const coverPath =
                    path.join(
                        coversFolder,
                        metadata.coverFile
                    );

                if (
                    fs.existsSync(
                        coverPath
                    )
                ) {

                    fs.unlinkSync(
                        coverPath
                    );
                }
            }

            removeUploadFiles(
                uploadId
            );

            res.json({

                message:
                    "Upload cancelled."
            });

        } catch (error) {

            console.error(
                "Cancel upload error:",
                error
            );

            res.status(500).json({

                message:
                    "Could not cancel upload."
            });
        }
    }
);


/*
=========================================================
COUNT VIEW
=========================================================
*/

router.post(
    "/:id/view",
    (req, res) => {

        try {

            const movieId =
                Number(
                    req.params.id
                );

            if (
                !Number.isInteger(movieId) ||
                movieId <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Invalid movie ID."
                });
            }

            const movie =
                Movie.getMovieById(
                    movieId
                );

            if (!movie) {

                return res.status(404).json({
                    message:
                        "Movie not found."
                });
            }

            const body =
                req.body || {};

            const visitorId =
                String(
                    body.visitorId ||
                    req.headers[
                        "x-visitor-id"
                    ] ||
                    req.ip ||
                    "unknown"
                ).trim();

            const result =
                View.createView(
                    movie.id,
                    visitorId,
                    req.ip || ""
                );

            const updatedMovie =
                Movie.getMovieById(
                    movie.id
                );

            res.json({

                message:
                    result.counted
                        ? "View counted."
                        : "View already counted recently.",

                counted:
                    result.counted,

                movie:
                    updatedMovie
            });

        } catch (error) {

            console.error(
                "View error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to count view."
            });
        }
    }
);


/*
=========================================================
COUNT DOWNLOAD
=========================================================
*/

router.post(
    "/:id/download",
    (req, res) => {

        try {

            const movieId =
                Number(
                    req.params.id
                );

            if (
                !Number.isInteger(movieId) ||
                movieId <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Invalid movie ID."
                });
            }

            const movie =
                Movie.getMovieById(
                    movieId
                );

            if (!movie) {

                return res.status(404).json({
                    message:
                        "Movie not found."
                });
            }

            const updatedMovie =
                Movie.incrementDownloads(
                    movie.id
                );

            res.json({

                message:
                    "Download counted.",

                movie:
                    updatedMovie
            });

        } catch (error) {

            console.error(
                "Download error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to count download."
            });
        }
    }
);


/*
=========================================================
DOWNLOAD ACTUAL MOVIE FILE
=========================================================
*/

router.get(
    "/:id/download",
    (req, res) => {

        try {

            const movieId =
                Number(
                    req.params.id
                );

            if (
                !Number.isInteger(movieId) ||
                movieId <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Invalid movie ID."
                });
            }

            const movie =
                Movie.getMovieById(
                    movieId
                );

            if (!movie) {

                return res.status(404).json({
                    message:
                        "Movie not found."
                });
            }

            if (!movie.video) {

                return res.status(404).json({
                    message:
                        "Movie video file not found."
                });
            }

            const videoFile =
                path.basename(
                    movie.video
                );

            const videoPath =
                path.join(
                    moviesFolder,
                    videoFile
                );

            if (
                !fs.existsSync(
                    videoPath
                )
            ) {

                return res.status(404).json({
                    message:
                        "Movie file does not exist on the server."
                });
            }

            const safeTitle =
                String(
                    movie.title ||
                    "Agasobanuye-Fast-Movie"
                )
                    .replace(
                        /[^a-zA-Z0-9_-]/g,
                        "_"
                    );

            const extension =
                path.extname(
                    videoPath
                ) || ".mp4";

            const downloadName =
                safeTitle +
                extension;

            res.download(
                videoPath,
                downloadName,
                error => {

                    if (error) {

                        console.error(
                            "Movie download error:",
                            error
                        );

                        if (
                            !res.headersSent
                        ) {

                            res.status(500).json({
                                message:
                                    "Failed to download movie."
                            });
                        }
                    }
                }
            );

        } catch (error) {

            console.error(
                "Download file error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to download movie."
            });
        }
    }
);


/*
=========================================================
DELETE MOVIE
=========================================================
*/

router.delete(
    "/:id",
    protectAdmin,
    (req, res) => {

        try {

            const movieId =
                Number(
                    req.params.id
                );

            if (
                !Number.isInteger(movieId) ||
                movieId <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Invalid movie ID."
                });
            }

            const movie =
                Movie.getMovieById(
                    movieId
                );

            if (!movie) {

                return res.status(404).json({
                    message:
                        "Movie not found."
                });
            }

            /*
            ==============================================
            DELETE DATABASE RECORD
            ==============================================
            */

            Movie.deleteMovie(
                movie.id
            );


            /*
            ==============================================
            DELETE VIDEO FILE
            ==============================================
            */

            if (
                movie.video
            ) {

                const videoPath =
                    path.join(
                        moviesFolder,
                        path.basename(
                            movie.video
                        )
                    );

                if (
                    fs.existsSync(
                        videoPath
                    )
                ) {

                    fs.unlinkSync(
                        videoPath
                    );
                }
            }


            /*
            ==============================================
            DELETE COVER IMAGE
            ==============================================
            */

            if (
                movie.cover
            ) {

                const coverPath =
                    path.join(
                        coversFolder,
                        path.basename(
                            movie.cover
                        )
                    );

                if (
                    fs.existsSync(
                        coverPath
                    )
                ) {

                    fs.unlinkSync(
                        coverPath
                    );
                }
            }


            /*
            ==============================================
            RESPONSE
            ==============================================
            */

            res.json({

                message:
                    "Movie deleted successfully.",

                movie
            });

        } catch (error) {

            console.error(
                "Delete movie error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to delete movie."
            });
        }
    }
);


/*
=========================================================
EXPORT ROUTER
=========================================================
*/

module.exports = router;