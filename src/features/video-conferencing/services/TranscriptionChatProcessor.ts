/**
 * Transcription and Chat Processing Service
 * Handles processing of transcriptions and chat messages
 */

import { prisma } from "@/lib/prisma";

export interface TranscriptionAnalysis {
  meetingRecordId: string;
  totalSegments: number;
  totalDuration: number; // in seconds
  averageConfidence: number;
  languages: string[];
  speakerCount: number;
  wordCount: number;
  keyTopics: string[];
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  actionItems: string[];
  summary: string;
}

export interface ChatAnalysis {
  meetingRecordId: string;
  totalMessages: number;
  totalParticipants: number;
  messageTypes: Record<string, number>;
  averageMessagesPerParticipant: number;
  mostActiveParticipants: {
    participantId: string;
    name: string;
    messageCount: number;
  }[];
  timeDistribution: {
    hour: number;
    messageCount: number;
  }[];
  privateMessageCount: number;
  publicMessageCount: number;
}

export interface ContentProcessingResult {
  success: boolean;
  transcriptionsProcessed: number;
  chatMessagesProcessed: number;
  analysisGenerated: number;
  errors: string[];
  processingTime: number;
}

export class TranscriptionChatProcessor {
  /**
   * Process transcriptions for analysis
   */
  async processTranscriptions(
    meetingRecordIds?: string[],
    dateRange?: { start: Date; end: Date }
  ): Promise<ContentProcessingResult> {
    const startTime = Date.now();
    const result: ContentProcessingResult = {
      success: false,
      transcriptionsProcessed: 0,
      chatMessagesProcessed: 0,
      analysisGenerated: 0,
      errors: [],
      processingTime: 0,
    };

    try {
      // Build where clause
      const whereClause: any = {};

      if (meetingRecordIds && meetingRecordIds.length > 0) {
        whereClause.meetingRecordId = { in: meetingRecordIds };
      }

      if (dateRange) {
        whereClause.meetingRecord = {
          startTime: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        };
      }

      // Get transcription segments grouped by meeting
      const transcriptionSegments = await prisma.transcriptionSegment.findMany({
        where: whereClause,
        include: {
          meetingRecord: {
            select: {
              id: true,
              title: true,
              startTime: true,
            },
          },
        },
        orderBy: [{ meetingRecordId: "asc" }, { startTime: "asc" }],
      });

      // Group by meeting record
      const meetingTranscriptions = new Map<string, any[]>();

      for (const segment of transcriptionSegments) {
        const meetingId = segment.meetingRecordId;

        if (!meetingTranscriptions.has(meetingId)) {
          meetingTranscriptions.set(meetingId, []);
        }

        meetingTranscriptions.get(meetingId)!.push(segment);
      }

      // Process each meeting's transcriptions
      for (const [meetingId, segments] of meetingTranscriptions.entries()) {
        try {
          const analysis = await this.analyzeTranscription(meetingId, segments);
          await this.storeTranscriptionAnalysis(analysis);

          result.transcriptionsProcessed += segments.length;
          result.analysisGenerated++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          result.errors.push(
            `Failed to process transcription for meeting ${meetingId}: ${errorMessage}`
          );
        }
      }

      result.success = result.errors.length === 0;
      result.processingTime = Date.now() - startTime;

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Transcription processing failed: ${errorMessage}`);
      result.processingTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Process chat messages for analysis
   */
  async processChatMessages(
    meetingRecordIds?: string[],
    dateRange?: { start: Date; end: Date }
  ): Promise<ContentProcessingResult> {
    const startTime = Date.now();
    const result: ContentProcessingResult = {
      success: false,
      transcriptionsProcessed: 0,
      chatMessagesProcessed: 0,
      analysisGenerated: 0,
      errors: [],
      processingTime: 0,
    };

    try {
      // Build where clause
      const whereClause: any = {};

      if (meetingRecordIds && meetingRecordIds.length > 0) {
        whereClause.meetingRecordId = { in: meetingRecordIds };
      }

      if (dateRange) {
        whereClause.timestamp = {
          gte: dateRange.start,
          lte: dateRange.end,
        };
      }

      // Get chat messages grouped by meeting
      const chatMessages = await prisma.chatMessage.findMany({
        where: whereClause,
        include: {
          meetingRecord: {
            select: {
              id: true,
              title: true,
              startTime: true,
            },
          },
        },
        orderBy: [{ meetingRecordId: "asc" }, { timestamp: "asc" }],
      });

      // Group by meeting record
      const meetingChats = new Map<string, any[]>();

      for (const message of chatMessages) {
        const meetingId = message.meetingRecordId;

        if (!meetingChats.has(meetingId)) {
          meetingChats.set(meetingId, []);
        }

        meetingChats.get(meetingId)!.push(message);
      }

      // Process each meeting's chat messages
      for (const [meetingId, messages] of meetingChats.entries()) {
        try {
          const analysis = await this.analyzeChatMessages(meetingId, messages);
          await this.storeChatAnalysis(analysis);

          result.chatMessagesProcessed += messages.length;
          result.analysisGenerated++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          result.errors.push(
            `Failed to process chat for meeting ${meetingId}: ${errorMessage}`
          );
        }
      }

      result.success = result.errors.length === 0;
      result.processingTime = Date.now() - startTime;

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Chat processing failed: ${errorMessage}`);
      result.processingTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Get transcription analysis for a meeting
   */
  async getTranscriptionAnalysis(
    meetingRecordId: string
  ): Promise<TranscriptionAnalysis | null> {
    try {
      const analysis = await prisma.transcriptionAnalysis.findUnique({
        where: { meetingRecordId },
      });

      if (!analysis) {
        return null;
      }

      return {
        meetingRecordId: analysis.meetingRecordId,
        totalSegments: analysis.totalSegments,
        totalDuration: analysis.totalDuration,
        averageConfidence: analysis.averageConfidence,
        languages: analysis.languages as string[],
        speakerCount: analysis.speakerCount,
        wordCount: analysis.wordCount,
        keyTopics: analysis.keyTopics as string[],
        sentiment: analysis.sentiment as "POSITIVE" | "NEUTRAL" | "NEGATIVE",
        actionItems: analysis.actionItems as string[],
        summary: analysis.summary,
      };
    } catch (error) {
      console.error("Error getting transcription analysis:", error);
      return null;
    }
  }

  /**
   * Get chat analysis for a meeting
   */
  async getChatAnalysis(meetingRecordId: string): Promise<ChatAnalysis | null> {
    try {
      const analysis = await prisma.chatAnalysis.findUnique({
        where: { meetingRecordId },
      });

      if (!analysis) {
        return null;
      }

      return {
        meetingRecordId: analysis.meetingRecordId,
        totalMessages: analysis.totalMessages,
        totalParticipants: analysis.totalParticipants,
        messageTypes: analysis.messageTypes as Record<string, number>,
        averageMessagesPerParticipant: analysis.averageMessagesPerParticipant,
        mostActiveParticipants: analysis.mostActiveParticipants as any[],
        timeDistribution: analysis.timeDistribution as any[],
        privateMessageCount: analysis.privateMessageCount,
        publicMessageCount: analysis.publicMessageCount,
      };
    } catch (error) {
      console.error("Error getting chat analysis:", error);
      return null;
    }
  }

  /**
   * Search transcriptions by content
   */
  async searchTranscriptions(
    query: string,
    filters?: {
      meetingRecordIds?: string[];
      dateRange?: { start: Date; end: Date };
      confidence?: number; // minimum confidence threshold
    }
  ): Promise<{
    segments: any[];
    totalResults: number;
    meetings: string[];
  }> {
    try {
      // Build where clause
      const whereClause: any = {
        text: {
          contains: query,
          mode: "insensitive",
        },
      };

      if (filters?.meetingRecordIds && filters.meetingRecordIds.length > 0) {
        whereClause.meetingRecordId = { in: filters.meetingRecordIds };
      }

      if (filters?.confidence) {
        whereClause.confidence = { gte: filters.confidence };
      }

      if (filters?.dateRange) {
        whereClause.meetingRecord = {
          startTime: {
            gte: filters.dateRange.start,
            lte: filters.dateRange.end,
          },
        };
      }

      // Search transcription segments
      const segments = await prisma.transcriptionSegment.findMany({
        where: whereClause,
        include: {
          meetingRecord: {
            select: {
              id: true,
              title: true,
              startTime: true,
              videoSpace: {
                select: {
                  name: true,
                  cohort: true,
                },
              },
            },
          },
        },
        orderBy: [{ meetingRecordId: "asc" }, { startTime: "asc" }],
      });

      const uniqueMeetings = new Set(segments.map((s) => s.meetingRecordId));

      return {
        segments,
        totalResults: segments.length,
        meetings: Array.from(uniqueMeetings),
      };
    } catch (error) {
      console.error("Error searching transcriptions:", error);
      return {
        segments: [],
        totalResults: 0,
        meetings: [],
      };
    }
  }

  /**
   * Analyze transcription segments for a meeting
   */
  private async analyzeTranscription(
    meetingRecordId: string,
    segments: any[]
  ): Promise<TranscriptionAnalysis> {
    // Calculate basic metrics
    const totalSegments = segments.length;
    const totalDuration = segments.reduce(
      (max, segment) => Math.max(max, segment.endTime),
      0
    );

    const confidenceValues = segments
      .filter((s) => s.confidence !== null)
      .map((s) => s.confidence);
    const averageConfidence =
      confidenceValues.length > 0
        ? confidenceValues.reduce((sum, c) => sum + c, 0) /
          confidenceValues.length
        : 0;

    // Extract languages
    const languages = [
      ...new Set(segments.filter((s) => s.language).map((s) => s.language)),
    ];

    // Count unique speakers
    const speakers = new Set(
      segments.filter((s) => s.participantId).map((s) => s.participantId)
    );
    const speakerCount = speakers.size;

    // Count words
    const allText = segments.map((s) => s.text).join(" ");
    const wordCount = allText
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    // Extract key topics (simple keyword extraction)
    const keyTopics = this.extractKeyTopics(allText);

    // Analyze sentiment (simple implementation)
    const sentiment = this.analyzeSentiment(allText);

    // Extract action items (simple pattern matching)
    const actionItems = this.extractActionItems(allText);

    // Generate summary (simple implementation)
    const summary = this.generateSummary(allText);

    return {
      meetingRecordId,
      totalSegments,
      totalDuration,
      averageConfidence,
      languages,
      speakerCount,
      wordCount,
      keyTopics,
      sentiment,
      actionItems,
      summary,
    };
  }

  /**
   * Analyze chat messages for a meeting
   */
  private async analyzeChatMessages(
    meetingRecordId: string,
    messages: any[]
  ): Promise<ChatAnalysis> {
    const totalMessages = messages.length;

    // Count unique participants
    const participants = new Set(messages.map((m) => m.participantId));
    const totalParticipants = participants.size;

    // Count message types
    const messageTypes: Record<string, number> = {};
    for (const message of messages) {
      const type = message.messageType;
      messageTypes[type] = (messageTypes[type] || 0) + 1;
    }

    // Calculate average messages per participant
    const averageMessagesPerParticipant =
      totalParticipants > 0 ? totalMessages / totalParticipants : 0;

    // Find most active participants
    const participantMessageCounts = new Map<
      string,
      { name: string; count: number }
    >();

    for (const message of messages) {
      const participantId = message.participantId;

      if (!participantMessageCounts.has(participantId)) {
        // Get participant name from participant records
        const participantRecord = await prisma.participantRecord.findFirst({
          where: {
            meetingRecordId,
            participantId,
          },
          select: { name: true },
        });

        participantMessageCounts.set(participantId, {
          name: participantRecord?.name || "Unknown",
          count: 0,
        });
      }

      participantMessageCounts.get(participantId)!.count++;
    }

    const mostActiveParticipants = Array.from(
      participantMessageCounts.entries()
    )
      .map(([participantId, data]) => ({
        participantId,
        name: data.name,
        messageCount: data.count,
      }))
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, 5);

    // Calculate time distribution (by hour)
    const timeDistribution: { hour: number; messageCount: number }[] = [];
    const hourCounts = new Map<number, number>();

    for (const message of messages) {
      const hour = new Date(message.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }

    for (let hour = 0; hour < 24; hour++) {
      timeDistribution.push({
        hour,
        messageCount: hourCounts.get(hour) || 0,
      });
    }

    // Count private vs public messages
    const privateMessageCount = messages.filter((m) => m.isPrivate).length;
    const publicMessageCount = messages.filter((m) => !m.isPrivate).length;

    return {
      meetingRecordId,
      totalMessages,
      totalParticipants,
      messageTypes,
      averageMessagesPerParticipant,
      mostActiveParticipants,
      timeDistribution,
      privateMessageCount,
      publicMessageCount,
    };
  }

  /**
   * Extract key topics from text (simple implementation)
   */
  private extractKeyTopics(text: string): string[] {
    // Simple keyword extraction - in production, use NLP libraries
    const commonWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "must",
      "shall",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
      "this",
      "that",
      "these",
      "those",
      "here",
      "there",
      "where",
      "when",
      "why",
      "how",
      "what",
      "who",
      "which",
      "whose",
      "whom",
      "yes",
      "no",
      "not",
      "so",
      "very",
      "just",
      "now",
      "then",
      "well",
      "also",
      "too",
      "only",
      "even",
      "still",
      "more",
      "most",
      "some",
      "any",
      "all",
      "each",
      "every",
      "both",
      "either",
      "neither",
      "one",
      "two",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !commonWords.has(word));

    // Count word frequency
    const wordCounts = new Map<string, number>();
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }

