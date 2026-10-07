function ChatWelcome() {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          你好，我是 AI Agent
        </h1>

        <p className="mt-3 text-muted-foreground">
          可以聊天，也可以调用工具完成任务。
        </p>
      </div>
    </div>
  )
}

export default ChatWelcome
