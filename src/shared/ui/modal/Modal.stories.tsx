import type { Meta, StoryObj } from '@storybook/react';
import Modal from './Modal';
import { useState } from 'react';
import Button from '../button/Button';

const meta = {
  title: 'Shared/UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    title: '모달 제목',
    children: '모달 내용',
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
        <Modal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          title="모달 제목"
        >
          <div className="space-y-4">
            <p>모달 내용입니다.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>취소</Button>
              <Button onClick={() => setIsOpen(false)}>확인</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
};