    // Return top 10 most frequent words
    return Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Analyze sentiment (simple implementation)
   */
  private analyzeSentiment(text: string): "POSITIVE" | "NEUTRAL" | "NEGATIVE" {
    // Simple sentiment analysis - in production, use NLP libraries
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "awesome",
      "fantastic",
      "wonderful",
      "amazing",
      "perfect",
      "love",
      "like",
      "happy",
      "pleased",
      "satisfied",
    ];
    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "horrible",
      "hate",
      "dislike",
      "angry",
      "frustrated",
      "disappointed",
      "sad",
      "upset",
      "annoyed",
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of words) {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    }

    if (positiveCount > negativeCount) return "POSITIVE";
    if (negativeCount > positiveCount) return "NEGATIVE";
    return "NEUTRAL";
  }

  /**
   * Extract action items (simple implementation)
   */
  private extractActionItems(text: string): string[] {
    // Simple pattern matching for action items
    const actionPatterns = [
      /(?:action item|todo|to do|task|follow up|next step):\s*([^.!?]+)/gi,
      /(?:we need to|should|must|will)\s+([^.!?]+)/gi,
      /(?:assign|assigned to|responsible for)\s+([^.!?]+)/gi,
    ];

    const actionItems: string[] = [];

    for (const pattern of actionPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          actionItems.push(match[1].trim());
        }
      }
    }

    return actionItems.slice(0, 10); // Limit to 10 action items
  }

  /**
   * Generate summary (simple implementation)
   */
  private generateSummary(text: string): string {
    // Simple summary generation - in production, use NLP libraries
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);

    if (sentences.length === 0) {
      return "No summary available.";
    }

    // Take first few sentences as summary
    const summaryLength = Math.min(3, sentences.length);
    return sentences.slice(0, summaryLength).join(". ").trim() + ".";
  }

  /**
   * Store transcription analysis
   */
  private async storeTranscriptionAnalysis(
    analysis: TranscriptionAnalysis
  ): Promise<void> {
    try {
      await prisma.transcriptionAnalysis.upsert({
        where: { meetingRecordId: analysis.meetingRecordId },
        update: {
          totalSegments: analysis.totalSegments,
          totalDuration: analysis.totalDuration,
          averageConfidence: analysis.averageConfidence,
          languages: analysis.languages,
          speakerCount: analysis.speakerCount,
          wordCount: analysis.wordCount,
          keyTopics: analysis.keyTopics,
          sentiment: analysis.sentiment,
          actionItems: analysis.actionItems,
          summary: analysis.summary,
          updatedAt: new Date(),
        },
        create: {
          meetingRecordId: analysis.meetingRecordId,
          totalSegments: analysis.totalSegments,
          totalDuration: analysis.totalDuration,
          averageConfidence: analysis.averageConfidence,
          languages: analysis.languages,
          speakerCount: analysis.speakerCount,
          wordCount: analysis.wordCount,
          keyTopics: analysis.keyTopics,
          sentiment: analysis.sentiment,
          actionItems: analysis.actionItems,
          summary: analysis.summary,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error storing transcription analysis:", error);
      throw error;
    }
  }

  /**
   * Store chat analysis
   */
  private async storeChatAnalysis(analysis: ChatAnalysis): Promise<void> {
    try {
      await prisma.chatAnalysis.upsert({
        where: { meetingRecordId: analysis.meetingRecordId },
        update: {
          totalMessages: analysis.totalMessages,
          totalParticipants: analysis.totalParticipants,
          messageTypes: analysis.messageTypes,
          averageMessagesPerParticipant: analysis.averageMessagesPerParticipant,
          mostActiveParticipants: analysis.mostActiveParticipants,
          timeDistribution: analysis.timeDistribution,
          privateMessageCount: analysis.privateMessageCount,
          publicMessageCount: analysis.publicMessageCount,
          updatedAt: new Date(),
        },
        create: {
          meetingRecordId: analysis.meetingRecordId,
          totalMessages: analysis.totalMessages,
          totalParticipants: analysis.totalParticipants,
          messageTypes: analysis.messageTypes,
          averageMessagesPerParticipant: analysis.averageMessagesPerParticipant,
          mostActiveParticipants: analysis.mostActiveParticipants,
          timeDistribution: analysis.timeDistribution,
          privateMessageCount: analysis.privateMessageCount,
          publicMessageCount: analysis.publicMessageCount,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error storing chat analysis:", error);
      throw error;
    }
  }
}
