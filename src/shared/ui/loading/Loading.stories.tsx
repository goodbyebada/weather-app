import type { Meta, StoryObj } from "@storybook/react";
import Loading from "./Loading";

const meta = {
  title: "Shared/UI/Loading",
  component: Loading,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["card", "text", "circle"],
    },
    count: {
      control: { type: "number", min: 1, max: 10 },
    },
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CardType: Story = {
  args: {
    type: "card",
    count: 1,
  },
};

export const TextType: Story = {
  args: {
    type: "text",
    count: 3,
  },
};

export const CircleType: Story = {
  args: {
    type: "circle",
    count: 1,
  },
};
