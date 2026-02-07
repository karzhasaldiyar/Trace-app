const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.member.deleteMany();
  await prisma.project.deleteMany();

  const alphaProject = await prisma.project.create({
    data: {
      name: "Alpha Expansion",
      staleDays: 7
    }
  });

  const alphaOwner = await prisma.member.create({
    data: {
      projectId: alphaProject.id,
      name: "Jordan Lee",
      email: "jordan@trace.dev",
      role: "OWNER"
    }
  });

  const alphaAdmin = await prisma.member.create({
    data: {
      projectId: alphaProject.id,
      name: "Morgan Patel",
      email: "morgan@trace.dev",
      role: "ADMIN"
    }
  });

  await prisma.member.create({
    data: {
      projectId: alphaProject.id,
      name: "Riley Kim",
      email: "riley@trace.dev",
      role: "MEMBER"
    }
  });

  await prisma.member.create({
    data: {
      projectId: alphaProject.id,
      name: "Casey Client",
      email: "casey@trace.dev",
      role: "CLIENT"
    }
  });

  const alphaDocOne = await prisma.document.create({
    data: {
      projectId: alphaProject.id,
      title: "Vendor Agreement",
      status: "DRAFT",
      dueDate: null,
      assignedMemberId: alphaOwner.id,
      tagsJson: "[]",
      stale: false,
      lastActivityAt: new Date()
    }
  });

  const alphaDocTwo = await prisma.document.create({
    data: {
      projectId: alphaProject.id,
      title: "Pilot Launch Plan",
      status: "IN_REVIEW",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      assignedMemberId: alphaAdmin.id,
      tagsJson: JSON.stringify(["launch", "priority"]),
      stale: false,
      lastActivityAt: new Date()
    }
  });

  const betaProject = await prisma.project.create({
    data: {
      name: "Beta Rollout",
      staleDays: 10
    }
  });

  const betaOwner = await prisma.member.create({
    data: {
      projectId: betaProject.id,
      name: "Taylor Brooks",
      email: "taylor@trace.dev",
      role: "OWNER"
    }
  });

  const betaAdmin = await prisma.member.create({
    data: {
      projectId: betaProject.id,
      name: "Avery Chen",
      email: "avery@trace.dev",
      role: "ADMIN"
    }
  });

  await prisma.member.create({
    data: {
      projectId: betaProject.id,
      name: "Skyler Moore",
      email: "skyler@trace.dev",
      role: "MEMBER"
    }
  });

  await prisma.member.create({
    data: {
      projectId: betaProject.id,
      name: "Devon Client",
      email: "devon@trace.dev",
      role: "CLIENT"
    }
  });

  const betaDocOne = await prisma.document.create({
    data: {
      projectId: betaProject.id,
      title: "Risk Review Summary",
      status: "DRAFT",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      assignedMemberId: betaOwner.id,
      tagsJson: JSON.stringify(["risk", "summary"]),
      stale: false,
      lastActivityAt: new Date()
    }
  });

  const betaDocTwo = await prisma.document.create({
    data: {
      projectId: betaProject.id,
      title: "Implementation Checklist",
      status: "FINAL",
      dueDate: null,
      assignedMemberId: betaAdmin.id,
      tagsJson: JSON.stringify(["checklist"]),
      stale: false,
      lastActivityAt: new Date()
    }
  });

  await prisma.activityLog.createMany({
    data: [
      {
        projectId: alphaProject.id,
        actorName: alphaOwner.name,
        eventType: "PROJECT_CREATED",
        message: `${alphaOwner.name} created the project ${alphaProject.name}.`,
        payloadJson: JSON.stringify({ projectId: alphaProject.id })
      },
      {
        projectId: alphaProject.id,
        documentId: alphaDocOne.id,
        actorName: alphaAdmin.name,
        eventType: "DOC_UPLOADED",
        message: `${alphaAdmin.name} uploaded ${alphaDocOne.title} (v1).`,
        payloadJson: JSON.stringify({ version: 1 })
      },
      {
        projectId: alphaProject.id,
        documentId: alphaDocTwo.id,
        actorName: alphaOwner.name,
        eventType: "DOC_METADATA_CHANGED",
        message: `${alphaOwner.name} updated metadata for ${alphaDocTwo.title}.`,
        payloadJson: JSON.stringify({ diffs: [] })
      },
      {
        projectId: betaProject.id,
        actorName: betaOwner.name,
        eventType: "PROJECT_CREATED",
        message: `${betaOwner.name} created the project ${betaProject.name}.`,
        payloadJson: JSON.stringify({ projectId: betaProject.id })
      },
      {
        projectId: betaProject.id,
        documentId: betaDocOne.id,
        actorName: betaAdmin.name,
        eventType: "DOC_VERSION_UPLOADED",
        message: `${betaAdmin.name} uploaded v2 for ${betaDocOne.title}.`,
        payloadJson: JSON.stringify({ version: 2 })
      },
      {
        projectId: betaProject.id,
        actorName: betaOwner.name,
        eventType: "STALE_CHECK_RUN",
        message: `${betaOwner.name} ran a stale check and marked 1 document stale.`,
        payloadJson: JSON.stringify({ count: 1 })
      }
    ]
  });

  await prisma.notification.createMany({
    data: [
      {
        projectId: alphaProject.id,
        documentId: alphaDocOne.id,
        actorName: alphaOwner.name,
        type: "Metadata updated",
        message: `${alphaDocOne.title} metadata was updated.`
      },
      {
        projectId: alphaProject.id,
        actorName: alphaAdmin.name,
        type: "New member added",
        message: "Riley Kim joined the project as Member."
      },
      {
        projectId: betaProject.id,
        documentId: betaDocTwo.id,
        actorName: betaAdmin.name,
        type: "Document marked stale",
        message: `${betaDocTwo.title} was marked stale.`
      }
    ]
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
