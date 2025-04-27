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
