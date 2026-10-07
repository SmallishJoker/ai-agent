import { SidebarTrigger } from "@/components/ui/sidebar"
  
  function ChatHeader() {
    return (
      <header className="flex min-h-12 items-center px-2 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center">
            <SidebarTrigger className="m-2 sticky t-[2]" />
          </div>
        </div>
      </header>
    )
  }
  
  export default ChatHeader