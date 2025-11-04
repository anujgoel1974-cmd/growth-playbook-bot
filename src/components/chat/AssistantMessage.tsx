import ReactMarkdown from 'react-markdown';

interface AssistantMessageProps {
  content: string;
}

export function AssistantMessage({ content }: AssistantMessageProps) {
  if (!content) return null;
  
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-[15px] prose-headings:font-semibold prose-headings:tracking-tight">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
