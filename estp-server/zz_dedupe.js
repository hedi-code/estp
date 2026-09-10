// Nettoyage des doublons d'options sur les bons de commande.
//
// Contexte : un bug côté client (bc1-souscrits) ré-insérait la même option
// plusieurs fois dans `commande1_options` / `commande2_options` à chaque
// interaction avec le stepper de quantité. Résultat : des factures gonflées
// (ex : "Adhésivage sur cloison" répété ~18 fois).
//
// Ce script conserve UNE seule ligne par (commande, option) — celle d'id le
// plus petit — et supprime les doublons. Les quantités des doublons étant
// identiques, aucune agrégation n'est nécessaire.
//
// À exécuter DEPUIS estp-server (car il require ./config/db) :
//   node _dedupe_options.js            (dry-run : compte seulement)
//   node _dedupe_options.js --apply    (applique la suppression)
//
require("dotenv").config();
const db = require("./config/db");

const APPLY = process.argv.includes("--apply");

const q = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, res) => (err ? reject(err) : resolve(res)));
  });

const TABLES = [
  { table: "commande1_options", cmd: "commande1_id", opt: "option1_id" },
  { table: "commande2_options", cmd: "commande2_id", opt: "option2_id" },
];

async function main() {
  console.log(APPLY ? ">> MODE APPLY (suppression réelle)\n" : ">> MODE DRY-RUN (comptage seulement)\n");

  for (const { table, cmd, opt } of TABLES) {
    const total = (await q(`SELECT COUNT(*) AS n FROM ${table}`))[0].n;

    // Nombre de lignes en trop = total - nb de couples (commande, option) distincts.
    const distinctPairs = (
      await q(`SELECT COUNT(*) AS n FROM (SELECT 1 FROM ${table} GROUP BY ${cmd}, ${opt}) t`)
    )[0].n;
    const surplus = total - distinctPairs;

    console.log(`--- ${table}`);
    console.log(`    lignes totales        : ${total}`);
    console.log(`    couples distincts     : ${distinctPairs}`);
    console.log(`    doublons à supprimer  : ${surplus}`);

    if (surplus > 0) {
      // Détail des commandes les plus impactées (aide au contrôle).
      const worst = await q(
        `SELECT ${cmd} AS commande, ${opt} AS option_id, COUNT(*) AS n
           FROM ${table}
          GROUP BY ${cmd}, ${opt}
         HAVING COUNT(*) > 1
          ORDER BY n DESC
          LIMIT 10`
      );
      worst.forEach((w) =>
        console.log(`      commande=${w.commande} option=${w.option_id} -> ${w.n} lignes`)
      );
    }

    if (APPLY && surplus > 0) {
      const del = await q(
        `DELETE t FROM ${table} t
           JOIN (
             SELECT MIN(id) AS keep_id, ${cmd} AS c, ${opt} AS o
               FROM ${table}
              GROUP BY ${cmd}, ${opt}
           ) k ON t.${cmd} = k.c AND t.${opt} = k.o
          WHERE t.id <> k.keep_id`
      );
      console.log(`    >>> SUPPRIMÉ : ${del.affectedRows} ligne(s)`);
      const after = (await q(`SELECT COUNT(*) AS n FROM ${table}`))[0].n;
      console.log(`    lignes restantes      : ${after}`);
    }
    console.log("");
  }

  console.log(APPLY ? "Terminé (APPLY)." : "Terminé (DRY-RUN). Relancer avec --apply pour appliquer.");
  process.exit(0);
}

main().catch((e) => {
  console.error("ERREUR:", e.message);
  process.exit(1);
});
