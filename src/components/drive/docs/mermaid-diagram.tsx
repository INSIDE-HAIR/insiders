"use client";

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, Maximize, Minimize, Move } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (ref.current) {
      // Initialize mermaid with dark theme
      mermaid.initialize({
        startOnLoad: false, // Changed to false to manually control rendering
        theme: 'dark',
        themeVariables: {
          primaryColor: '#10b981', // emerald-500 (primary color)
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#059669',
          lineColor: '#6b7280',
          sectionBkgColor: '#1f2937',
          altSectionBkgColor: '#374151',
          gridColor: '#4b5563',
          secondaryColor: '#1e40af',
          tertiaryColor: '#7c3aed',
          background: '#0f172a', // slate-900
          mainBkg: '#1e293b', // slate-800
          secondBkg: '#334155', // slate-700
          tertiaryBkg: '#475569', // slate-600
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
        sequence: {
          useMaxWidth: true,
        },
        gantt: {
          useMaxWidth: true,
        },
      });

      // Clear previous content
      ref.current.innerHTML = '';
      
      // Generate unique ID for this diagram
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      // Render the diagram using mermaid.render
      mermaid.render(id, chart).then((result) => {
        if (ref.current) {
          ref.current.innerHTML = result.svg;
        }
      }).catch((error) => {
        console.error('Mermaid rendering error:', error);
        if (ref.current) {
          ref.current.innerHTML = `<div class="text-red-500">Error rendering diagram: ${error.message}</div>`;
        }
      });
    }
  }, [chart]);

  // Zoom functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.1));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Fullscreen toggle
  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - lastPanPoint.x;
    const dy = e.clientY - lastPanPoint.y;
    
    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleResetZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isFullscreen]);

  // Mouse up event for the entire document
  useEffect(() => {
    const handleDocumentMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleDocumentMouseUp);
    return () => document.removeEventListener('mouseup', handleDocumentMouseUp);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative mermaid-container bg-slate-900/50 rounded-lg border border-primary/20 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''} ${className}`}
    >
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleZoomOut}
          className="h-8 w-8 p-0 bg-slate-800/80 hover:bg-slate-700"
          title="Zoom Out (Ctrl + -)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleResetZoom}
          className="h-8 px-2 bg-slate-800/80 hover:bg-slate-700 text-xs"
          title="Reset Zoom (Ctrl + 0)"
        >
          {Math.round(zoom * 100)}%
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleZoomIn}
          className="h-8 w-8 p-0 bg-slate-800/80 hover:bg-slate-700"
          title="Zoom In (Ctrl + =)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleFullscreenToggle}
          className="h-8 w-8 p-0 bg-slate-800/80 hover:bg-slate-700"
          title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>

      {/* Pan indicator */}
      {!isFullscreen && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 text-xs text-slate-400">
          <Move className="h-3 w-3" />
          <span>Click & drag to pan</span>
        </div>
      )}

      {/* Diagram container */}
      <div 
        className={`overflow-hidden ${isFullscreen ? 'h-full w-full' : 'p-4'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ touchAction: 'none' }}
      >
        <div 
          ref={ref}
          className="mermaid-diagram select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        />
      </div>
    </div>
  );
}