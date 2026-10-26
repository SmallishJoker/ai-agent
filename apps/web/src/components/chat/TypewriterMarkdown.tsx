import { useTypewriter } from '@/hooks/use-typewriter'

import MarkdownRenderer from './MarkdownRenderer'

interface TypewriterMarkdownProps {
  content: string
  active?: boolean
}

function TypewriterMarkdown({
  content,
  active = false
}: TypewriterMarkdownProps) {
  const displayed = useTypewriter(content, active)

  const showCursor =
    active || displayed.length < content.length

  return (
    <div>
      <MarkdownRenderer content={displayed} />

      {showCursor && (
        <span
          aria-hidden="true"
          className="typewriter-cursor"
        />
      )}
    </div>
  )
}

export default TypewriterMarkdown
