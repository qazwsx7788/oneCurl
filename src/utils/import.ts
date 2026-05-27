import { HttpRequest } from '../types/request';

export const importFromJson = (jsonString: string): HttpRequest | null => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.method || !data.url) {
      throw new Error('无效的请求格式');
    }
    return data as HttpRequest;
  } catch {
    return null;
  }
};

export const importFromFile = async (file: File): Promise<HttpRequest | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(importFromJson(content));
    };
    reader.onerror = () => {
      resolve(null);
    };
    reader.readAsText(file);
  });
};
