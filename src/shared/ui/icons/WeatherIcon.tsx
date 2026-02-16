import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  type LucideProps,
} from "lucide-react";

/**
 * OpenWeatherMap 아이콘 코드 매핑
 * https://openweathermap.org/weather-conditions
 */
const ICON_COMPONENTS: Record<string, React.ComponentType<LucideProps>> = {
  "01d": Sun,
  "01n": Moon,
  "02d": CloudSun,
  "02n": CloudMoon,
  "03d": Cloud,
  "03n": Cloud,
  "04d": Cloud, // 완전히 흐림은 구름 많음으로 처리
  "04n": Cloud,
  "09d": CloudRain, // 소나기
  "09n": CloudRain,
  "10d": CloudRain, // 비
  "10n": CloudRain,
  "11d": CloudLightning,
  "11n": CloudLightning,
  "13d": Snowflake,
  "13n": Snowflake,
  "50d": CloudFog,
  "50n": CloudFog,
};

interface WeatherIconProps extends Omit<LucideProps, "ref"> {
  code: string;
  alt?: string; // 하위 호환성을 위해 유지되지만 SVG에서 직접 사용되지 않음
}

const WeatherIcon = ({
  code,
  alt = "",
  className,
  size = 24, // Lucide 아이콘의 기본 크기
  ...props
}: WeatherIconProps) => {
  const IconComponent = ICON_COMPONENTS[code] || Cloud; // 구름 아이콘으로 대체

  return (
    <IconComponent
      className={className}
      size={size}
      aria-label={alt}
      {...props}
    />
  );
};

export default WeatherIcon;
