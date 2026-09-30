"use strict";

/* =========================================================
   AGASOBANUYE FAST
   MAIN APPLICATION
   PUBLIC + WATCH + ADMIN
   ========================================================= */

const API = "https://agasobanuye-fast.onrender.com/api";
const SERVER = "http://localhost:5000";


/* =========================================================
   CLICKABLE MOVIE PLAY TRIANGLE
   ========================================================= */

(function installMoviePlayButtonStyle() {

    if (document.getElementById("agasobanuyeMoviePlayStyle")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "agasobanuyeMoviePlayStyle";

    style.textContent = `
        .movie-poster {
            position: relative;
        }

        .movie-play-button {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);

            width: 68px;
            height: 68px;

            border: none;
            border-radius: 50%;

            background: rgba(0, 0, 0, 0.25);

            cursor: pointer;

            display: flex;
            align-items: center;
            justify-content: center;

            z-index: 100;
            padding: 0;
            margin: 0;

            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

            transition:
                transform 0.2s ease,
                background 0.2s ease,
                box-shadow 0.2s ease;
        }

        .movie-play-button::before {
            content: "";

            width: 0;
            height: 0;

            border-top: 17px solid transparent;
            border-bottom: 17px solid transparent;
            border-left: 27px solid #3478ff;

            margin-left: 6px;

            filter:
                drop-shadow(
                    0 4px 10px
                    rgba(52, 120, 255, 0.7)
                );
        }

        .movie-play-button:hover {
            transform: translate(-50%, -50%) scale(1.12);
            background: rgba(0, 0, 0, 0.4);
            box-shadow:
                0 15px 40px
                rgba(52, 120, 255, 0.45);
        }

        .movie-play-button:active {
            transform: translate(-50%, -50%) scale(0.95);
        }

        .movie-play-button:focus {
            outline: none;
        }

        .movie-play-button:focus-visible {
            outline: 3px solid white;
            outline-offset: 4px;
        }
    `;

    document.head.appendChild(style);

})();


/* =========================================================
   HELPERS
   ========================================================= */

function getToken() {
    return localStorage.getItem("adminToken") || "";
}


function authHeaders() {

    const token = getToken();

    return token
        ? {
            Authorization: `Bearer ${token}`
        }
        : {};
}


function mediaURL(url) {

    if (!url) {
        return "";
    }

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return SERVER + url;
}


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatBytes(bytes) {

    if (!bytes || bytes <= 0) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB",
        "TB"
    ];

    const index = Math.min(
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        ),
        units.length - 1
    );

    return (
        bytes /
        Math.pow(1024, index)
    ).toFixed(
        index === 0 ? 0 : 2
    ) +
    " " +
    units[index];
}


function sleep(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}


/* =========================================================
   LOAD MOVIES
   ========================================================= */

async function fetchMovies() {

    const response = await fetch(
        `${API}/movies`
    );

    const data =
        await response.json();

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Could not load movies."
        );
    }

    return data;
}


/* =========================================================
   MOVIE CARD
   ========================================================= */

function createMovieCard(movie) {

    const card =
        document.createElement("article");

    card.className =
        "movie-card";

    const category =
        movie.category ||
        "Movie";

    const cover =
        mediaURL(
            movie.cover
        );

    card.innerHTML = `

        <div class="movie-poster">

            ${
                cover

                ?

                `
                    <img
                        src="${escapeHTML(cover)}"
                        alt="${escapeHTML(movie.title)}"
                        loading="lazy"
                    >
                `

                :

                `
                    <div class="movie-poster-placeholder">
                        🎬
                    </div>
                `
            }

            <button
                type="button"
                class="movie-play-button"
                data-movie-id="${movie.id}"
                aria-label="Play ${escapeHTML(movie.title)}"
                title="Play movie"
            ></button>

            <span class="movie-badge">
                ${escapeHTML(category)}
            </span>

        </div>


        <div class="movie-content">

            <h3
                title="${escapeHTML(movie.title)}"
            >
                ${escapeHTML(movie.title)}
            </h3>


            <div class="movie-meta">

                <span>
                    ${movie.year || ""}
                </span>

                <span>•</span>

                <span>
                    ${escapeHTML(category)}
                </span>

                <span>•</span>

                <span>
                    HD
                </span>

            </div>


            <div class="movie-stats">

                <span>
                    👁 ${movie.views || 0}
                </span>

                <span>
                    ⬇ ${movie.downloads || 0}
                </span>

            </div>


            <a
                class="watch-small"
                href="watch.html?id=${movie.id}"
            >
                ▶ Watch
            </a>

        </div>
    `;

    return card;
}


