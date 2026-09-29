"use strict";

const jwt = require("jsonwebtoken");

function requireAdmin(req, res, next) {

    try {

        const authorization =
            req.headers.authorization || "";

        if (!authorization) {

            return res.status(401).json({
                message: "Admin authentication required."
            });
        }


        const parts =
            authorization.split(" ");


        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {

            return res.status(401).json({
                message: "Invalid authorization format."
            });
        }


        const token =
            parts[1];


        if (!token) {

            return res.status(401).json({
                message: "Admin token is missing."
            });
        }


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        if (
            decoded.role !== "admin"
        ) {

            return res.status(403).json({
                message: "Admin access required."
            });
        }


        req.admin =
            decoded;


        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );


        if (
            error.name ===
            "TokenExpiredError"
        ) {

            return res.status(401).json({
                message:
                    "Admin session expired. Please login again."
            });
        }


        return res.status(401).json({
            message:
                "Invalid or expired admin token."
        });
    }
}


module.exports = requireAdmin;