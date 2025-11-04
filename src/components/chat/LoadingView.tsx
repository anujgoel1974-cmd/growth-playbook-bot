export function LoadingView() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-glow-pulse">
            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-breathe" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-breathe" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-breathe" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-foreground">AI is thinking...</p>
          <p className="text-xs text-muted-foreground">Analyzing your request and preparing insights</p>
        </div>
      </div>
    </div>
  );
}