/* =========================================================
   CLICKABLE MOVIE TRIANGLE
   ========================================================= */

document.addEventListener("click", function (event) {

    const playButton =
        event.target.closest(".movie-play-button");

    if (!playButton) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const movieId =
        playButton.dataset.movieId;

    if (!movieId) {
        return;
    }

    sessionStorage.setItem(
        "agasobanuyeAutoplayMovie",
        String(movieId)
    );

    window.location.href =
        `watch.html?id=${encodeURIComponent(movieId)}&autoplay=1`;
});


/* =========================================================
   RENDER MOVIES
   ========================================================= */

function renderMovies(
    container,
    movies
) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !Array.isArray(movies) ||
        !movies.length
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No movies found
                </h3>

                <p>
                    Movies will appear here
                    when they are uploaded.
                </p>

            </div>

        `;

        return;
    }

    movies.forEach(
        movie => {

            container.appendChild(
                createMovieCard(movie)
            );

        }
    );
}


/* =========================================================
   HOME PAGE
   ========================================================= */

async function initializeHomePage() {

    const latestContainer =
        document.getElementById(
            "latestMovies"
        );

    const uninterpretedContainer =
        document.getElementById(
            "uninterpretedMovies"
        );

    const kinyarwandaContainer =
        document.getElementById(
            "kinyarwandaMovies"
        );

    /*
     * Your newer index.html may use movieGrid
     * instead of latestMovies.
     */

    const movieGrid =
        document.getElementById(
            "movieGrid"
        );

    if (
        !latestContainer &&
        !uninterpretedContainer &&
        !kinyarwandaContainer &&
        !movieGrid
    ) {
        return;
    }

    try {

        const movies =
            await fetchMovies();


        if (latestContainer) {

            renderMovies(
                latestContainer,
                movies.slice(0, 20)
            );

        }


        if (movieGrid) {

            renderMovies(
                movieGrid,
                movies
            );

        }


        if (uninterpretedContainer) {

            const filtered =
                movies.filter(
                    movie =>
                        String(
                            movie.category || ""
                        )
                        .toLowerCase()
                        .includes(
                            "uninterpreted"
                        )
                );

            renderMovies(
                uninterpretedContainer,
                filtered.slice(0, 20)
            );

        }


        if (kinyarwandaContainer) {

            const filtered =
                movies.filter(
                    movie =>
                        String(
                            movie.category || ""
                        )
                        .toLowerCase()
                        .includes(
                            "kinyarwanda"
                        )
                );

            renderMovies(
                kinyarwandaContainer,
                filtered.slice(0, 20)
            );

        }

    } catch (error) {

        console.error(
            "Home movies error:",
            error
        );

        const container =
            latestContainer ||
            movieGrid;

        if (container) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        Could not load movies
                    </h3>

                    <p>
                        Make sure the Agasobanuye
                        Fast server is running.
                    </p>

                </div>

            `;
        }
    }
}


/* =========================================================
   SEARCH
   ========================================================= */

function initializeSearch() {

    const searchInputs = [
        document.getElementById(
            "movieSearch"
        ),
        document.getElementById(
            "searchInput"
        ),
        document.getElementById(
            "mainSearchInput"
        )
    ].filter(Boolean);


    if (!searchInputs.length) {
        return;
    }


    let timer;


    searchInputs.forEach(
        input => {

            input.addEventListener(
                "input",
                function () {

                    clearTimeout(timer);


                    timer = setTimeout(
                        async () => {

                            const search =
                                input.value
                                    .trim()
                                    .toLowerCase();


                            try {

                                const response =
                                    await fetch(
                                        `${API}/movies?search=${encodeURIComponent(search)}`
                                    );


                                const movies =
                                    await response.json();


                                const containers = [
                                    document.getElementById(
                                        "allMovies"
                                    ),
                                    document.getElementById(
                                        "movieGrid"
                                    )
                                ];


                                containers
                                    .filter(Boolean)
                                    .forEach(
                                        container =>
                                            renderMovies(
                                                container,
                                                movies
                                            )
                                    );


                            } catch (error) {

                                console.error(
                                    "Search error:",
                                    error
                                );

                            }

                        },
                        250
                    );

                }
            );

        }
    );
}


