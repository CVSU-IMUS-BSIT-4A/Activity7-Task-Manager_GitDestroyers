import { useConfirmDialog } from './useConfirmDialog';

export function useConfirm() {
  const { confirm, ...dialogProps } = useConfirmDialog();

  const confirmDelete = async (message: string = 'Delete this item?'): Promise<boolean> => {
    return confirm({
      title: 'Confirm Deletion',
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
  };

  return {
    confirmDelete,
    ...dialogProps,
  };
}
