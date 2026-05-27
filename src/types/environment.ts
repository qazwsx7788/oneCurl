export type VariableType = 'string' | 'number' | 'boolean' | 'secret';

export interface EnvironmentVariable {
  key: string;
  value: string;
  variableType: VariableType;
  enabled: boolean;
}

export interface Environment {
  id: number;
  name: string;
  variables: EnvironmentVariable[];
  createdAt: string;
  updatedAt: string;
}