/* =========================================================
   ALL MOVIES PAGE
   ========================================================= */

async function initializeAllMoviesPage() {

    const container =
        document.getElementById(
            "allMovies"
        );

    if (!container) {
        return;
    }

    try {

        const movies =
            await fetchMovies();

        let currentCategory =
            "all";

        const params =
            new URLSearchParams(
                window.location.search
            );

        currentCategory =
            params.get(
                "category"
            ) || "all";


        const searchInput =
            document.getElementById(
                "movieSearch"
            );


        function render() {

            let filtered =
                [...movies];


            if (
                currentCategory !==
                "all"
            ) {

                filtered =
                    filtered.filter(
                        movie =>
                            String(
                                movie.category || ""
                            ).toLowerCase() ===
                            currentCategory
                                .toLowerCase()
                    );

            }


            if (
                searchInput &&
                searchInput.value.trim()
            ) {

                const search =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                filtered =
                    filtered.filter(
                        movie => {

                            return (

                                String(
                                    movie.title || ""
                                )
                                .toLowerCase()
                                .includes(search)

                                ||

                                String(
                                    movie.category || ""
                                )
                                .toLowerCase()
                                .includes(search)

                                ||

                                String(
                                    movie.actors || ""
                                )
                                .toLowerCase()
                                .includes(search)

                                ||

                                String(
                                    movie.year || ""
                                )
                                .includes(search)

                            );

                        }
                    );

            }


            renderMovies(
                container,
                filtered
            );
                    }


        document
            .querySelectorAll(
                ".filter-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            currentCategory =
                                button.dataset
                                    .category ||
                                "all";


                            document
                                .querySelectorAll(
                                    ".filter-button"
                                )
                                .forEach(
                                    b =>
                                        b.classList
                                            .remove(
                                                "active"
                                            )
                                );


                            button.classList.add(
                                "active"
                            );


                            render();

                        }
                    );

                }
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                render
            );

        }


        render();

    } catch (error) {

        console.error(
            "All movies error:",
            error
        );

    }
}


/* =========================================================
   WATCH PAGE
   ========================================================= */

