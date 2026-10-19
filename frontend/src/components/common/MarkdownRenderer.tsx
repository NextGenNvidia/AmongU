import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div className={`markdown-content text-gray-200 leading-relaxed font-sans ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-display text-white mt-4 mb-2 tracking-wide font-bold">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-display text-crew-cyan mt-3.5 mb-2 font-bold tracking-wide">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-display text-crew-lime mt-3 mb-1.5 font-bold">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3.5 last:mb-0 leading-relaxed text-sm sm:text-base text-gray-200">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-extrabold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-300">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1.5 mb-3.5 pl-2 text-sm sm:text-base text-gray-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1.5 mb-3.5 pl-2 text-sm sm:text-base text-gray-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-200 leading-relaxed">
              {children}
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-crew-cyan underline hover:text-white transition-colors underline-offset-4 font-bold"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-crew-cyan bg-cyan-950/20 pl-4 py-2 my-3 rounded-r-xl italic text-gray-300 border-gray-700">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-black/80 text-crew-lime font-mono text-xs px-2 py-0.5 rounded border border-gray-700">
                {children}
              </code>
            ) : (
              <code className={className}>{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-black/90 p-4 rounded-xl border border-gray-800 overflow-x-auto text-xs font-mono text-crew-lime my-3 shadow-inner">
              {children}
            </pre>
          ),
          hr: () => <hr className="border-gray-800 my-4" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
