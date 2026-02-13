import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import WeatherCard from "./WeatherCard";
import type { WeatherData } from "@shared/types/weather.types";

const baseWeather: WeatherData = {
  locationName: "서울특별시-종로구-청운동",
  temp: 22,
  tempMin: 18,
  tempMax: 26,
  feelsLike: 23,
  humidity: 55,
  windSpeed: 3.2,
  description: "clear sky",
  icon: "01d",
  coord: { lat: 37.5872, lon: 126.9688 },
  dt: Date.now() / 1000,
};

const meta: Meta<typeof WeatherCard> = {
  title: "Widgets/WeatherCard",
  component: WeatherCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="max-w-sm">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    onFavoriteToggle: { action: "favoriteToggled" },
  },
};

export default meta;
type Story = StoryObj<typeof WeatherCard>;

export const ClearSky: Story = {
  args: {
    weather: baseWeather,
  },
};

export const Cloudy: Story = {
  args: {
    weather: {
      ...baseWeather,
      description: "overcast clouds",
      icon: "04d",
      temp: 16,
      tempMin: 12,
      tempMax: 19,
    },
  },
};

export const Rainy: Story = {
  args: {
    weather: {
      ...baseWeather,
      description: "light rain",
      icon: "10d",
      temp: 14,
      tempMin: 11,
      tempMax: 16,
      humidity: 88,
    },
  },
};

export const Snowy: Story = {
  args: {
    weather: {
      ...baseWeather,
      description: "light snow",
      icon: "13d",
      temp: -3,
      tempMin: -7,
      tempMax: 0,
      humidity: 75,
    },
  },
};

export const HighTemperature: Story = {
  args: {
    weather: {
      ...baseWeather,
      description: "clear sky",
      icon: "01d",
      temp: 36,
      tempMin: 30,
      tempMax: 38,
    },
  },
};

export const LowTemperature: Story = {
  args: {
    weather: {
      ...baseWeather,
      description: "overcast clouds",
      icon: "04d",
      temp: -15,
      tempMin: -20,
      tempMax: -10,
    },
  },
};
