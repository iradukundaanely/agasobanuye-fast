const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", (req, res) => {
    try {
        const username = String(
            req.body.username || ""
        ).trim();

        const password = String(
            req.body.password || ""
        );

        if (
            username !== process.env.ADMIN_USERNAME ||
            password !== process.env.ADMIN_PASSWORD
        ) {
            return res.status(401).json({
                message: "Invalid username or password."
            });
        }

        const token = jwt.sign(
            {
                username: username,
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        res.json({
            message: "Login successful.",
            token: token
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed."
        });
    }
});

module.exports = router;