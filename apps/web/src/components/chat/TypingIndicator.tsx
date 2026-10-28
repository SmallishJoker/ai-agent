import { LoaderCircle } from 'lucide-react'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
      <LoaderCircle className="size-4 animate-spin" />

      <span className="shimmer">AI 正在思考...</span>
    </div>
  )
}

export default TypingIndicator
