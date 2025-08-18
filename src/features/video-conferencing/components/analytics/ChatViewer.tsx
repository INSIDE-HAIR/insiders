/**
 * ChatViewer Component
 * Displays meeting chat messages with filtering capabilities
 */
"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Search,
  Filter,
  Clock,
  User,
  Download,
  Copy,
  Check,
  Link,
  Image,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { ChatMessage } from "../../types/analytics";

interface ChatViewerProps {
  messages: ChatMessage[];
  className?: string;
  onExport?: (format: "txt" | "csv") => void;
  searchable?: boolean;
  showTimestamps?: boolean;
  maxHeight?: string;
}

type MessageType = "all" | "text" | "file" | "link" | "image";
type SortOrder = "asc" | "desc";

export function ChatViewer({
  messages,
  className,
  onExport,
  searchable = true,
  showTimestamps = true,
  maxHeight = "600px",
}: ChatViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedSender, setSelectedSender] = useState<string>("all");
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  const senders = useMemo(() => {
    const uniqueSenders = Array.from(
      new Set(messages.map((msg) => msg.sender))
    );
    return uniqueSenders.sort();
  }, [messages]);

  const filteredMessages = useMemo(() => {
    let filtered = messages.filter((message) => {
      // Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = messageType === "all" || message.type === messageType;

      // Sender filter
      const matchesSender =
        selectedSender === "all" || message.sender === selectedSender;

      return matchesSearch && matchesType && matchesSender;
    });

    // Sort by timestamp
    filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });

    return filtered;
  }, [messages, searchQuery, messageType, selectedSender, sortOrder]);

  const messageStats = useMemo(() => {
    const stats = {
      total: messages.length,
      text: messages.filter((m) => m.type === "text").length,
      file: messages.filter((m) => m.type === "file").length,
      link: messages.filter((m) => m.type === "link").length,
      image: messages.filter((m) => m.type === "image").length,
      uniqueSenders: senders.length,
    };
    return stats;
  }, [messages, senders]);

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

  const copyMessage = async (message: ChatMessage) => {
    const text = `[${formatTime(message.timestamp)}] ${message.sender}: ${message.content}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(message.id);
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "file":
        return <FileText className='h-3 w-3' />;
      case "link":
        return <Link className='h-3 w-3' />;
      case "image":
        return <Image className='h-3 w-3' />;
      default:
        return <MessageSquare className='h-3 w-3' />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "file":
        return "text-blue-600";
      case "link":
        return "text-green-600";
      case "image":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const displayedMessages = isExpanded
    ? filteredMessages
    : filteredMessages.slice(0, 20);

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5' />
            Chat Messages
            <Badge variant='outline'>
              {filteredMessages.length} of {messageStats.total}
            </Badge>
          </CardTitle>

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
                onClick={() => onExport("csv")}
                className='flex items-center gap-2'
              >
                <Download className='h-4 w-4' />
                CSV
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className='flex flex-wrap gap-2 text-xs'>
          <Badge variant='outline'>{messageStats.text} text</Badge>
          <Badge variant='outline'>{messageStats.file} files</Badge>
          <Badge variant='outline'>{messageStats.link} links</Badge>
          <Badge variant='outline'>{messageStats.image} images</Badge>
          <Badge variant='outline'>
            {messageStats.uniqueSenders} participants
          </Badge>
        </div>

        {searchable && (
          <div className='flex flex-col sm:flex-row gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search messages...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            <Select
              value={messageType}
              onValueChange={(value: MessageType) => setMessageType(value)}
            >
              <SelectTrigger className='w-[120px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='text'>Text</SelectItem>
                <SelectItem value='file'>Files</SelectItem>
                <SelectItem value='link'>Links</SelectItem>
                <SelectItem value='image'>Images</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSender} onValueChange={setSelectedSender}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Senders</SelectItem>
                {senders.map((sender) => (
                  <SelectItem key={sender} value={sender}>
                    {sender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className='p-0'>
        {filteredMessages.length === 0 ? (
          <div className='p-6 text-center text-muted-foreground'>
            {searchQuery ||
            messageType !== "all" ||
            selectedSender !== "all" ? (
              <>
                <Search className='h-12 w-12 mx-auto mb-2 opacity-50' />
                <p>No messages found with current filters</p>
              </>
            ) : (
              <>
                <MessageSquare className='h-12 w-12 mx-auto mb-2 opacity-50' />
                <p>No chat messages available</p>
              </>
            )}
          </div>
        ) : (
          <ScrollArea className='h-[600px]' style={{ height: maxHeight }}>
            <div className='p-4 space-y-3'>
              {displayedMessages.map((message, index) => (
                <div
                  key={message.id}
                  className='flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group'
                >
                  <Avatar className='h-8 w-8 flex-shrink-0'>
                    <AvatarImage
                      src={message.senderAvatar}
                      alt={message.sender}
                    />
                    <AvatarFallback className='text-xs'>
                      {message.sender
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='font-medium text-sm'>
                        {message.sender}
                      </span>

                      {showTimestamps && (
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Clock className='h-3 w-3' />
                          <span>{formatTime(message.timestamp)}</span>
                        </div>
                      )}

                      <div
                        className={`flex items-center gap-1 ${getMessageTypeColor(message.type)}`}
                      >
                        {getMessageIcon(message.type)}
                        <span className='text-xs capitalize'>
                          {message.type}
                        </span>
                      </div>

                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => copyMessage(message)}
                        className='h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto'
                      >
                        {copiedMessage === message.id ? (
                          <Check className='h-3 w-3' />
                        ) : (
                          <Copy className='h-3 w-3' />
                        )}
                      </Button>
                    </div>

                    <div className='text-sm'>
                      {message.type === "link" ? (
                        <a
                          href={message.content}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:underline break-all'
                        >
                          {highlightText(message.content, searchQuery)}
                        </a>
                      ) : message.type === "file" ? (
                        <div className='flex items-center gap-2 p-2 bg-muted rounded border'>
                          <FileText className='h-4 w-4' />
                          <span className='font-medium'>
                            {message.fileName || "File"}
                          </span>
                          {message.fileSize && (
                            <Badge variant='outline' className='text-xs'>
                              {message.fileSize}
                            </Badge>
                          )}
                        </div>
                      ) : message.type === "image" ? (
                        <div className='flex items-center gap-2 p-2 bg-muted rounded border'>
                          <Image className='h-4 w-4' />
                          <span className='font-medium'>
                            {message.fileName || "Image"}
                          </span>
                          {message.content && (
                            <img
                              src={message.content}
                              alt='Chat image'
                              className='max-w-xs max-h-32 rounded border mt-2'
                            />
                          )}
                        </div>
                      ) : (
                        <p className='leading-relaxed'>
                          {highlightText(message.content, searchQuery)}
                        </p>
                      )}
                    </div>

                    {message.isPrivate && (
                      <Badge variant='outline' className='text-xs mt-2'>
                        Private message
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {!isExpanded && filteredMessages.length > 20 && (
                <div className='text-center py-4'>
                  <Button
                    variant='outline'
                    onClick={() => setIsExpanded(true)}
                    className='flex items-center gap-2'
                  >
                    <ChevronDown className='h-4 w-4' />
                    Show {filteredMessages.length - 20} more messages
                  </Button>
                </div>
              )}

              {isExpanded && filteredMessages.length > 20 && (
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
