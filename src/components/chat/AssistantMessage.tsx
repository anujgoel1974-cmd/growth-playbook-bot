import ReactMarkdown from 'react-markdown';

interface AssistantMessageProps {
  content: string;
}

export function AssistantMessage({ content }: AssistantMessageProps) {
  if (!content) return null;
  
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
