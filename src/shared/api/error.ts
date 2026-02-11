import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status: number;
}

export const parseApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;

    switch (status) {
      case 401:
        return { message: 'API 키가 유효하지 않습니다.', status };
      case 404:
        return { message: '해당 장소의 정보가 제공되지 않습니다.', status };
      case 429:
        return { message: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.', status };
      default:
        return { message: '날씨 정보를 불러오는 중 오류가 발생했습니다.', status };
    }
  }

  return { message: '알 수 없는 오류가 발생했습니다.', status: 0 };
};
