const express = require("express");
const {
  createOption2Category,
  getAllOption2Categories,
  getOption2CategoryById,
  getOption2CategoryWithOptions,
  updateOption2Category,
  deleteOption2Category
} = require("../controllers/option2CategoriesController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, createOption2Category);
router.get("/",authMiddleware,  getAllOption2Categories);
router.get("/:id",authMiddleware,  getOption2CategoryById);
router.get("/:id/with-options",authMiddleware,  getOption2CategoryWithOptions);
router.put("/:id", authMiddleware, updateOption2Category);
router.delete("/:id", authMiddleware, deleteOption2Category);

module.exports = router;
