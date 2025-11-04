import ReactMarkdown from 'react-markdown';

interface AssistantMessageProps {
  content: string;
  isStreaming?: boolean;
}

export function AssistantMessage({ content, isStreaming }: AssistantMessageProps) {
  if (!content && !isStreaming) return null;
  
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-[15px] prose-headings:font-semibold prose-headings:tracking-tight">
      <ReactMarkdown>{content}</ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-[2px] h-4 bg-primary ml-1 animate-pulse" />
      )}
    </div>
  );
}
