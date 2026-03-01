import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tiktokLinks: Record<string, string> = {
  glowhaven: "https://tiktok.com/@glowhaven",
  aurae: "https://tiktok.com/@aurae.jewelry",
  nestwell: "https://tiktok.com/@nestwell.home",
};

async function main() {
  for (const [slug, url] of Object.entries(tiktokLinks)) {
    const store = await prisma.store.findUnique({ where: { slug } });
    if (!store) {
      console.log(`  ⊘ Store "${slug}" not found — skipping`);
      continue;
    }
    await prisma.storeConfig.updateMany({
      where: { storeId: store.id },
      data: { socialTiktok: url },
    });
    console.log(`  ✓ ${slug}: socialTiktok = ${url}`);
  }
}

main()
  .then(() => console.log("\nDone!"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
