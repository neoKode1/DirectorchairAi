// Prompt Adherence Monitor - Tracks and validates prompt enhancement consistency
// Ensures all prompt modifications follow established patterns and quality standards

export interface PromptEnhancementLog {
  timestamp: Date;
  originalPrompt: string;
  enhancedPrompt: string;
  enhancementLayers: string[];
  directorStyle?: string;
  modelUsed: string;
  contentType: string;
  validationWarnings: string[];
  adherenceScore: number;
}

export interface AdherenceMetrics {
  totalPrompts: number;
  averageAdherenceScore: number;
  commonWarnings: string[];
  enhancementLayerUsage: Record<string, number>;
  directorStyleUsage: Record<string, number>;
}

export class PromptAdherenceMonitor {
  private static instance: PromptAdherenceMonitor;
  private enhancementLogs: PromptEnhancementLog[] = [];
  private readonly storageKey = 'prompt_adherence_logs';

  private constructor() {
    this.loadLogs();
  }

  public static getInstance(): PromptAdherenceMonitor {
    if (!PromptAdherenceMonitor.instance) {
      PromptAdherenceMonitor.instance = new PromptAdherenceMonitor();
    }
    return PromptAdherenceMonitor.instance;
  }

  // Log a prompt enhancement for monitoring
  public logEnhancement(
    originalPrompt: string,
    enhancedPrompt: string,
    enhancementLayers: string[],
    directorStyle: string | undefined,
    modelUsed: string,
    contentType: string,
    validationWarnings: string[] = []
  ): void {
    const adherenceScore = this.calculateAdherenceScore(
      originalPrompt,
      enhancedPrompt,
      enhancementLayers,
      validationWarnings
    );

    const log: PromptEnhancementLog = {
      timestamp: new Date(),
      originalPrompt,
      enhancedPrompt,
      enhancementLayers,
      directorStyle,
      modelUsed,
      contentType,
      validationWarnings,
      adherenceScore
    };

    this.enhancementLogs.push(log);
    this.saveLogs();
    
    console.log('📊 [PromptAdherenceMonitor] Logged enhancement:', {
      adherenceScore,
      enhancementLayers,
      directorStyle,
      warnings: validationWarnings.length
    });
  }

