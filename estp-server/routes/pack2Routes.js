const express = require("express");
const {
  createPack2,
  getAllPack2s,
  getPack2ById,
  updatePack2,
  deletePack2
} = require("../controllers/pack2Controller");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, createPack2);
router.get("/", authMiddleware, getAllPack2s);
router.get("/:id",authMiddleware,  getPack2ById);
router.put("/:id", authMiddleware, updatePack2);
router.delete("/:id", authMiddleware, deletePack2);

module.exports = router;
