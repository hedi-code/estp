// axonaut/axonautRoutes.js
// Manual sync endpoints – protected by JWT middleware (admin use only).

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  syncEntreprise,
  syncBC1,
  syncBC2,
  syncAllPending,
} = require('./axonautService');

// ── Sync a single company ────────────────────────────────────────────────────
router.post('/sync/entreprise/:id', authMiddleware, async (req, res) => {
  try {
    const axonautId = await syncEntreprise(Number(req.params.id));
    res.json({ axonaut_company_id: axonautId });
  } catch (err) {
    console.error('[Axonaut] sync entreprise error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Sync a single BC1 ────────────────────────────────────────────────────────
router.post('/sync/bc1/:id', authMiddleware, async (req, res) => {
  try {
    const axonautId = await syncBC1(Number(req.params.id));
    res.json({ axonaut_invoice_id: axonautId });
  } catch (err) {
    console.error('[Axonaut] sync BC1 error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Sync a single BC2 ────────────────────────────────────────────────────────
router.post('/sync/bc2/:id', authMiddleware, async (req, res) => {
  try {
    const axonautId = await syncBC2(Number(req.params.id));
    res.json({ axonaut_invoice_id: axonautId });
  } catch (err) {
    console.error('[Axonaut] sync BC2 error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Batch sync: all validated commandes without Axonaut invoice ──────────────
router.post('/sync/batch', authMiddleware, async (req, res) => {
  try {
    const summary = await syncAllPending();
    res.json(summary);
  } catch (err) {
    console.error('[Axonaut] batch sync error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
