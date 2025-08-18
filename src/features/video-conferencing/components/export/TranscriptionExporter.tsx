/**
 * TranscriptionExporter Component
 * Exports transcriptions in TXT and DOCX formats
 */
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Copy,
  Check,
  Clock,
  User,
  Settings,
  FileType,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { TranscriptionSegment } from "../../types/analytics";

interface TranscriptionExporterProps {
  transcription: TranscriptionSegment[];
  meetingTitle: string;
  onExport: (format: "txt" | "docx", options: ExportOptions) => Promise<void>;
  className?: string;
}

interface ExportOptions {
  includeTimestamps: boolean;
  includeSpeakers: boolean;
  includeConfidence: boolean;
  groupBySpeaker: boolean;
  format: "txt" | "docx";
  customHeader?: string;
  customFooter?: string;
}

export function TranscriptionExporter({
  transcription,
  meetingTitle,
  onExport,
  className,
}: TranscriptionExporterProps) {
  const [format, setFormat] = useState<"txt" | "docx">("txt");
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeSpeakers, setIncludeSpeakers] = useState(true);
  const [includeConfidence, setIncludeConfidence] = useState(false);
  const [groupBySpeaker, setGroupBySpeaker] = useState(false);
  const [customHeader, setCustomHeader] = useState("");
  const [customFooter, setCustomFooter] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  const exportOptions: ExportOptions = {
    includeTimestamps,
    includeSpeakers,
    includeConfidence,
    groupBySpeaker,
    format,
    customHeader: customHeader.trim() || undefined,
    customFooter: customFooter.trim() || undefined,
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(format, exportOptions);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const generatePreview = () => {
    if (transcription.length === 0) return "No transcription available.";

    const lines: string[] = [];

    // Add custom header
    if (customHeader.trim()) {
      lines.push(customHeader.trim());
      lines.push("");
    }

    // Add meeting info
    lines.push(`Meeting: ${meetingTitle}`);
    lines.push(`Exported: ${new Date().toLocaleString()}`);
    lines.push(`Total segments: ${transcription.length}`);
    lines.push("");
    lines.push("---");
    lines.push("");

    if (groupBySpeaker) {
      // Group by speaker
      const speakerGroups = transcription.reduce(
        (groups, segment) => {
          if (!groups[segment.speaker]) {
            groups[segment.speaker] = [];
          }
          groups[segment.speaker].push(segment);
          return groups;
        },
        {} as Record<string, TranscriptionSegment[]>
      );

      Object.entries(speakerGroups).forEach(([speaker, segments]) => {
        lines.push(`${speaker}:`);
        lines.push("");

        segments.forEach((segment) => {
          let line = "";
          if (includeTimestamps) {
            line += `[${formatTime(segment.timestamp)}] `;
          }
          line += segment.text;
          if (includeConfidence && segment.confidence) {
            line += ` (${Math.round(segment.confidence * 100)}% confidence)`;
          }
          lines.push(line);
        });

        lines.push("");
      });
    } else {
      // Sequential format
      transcription.slice(0, 10).forEach((segment) => {
        // Preview first 10 segments
        let line = "";

        if (includeTimestamps) {
          line += `[${formatTime(segment.timestamp)}] `;
        }

        if (includeSpeakers) {
          line += `${segment.speaker}: `;
        }

        line += segment.text;

        if (includeConfidence && segment.confidence) {
          line += ` (${Math.round(segment.confidence * 100)}% confidence)`;
        }

        lines.push(line);
      });

      if (transcription.length > 10) {
        lines.push("");
        lines.push(`... and ${transcription.length - 10} more segments`);
      }
    }

    // Add custom footer
    if (customFooter.trim()) {
      lines.push("");
      lines.push("---");
      lines.push("");
      lines.push(customFooter.trim());
    }

    return lines.join("\n");
  };

  const copyPreview = async () => {
    try {
      await navigator.clipboard.writeText(generatePreview());
      setCopiedPreview(true);
      setTimeout(() => setCopiedPreview(false), 2000);
    } catch (error) {
      console.error("Failed to copy preview:", error);
    }
  };

  const getEstimatedSize = () => {
    const preview = generatePreview();
    const sizeInBytes = new Blob([preview]).size;
    const sizeInKB = Math.round(sizeInBytes / 1024);

    // DOCX files are typically larger
    const multiplier = format === "docx" ? 2.5 : 1;
    const estimatedSize = Math.round(sizeInKB * multiplier);

    return estimatedSize < 1024
      ? `${estimatedSize} KB`
      : `${(estimatedSize / 1024).toFixed(1)} MB`;
  };

  const speakers = Array.from(new Set(transcription.map((s) => s.speaker)));
  const totalDuration =
    transcription.length > 0
      ? Math.max(...transcription.map((s) => new Date(s.timestamp).getTime())) -
        Math.min(...transcription.map((s) => new Date(s.timestamp).getTime()))
      : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Export Transcription
          </CardTitle>

          <div className='flex items-center gap-2'>
            <Badge variant='outline'>{transcription.length} segments</Badge>
            <Badge variant='secondary'>{speakers.length} speakers</Badge>
          </div>
        </div>

        <p className='text-sm text-muted-foreground'>
          Export transcription from "{meetingTitle}" in your preferred format
        </p>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Format Selection */}
        <div className='space-y-3'>
          <Label className='text-base font-medium'>Export Format</Label>
          <RadioGroup
            value={format}
            onValueChange={(value: "txt" | "docx") => setFormat(value)}
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='txt' id='txt' />
              <Label htmlFor='txt' className='flex-1 cursor-pointer'>
                <div className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50'>
                  <div className='flex items-center gap-3'>
                    <FileText className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <div className='font-medium'>Plain Text (.txt)</div>
                      <div className='text-sm text-muted-foreground'>
                        Simple text format, compatible with all applications
                      </div>
                    </div>
                  </div>
                  <Badge variant='outline'>Lightweight</Badge>
                </div>
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='docx' id='docx' />
              <Label htmlFor='docx' className='flex-1 cursor-pointer'>
                <div className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50'>
                  <div className='flex items-center gap-3'>
                    <FileType className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <div className='font-medium'>Word Document (.docx)</div>
                      <div className='text-sm text-muted-foreground'>
                        Formatted document with styling and structure
                      </div>
                    </div>
                  </div>
                  <Badge variant='outline'>Formatted</Badge>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Export Options */}
        <div className='space-y-4'>
          <Label className='text-base font-medium'>Export Options</Label>

          <div className='grid grid-cols-1 gap-3'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='timestamps'
                checked={includeTimestamps}
                onCheckedChange={setIncludeTimestamps}
              />
              <Label
                htmlFor='timestamps'
                className='flex items-center gap-2 cursor-pointer'
              >
                <Clock className='h-4 w-4 text-muted-foreground' />
                Include timestamps
                <span className='text-sm text-muted-foreground'>
                  ([00:05:23] format)
                </span>
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='speakers'
                checked={includeSpeakers}
                onCheckedChange={setIncludeSpeakers}
              />
              <Label
                htmlFor='speakers'
                className='flex items-center gap-2 cursor-pointer'
              >
                <User className='h-4 w-4 text-muted-foreground' />
                Include speaker names
                <span className='text-sm text-muted-foreground'>
                  (Speaker: text format)
                </span>
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='confidence'
                checked={includeConfidence}
                onCheckedChange={setIncludeConfidence}
              />
              <Label
                htmlFor='confidence'
                className='flex items-center gap-2 cursor-pointer'
              >
                <Settings className='h-4 w-4 text-muted-foreground' />
                Include confidence scores
                <span className='text-sm text-muted-foreground'>
                  (95% confidence)
                </span>
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='group'
                checked={groupBySpeaker}
                onCheckedChange={setGroupBySpeaker}
              />
              <Label
                htmlFor='group'
                className='flex items-center gap-2 cursor-pointer'
              >
                <User className='h-4 w-4 text-muted-foreground' />
                Group by speaker
                <span className='text-sm text-muted-foreground'>
                  (Organize by person)
                </span>
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Custom Headers/Footers */}
        <div className='space-y-4'>
          <Label className='text-base font-medium'>Custom Content</Label>

          <div className='space-y-3'>
            <div>
              <Label htmlFor='header' className='text-sm font-medium'>
                Custom Header (optional)
              </Label>
              <Textarea
                id='header'
                placeholder='Add custom header text...'
                value={customHeader}
                onChange={(e) => setCustomHeader(e.target.value)}
                className='mt-1'
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor='footer' className='text-sm font-medium'>
                Custom Footer (optional)
              </Label>
              <Textarea
                id='footer'
                placeholder='Add custom footer text...'
                value={customFooter}
                onChange={(e) => setCustomFooter(e.target.value)}
                className='mt-1'
                rows={2}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Preview */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label className='text-base font-medium'>Preview</Label>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowPreview(!showPreview)}
                className='flex items-center gap-2'
              >
                {showPreview ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
                {showPreview ? "Hide" : "Show"} Preview
              </Button>

              {showPreview && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={copyPreview}
                  className='flex items-center gap-2'
                >
                  {copiedPreview ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                  Copy
                </Button>
              )}
            </div>
          </div>

          {showPreview && (
            <div className='border rounded-lg p-4 bg-muted/50 max-h-64 overflow-y-auto'>
              <pre className='text-sm whitespace-pre-wrap font-mono'>
                {generatePreview()}
              </pre>
            </div>
          )}
        </div>

        {/* Export Summary */}
        <div className='p-4 bg-muted rounded-lg'>
          <div className='flex items-center justify-between mb-2'>
            <span className='font-medium'>Export Summary</span>
            <Badge variant='outline'>{getEstimatedSize()}</Badge>
          </div>
          <div className='text-sm text-muted-foreground space-y-1'>
            <div className='flex justify-between'>
              <span>Format:</span>
              <span className='font-medium uppercase'>{format}</span>
            </div>
            <div className='flex justify-between'>
              <span>Segments:</span>
              <span className='font-medium'>{transcription.length}</span>
            </div>
            <div className='flex justify-between'>
              <span>Speakers:</span>
              <span className='font-medium'>{speakers.length}</span>
            </div>
            {totalDuration > 0 && (
              <div className='flex justify-between'>
                <span>Duration:</span>
                <span className='font-medium'>
                  {Math.round(totalDuration / (1000 * 60))} minutes
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || transcription.length === 0}
          className='w-full flex items-center gap-2'
          size='lg'
        >
          {isExporting ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Download className='h-4 w-4' />
          )}
          {isExporting ? "Exporting..." : `Export as ${format.toUpperCase()}`}
        </Button>

        {/* No Transcription Message */}
        {transcription.length === 0 && (
          <div className='text-center py-8'>
            <FileText className='h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50' />
            <h3 className='text-lg font-semibold mb-2'>
              No Transcription Available
            </h3>
            <p className='text-muted-foreground'>
              This meeting doesn't have a transcription to export.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
