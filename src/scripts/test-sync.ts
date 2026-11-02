import { runIngestion } from "../lib/services/ingestion";
import { prisma } from "../lib/db";

async function main() {
  console.log("🚀 Lancement du test d'ingestion des bons plans...");
  const start = Date.now();

  const reports = await runIngestion();

  console.log("\n📊 Résumé de la synchronisation :");
  for (const report of reports) {
    console.log(`- Source: ${report.source.toUpperCase()}`);
    console.log(`  Total hardware détecté : ${report.totalFound}`);
    console.log(`  Nouveaux deals insérés : ${report.newDeals}`);
    console.log(`  Alertes Discord envoyées : ${report.alertsSent}`);
    if (report.errors.length > 0) {
      console.log(`  Erreurs : ${report.errors.join(", ")}`);
    }
  }

  const allDeals = await prisma.deal.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log(`\n🔥 Les derniers deals enregistrés en base (${allDeals.length}) :`);
  for (const d of allDeals) {
    console.log(`• [${d.category}] [${d.merchant}] ${d.title.slice(0, 70)}... (${d.price}€)`);
  }

  console.log(`\n⏱️ Terminé en ${(Date.now() - start) / 1000}s`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Erreur critique :", err);
  process.exit(1);
});
