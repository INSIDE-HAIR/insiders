/**
 * TranscriptionViewer Component
 * Displays meeting transcription with search functionality
 */
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Download,
  FileText,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { TranscriptionSegment } from "../../types/analytics";

interface TranscriptionViewerProps {
  transcription: TranscriptionSegment[];
  meetingTitle?: string;
  className?: string;
  onExport?: (format: "txt" | "docx") => void;
  searchable?: boolean;
  showTimestamps?: boolean;
  showSpeakers?: boolean;
}

export function TranscriptionViewer({
  transcription,
  meetingTitle,
  className,
  onExport,
  searchable = true,
  showTimestamps = true,
  showSpeakers = true,
}: TranscriptionViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedSegments, setHighlightedSegments] = useState<Set<string>>(
    new Set()
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedSegment, setCopiedSegment] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const filteredTranscription = useMemo(() => {
    if (!searchQuery.trim()) {
      return transcription;
    }

    const query = searchQuery.toLowerCase();
    const filtered = transcription.filter(
      (segment) =>
        segment.text.toLowerCase().includes(query) ||
        segment.speaker.toLowerCase().includes(query)
    );

    // Update highlighted segments
    const highlighted = new Set(
      filtered
        .filter((segment) => segment.text.toLowerCase().includes(query))
        .map((segment) => segment.id)
    );
    setHighlightedSegments(highlighted);

    return filtered;
  }, [transcription, searchQuery]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className='bg-yellow-200 dark:bg-yellow-800 px-1 rounded'
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const copySegmentText = async (segment: TranscriptionSegment) => {
    const text = `[${formatTime(segment.timestamp)}] ${segment.speaker}: ${segment.text}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSegment(segment.id);
      setTimeout(() => setCopiedSegment(null), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const copyAllText = async () => {
    const allText = filteredTranscription
      .map(
        (segment) =>
          `[${formatTime(segment.timestamp)}] ${segment.speaker}: ${segment.text}`
      )
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(allText);
      setCopiedSegment("all");
      setTimeout(() => setCopiedSegment(null), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const scrollToSegment = (segmentId: string) => {
    const element = document.getElementById(`segment-${segmentId}`);
    if (element && scrollAreaRef.current) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const displayedTranscription = isExpanded
    ? filteredTranscription
    : filteredTranscription.slice(0, 10);

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Transcription
            {filteredTranscription.length > 0 && (
              <Badge variant='outline'>
                {filteredTranscription.length} segments
              </Badge>
            )}
          </CardTitle>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={copyAllText}
              className='flex items-center gap-2'
            >
              {copiedSegment === "all" ? (
                <Check className='h-4 w-4' />
              ) : (
                <Copy className='h-4 w-4' />
              )}
              Copy All
            </Button>

            {onExport && (
              <div className='flex gap-1'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onExport("txt")}
                  className='flex items-center gap-2'
                >
                  <Download className='h-4 w-4' />
                  TXT
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onExport("docx")}
                  className='flex items-center gap-2'
                >
                  <Download className='h-4 w-4' />
                  DOCX
                </Button>
              </div>
            )}
          </div>
        </div>

        {searchable && (
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search transcription...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
        )}
      </CardHeader>

      <CardContent className='p-0'>
        {filteredTranscription.length === 0 ? (
          <div className='p-6 text-center text-muted-foreground'>
            {searchQuery ? (
              <>
                <Search className='h-12 w-12 mx-auto mb-2 opacity-50' />
                <p>No results found for "{searchQuery}"</p>
              </>
            ) : (
              <>
                <FileText className='h-12 w-12 mx-auto mb-2 opacity-50' />
                <p>No transcription available</p>
              </>
            )}
          </div>
        ) : (
          <ScrollArea className='h-[600px]' ref={scrollAreaRef}>
            <div className='p-4 space-y-4'>
              {displayedTranscription.map((segment, index) => (
                <div
                  key={segment.id}
                  id={`segment-${segment.id}`}
                  className={`flex gap-3 p-3 rounded-lg transition-colors ${
                    highlightedSegments.has(segment.id)
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {showSpeakers && (
                    <div className='flex-shrink-0'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={segment.speakerAvatar}
                          alt={segment.speaker}
                        />
                        <AvatarFallback className='text-xs'>
                          {segment.speaker
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      {showSpeakers && (
                        <span className='font-medium text-sm'>
                          {segment.speaker}
                        </span>
                      )}
                      {showTimestamps && (
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Clock className='h-3 w-3' />
                          <span>{formatTime(segment.timestamp)}</span>
                        </div>
                      )}
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => copySegmentText(segment)}
                        className='h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        {copiedSegment === segment.id ? (
                          <Check className='h-3 w-3' />
                        ) : (
                          <Copy className='h-3 w-3' />
                        )}
                      </Button>
                    </div>

                    <p className='text-sm leading-relaxed'>
                      {highlightText(segment.text, searchQuery)}
                    </p>

                    {segment.confidence && segment.confidence < 0.8 && (
                      <Badge variant='outline' className='text-xs mt-2'>
                        Low confidence ({Math.round(segment.confidence * 100)}%)
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {!isExpanded && filteredTranscription.length > 10 && (
                <div className='text-center py-4'>
                  <Button
                    variant='outline'
                    onClick={() => setIsExpanded(true)}
                    className='flex items-center gap-2'
                  >
                    <ChevronDown className='h-4 w-4' />
                    Show {filteredTranscription.length - 10} more segments
                  </Button>
                </div>
              )}

              {isExpanded && filteredTranscription.length > 10 && (
                <div className='text-center py-4'>
                  <Button
                    variant='outline'
                    onClick={() => setIsExpanded(false)}
                    className='flex items-center gap-2'
                  >
                    <ChevronUp className='h-4 w-4' />
                    Show less
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
