import type { Meta, StoryObj } from "@storybook/react-vite";
import HourlyForecast from "./HourlyForecast";
import type { HourlyWeather } from "@shared/types/weather.types";

const now = Math.floor(Date.now() / 1000);
const HOUR = 3600;

const generateItems = (
  count: number,
  baseTemp: number,
  conditions: { icon: string; description: string; pop: number }[],
): HourlyWeather[] =>
  Array.from({ length: count }, (_, i) => ({
    dt: now + HOUR * (i + 1),
    temp: baseTemp + Math.round(Math.sin(i / 3) * 4),
    icon: conditions[i % conditions.length].icon,
    description: conditions[i % conditions.length].description,
    pop: conditions[i % conditions.length].pop,
  }));

const meta: Meta<typeof HourlyForecast> = {
  title: "Widgets/HourlyForecast",
  component: HourlyForecast,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HourlyForecast>;

export const SunnyDay: Story = {
  args: {
    items: generateItems(8, 24, [
      { icon: "01d", description: "맑음", pop: 0 },
      { icon: "02d", description: "구름 조금", pop: 0 },
    ]),
  },
};

export const RainyDay: Story = {
  args: {
    items: generateItems(8, 15, [
      { icon: "10d", description: "비", pop: 0.8 },
      { icon: "09d", description: "소나기", pop: 0.6 },
      { icon: "10d", description: "비", pop: 0.9 },
    ]),
  },
};

export const MixedWeather: Story = {
  args: {
    items: generateItems(8, 18, [
      { icon: "01d", description: "맑음", pop: 0 },
      { icon: "02d", description: "구름 조금", pop: 0.1 },
      { icon: "04d", description: "흐림", pop: 0.3 },
      { icon: "10d", description: "비", pop: 0.7 },
    ]),
  },
};

export const LongList: Story = {
  args: {
    items: generateItems(24, 20, [
      { icon: "01d", description: "맑음", pop: 0 },
      { icon: "02d", description: "구름 조금", pop: 0 },
      { icon: "04d", description: "흐림", pop: 0.2 },
    ]),
  },
};
