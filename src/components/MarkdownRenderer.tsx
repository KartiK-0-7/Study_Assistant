import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content by lines to process them sequentially
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  
  let keyCounter = 0;
  let inList = false;
  let listItems: string[] = [];

  const renderTextWithFormatting = (text: string) => {
    // Basic regex to find bold text **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-bold text-gray-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${keyCounter++}`} className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderTextWithFormatting(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines, but close list if open
    if (line === "") {
      flushList();
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={keyCounter++} className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3 flex items-center">
          {renderTextWithFormatting(line.substring(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={keyCounter++} className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4 border-b pb-1 border-gray-200 dark:border-gray-800">
          {renderTextWithFormatting(line.substring(3))}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={keyCounter++} className="text-2xl font-extrabold text-gray-900 dark:text-white mt-10 mb-4">
          {renderTextWithFormatting(line.substring(2))}
        </h1>
      );
    }
    // Blockquotes
    else if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote key={keyCounter++} className="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-50/50 dark:bg-indigo-950/20 text-gray-800 dark:text-gray-300 rounded-r">
          {renderTextWithFormatting(line.substring(2))}
        </blockquote>
      );
    }
    // Lists
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      inList = true;
      listItems.push(line.substring(2));
    }
    // Standard Paragraphs
    else {
      // If we were in a list, this non-list line breaks it
      if (inList) {
        flushList();
      }
      elements.push(
        <p key={keyCounter++} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {renderTextWithFormatting(line)}
        </p>
      );
    }
  }

  // Handle remaining list
  flushList();

  return <div className="space-y-1">{elements}</div>;
}