async function initializeWatchPage() {

    const video =
        document.getElementById(
            "moviePlayer"
        );

    if (!video) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const movieId =
        params.get("id");


    if (!movieId) {

        console.error(
            "No movie ID in URL."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API}/movies/${movieId}`
            );


        const movie =
            await response.json();


        if (!response.ok) {

            throw new Error(
                movie.message ||
                "Movie not found."
            );

        }


        /* VIDEO */

        const videoURL =
            mediaURL(
                movie.video
            );


        video.src =
            videoURL;


        video.preload =
            "auto";


        video.controls =
            true;


        video.setAttribute(
            "playsinline",
            ""
        );


        /*
         * Automatically start the movie when
         * the blue play triangle was clicked.
         *
         * Muted autoplay is used because browsers
         * can block autoplay when sound is enabled.
         */

        const autoplayRequested =
            params.get("autoplay") === "1";


        if (autoplayRequested) {

            video.autoplay =
                true;

            video.muted =
                true;

            video.load();

            video.play()
                .then(() => {

                    console.log(
                        "Movie autoplay started."
                    );

                })
                .catch(error => {

                    console.log(
                        "Autoplay was blocked:",
                        error.message
                    );

                });

        }


        /* TITLE */

        setText(
            "movieTitle",
            movie.title
        );


        setText(
            "movieYear",
            movie.year
        );


        setText(
            "movieCategory",
            movie.category
        );


        setText(
            "movieActors",
            movie.actors ||
            "Not specified"
        );


        setText(
            "movieDescription",
            movie.description ||
            "No description available."
        );


        setText(
            "movieLanguage",
            movie.language ||
            "Kinyarwanda"
        );


        setText(
            "movieViews",
            movie.views || 0
        );


        setText(
            "movieDownloads",
            movie.downloads || 0
        );


        /* COVER */

        const cover =
            document.getElementById(
                "movieCover"
            );


        if (cover) {

            cover.src =
                mediaURL(
                    movie.cover
                );

        }


        /* VIEW */

        recordMovieView(
            movieId
        );


        /* RELATED */

        await loadRelatedMovies(
            movie
        );


        /* DOWNLOAD */

        initializeDownload(
            movie
        );


    } catch (error) {

        console.error(
            "Watch page error:",
            error
        );


        video.insertAdjacentHTML(
            "beforebegin",
            `

                <div class="empty-state">

                    <h3>
                        Movie could not be loaded
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>

            `
        );

    }
}


/* =========================================================
   SET TEXT
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ?? "";

    }
}


/* =========================================================
   RECORD VIEW
   ========================================================= */

async function recordMovieView(
    movieId
) {

    let visitorId =
        localStorage.getItem(
            "agasobanuyeVisitorId"
        );


    if (!visitorId) {

        if (
            window.crypto &&
            typeof crypto.randomUUID ===
            "function"
        ) {

            visitorId =
                crypto.randomUUID();

        } else {

            visitorId =
                Date.now() +
                "-" +
                Math.random();

        }


        localStorage.setItem(
            "agasobanuyeVisitorId",
            visitorId
        );

    }


    try {

        const response =
            await fetch(
                `${API}/movies/${movieId}/view`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            visitorId
                        })

                }
            );


        const data =
            await response.json();


        if (
            data.movie
        ) {

            setText(
                "movieViews",
                data.movie.views || 0
            );

        }


    } catch (error) {

        console.error(
            "View error:",
            error
        );

    }
}


/* =========================================================
   RELATED MOVIES
   ========================================================= */

async function loadRelatedMovies(
    currentMovie
) {

    const container =
        document.getElementById(
            "relatedMovies"
        );


    if (!container) {
        return;
    }


    try {

        const movies =
            await fetchMovies();


        let related =
            movies
                .filter(
                    movie =>
                        Number(movie.id) !==
                        Number(currentMovie.id)
                )
                .filter(
                    movie =>
                        String(
                            movie.category || ""
                        ).toLowerCase() ===
                        String(
                            currentMovie.category || ""
                        ).toLowerCase()
                )
                .slice(0, 8);


        /*
         * If there aren't enough movies
         * in the same category, show
         * other movies too.
         */

        if (
            related.length < 4
        ) {

            const additional =
                movies
                    .filter(
                        movie =>
                            Number(movie.id) !==
                            Number(currentMovie.id)
                    )
                    .filter(
                        movie =>
                            !related.some(
                                item =>
                                    Number(item.id) ===
                                    Number(movie.id)
                            )
                    )
                    .slice(
                        0,
                        8 - related.length
                    );


            related =
                related.concat(
                    additional
                );

        }


        renderMovies(
            container,
            related
        );


    } catch (error) {

        console.error(
            "Related movies error:",
            error
        );

    }
}


/* =========================================================
   DOWNLOAD MOVIE
   ========================================================= */

function initializeDownload(
    movie
) {

    const button =
        document.getElementById(
            "downloadButton"
        );


    if (!button) {
        return;
    }


    /*
     * Prevent duplicate listeners.
     */

    if (
        button.dataset.downloadReady ===
        "true"
    ) {
        return;
    }


    button.dataset.downloadReady =
        "true";


    button.addEventListener(
        "click",
        async function () {

            try {

                button.disabled =
                    true;

                button.textContent =
                    "⏳ Preparing...";


                /*
                 * First count the download.
                 *
                 * Your existing backend has:
                 * POST /api/movies/:id/download
                 */

                const countResponse =
                    await fetch(
                        `${API}/movies/${movie.id}/download`,
                        {
                            method: "POST"
                        }
                    );


                const countData =
                    await countResponse
                        .json()
                        .catch(
                            () => ({})
                        );


                if (
                    !countResponse.ok
                ) {

                    throw new Error(
                        countData.message ||
                        "Could not count download."
                    );

                }


                /*
                 * Update the number on screen.
                 */

                if (
                    countData.movie
                ) {

                    setText(
                        "movieDownloads",
                        countData.movie.downloads ||
                        0
                    );

                } else {

                    setText(
                        "movieDownloads",
                        Number(
                            movie.downloads || 0
                        ) + 1
                    );

                }


                /*
                 * IMPORTANT:
                 *
                 * The GET route downloads
                 * the actual movie file.
                 */

                const downloadURL =
                    `${API}/movies/${movie.id}/download`;


                /*
                 * Navigate directly to the
                 * server download route.
                 *
                 * This is much more reliable
                 * for large movie files than
                 * fetch/blob downloading.
                 */

                window.location.href =
                    downloadURL;


                button.textContent =
                    "✅ Download Started";


                setTimeout(
                    () => {

                        button.disabled =
                            false;

                        button.textContent =
                            "⬇ Download";

                    },
                    2500
                );


            } catch (error) {

                console.error(
                    "Download error:",
                    error
                );


                /*
                 * Fallback:
                 * if the GET download route
                 * hasn't been added yet,
                 * use the direct video file.
                 */

                if (
                    movie.video
                ) {

                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =
                        mediaURL(
                            movie.video
                        );


                    link.download =
                        `${
                            movie.title ||
                            "movie"
                        }.mp4`;


                    link.target =
                        "_blank";


                    document.body.appendChild(
                        link
                    );


                    link.click();


                    link.remove();


                    button.textContent =
                        "⬇ Download";


                    button.disabled =
                        false;

                    return;
                }


                button.disabled =
                    false;


                button.textContent =
                    "⬇ Download";


                alert(
                    "Download failed: " +
                    error.message
                );

            }

        }
    );
}


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

async function initializeAdminPage() {

    const loginSection =
        document.getElementById(
            "loginSection"
        );


    const dashboardSection =
        document.getElementById(
            "dashboardSection"
        );


    if (
        !loginSection ||
        !dashboardSection
    ) {
        return;
    }


    /*
     * Existing login session.
     */

    if (getToken()) {

        loginSection.style.display =
            "none";

        dashboardSection.style.display =
            "block";

        await loadAdminDashboard();

    }


    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const username =
                    document.getElementById(
                        "username"
                    ).value.trim();


                const password =
                    document.getElementById(
                        "password"
                    ).value;


                const message =
                    document.getElementById(
                        "loginMessage"
                    );


                message.textContent =
                    "Checking login...";


                try {

                    const response =
                        await fetch(
                            `${API}/auth/login`,
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        username,
                                        password
                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Login failed."
                        );

                    }


                    const token =
                        data.token ||
                        data.accessToken;


                    if (!token) {

                        throw new Error(
                            "No login token received."
                        );

                    }


                    localStorage.setItem(
                        "adminToken",
                        token
                    );


                    loginSection.style.display =
                        "none";

                    dashboardSection.style.display =
                        "block";


                    await loadAdminDashboard();


                } catch (error) {

                    message.textContent =
                        error.message;

                }

            }
        );

    }


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "adminToken"
                );

                location.reload();

            }
        );

    }


    initializeAdminUpload();
}


/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */

async function loadAdminDashboard() {

    await loadAdminMovies();

    await loadAdminAnalytics();

}


/* =========================================================
   ADMIN MOVIES
   ========================================================= */

async function loadAdminMovies() {

    try {

        const movies =
            await fetchMovies();


        const count =
            document.getElementById(
                "movieCount"
            );


        if (count) {

            count.textContent =
                movies.length;

        }


        const libraryCount =
            document.getElementById(
                "libraryCount"
            );


        if (libraryCount) {

            libraryCount.textContent =
                movies.length;

        }


        const container =
            document.getElementById(
                "adminMovies"
            );


        if (!container) {
            return;
        }


        if (!movies.length) {

            container.innerHTML = `

                <div class="admin-empty">

                    <div class="admin-empty-icon">
                        🎬
                    </div>

                    <h3>
                        No movies yet
                    </h3>

                    <p>
                        Upload your first movie
                        using the panel above.
                    </p>

                </div>

            `;

            return;
        }


        container.innerHTML =
            movies.map(
                movie => `

                    <div class="admin-movie-row">

                        <img
                            src="${escapeHTML(
                                mediaURL(
                                    movie.cover
                                )
                            )}"
                            alt=""
                            class="admin-movie-image"
                        >


                        <div
                            class="admin-movie-info"
                        >

                            <h3>
                                ${escapeHTML(
                                    movie.title
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    movie.category
                                )}
                                •
                                ${movie.year}
                            </p>


                            <div
                                class="admin-movie-stats"
                            >

                                <span>
                                    👁
                                    ${movie.views || 0}
                                </span>

                                <span>
                                    ⬇
                                    ${movie.downloads || 0}
                                </span>

                            </div>

                        </div>


                        <a
                            href="watch.html?id=${movie.id}"
                            class="admin-watch"
                            target="_blank"
                        >
                            Watch
                        </a>


                        <button
                            class="admin-delete"
                            onclick="deleteMovie(${movie.id})"
                        >
                            Delete
                        </button>

                    </div>

                `
            ).join("");


    } catch (error) {

        console.error(
            "Admin movie error:",
            error
        );

    }
}


/* =========================================================
   ANALYTICS
   ========================================================= */

async function loadAdminAnalytics() {

    try {

        const response =
            await fetch(
                `${API}/analytics`,
                {
                    headers:
                        authHeaders()
                }
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        setText(
            "movieCount",
            data.movieCount ?? 0
        );


        setText(
            "viewCount",
            data.viewCount ?? 0
        );


        setText(
            "visitorCount",
            data.uniqueVisitors ?? 0
        );


    } catch (error) {

        console.error(
            "Analytics error:",
            error
        );

    }
}


/* =========================================================
   DELETE MOVIE
   ========================================================= */

async function deleteMovie(
    id
) {

    if (
        !confirm(
            "Are you sure you want to delete this movie?"
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/movies/${id}`,
                {

                    method: "DELETE",

                    headers:
                        authHeaders()

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Delete failed."
            );

        }


        await loadAdminDashboard();


    } catch (error) {

        alert(
            error.message
        );

    }
}


