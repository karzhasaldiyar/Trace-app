const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.member.deleteMany();
  await prisma.project.deleteMany();

  const project = await prisma.project.create({
    data: {
      name: "Alpha Expansion",
      staleDays: 7
    }
  });

  const owner = await prisma.member.create({
    data: {
      projectId: project.id,
      name: "Jordan Lee",
      email: "jordan@trace.dev",
      role: "OWNER"
    }
  });

  await prisma.member.create({
    data: {
      projectId: project.id,
      name: "Riley Kim",
      email: "riley@trace.dev",
      role: "MEMBER"
    }
  });

  await prisma.member.create({
    data: {
      projectId: project.id,
      name: "Casey Client",
      email: "casey@trace.dev",
      role: "CLIENT"
    }
  });

  await prisma.document.create({
    data: {
      projectId: project.id,
      title: "Vendor Agreement",
      status: "DRAFT",
      dueDate: null,
      assignedMemberId: owner.id,
      tagsJson: "[]",
      stale: false,
      lastActivityAt: new Date()
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
