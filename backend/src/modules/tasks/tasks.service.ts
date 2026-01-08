import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto, TaskStatus } from './dto/task.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const { projectId, assigneeId, ...data } = createTaskDto;
    
    // Validate project exists
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project with ID ${projectId} not found`);

    // Validate assignee exists if provided
    if (assigneeId) {
      const user = await this.prisma.user.findUnique({ where: { id: assigneeId } });
      if (!user) throw new NotFoundException(`User with ID ${assigneeId} not found`);
    }

    return this.prisma.task.create({
      data: {
        ...data,
        deadline: new Date(data.deadline),
        project: { connect: { id: projectId } },
        ...(assigneeId ? { assignee: { connect: { id: assigneeId } } } : {}),
      },
    });
  }

  async findAll(filters: TaskFilterDto) {
    const { projectId, assigneeId, status, overdue } = filters;
    const where: Prisma.TaskWhereInput = {};

    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;
    
    if (overdue === 'true') {
      where.deadline = { lt: new Date() };
      where.status = { not: TaskStatus.DONE };
    }

    return this.prisma.task.findMany({
      where,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true, email: true } },
      },
      orderBy: { deadline: 'asc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: true,
      },
    });
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const { assigneeId, ...data } = updateTaskDto;
    await this.findOne(id);

    const updateData: Prisma.TaskUpdateInput = {
      ...data,
      ...(data.deadline ? { deadline: new Date(data.deadline) } : {}),
    };

    if (assigneeId !== undefined) {
      if (assigneeId === null) {
        updateData.assignee = { disconnect: true };
      } else {
        const user = await this.prisma.user.findUnique({ where: { id: assigneeId } });
        if (!user) throw new NotFoundException(`User with ID ${assigneeId} not found`);
        updateData.assignee = { connect: { id: assigneeId } };
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