window.deleteMovie =
    deleteMovie;


/* =========================================================
   ADMIN RESUMABLE UPLOAD
   ========================================================= */

let uploadState = {

    uploadId: null,

    file: null,

    chunkSize:
        25 * 1024 * 1024,

    offset: 0,

    paused: false,

    cancelled: false,

    uploading: false
};


/* =========================================================
   INITIALIZE UPLOAD
   ========================================================= */

function initializeAdminUpload() {

    const form =
        document.getElementById(
            "movieUploadForm"
        );


    if (!form) {
        return;
    }


    const pauseButton =
        document.getElementById(
            "pauseUploadButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelUploadButton"
        );


    if (pauseButton) {

        pauseButton.addEventListener(
            "click",
            togglePauseUpload
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            cancelUpload
        );

    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (
                uploadState.uploading
            ) {
                return;
            }


            const movieFileInput =
                document.getElementById(
                    "movieFile"
                );


            const coverInput =
                document.getElementById(
                    "movieCover"
                );


            const file =
                movieFileInput &&
                movieFileInput.files[0];


            const cover =
                coverInput &&
                coverInput.files[0];


            if (!file) {

                alert(
                    "Please select a movie."
                );

                return;
            }


            if (!cover) {

                alert(
                    "Please select a cover."
                );

                return;
            }


            const maxSize =
                100 *
                1024 *
                1024 *
                1024;


            if (
                file.size >
                maxSize
            ) {

                alert(
                    "Maximum movie size is 100 GB."
                );

                return;
            }


            uploadState.file =
                file;


            uploadState.offset =
                0;


            uploadState.paused =
                false;


            uploadState.cancelled =
                false;


            try {

                await startUpload(
                    cover
                );

            } catch (error) {

                console.error(
                    error
                );

                showUploadMessage(
                    error.message
                );

                uploadState.uploading =
                    false;

            }

        }
    );
}


