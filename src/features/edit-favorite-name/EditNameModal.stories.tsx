import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ComponentProps, useState } from "react";
import EditNameModal from "./EditNameModal";

import Button from "@shared/ui/button/Button";

const meta: Meta<typeof EditNameModal> = {
  title: "Features/EditFavoriteName/EditNameModal",
  component: EditNameModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: { control: "boolean", description: "모달 열림 여부" },
    initialName: { control: "text", description: "초기 이름" },
    onConfirm: { action: "confirmed", description: "확인 버튼 클릭 핸들러" },
    onClose: { action: "closed", description: "닫기/취소 핸들러" },
  },
};

export default meta;
type Story = StoryObj<typeof EditNameModal>;

const ModalWithTrigger = (args: ComponentProps<typeof EditNameModal>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>이름 수정하기</Button>
      {isOpen && (
        <EditNameModal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    initialName: "우리집",
    isOpen: false,
  },
};

export const Open: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    initialName: "회사",
  },
};

export const LongName: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    initialName: "엄청나게 긴 이름을 가진 즐겨찾기 장소",
  },
};
