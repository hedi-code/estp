const express = require("express");
const {
  createOption2,
  getAllOption2s,
  getOption2ById,
  getOption2sByCategory,
  updateOption2,
  deleteOption2
} = require("../controllers/option2Controller");

const router = express.Router();

router.post("/", createOption2);
router.get("/", getAllOption2s);
router.get("/:id", getOption2ById);
router.get("/category/:category_id", getOption2sByCategory);
router.put("/:id", updateOption2);
router.delete("/:id", deleteOption2);

module.exports = router;