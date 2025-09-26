// controllers/pack1sController.js

const db = require('../config/db');

exports.getAllPack1sWithDetails = (req, res) => {
  const query = `
    SELECT 
      p.id AS pack_id,
      p.type,
      p.titre,
      p.description,
      p.img,
      s.id AS surface_id,
      s.surface,
      s.prix,
      o.id AS option_id,
      o.description AS option_description
    FROM pack1s p
    LEFT JOIN pack1s_surface s ON p.id = s.id_pack1
    LEFT JOIN pack1_options o ON p.id = o.id_pack1
    ORDER BY p.id, s.surface, o.id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching pack1s details:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Transforming the flat result into a nested structure
    const groupedResults = [];

    results.forEach(row => {
      // Find the existing pack in the grouped results
      let pack = groupedResults.find(item => item.pack_id === row.pack_id);
      
      if (!pack) {
        // If the pack doesn't exist yet, create a new one
        pack = {
          pack_id: row.pack_id,
          type: row.type,
          titre: row.titre,
          description: row.description,
          img: `/uploads/img/pack1/${row.img}`,
          surfaces: [],
          options: []
        };
        groupedResults.push(pack);
      }
      
      // Add surface data to the pack, ensuring the surface is only added once
      if (row.surface_id && !pack.surfaces.some(surface => surface.surface_id === row.surface_id)) {
        pack.surfaces.push({
          surface_id: row.surface_id,
          surface: row.surface,
          prix: row.prix
        });
      }
      
      // Add option data to the pack, ensuring options are correctly grouped
      if (row.option_id && !pack.options.some(option => option.option_id === row.option_id)) {
        pack.options.push({
          option_id: row.option_id,
          option_description: row.option_description
        });
      }
    });

    res.json(groupedResults);
  });
};

// =================== CREATE PACK ===================
exports.createPack1 = (req, res) => {
  const { type, titre, description, img } = req.body;
  console.log('Creating pack with data:', { type, titre, description, img });
  const query = 'INSERT INTO pack1s (type, titre, description, img) VALUES (?, ?, ?, ?)';
  db.query(query, [type, titre, description, img], (err, result) => {
    if (err) {
      console.error('Pack creation error:', err);
      return res.status(500).json({ error: 'Échec de la création du pack' });
    }
    res.json({ message: 'Pack créé avec succès', pack_id: result.insertId });
  });
};

// =================== UPDATE PACK ===================
exports.updatePack1 = (req, res) => {
  const { id } = req.params;
  const { type, titre, description, img } = req.body;

  const query = 'UPDATE pack1s SET type=?, titre=?, description=?, img=? WHERE id=?';
  db.query(query, [type, titre, description, img, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update pack' });
    res.json({ message: 'Pack updated' });
  });
};

// =================== DELETE PACK (WITH SURFACES & OPTIONS) ===================
exports.deletePack1 = (req, res) => {
  const { id } = req.params;

  const deleteOptions = 'DELETE FROM pack1_options WHERE id_pack1=?';
  const deleteSurfaces = 'DELETE FROM pack1s_surface WHERE id_pack1=?';
  const deletePack = 'DELETE FROM pack1s WHERE id=?';

  db.query(deleteOptions, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete pack options' });

    db.query(deleteSurfaces, [id], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete pack surfaces' });

      db.query(deletePack, [id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to delete pack' });
        res.json({ message: 'Pack and related data deleted' });
      });
    });
  });
};

// =================== OPTIONS CRUD ===================
exports.createOption = (req, res) => {
  const { description, id_pack1 } = req.body;
  db.query('INSERT INTO pack1_options (description, id_pack1) VALUES (?, ?)', [description, id_pack1], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to create option' });
    res.json({ message: 'Option created', option_id: result.insertId });
  });
};

exports.updateOption = (req, res) => {
  const { id } = req.params;
  const description  = req.body.option_description;
  db.query('UPDATE pack1_options SET description=? WHERE id=?', [description, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update option' });
    res.json({ message: 'Option updated' });
  });
};

exports.deleteOption = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM pack1_options WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete option' });
    res.json({ message: 'Option deleted' });
  });
};

// =================== SURFACES CRUD ===================
exports.createSurface = (req, res) => {
  const { surface, prix, id_pack1 } = req.body;
  db.query('INSERT INTO pack1s_surface (surface, prix, id_pack1) VALUES (?, ?, ?)', [surface, prix, id_pack1], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to create surface' });
    res.json({ message: 'Surface created', surface_id: result.insertId });
  });
};

exports.updateSurface = (req, res) => {
  const { id } = req.params;
  const { surface, prix } = req.body;
  db.query('UPDATE pack1s_surface SET surface=?, prix=? WHERE id=?', [surface, prix, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update surface' });
    res.json({ message: 'Surface updated' });
  });
};

exports.deleteSurface = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM pack1s_surface WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete surface' });
    res.json({ message: 'Surface deleted' });
  });
};