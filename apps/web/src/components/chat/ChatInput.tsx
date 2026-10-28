import {
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent
} from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { ArrowUpIcon, Plus, Square } from 'lucide-react'

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const buttonsWidthRef = useRef(0)
  const [isMultiline, setIsMultiline] = useState(false)

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    const form = formRef.current

    if (!textarea || !form) {
      return
    }

    const resizeTextarea = () => {
      const styles = window.getComputedStyle(textarea)
      const lineHeight =
        Number.parseFloat(styles.lineHeight) ||
        Number.parseFloat(styles.fontSize) * 1.5
      const verticalPadding =
        Number.parseFloat(styles.paddingTop) +
        Number.parseFloat(styles.paddingBottom)
      const maxHeight = 192

      const formStyles = window.getComputedStyle(form)
      const formHorizontalPadding =
        Number.parseFloat(formStyles.paddingLeft) +
        Number.parseFloat(formStyles.paddingRight)
      const contentWidth =
        form.clientWidth - formHorizontalPadding

      if (!isMultiline) {
        textarea.style.width = ''
        buttonsWidthRef.current =
          contentWidth - textarea.offsetWidth
      }

      // The inline (single line) width is narrower than the full width used
      // for the multiline layout. Always judge wrapping against the inline
      // width, otherwise the textarea keeps toggling between both layouts.
      const inlineWidth = Math.max(
        contentWidth - buttonsWidthRef.current,
        0
      )

      textarea.style.width = `${inlineWidth}px`
      textarea.style.height = 'auto'

      const multiline =
        textarea.scrollHeight - verticalPadding >
        lineHeight + 1

      textarea.style.width =
        `${multiline ? contentWidth : inlineWidth}px`
      textarea.style.height = 'auto'

      textarea.style.height =
        `${Math.min(textarea.scrollHeight, maxHeight)}px`
      textarea.style.overflowY =
        textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
      setIsMultiline(multiline)
    }

    resizeTextarea()

    let observedWidth: number | undefined
    const resizeObserver = new ResizeObserver(entries => {
      const nextWidth = entries[0]?.contentRect.width

      if (
        nextWidth !== undefined &&
        (observedWidth === undefined ||
          Math.abs(nextWidth - observedWidth) > 1)
      ) {
        observedWidth = nextWidth
        resizeTextarea()
      }
    })

    resizeObserver.observe(form)

    return () => resizeObserver.disconnect()
  }, [value, isMultiline])

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

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  const plusButton = (
    <Plus
      className={cn(
        'shrink-0 text-muted-foreground',
        !isMultiline && 'ml-2'
      )}
    />
  )

  return (
    <div className="sticky bottom-0 mx-auto w-full max-w-3xl rounded-t-[26px] bg-transparent bg-[image:radial-gradient(transparent_1px,#fff_1px)] bg-[length:4px_4px] px-4 pb-6 backdrop-blur-[4px] backdrop-saturate-50">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={cn(
          'mx-auto flex overflow-hidden rounded-[26px] border bg-white px-2 py-[5px]',
          isMultiline
            ? 'flex-col'
            : 'flex-row items-center'
        )}
      >
        {!isMultiline && plusButton}

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={event =>
            onChange(
              event.target.value
            )
          }
          onKeyDown={handleKeyDown}
          placeholder="有问题，随便问"
          disabled={loading}
          rows={1}
          className={cn(
            'min-h-[1rem] max-h-48 resize-none rounded-none border-0 bg-transparent px-2 py-1 shadow-none outline-none transition-none focus-visible:border-transparent focus-visible:ring-0',
            isMultiline ? 'w-full' : 'flex-1'
          )}
        />

        <div
          className={cn(
            isMultiline
              ? 'flex items-center justify-between px-1 pt-1'
              : 'contents'
          )}
        >
          {isMultiline && plusButton}

          <Button
            type="submit"
            disabled={
              loading ||
              !value.trim()
            }
            className="cursor-pointer rounded-full"
            size="icon"
          >
            {loading
              ? <Square fill="#fff" />
              : <ArrowUpIcon className="size-5" />}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatInput
