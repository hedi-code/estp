// controllers/commande1OptionsController.js

const db = require("../config/db");

exports.createCommande1Option = (req, res) => {
  const { commande1_id, option1_id, qty } = req.body;

  const query = "INSERT INTO commande1_options (commande1_id, option1_id, qty) VALUES (?, ?, ?)";
  db.query(query, [commande1_id, option1_id, qty], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ nonDisplayMessage: "Option added successfully", id: result.insertId });
  });
};

exports.getAllCommande1Options = (req, res) => {
  const query = "SELECT * FROM commande1_options";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ nonDisplayMessage: "Error fetching options" });
    res.json(results);
  });
};

exports.getCommande1OptionById = (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM commande1_options WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ nonDisplayMessage: "Error fetching option" });
    if (result.length === 0) return res.status(404).json({ nonDisplayMessage: "Option not found" });
    res.json(result[0]);
  });
};

exports.getCommande1OptionByCommandeId = (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM commande1_options WHERE commande1_id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ nonDisplayError: "Error fetching option" });
    if (result.length === 0) return res.json([]);
    res.json(result);
  });
};

exports.updateCommande1Option = (req, res) => {
  const { id } = req.params;
  const { qty } = req.body;

  const query = "UPDATE commande1_options SET qty = ? WHERE id = ?";
  db.query(query, [qty, id], (err) => {
    if (err) return res.status(500).json({ nonDisplayMessage: "Error updating option" });
    res.json({ nonDisplayMessage: "Option updated successfully" });
  });
};

exports.deleteCommande1Option = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM commande1_options WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ nonDisplayMessage: "Error deleting option" });
    res.json({ nonDisplayMessage: "Option deleted successfully" });
  });
};
