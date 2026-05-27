import { HttpRequest } from '../types/request';
import { HttpResponse } from '../types/response';

export const exportRequest = (request: HttpRequest): string => {
  return JSON.stringify(request, null, 2);
};

export const exportResponse = (response: HttpResponse): string => {
  return JSON.stringify(response, null, 2);
};

export const exportAsCurl = (request: HttpRequest): string => {
  let curl = `curl -X ${request.method}`;

  if (request.headers) {
    request.headers.forEach((header) => {
      if (header.enabled) {
        curl += ` -H "${header.key}: ${header.value}"`;
      }
    });
  }

  if (request.body) {
    if ('Raw' in request.body) {
      curl += ` -d '${request.body.Raw}'`;
    } else if ('Json' in request.body) {
      curl += ` -d '${request.body.Json}'`;
    } else if ('Form' in request.body) {
      request.body.Form.forEach((field) => {
        if (field.enabled) {
          curl += ` -F "${field.key}=${field.value}"`;
        }
      });
    }
  }

  if (request.auth) {
    if ('Basic' in request.auth) {
      curl += ` -u "${request.auth.Basic.username}:${request.auth.Basic.password}"`;
    } else if ('Bearer' in request.auth) {
      curl += ` -H "Authorization: Bearer ${request.auth.Bearer.token}"`;
    }
  }

  if (!request.ssl_verify) {
    curl += ' -k';
  }

  if (request.timeout) {
    curl += ` -m ${request.timeout}`;
  }

  curl += ` ${request.url}`;

  return curl;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const downloadAsFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