/* =========================================================
   START UPLOAD
   ========================================================= */

async function startUpload(
    cover
) {

    const file =
        uploadState.file;


    const formData =
        new FormData();


    formData.append(
        "cover",
        cover
    );


    formData.append(
        "title",
        document.getElementById(
            "movieTitle"
        ).value.trim()
    );


    formData.append(
        "year",
        document.getElementById(
            "movieYear"
        ).value
    );


    formData.append(
        "category",
        document.getElementById(
            "movieCategory"
        ).value.trim()
    );


    formData.append(
        "actors",
        document.getElementById(
            "movieActors"
        ).value.trim()
    );


    formData.append(
        "language",
        document.getElementById(
            "movieLanguage"
        ).value
    );


    formData.append(
        "description",
        document.getElementById(
            "movieDescription"
        ).value.trim()
    );


    formData.append(
        "fileName",
        file.name
    );


    formData.append(
        "fileSize",
        String(file.size)
    );


    showUploadInterface();


    setUploadMessage(
        "Preparing upload..."
    );


    const response =
        await fetch(
            `${API}/movies/upload/start`,
            {

                method: "POST",

                headers:
                    authHeaders(),

                body: formData

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Could not start upload."
        );

    }


    uploadState.uploadId =
        data.uploadId;


    uploadState.chunkSize =
        data.chunkSize ||
        25 * 1024 * 1024;


    uploadState.offset =
        data.uploadedBytes ||
        0;


    uploadState.uploading =
        true;


    await uploadChunks();
}


