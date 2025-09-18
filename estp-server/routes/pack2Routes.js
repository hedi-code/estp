const express = require("express");
const {
  createPack2,
  getAllPack2s,
  getPack2ById,
  updatePack2,
  deletePack2
} = require("../controllers/pack2Controller");

const router = express.Router();

router.post("/", createPack2);
router.get("/", getAllPack2s);
router.get("/:id", getPack2ById);
router.put("/:id", updatePack2);
router.delete("/:id", deletePack2);

module.exports = router;