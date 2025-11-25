import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to recipes.json
const filePath = path.join(__dirname, "data", "recipes.json");

// ===== Root Route =====
app.get("/", (req, res) => {
  res.send("🍽️ Recipe API is running! Use /api/recipes to GET or POST recipes.");
});

// ===== Get All Recipes =====
app.get("/api/recipes", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    try {
      const recipes = JSON.parse(data);
      res.json(recipes);
    } catch {
      res.status(500).json({ message: "JSON file corrupted" });
    }
  });
});

// ===== Add New Recipe =====
app.post("/api/recipes", (req, res) => {
  const { title, ingredients, instructions, cookTime, difficulty } = req.body;

  if (!title || !ingredients || !instructions) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const newRecipe = {
    id: Date.now(),
    title,
    ingredients,
    instructions,
    cookTime: cookTime || "",
    difficulty: difficulty || "medium"
  };

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Server error" });

    let recipes = JSON.parse(data);
    recipes.push(newRecipe);

    fs.writeFile(filePath, JSON.stringify(recipes, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing file" });
      res.status(201).json(newRecipe);
    });
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
