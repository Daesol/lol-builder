import { kv } from '@vercel/kv';
import type { Match } from '@/types/game';

export interface AnalysisSession {
  matchIds: string[];
  processed: number;
  results: Match[];
  completed: boolean;
}

export const analysisKV = {
  async createSession(sessionId: string, data: AnalysisSession) {
    return kv.set(sessionId, data, { ex: 300 });
  },

  async getSession(sessionId: string): Promise<AnalysisSession | null> {
    const session = await kv.get<AnalysisSession>(sessionId);
    return session;
  },

  async updateSession(sessionId: string, data: Partial<AnalysisSession>) {
    const session = await kv.get<AnalysisSession>(sessionId);
    if (!session) return null;
    
    const updatedSession = { ...session, ...data } as AnalysisSession;
    await kv.set(sessionId, updatedSession, { ex: 300 });
    return updatedSession;
  },

  async deleteSession(sessionId: string) {
    return kv.del(sessionId);
  }
}; 