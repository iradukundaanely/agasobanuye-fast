const express = require("express");

const Category = require("../models/Category");
const protectAdmin = require("../middleware/auth");

const router = express.Router();

/*
GET ALL CATEGORIES
*/

router.get("/", (req, res) => {
    try {
        const categories =
            Category.getAllCategories();

        res.json(categories);

    } catch (error) {
        console.error(
            "Category loading error:",
            error
        );

        res.status(500).json({
            message: "Could not load categories."
        });
    }
});


/*
CREATE CATEGORY
*/

router.post("/", protectAdmin, (req, res) => {
    try {
        const name = String(
            req.body.name || ""
        ).trim();

        if (!name) {
            return res.status(400).json({
                message: "Category name is required."
            });
        }

        const existing =
            Category.findCategoryByName(name);

        if (existing) {
            return res.status(409).json({
                message: "Category already exists."
            });
        }

        const category =
            Category.createCategory(name);

        res.status(201).json({
            message:
                "Category created successfully.",
            category
        });

    } catch (error) {
        console.error(
            "Category creation error:",
            error
        );

        res.status(500).json({
            message: "Could not create category."
        });
    }
});


/*
DELETE CATEGORY
*/

router.delete(
    "/:id",
    protectAdmin,
    (req, res) => {
        try {
            const category =
                Category.getCategoryById(
                    req.params.id
                );

            if (!category) {
                return res.status(404).json({
                    message:
                        "Category not found."
                });
            }

            const movieCount =
                Category.countMoviesUsingCategory(
                    category.name
                );

            if (movieCount > 0) {
                return res.status(400).json({
                    message:
                        `Cannot delete this category because ${movieCount} movie(s) are using it.`
                });
            }

            Category.deleteCategory(
                req.params.id
            );

            res.json({
                message:
                    "Category deleted successfully."
            });

        } catch (error) {
            console.error(
                "Category deletion error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not delete category."
            });
        }
    }
);

module.exports = router;