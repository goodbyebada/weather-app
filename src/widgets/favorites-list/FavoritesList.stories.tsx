import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FavoritesList from "./FavoritesList";
import { useFavoriteStore } from "@entities/favorite/model/store";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const WithProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <div className="max-w-4xl mx-auto p-6">{children}</div>
    </MemoryRouter>
  </QueryClientProvider>
);

const ClearFavorites = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    useFavoriteStore.setState({ favorites: [] });
  }, []);
  return <>{children}</>;
};

const meta: Meta<typeof FavoritesList> = {
  title: "Widgets/FavoritesList",
  component: FavoritesList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "즐겨찾기 목록을 반응형 그리드로 표시합니다. 최대 6개까지 등록 가능하며, 비어있을 때 안내 UI를 표시합니다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FavoritesList>;

export const Empty: Story = {
  decorators: [
    (Story) => (
      <WithProviders>
        <ClearFavorites>
          <Story />
        </ClearFavorites>
      </WithProviders>
    ),
  ],
};
