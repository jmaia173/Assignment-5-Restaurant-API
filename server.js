// published documentation URL
// https://documenter.getpostman.com/view/48299586/2sBXcEm1UC

// Import packages, initialize an express app, and define the port
const express = require("express");
const app = express();
const PORT = 3000;

const { body, validationResult } = require("express-validator");

// Middleware 
app.use(express.json());

// Request Logging Middleware

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();

  console.log("----- Incoming Request -----");
  console.log(`Time: ${timestamp}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.originalUrl}`);

  // Log body only for POST and PUT
  if (req.method === "POST" || req.method === "PUT") {
    console.log("Request Body:", req.body);
  }

  console.log("----------------------------");

  next(); // move to next middleware/route
};

app.use(requestLogger);

// Validation Middleware

const validateMenuItem = [
  body("name")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  body("description")
    .isString()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),

  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number greater than 0"),

  body("category")
    .isIn(["appetizer", "entree", "dessert", "beverage"])
    .withMessage("Category must be appetizer, entree, dessert, or beverage"),

  body("ingredients")
    .isArray({ min: 1 })
    .withMessage("Ingredients must be an array with at least one item"),

  body("available")
    .optional()
    .isBoolean()
    .withMessage("Available must be true or false"),

  // Final middleware to check errors
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    // default value if not provided
    if (req.body.available === undefined) {
      req.body.available = true;
    }

    next();
  }
];

// Data for the server
let menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];


// ROUTES

// GET /api/menu - Retrieve all menu items
app.get("/api/menu", (req, res) => {
  res.json(menuItems);
});


// GET /api/menu/:id - Retrieve a specific menu item
app.get("/api/menu/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const item = menuItems.find(menuItem => menuItem.id === id);

  if (!item) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  res.json(item);
});


// POST /api/menu - Add a new menu item
app.post("/api/menu", validateMenuItem, (req, res) => {
  const newItem = req.body;

  // Create new ID
  const newId =
    menuItems.length > 0
      ? Math.max(...menuItems.map(item => item.id)) + 1
      : 1;

  newItem.id = newId;

  menuItems.push(newItem);

  res.status(201).json(newItem);
});


// PUT /api/menu/:id - Update an existing menu item
app.put("/api/menu/:id", validateMenuItem, (req, res) => {
  const id = parseInt(req.params.id);
  const updatedData = req.body;

  const index = menuItems.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  // Update item while keeping existing id
  menuItems[index] = {
    ...menuItems[index],
    ...updatedData,
    id
  };

  res.status(200).json(menuItems[index]);
});


// DELETE /api/menu/:id - Remove a menu item
app.delete("/api/menu/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = menuItems.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  const deletedItem = menuItems.splice(index, 1);

  res.status(200).json({
  message: "Menu item deleted",
  item: deletedItem[0]
});
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});