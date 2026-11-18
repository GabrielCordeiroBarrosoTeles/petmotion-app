export interface InviteParams extends Record<string, string> {
  code: string;
}

export type InviteStatus = 'loading' | 'ready' | 'invalid' | 'own';
