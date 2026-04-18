import { auth } from "../lib/auth";
import prisma from "../lib/prisma";

async function main() {
  const email = "musbi@mediticket.com";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Test user already exists — skipping seed.");
    return;
  }

  // Create user + account via Better Auth (handles scrypt hashing)
  await auth.api.signUpEmail({
    body: { name: "Musbi Admin", email, password: "musbi123" },
    headers: new Headers(),
  });

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: "Musbi Test Hospital",
      email,
      phone: "+220 000 0000",
      address: "Banjul, The Gambia",
    },
  });

  // Link user to organization
  await prisma.user.update({
    where: { email },
    data: { organizationId: org.id },
  });

  console.log("Seed complete:");
  console.log("  Email:    musbi@mediticket.com");
  console.log("  Password: musbi123");
  console.log("  Org:      Musbi Test Hospital");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