  // Calculate adherence score (0-100)
  private calculateAdherenceScore(
    originalPrompt: string,
    enhancedPrompt: string,
    enhancementLayers: string[],
    validationWarnings: string[]
  ): number {
    let score = 100;

    // Deduct points for validation warnings
    score -= validationWarnings.length * 10;

    // Check for prompt length appropriateness
    const lengthRatio = enhancedPrompt.length / originalPrompt.length;
    if (lengthRatio > 3) {
      score -= 20; // Too much enhancement
    } else if (lengthRatio < 1.1) {
      score -= 10; // Too little enhancement
    }

    // Check for enhancement layer consistency
    const expectedLayers = ['claude', 'auteur', 'cinematic', 'style'];
    const missingLayers = expectedLayers.filter(layer => 
      !enhancementLayers.some(used => used.toLowerCase().includes(layer))
    );
    score -= missingLayers.length * 5;

    // Check for director style application
    if (enhancementLayers.includes('auteur') && !enhancedPrompt.includes('directed by')) {
      score -= 15;
    }

    // Check for cinematic terminology
    const cinematicTerms = ['cinematic', 'professional', 'lighting', 'composition', 'camera'];
    const hasCinematicTerms = cinematicTerms.some(term => 
      enhancedPrompt.toLowerCase().includes(term)
    );
    if (!hasCinematicTerms) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  // Get adherence metrics
  public getAdherenceMetrics(): AdherenceMetrics {
    const totalPrompts = this.enhancementLogs.length;
    const averageScore = totalPrompts > 0 
      ? this.enhancementLogs.reduce((sum, log) => sum + log.adherenceScore, 0) / totalPrompts
      : 0;

    // Count common warnings
    const warningCounts: Record<string, number> = {};
    this.enhancementLogs.forEach(log => {
      log.validationWarnings.forEach(warning => {
        warningCounts[warning] = (warningCounts[warning] || 0) + 1;
      });
    });

    // Count enhancement layer usage
    const layerUsage: Record<string, number> = {};
    this.enhancementLogs.forEach(log => {
      log.enhancementLayers.forEach(layer => {
        layerUsage[layer] = (layerUsage[layer] || 0) + 1;
      });
    });

    // Count director style usage
    const directorUsage: Record<string, number> = {};
    this.enhancementLogs.forEach(log => {
      if (log.directorStyle) {
        directorUsage[log.directorStyle] = (directorUsage[log.directorStyle] || 0) + 1;
      }
    });

    return {
      totalPrompts,
      averageAdherenceScore: Math.round(averageScore * 100) / 100,
      commonWarnings: Object.entries(warningCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([warning]) => warning),
      enhancementLayerUsage: layerUsage,
      directorStyleUsage: directorUsage
    };
  }

  // Get recent enhancement logs
  public getRecentLogs(limit: number = 10): PromptEnhancementLog[] {
    return this.enhancementLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get logs with low adherence scores
  public getLowAdherenceLogs(threshold: number = 70): PromptEnhancementLog[] {
    return this.enhancementLogs.filter(log => log.adherenceScore < threshold);
  }

  // Clear old logs (keep last 1000)
  public cleanupOldLogs(): void {
    if (this.enhancementLogs.length > 1000) {
      this.enhancementLogs = this.enhancementLogs
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 1000);
      this.saveLogs();
    }
  }

  // Validate prompt enhancement consistency
  public validateEnhancementConsistency(
    originalPrompt: string,
    enhancedPrompt: string,
    enhancementLayers: string[]
  ): {
    isConsistent: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for prompt preservation
    const originalWords = originalPrompt.toLowerCase().split(/\s+/);
    const enhancedWords = enhancedPrompt.toLowerCase().split(/\s+/);
    const preservedWords = originalWords.filter(word => 
      enhancedWords.includes(word) && word.length > 3
    );
    
    const preservationRatio = preservedWords.length / originalWords.length;
    if (preservationRatio < 0.7) {
      issues.push('Original prompt content not well preserved');
      recommendations.push('Ensure key elements from original prompt are maintained');
    }

    // Check for enhancement layer consistency
    if (enhancementLayers.includes('auteur') && !enhancedPrompt.includes('directed by')) {
      issues.push('Auteur enhancement applied but no director style detected');
      recommendations.push('Apply director-specific terminology when using auteur enhancement');
    }

    // Check for cinematic terminology
    const cinematicTerms = ['cinematic', 'professional', 'lighting', 'composition'];
    const hasCinematicEnhancement = cinematicTerms.some(term => 
      enhancedPrompt.toLowerCase().includes(term)
    );
    
    if (!hasCinematicEnhancement && enhancementLayers.includes('cinematic')) {
      issues.push('Cinematic enhancement applied but no cinematic terminology found');
      recommendations.push('Include cinematic terms when applying cinematic enhancement');
    }

    // Check for style reference consistency
    if (enhancementLayers.includes('style') && !enhancedPrompt.includes('style')) {
      issues.push('Style enhancement applied but no style terminology found');
      recommendations.push('Include style-related terms when applying style enhancement');
    }

    return {
      isConsistent: issues.length === 0,
      issues,
      recommendations
    };
  }

  // Generate adherence report
  public generateAdherenceReport(): string {
    const metrics = this.getAdherenceMetrics();
    const recentLogs = this.getRecentLogs(5);
    const lowAdherenceLogs = this.getLowAdherenceLogs();

    let report = `# Prompt Adherence Report\n\n`;
    report += `**Overall Metrics:**\n`;
    report += `- Total Prompts Processed: ${metrics.totalPrompts}\n`;
    report += `- Average Adherence Score: ${metrics.averageAdherenceScore}/100\n`;
    report += `- Low Adherence Prompts: ${lowAdherenceLogs.length}\n\n`;

    report += `**Enhancement Layer Usage:**\n`;
    Object.entries(metrics.enhancementLayerUsage).forEach(([layer, count]) => {
      const percentage = ((count / metrics.totalPrompts) * 100).toFixed(1);
      report += `- ${layer}: ${count} (${percentage}%)\n`;
    });

    report += `\n**Director Style Usage:**\n`;
    Object.entries(metrics.directorStyleUsage).forEach(([director, count]) => {
      const percentage = ((count / metrics.totalPrompts) * 100).toFixed(1);
      report += `- ${director}: ${count} (${percentage}%)\n`;
    });

    if (metrics.commonWarnings.length > 0) {
      report += `\n**Common Warnings:**\n`;
      metrics.commonWarnings.forEach(warning => {
        report += `- ${warning}\n`;
      });
    }

    if (lowAdherenceLogs.length > 0) {
      report += `\n**Recent Low Adherence Examples:**\n`;
      lowAdherenceLogs.slice(0, 3).forEach(log => {
        report += `- Score: ${log.adherenceScore}/100\n`;
        report += `  Original: "${log.originalPrompt.substring(0, 50)}..."\n`;
        report += `  Enhanced: "${log.enhancedPrompt.substring(0, 50)}..."\n`;
        report += `  Warnings: ${log.validationWarnings.join(', ')}\n\n`;
      });
    }

    return report;
  }

  private loadLogs(): void {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.enhancementLogs = parsed.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp)
          }));
        }
      }
    } catch (error) {
      console.warn('⚠️ [PromptAdherenceMonitor] Failed to load logs:', error);
    }
  }

  private saveLogs(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.enhancementLogs));
      }
    } catch (error) {
      console.error('❌ [PromptAdherenceMonitor] Failed to save logs:', error);
    }
  }
}

// Export singleton instance
export const promptAdherenceMonitor = PromptAdherenceMonitor.getInstance();
