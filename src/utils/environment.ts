import { KeyValuePair } from '../types/request';
import { Environment } from '../types/environment';

/**
 * 将环境变量合并到请求 headers 中
 * - 大小写不敏感匹配 key
 * - 已存在的 key 替换 value，不存在的追加
 * - 只合并 enabled 的变量
 */
export const mergeEnvironmentHeaders = (
  requestHeaders: KeyValuePair[],
  environment: Environment | null
): KeyValuePair[] => {
  if (!environment) return requestHeaders;

  const enabledVars = environment.variables.filter((v) => v.enabled);
  if (enabledVars.length === 0) return requestHeaders;

  // 构建大小写不敏感的 key -> index 映射
  const headerMap = new Map<string, number>();
  requestHeaders.forEach((h, i) => {
    headerMap.set(h.key.toLowerCase(), i);
  });

  const result = [...requestHeaders];

  for (const envVar of enabledVars) {
    const lowerKey = envVar.key.toLowerCase();
    const existingIndex = headerMap.get(lowerKey);

    if (existingIndex !== undefined) {
      // 替换已有 header 的 value
      result[existingIndex] = {
        ...result[existingIndex],
        value: envVar.value,
        enabled: true,
      };
    } else {
      // 追加新 header
      result.push({
        key: envVar.key,
        value: envVar.value,
        enabled: true,
      });
    }
  }

  return result;
}
