import type { Meta, StoryObj } from '@storybook/react';
import Input from './Input';

const meta = {
  title: 'Shared/UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    value: { control: 'text' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: '검색어를 입력하세요',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: '검색어를 입력하세요',
    value: '서울',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: '비활성화된 입력창',
    disabled: true,
  },
};
