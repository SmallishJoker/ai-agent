function TypingIndicator() {
    return (
      <div className="flex items-center gap-2 px-1 py-3 text-sm text-muted-foreground">
        <span className="animate-pulse">
          AI 正在思考...
        </span>
      </div>
    )
  }
  
  export default TypingIndicator