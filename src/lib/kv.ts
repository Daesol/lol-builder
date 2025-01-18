import { kv } from '@vercel/kv';

export interface AnalysisSession {
  matchIds: string[];
  processed: number;
  results: any[];
  completed: boolean;
}

export const analysisKV = {
  async createSession(sessionId: string, data: AnalysisSession) {
    return kv.set(sessionId, data, { ex: 300 }); // 5 minute expiry
  },

  async getSession(sessionId: string): Promise<AnalysisSession | null> {
    return kv.get(sessionId);
  },

  async updateSession(sessionId: string, data: Partial<AnalysisSession>) {
    const session = await kv.get<AnalysisSession>(sessionId);
    if (!session) return null;
    
    const updatedSession = { ...session, ...data };
    await kv.set(sessionId, updatedSession, { ex: 300 });
    return updatedSession;
  },

  async deleteSession(sessionId: string) {
    return kv.del(sessionId);
  }
}; 