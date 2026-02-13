import type { Meta, StoryObj } from "@storybook/react";
import Card from "./Card";

const meta = {
  title: "Shared/UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="p-4">
        <h3 className="text-lg font-bold">카드 제목</h3>
        <p className="text-gray-600">카드 내용이 들어갑니다.</p>
      </div>
    ),
  },
};

export const WithInteraction: Story = {
  args: {
    className: "hover:shadow-lg transition-shadow cursor-pointer",
    children: (
      <div className="p-4">
        <h3 className="text-lg font-bold">인터랙티브 카드</h3>
        <p className="text-gray-600">호버해보세요.</p>
      </div>
    ),
    onClick: () => alert("카드 클릭됨!"),
  },
};
