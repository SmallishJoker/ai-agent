
  import type { FormEvent } from 'react'
  
  import { Button } from '@/components/ui/button'
  import { Textarea } from '@/components/ui/textarea'
  
  interface ChatInputProps {
    value: string
    loading: boolean
    onChange: (
      value: string
    ) => void
    onSubmit: () => void
  }
  
  function ChatInput({
    value,
    loading,
    onChange,
    onSubmit
  }: ChatInputProps) {
    const handleSubmit = (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault()
  
      if (
        loading ||
        !value.trim()
      ) {
        return
      }
  
      onSubmit()
    }
  
    return (
      <div className="border-t bg-background/95 p-4 backdrop-blur">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-4xl items-end gap-3"
        >
          <Textarea
            value={value}
            onChange={event =>
              onChange(
                event.target.value
              )
            }
            placeholder="输入消息..."
            disabled={loading}
            className="min-h-12 resize-none"
          />
  
          <Button
            type="submit"
            disabled={
              loading ||
              !value.trim()
            }
          >
            {loading
              ? '回答中'
              : '发送'}
          </Button>
        </form>
      </div>
    )
  }
  
  export default ChatInput