import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import SearchBar from "./SearchBar";

const meta: Meta<typeof SearchBar> = {
  title: "Widgets/SearchBar",
  component: SearchBar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="p-8 bg-gray-50 min-h-[400px]">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "지역 검색 자동완성 컴포넌트. 초성 검색(ㅅㅇ → 서울)을 지원하며, 키보드 탐색(화살표키, Enter, Escape)이 가능합니다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {};
