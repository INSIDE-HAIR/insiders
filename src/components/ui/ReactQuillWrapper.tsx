"use client";

import React, { useEffect, useRef, forwardRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface ReactQuillWrapperProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  theme?: string;
  className?: string;
  modules?: any;
  formats?: string[];
}

export const ReactQuillWrapper = forwardRef<
  HTMLDivElement,
  ReactQuillWrapperProps
>(
  (
    {
      value = "",
      onChange,
      placeholder,
      theme = "snow",
      className,
      modules,
      formats,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const isUpdatingFromProp = useRef(false);

    useEffect(() => {
      if (editorRef.current && !quillRef.current) {
        const defaultModules = {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        };

        const defaultFormats = [
          "header",
          "bold",
          "italic",
          "underline",
          "strike",
          "list",
          "link",
        ];

        quillRef.current = new Quill(editorRef.current, {
          theme,
          placeholder,
          modules: modules || defaultModules,
          formats: formats || defaultFormats,
        });

        // Aplicar estilos personalizados después de la inicialización
        if (quillRef.current) {
          const toolbar = editorRef.current.querySelector(".ql-toolbar");
          const editor = editorRef.current.querySelector(".ql-editor");

          if (toolbar) {
            toolbar.classList.add(
              "border-b",
              "border-border",
              "bg-muted/30",
              "rounded-t-md"
            );
          }

          if (editor) {
            editor.classList.add(
              "bg-background",
              "text-foreground",
              "min-h-[120px]",
              "p-4"
            );
          }
        }

        quillRef.current.on("text-change", () => {
          if (!isUpdatingFromProp.current && onChange) {
            const html = quillRef.current?.root.innerHTML || "";
            onChange(html === "<p><br></p>" ? "" : html);
          }
        });
      }

      return () => {
        if (quillRef.current) {
          quillRef.current.off("text-change");
        }
      };
    }, [theme, placeholder, modules, formats, onChange]);

    useEffect(() => {
      if (quillRef.current) {
        const currentContent = quillRef.current.root.innerHTML;
        const normalizedValue = value === "" ? "<p><br></p>" : value;

        if (currentContent !== normalizedValue) {
          isUpdatingFromProp.current = true;
          quillRef.current.root.innerHTML = normalizedValue;
          isUpdatingFromProp.current = false;
        }
      }
    }, [value]);

    return (
      <div
        ref={editorRef}
        className={`${className || ""} rounded-md border border-border overflow-hidden`}
        style={
          {
            // Estilos personalizados para Quill
            "--quill-toolbar-bg": "hsl(var(--muted))",
            "--quill-toolbar-border": "hsl(var(--border))",
            "--quill-editor-bg": "hsl(var(--background))",
            "--quill-editor-text": "hsl(var(--foreground))",
            "--quill-placeholder": "hsl(var(--muted-foreground))",
          } as React.CSSProperties & {
            "--quill-toolbar-bg": string;
            "--quill-toolbar-border": string;
            "--quill-editor-bg": string;
            "--quill-editor-text": string;
            "--quill-placeholder": string;
          }
        }
      />
    );
  }
);

ReactQuillWrapper.displayName = "ReactQuillWrapper";
