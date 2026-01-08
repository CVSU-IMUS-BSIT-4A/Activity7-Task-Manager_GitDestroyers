import { TaskStatus } from '../../api/types';

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}

export function isOverdue(deadline: string | Date, status: TaskStatus): boolean {
  return new Date(deadline) < new Date() && status !== TaskStatus.DONE;
}

export function isDueSoon(deadline: string | Date, status: TaskStatus, days: number = 7): boolean {
  if (status === TaskStatus.DONE) return false;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  return deadlineDate >= now && deadlineDate <= futureDate;
}
