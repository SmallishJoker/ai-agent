import {
    Bot,
    Circle
  } from 'lucide-react'
  
  function ChatHeader() {
    return (
      <header className="flex h-14 items-center border-b px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </div>
  
          <div>
            <div className="font-semibold">
              AI Agent
            </div>
  
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Circle className="size-2 fill-current" />
              Online
            </div>
          </div>
        </div>
      </header>
    )
  }
  
  export default ChatHeader