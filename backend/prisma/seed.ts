import { PrismaClient } from '@prisma/client';

enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: 'Bob Smith',
      email: 'bob@example.com',
    },
  });

  // Clear existing tasks and projects (to avoid duplicates on re-seed)
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Activity 7',
      description: 'Build a Task Management System',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Personal Portfolio',
      description: 'Create a website to showcase projects',
    },
  });

  // Create Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Setup Backend',
        description: 'Initialize NestJS and Prisma',
        status: TaskStatus.DONE,
        deadline: new Date(Date.now() - 86400000), // yesterday
        projectId: project1.id,
        assigneeId: user1.id,
      },
      {
        title: 'Implement Frontend',
        description: 'React + Vite UI',
        status: TaskStatus.IN_PROGRESS,
        deadline: new Date(Date.now() + 86400000 * 2), // in 2 days
        projectId: project1.id,
        assigneeId: user2.id,
      },
      {
        title: 'Overdue Task Example',
        description: 'This task is overdue',
        status: TaskStatus.TODO,
        deadline: new Date(Date.now() - 86400000 * 5), // 5 days ago
        projectId: project1.id,
      },
      {
        title: 'Future Task',
        description: 'This task is due soon',
        status: TaskStatus.TODO,
        deadline: new Date(Date.now() + 86400000 * 5), // in 5 days
        projectId: project2.id,
      },
    ],
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
