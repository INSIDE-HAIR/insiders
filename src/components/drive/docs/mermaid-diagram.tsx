"use client";

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      // Initialize mermaid with dark theme
      mermaid.initialize({
        startOnLoad: true,
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
      ref.current.innerHTML = chart;
      
      // Re-render the diagram
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div 
      ref={ref} 
      className={`mermaid overflow-auto bg-slate-900/50 rounded-lg p-4 border border-primary/20 ${className}`}
    />
  );
}