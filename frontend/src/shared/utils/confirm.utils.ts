export function confirmDelete(message: string = 'Delete this item?'): boolean {
  return window.confirm(message);
}
