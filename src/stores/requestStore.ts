import { create } from 'zustand';
import { HttpRequest, KeyValuePair, RequestBody, AuthConfig } from '../types/request';
import { HttpResponse } from '../types/response';

interface RequestState {
  currentRequest: HttpRequest;
  response: HttpResponse | null;
  loading: boolean;
  error: string | null;

  setMethod: (method: string) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: KeyValuePair[]) => void;
  setBody: (body: RequestBody | undefined) => void;
  setAuth: (auth: AuthConfig | undefined) => void;
  setProxy: (proxy: { proxy_type: string; host: string; port: number } | undefined) => void;
  setSslVerify: (verify: boolean) => void;
  setTimeout: (timeout: number | undefined) => void;
  setResponse: (response: HttpResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetRequest: () => void;
}

const defaultRequest: HttpRequest = {
  method: 'GET',
  url: '',
  headers: [],
  ssl_verify: false,
};

export const useRequestStore = create<RequestState>((set) => ({
  currentRequest: defaultRequest,
  response: null,
  loading: false,
  error: null,

  setMethod: (method) => set((state) => ({
    currentRequest: { ...state.currentRequest, method }
  })),
  setUrl: (url) => set((state) => ({
    currentRequest: { ...state.currentRequest, url }
  })),
  setHeaders: (headers) => set((state) => ({
    currentRequest: { ...state.currentRequest, headers }
  })),
  setBody: (body) => set((state) => ({
    currentRequest: { ...state.currentRequest, body }
  })),
  setAuth: (auth) => set((state) => ({
    currentRequest: { ...state.currentRequest, auth }
  })),
  setProxy: (proxy) => set((state) => ({
    currentRequest: { ...state.currentRequest, proxy }
  })),
  setSslVerify: (ssl_verify) => set((state) => ({
    currentRequest: { ...state.currentRequest, ssl_verify }
  })),
  setTimeout: (timeout) => set((state) => ({
    currentRequest: { ...state.currentRequest, timeout }
  })),
  setResponse: (response) => set({ response }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  resetRequest: () => set({ currentRequest: defaultRequest, response: null, error: null }),
}));