/* =========================================================
   UPLOAD CHUNKS
   ========================================================= */

async function uploadChunks() {
    const file =
        uploadState.file;


    while (
        uploadState.offset <
        file.size
    ) {

        if (
            uploadState.cancelled
        ) {
            return;
        }


        if (
            uploadState.paused
        ) {

            uploadState.uploading =
                false;

            return;
        }


        const start =
            uploadState.offset;


        const end =
            Math.min(
                start +
                uploadState.chunkSize,
                file.size
            );


        const chunk =
            file.slice(
                start,
                end
            );


        updateUploadProgress();


        try {

            const response =
                await fetch(
                    `${API}/movies/upload/${uploadState.uploadId}/chunk`,
                    {

                        method: "POST",

                        headers: {

                            ...authHeaders(),

                            "Content-Type":
                                "application/octet-stream",

                            "X-Upload-Offset":
                                String(start)

                        },

                        body: chunk

                    }
                );


            const data =
                await response.json();


            if (
                response.status ===
                409
            ) {

                uploadState.offset =
                    Number(
                        data.currentOffset
                    );

                continue;
            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Chunk upload failed."
                );

            }


            uploadState.offset =
                Number(
                    data.uploadedBytes
                );


            updateUploadProgress();


        } catch (error) {

            console.error(
                "Chunk upload error:",
                error
            );


            setUploadMessage(
                "Connection interrupted. Checking upload..."
            );


            await sleep(2000);


            try {

                await refreshUploadStatus();

            } catch (
                statusError
            ) {

                console.error(
                    statusError
                );

                await sleep(3000);

            }

        }

    }


    await completeUpload();
}


/* =========================================================
   UPLOAD STATUS
   ========================================================= */

async function refreshUploadStatus() {

    const response =
        await fetch(
            `${API}/movies/upload/${uploadState.uploadId}/status`,
            {

                headers:
                    authHeaders()

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Could not check upload."
        );

    }


    uploadState.offset =
        Number(
            data.uploadedBytes ||
            0
        );


    updateUploadProgress();
}


/* =========================================================
   COMPLETE UPLOAD
   ========================================================= */

async function completeUpload() {

    setUploadMessage(
        "Finishing movie..."
    );


    const response =
        await fetch(
            `${API}/movies/upload/${uploadState.uploadId}/complete`,
            {

                method: "POST",

                headers:
                    authHeaders()

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Could not finish upload."
        );

    }


    uploadState.uploading =
        false;


    updateUploadProgress(
        100
    );


    setUploadMessage(
        "✓ Movie uploaded successfully!"
    );


    await loadAdminDashboard();


    setTimeout(
        resetUploadForm,
        1500
    );
}


/* =========================================================
   PAUSE / RESUME UPLOAD
   ========================================================= */

