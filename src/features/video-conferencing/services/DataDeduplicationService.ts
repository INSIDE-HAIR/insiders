/**
 * Data Deduplication Service
 * Handles duplicate detection and data deduplication for meeting synchronization
 */

import { VideoProvider } from "@prisma/client";
import crypto from "crypto";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingRecordId?: string;
  confidence: number;
  matchedFields: string[];
  reason?: string;
}

export interface DeduplicationRule {
  id: string;
  provider?: VideoProvider;
  recordType: "meeting" | "participant";
  matchFields: string[];
  threshold: number;
  enabled: boolean;
  priority: number;
}

export interface DeduplicationStats {
  totalChecks: number;
  duplicatesDetected: number;
  duplicatesResolved: number;
  mergeOperations: number;
  processingTime: number;
}

export class DataDeduplicationService {
  private rules: DeduplicationRule[] = [];
  private stats: DeduplicationStats = {
    totalChecks: 0,
    duplicatesDetected: 0,
    duplicatesResolved: 0,
    mergeOperations: 0,
    processingTime: 0,
  };

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Check if a record is a duplicate
   */
  async checkForDuplicates(
    recordType: "meeting" | "participant",
    recordData: any,
    provider?: VideoProvider
  ): Promise<DuplicateCheckResult> {
    const startTime = Date.now();
    this.stats.totalChecks++;

    try {
      // Get applicable rules
      const applicableRules = this.getApplicableRules(recordType, provider);

      if (applicableRules.length === 0) {
        return {
          isDuplicate: false,
          confidence: 0,
          matchedFields: [],
          reason: "No applicable deduplication rules found",
        };
      }

      // Check each rule
      for (const rule of applicableRules) {
        const duplicateCheck = await this.checkRuleForDuplicates(
          rule,
          recordData
        );

        if (duplicateCheck.isDuplicate) {
          this.stats.duplicatesDetected++;
          return duplicateCheck;
        }
      }

      return {
        isDuplicate: false,
        confidence: 0,
        matchedFields: [],
      };
    } catch (error) {
      console.error("Duplicate check error:", error);

      return {
        isDuplicate: false,
        confidence: 0,
        matchedFields: [],
        reason: `Duplicate check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    } finally {
      this.stats.processingTime += Date.now() - startTime;
    }
  }

  /**
   * Merge duplicate records
   */
  async mergeDuplicateRecords(
    primaryRecordId: string,
    duplicateRecordId: string,
    recordType: "meeting" | "participant"
  ): Promise<{
    success: boolean;
    mergedRecordId: string;
    error?: string;
    mergedFields?: string[];
  }> {
    try {
      this.stats.mergeOperations++;

      // Get both records
      const primaryRecord = await this.getRecordById(
        primaryRecordId,
        recordType
      );
      const duplicateRecord = await this.getRecordById(
        duplicateRecordId,
        recordType
      );

      if (!primaryRecord || !duplicateRecord) {
        return {
          success: false,
          mergedRecordId: primaryRecordId,
          error: "One or both records not found",
        };
      }

      // Merge the records
      const mergedData = this.mergeRecordData(
        primaryRecord,
        duplicateRecord,
        recordType
      );
      const mergedFields = this.identifyMergedFields(
        primaryRecord,
        duplicateRecord
      );

      // Update primary record with merged data
      await this.updateRecord(primaryRecordId, mergedData, recordType);

      // Mark duplicate record as merged or delete it
      await this.handleDuplicateRecord(
        duplicateRecordId,
        primaryRecordId,
        recordType
      );

      this.stats.duplicatesResolved++;

      return {
        success: true,
        mergedRecordId: primaryRecordId,
        mergedFields,
      };
    } catch (error) {
      console.error("Merge operation error:", error);

      return {
        success: false,
        mergedRecordId: primaryRecordId,
        error:
          error instanceof Error ? error.message : "Merge operation failed",
      };
    }
  }

  /**
   * Generate fingerprint for record deduplication
   */
  generateRecordFingerprint(recordData: any, fields: string[]): string {
    const values = fields
      .map((field) => this.getNestedValue(recordData, field))
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase().trim())
      .sort();

    const fingerprint = values.join("|");
    return crypto.createHash("sha256").update(fingerprint).digest("hex");
  }

  /**
   * Add deduplication rule
   */
  addRule(rule: DeduplicationRule): void {
    this.rules.push(rule);
    this.sortRules();
  }

  /**
   * Remove deduplication rule
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex((rule) => rule.id === ruleId);
    if (index !== -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all deduplication rules
   */
  getRules(): DeduplicationRule[] {
    return [...this.rules];
  }

  /**
   * Get deduplication statistics
   */
  getStats(): DeduplicationStats {
    return { ...this.stats };
  }

  /**
   * Reset deduplication statistics
   */
  resetStats(): void {
    this.stats = {
      totalChecks: 0,
      duplicatesDetected: 0,
      duplicatesResolved: 0,
      mergeOperations: 0,
      processingTime: 0,
    };
  }

  /**
   * Initialize default deduplication rules
   */
  private initializeDefaultRules(): void {
    // Meeting deduplication rules
    this.addRule({
      id: "meeting-external-id",
      recordType: "meeting",
      matchFields: ["externalId", "provider"],
      threshold: 1.0, // Exact match required
      enabled: true,
      priority: 100,
    });

    this.addRule({
      id: "meeting-title-time",
      recordType: "meeting",
      matchFields: ["title", "startTime", "hostEmail"],
      threshold: 0.9,
      enabled: true,
      priority: 80,
    });

    this.addRule({
      id: "meeting-url",
      recordType: "meeting",
      matchFields: ["meetingUrl"],
      threshold: 1.0,
      enabled: true,
      priority: 90,
    });

    // Participant deduplication rules
    this.addRule({
      id: "participant-email-meeting",
      recordType: "participant",
      matchFields: ["email", "meetingId"],
      threshold: 1.0,
      enabled: true,
      priority: 100,
    });

    this.addRule({
      id: "participant-external-id",
      recordType: "participant",
      matchFields: ["externalId", "meetingId"],
      threshold: 1.0,
      enabled: true,
      priority: 95,
    });

    this.addRule({
      id: "participant-name-meeting",
      recordType: "participant",
      matchFields: ["name", "meetingId", "joinTime"],
      threshold: 0.8,
      enabled: true,
      priority: 70,
    });
  }

  /**
   * Get applicable rules for record type and provider
   */
  private getApplicableRules(
    recordType: "meeting" | "participant",
    provider?: VideoProvider
  ): DeduplicationRule[] {
    return this.rules
      .filter((rule) => {
        if (!rule.enabled) return false;
        if (rule.recordType !== recordType) return false;
        if (rule.provider && provider && rule.provider !== provider)
          return false;
        return true;
      })
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check a specific rule for duplicates
   */
  private async checkRuleForDuplicates(
    rule: DeduplicationRule,
    recordData: any
  ): Promise<DuplicateCheckResult> {
    try {
      // Generate fingerprint for the record
      const fingerprint = this.generateRecordFingerprint(
        recordData,
        rule.matchFields
      );

      // Search for existing records with the same fingerprint
      const existingRecords = await this.findRecordsByFingerprint(
        fingerprint,
        rule.recordType,
        rule.matchFields
      );

      if (existingRecords.length === 0) {
        return {
          isDuplicate: false,
          confidence: 0,
          matchedFields: [],
        };
      }

      // Calculate similarity for each existing record
      let bestMatch: {
        recordId: string;
        confidence: number;
        matchedFields: string[];
      } | null = null;

      for (const existingRecord of existingRecords) {
        const similarity = this.calculateSimilarity(
          recordData,
          existingRecord,
          rule.matchFields
        );

        if (similarity.confidence >= rule.threshold) {
          if (!bestMatch || similarity.confidence > bestMatch.confidence) {
            bestMatch = {
              recordId: existingRecord.id,
              confidence: similarity.confidence,
              matchedFields: similarity.matchedFields,
            };
          }
        }
      }

      if (bestMatch) {
        return {
          isDuplicate: true,
          existingRecordId: bestMatch.recordId,
          confidence: bestMatch.confidence,
          matchedFields: bestMatch.matchedFields,
          reason: `Matched by rule: ${rule.id}`,
        };
      }

      return {
        isDuplicate: false,
        confidence: 0,
        matchedFields: [],
      };
    } catch (error) {
      console.error(`Rule check error for ${rule.id}:`, error);

      return {
        isDuplicate: false,
        confidence: 0,
        matchedFields: [],
        reason: `Rule check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Calculate similarity between two records
   */
  private calculateSimilarity(
    record1: any,
    record2: any,
    fields: string[]
  ): { confidence: number; matchedFields: string[] } {
    const matchedFields: string[] = [];
    let totalFields = 0;
    let matchedCount = 0;

    for (const field of fields) {
      const value1 = this.getNestedValue(record1, field);
      const value2 = this.getNestedValue(record2, field);

      // Skip null/undefined values
      if (value1 == null || value2 == null) {
        continue;
      }

      totalFields++;

      // Check for exact match
      if (this.valuesMatch(value1, value2, field)) {
        matchedCount++;
        matchedFields.push(field);
      }
    }

    const confidence = totalFields > 0 ? matchedCount / totalFields : 0;

    return { confidence, matchedFields };
  }

  /**
   * Check if two values match (with field-specific logic)
   */
  private valuesMatch(value1: any, value2: any, field: string): boolean {
    // Handle dates
    if (field.includes("Time") || field.includes("Date")) {
      const date1 = new Date(value1);
      const date2 = new Date(value2);

      // Consider dates within 1 minute as matching
      return Math.abs(date1.getTime() - date2.getTime()) <= 60000;
    }

    // Handle strings (case-insensitive)
    if (typeof value1 === "string" && typeof value2 === "string") {
      return value1.toLowerCase().trim() === value2.toLowerCase().trim();
    }

    // Handle numbers
    if (typeof value1 === "number" && typeof value2 === "number") {
      return Math.abs(value1 - value2) < 0.001; // Small tolerance for floating point
    }

    // Default exact match
    return value1 === value2;
  }

  /**
   * Merge data from two records
   */
  private mergeRecordData(
    primaryRecord: any,
    duplicateRecord: any,
    recordType: string
  ): any {
    const merged = { ...primaryRecord };

    // Merge strategy: prefer non-null values from duplicate if primary is null
    for (const [key, value] of Object.entries(duplicateRecord)) {
      if (key === "id" || key === "createdAt") {
        continue; // Don't merge these fields
      }

      if (merged[key] == null && value != null) {
        merged[key] = value;
      } else if (key === "metadata") {
        // Merge metadata objects
        merged[key] = {
          ...merged[key],
          ...value,
          mergedFrom: duplicateRecord.id,
        };
      } else if (key === "updatedAt") {
        // Use the latest update time
        const primaryTime = new Date(merged[key] || 0);
        const duplicateTime = new Date(value || 0);
        merged[key] = duplicateTime > primaryTime ? value : merged[key];
      }
    }

    merged.updatedAt = new Date();
    return merged;
  }

  /**
   * Identify which fields were merged
   */
  private identifyMergedFields(
    primaryRecord: any,
    duplicateRecord: any
  ): string[] {
    const mergedFields: string[] = [];

    for (const [key, value] of Object.entries(duplicateRecord)) {
      if (key === "id" || key === "createdAt") {
        continue;
      }

      if (primaryRecord[key] == null && value != null) {
        mergedFields.push(key);
      }
    }

    return mergedFields;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Sort rules by priority
   */
  private sortRules(): void {
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Database operations (mock implementations)
   */

  private async findRecordsByFingerprint(
    fingerprint: string,
    recordType: string,
    fields: string[]
  ): Promise<any[]> {
    // Mock implementation - would query database
    console.log(
      `Finding records by fingerprint: ${fingerprint} (${recordType})`
    );
    return [];
  }

  private async getRecordById(
    recordId: string,
    recordType: string
  ): Promise<any | null> {
    // Mock implementation - would query database
    console.log(`Getting record by ID: ${recordId} (${recordType})`);
    return {
      id: recordId,
      title: "Mock Meeting",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async updateRecord(
    recordId: string,
    data: any,
    recordType: string
  ): Promise<void> {
    // Mock implementation - would update database
    console.log(`Updating record: ${recordId} (${recordType})`, data);
  }

  private async handleDuplicateRecord(
    duplicateId: string,
    primaryId: string,
    recordType: string
  ): Promise<void> {
    // Mock implementation - would mark as merged or delete
    console.log(
      `Handling duplicate record: ${duplicateId} -> ${primaryId} (${recordType})`
    );
  }
}
