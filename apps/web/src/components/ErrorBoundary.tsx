import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(
    error: Error,
    info: ErrorInfo
  ) {
    console.error(
      'Render error:',
      error,
      info.componentStack
    )
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-destructive">
            消息加载失败，请切换其它会话重试
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