async function togglePauseUpload() {

    if (
        !uploadState.uploadId
    ) {
        return;
    }


    const button =
        document.getElementById(
            "pauseUploadButton"
        );


    if (
        uploadState.paused
    ) {

        uploadState.paused =
            false;


        uploadState.uploading =
            true;


        if (button) {

            button.textContent =
                "Pause";

        }


        await refreshUploadStatus();


        uploadChunks();


    } else {

        uploadState.paused =
            true;


        if (button) {

            button.textContent =
                "Resume";

        }


        setUploadMessage(
            "Upload paused."
        );

    }
}


/* =========================================================
   CANCEL UPLOAD
   ========================================================= */

async function cancelUpload() {

    if (
        !uploadState.uploadId
    ) {

        resetUploadForm();

        return;
    }


    if (
        !confirm(
            "Cancel this upload?"
        )
    ) {
        return;
    }


    uploadState.cancelled =
        true;


    uploadState.uploading =
        false;


    try {

        await fetch(
            `${API}/movies/upload/${uploadState.uploadId}`,
            {

                method: "DELETE",

                headers:
                    authHeaders()

            }
        );


    } catch (error) {

        console.error(
            error
        );

    }


    resetUploadForm();
}


/* =========================================================
   UPLOAD UI
   ========================================================= */

function showUploadInterface() {

    const info =
        document.getElementById(
            "uploadInfo"
        );


    const pause =
        document.getElementById(
            "pauseUploadButton"
        );


    const cancel =
        document.getElementById(
            "cancelUploadButton"
        );


    if (info) {

        info.style.display =
            "block";

    }


    if (pause) {

        pause.style.display =
            "inline-flex";

    }


    if (cancel) {

        cancel.style.display =
            "inline-flex";

    }
}


function updateUploadProgress(
    forced = null
) {

    if (
        !uploadState.file
    ) {
        return;
    }


    const percent =
        forced !== null
            ? forced
            : (
                uploadState.offset /
                uploadState.file.size *
                100
            );


    const bar =
        document.getElementById(
            "uploadProgressBar"
        );


    const text =
        document.getElementById(
            "uploadPercent"
        );


    const details =
        document.getElementById(
            "uploadDetails"
        );


    if (bar) {

        bar.style.width =
            `${percent}%`;

    }


    if (text) {

        text.textContent =
            `${Number(percent).toFixed(1)}%`;

    }


    if (details) {

        details.textContent =
            `${formatBytes(
                uploadState.offset
            )} / ${formatBytes(
                uploadState.file.size
            )}`;

    }
}


function showUploadMessage(
    message
) {

    const element =
        document.getElementById(
            "uploadMessage"
        );


    if (element) {

        element.textContent =
            message;

    }
}


function setUploadMessage(
    message
) {

    showUploadMessage(
        message
    );
}


/* =========================================================
   RESET UPLOAD
   ========================================================= */

function resetUploadForm() {

    const form =
        document.getElementById(
            "movieUploadForm"
        );


    if (form) {

        form.reset();

    }


    uploadState = {

        uploadId: null,

        file: null,

        chunkSize:
            25 * 1024 * 1024,

        offset: 0,

        paused: false,

        cancelled: false,

        uploading: false

    };


    const info =
        document.getElementById(
            "uploadInfo"
        );


    const pause =
        document.getElementById(
            "pauseUploadButton"
        );


    const cancel =
        document.getElementById(
            "cancelUploadButton"
        );


    if (info) {

        info.style.display =
            "none";

    }


    if (pause) {

        pause.style.display =
            "none";

        pause.textContent =
            "Pause";

    }


    if (cancel) {

        cancel.style.display =
            "none";

    }


    const bar =
        document.getElementById(
            "uploadProgressBar"
        );


    if (bar) {

        bar.style.width =
            "0%";

    }


    setText(
        "uploadPercent",
        "0%"
    );


    setText(
        "uploadDetails",
        "Waiting..."
    );


    setUploadMessage(
        ""
    );
}


/* =========================================================
   START EVERYTHING
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeHomePage();

        initializeSearch();

        initializeAllMoviesPage();

        initializeWatchPage();

        initializeAdminPage();

    }
);
document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeHomePage();

        initializeSearch();

        initializeAllMoviesPage();

        initializeWatchPage();

        initializeAdminPage();

    }
);