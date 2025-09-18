const express = require("express");
const {
  createOption2Category,
  getAllOption2Categories,
  getOption2CategoryById,
  getOption2CategoryWithOptions,
  updateOption2Category,
  deleteOption2Category
} = require("../controllers/option2CategoriesController");

const router = express.Router();

router.post("/", createOption2Category);
router.get("/", getAllOption2Categories);
router.get("/:id", getOption2CategoryById);
router.get("/:id/with-options", getOption2CategoryWithOptions);
router.put("/:id", updateOption2Category);
router.delete("/:id", deleteOption2Category);

module.exports = router;