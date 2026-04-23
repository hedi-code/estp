const express = require("express");
const {
  createOption2,
  getAllOption2s,
  getOption2ById,
  getOption2sByCategory,
  updateOption2,
  deleteOption2
} = require("../controllers/option2Controller");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, createOption2);
router.get("/", authMiddleware, getAllOption2s);
router.get("/:id",authMiddleware,  getOption2ById);
router.get("/category/:category_id",authMiddleware,  getOption2sByCategory);
router.put("/:id", authMiddleware, updateOption2);
router.delete("/:id", authMiddleware, deleteOption2);

module.exports = router;
