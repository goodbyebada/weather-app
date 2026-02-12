import type { Meta, StoryObj } from '@storybook/react';
import ToastContainer from './ToastContainer';
import { toast } from './toast-manager';
import Button from '../button/Button';

const meta = {
  title: 'Shared/UI/Toast',
  component: ToastContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8 min-h-[200px]">
      <div className="flex gap-2">
        <Button onClick={() => toast.success('작업이 완료되었습니다.')} variant="primary">
          Success Toast
        </Button>
        <Button onClick={() => toast.error('문제가 발생했습니다.')} variant="secondary">
          Error Toast
        </Button>
        <Button onClick={() => toast.info('새로운 알림이 있습니다.')} variant="ghost">
          Info Toast
        </Button>
      </div>
      <ToastContainer />
    </div>
  ),
};
