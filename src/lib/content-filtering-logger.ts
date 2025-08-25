export interface FilteredTerm {
  original: string;
  replacement: string;
  reason: string;
}

export interface ContentFilteringLog {
  timestamp: string;
  originalPrompt: string;
  filteredPrompt: string;
  filteredTerms: FilteredTerm[];
  model: string;
  userInput: string;
  success: boolean;
  fALResponse: string;
  generationId: string;
}

export class ContentFilteringLogger {
  private static instance: ContentFilteringLogger;
  private readonly storageKey = 'content-filtering-logs';
  private readonly maxLogs = 1000; // Keep last 1000 logs

  private constructor() {
    this.cleanupOldLogs();
  }

  public static getInstance(): ContentFilteringLogger {
    if (!ContentFilteringLogger.instance) {
      ContentFilteringLogger.instance = new ContentFilteringLogger();
    }
    return ContentFilteringLogger.instance;
  }

  private getLogsFromStorage(): ContentFilteringLog[] {
    if (typeof window === 'undefined') {
      // Server-side: return empty array
      return [];
    }
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ [ContentFilteringLogger] Error loading logs from storage:', error);
      return [];
    }
  }

  private saveLogsToStorage(logs: ContentFilteringLog[]): void {
    if (typeof window === 'undefined') {
      // Server-side: do nothing
      return;
    }
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      console.error('❌ [ContentFilteringLogger] Error saving logs to storage:', error);
    }
  }

  private cleanupOldLogs(): void {
    const logs = this.getLogsFromStorage();
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter out logs older than 24 hours
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime > twentyFourHoursAgo;
    });

    // Keep only the last maxLogs entries
    const trimmedLogs = recentLogs.slice(-this.maxLogs);

    if (trimmedLogs.length !== logs.length) {
      this.saveLogsToStorage(trimmedLogs);
      console.log(`🗑️ [ContentFilteringLogger] Cleaned up logs. Kept ${trimmedLogs.length} recent entries.`);
    }
  }

  public logContentFiltering(
    originalPrompt: string,
    filteredPrompt: string,
    filteredTerms: FilteredTerm[],
    model: string,
    userInput: string,
    success: boolean,
    fALResponse: string
  ): void {
    const logEntry: ContentFilteringLog = {
      timestamp: new Date().toISOString(),
      originalPrompt,
      filteredPrompt,
      filteredTerms,
      model,
      userInput,
      success,
      fALResponse,
      generationId: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };

    const existingLogs = this.getLogsFromStorage();
    existingLogs.push(logEntry);
    this.saveLogsToStorage(existingLogs);

    // Log to console for debugging
    if (filteredTerms.length > 0) {
      console.log('🔍 [ContentFilteringLogger] Content filtering applied:');
      console.log('🔍 [ContentFilteringLogger] Original prompt:', originalPrompt);
      console.log('🔍 [ContentFilteringLogger] Filtered prompt:', filteredPrompt);
      console.log('🔍 [ContentFilteringLogger] Filtered terms:', filteredTerms);
      console.log('🔍 [ContentFilteringLogger] Success:', success);
    }
  }

  public getLogsForAnalysis(): ContentFilteringLog[] {
    return this.getLogsFromStorage();
  }

  public getFilteringStats(): {
    totalGenerations: number;
    successfulGenerations: number;
    failedGenerations: number;
    mostFilteredTerms: { term: string; count: number }[];
    successRate: number;
  } {
    const logs = this.getLogsFromStorage();
    const totalGenerations = logs.length;
    const successfulGenerations = logs.filter(log => log.success).length;
    const failedGenerations = totalGenerations - successfulGenerations;
    const successRate = totalGenerations > 0 ? (successfulGenerations / totalGenerations) * 100 : 0;

    // Count most filtered terms
    const termCounts: { [key: string]: number } = {};
    logs.forEach(log => {
      log.filteredTerms.forEach(term => {
        termCounts[term.original] = (termCounts[term.original] || 0) + 1;
      });
    });

    const mostFilteredTerms = Object.entries(termCounts)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalGenerations,
      successfulGenerations,
      failedGenerations,
      mostFilteredTerms,
      successRate
    };
  }

  public exportLogs(): string {
    const logs = this.getLogsFromStorage();
    return JSON.stringify(logs, null, 2);
  }

  public clearLogs(): void {
    this.saveLogsToStorage([]);
    console.log('🗑️ [ContentFilteringLogger] All logs cleared.');
  }
}
