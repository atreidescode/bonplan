import { runIngestion } from "../lib/services/ingestion";

const INTERVAL_MINUTES = 5;

async function loop() {
  console.log(`\n⏰ [${new Date().toLocaleTimeString("fr-FR")}] Démarrage de la vérification automatique des deals...`);
  try {
    const reports = await runIngestion();
    let totalNew = 0;
    let totalAlerts = 0;
    for (const r of reports) {
      totalNew += r.newDeals;
      totalAlerts += r.alertsSent;
    }
    console.log(`✨ Bilan du cycle : ${totalNew} nouveaux deals, ${totalAlerts} alertes Discord envoyées.`);
  } catch (err: any) {
    console.error("Erreur durant le cycle de veille :", err.message);
  }

  console.log(`⏳ Prochain scan dans ${INTERVAL_MINUTES} minutes...`);
}

// First run immediately
loop();

// Then run every INTERVAL_MINUTES
setInterval(loop, INTERVAL_MINUTES * 60 * 1000);
