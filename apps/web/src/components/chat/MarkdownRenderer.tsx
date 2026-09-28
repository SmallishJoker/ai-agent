import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
}

function MarkdownRenderer({
  content
}: MarkdownRendererProps) {
  return (
    <div className="prose prose-neutral max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
    // <div>
    //   <ReactMarkdown
    //   remarkPlugins={[remarkGfm]}
    //   components={{
    //     h1: ({ children }) => (
    //       <h1 className="mb-4 text-2xl font-bold">
    //         {children}
    //       </h1>
    //     ),

    //     h2: ({ children }) => (
    //       <h2 className="mb-3 mt-6 text-xl font-semibold">
    //         {children}
    //       </h2>
    //     ),

    //     h3: ({ children }) => (
    //       <h3 className="mb-2 mt-5 text-lg font-semibold">
    //         {children}
    //       </h3>
    //     ),

    //     p: ({ children }) => (
    //       <p className="mb-3 leading-7">
    //         {children}
    //       </p>
    //     ),

    //     ul: ({ children }) => (
    //       <ul className="mb-3 list-disc space-y-1 pl-6">
    //         {children}
    //       </ul>
    //     ),

    //     ol: ({ children }) => (
    //       <ol className="mb-3 list-decimal space-y-1 pl-6">
    //         {children}
    //       </ol>
    //     ),

    //     blockquote: ({ children }) => (
    //       <blockquote className="my-4 border-l-4 pl-4 text-muted-foreground">
    //         {children}
    //       </blockquote>
    //     ),

    //     a: ({ href, children }) => (
    //       <a
    //         href={href}
    //         target="_blank"
    //         rel="noreferrer"
    //         className="font-medium underline underline-offset-4"
    //       >
    //         {children}
    //       </a>
    //     ),

    //     code: ({
    //       className,
    //       children
    //     }) => {
    //       const isBlock =
    //         className?.includes(
    //           'language-'
    //         )

    //       if (!isBlock) {
    //         return (
    //           <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
    //             {children}
    //           </code>
    //         )
    //       }

    //       return (
    //         <code className={className}>
    //           {children}
    //         </code>
    //       )
    //     },

    //     pre: ({ children }) => (
    //       <pre className="my-4 overflow-x-auto rounded-xl border bg-muted p-4 text-sm">
    //         {children}
    //       </pre>
    //     ),

    //     table: ({ children }) => (
    //       <div className="my-4 overflow-x-auto">
    //         <table className="w-full border-collapse text-sm">
    //           {children}
    //         </table>
    //       </div>
    //     ),

    //     th: ({ children }) => (
    //       <th className="border px-3 py-2 text-left font-semibold">
    //         {children}
    //       </th>
    //     ),

    //     td: ({ children }) => (
    //       <td className="border px-3 py-2">
    //         {children}
    //       </td>
    //     )
    //   }}
    //   >
    //     {content}
    // </ReactMarkdown>
    // </div>
  )
}

export default MarkdownRenderer

// // MarkdownRenderer.tsx
// import ReactMarkdown from 'react-markdown'
// import type { Components } from 'react-markdown'
// import remarkGfm from 'remark-gfm'

// // 高亮主题（可选 github / atom-one-dark / vs2015 等）

// interface MarkdownRendererProps {
//   content: string
//   className?: string
// }

// const components: Components = {
//   // ===== 标题 =====
//   h1: ({ children }) => (
//     <h1 className="mb-4 mt-6 text-2xl font-bold tracking-tight first:mt-0">
//       {children}
//     </h1>
//   ),
//   h2: ({ children }) => (
//     <h2 className="mb-3 mt-6 text-xl font-semibold tracking-tight first:mt-0">
//       {children}
//     </h2>
//   ),
//   h3: ({ children }) => (
//     <h3 className="mb-2 mt-5 text-lg font-semibold first:mt-0">{children}</h3>
//   ),
//   h4: ({ children }) => (
//     <h4 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h4>
//   ),

//   // ===== 段落与文本 =====
//   p: ({ children }) => <p className="mb-3 leading-7">{children}</p>,

//   strong: ({ children }) => (
//     <strong className="font-semibold">{children}</strong>
//   ),
//   em: ({ children }) => <em className="italic">{children}</em>,
//   del: ({ children }) => <del className="line-through opacity-70">{children}</del>,

//   // ===== 列表 =====
//   ul: ({ children }) => (
//     <ul className="mb-3 list-disc space-y-1 pl-6 marker:text-muted-foreground">
//       {children}
//     </ul>
//   ),
//   ol: ({ children }) => (
//     <ol className="mb-3 list-decimal space-y-1 pl-6 marker:text-muted-foreground">
//       {children}
//     </ol>
//   ),
//   li: ({ children }) => <li className="leading-7">{children}</li>,

//   // ===== 引用 =====
//   blockquote: ({ children }) => (
//     <blockquote className="my-4 border-l-4 border-muted-foreground/30 bg-muted/40 py-1 pl-4 italic text-muted-foreground">
//       {children}
//     </blockquote>
//   ),

//   // ===== 链接：只对 http(s) 外链新开窗口 =====
//   a: ({ href, children }) => {
//     const isExternal = /^https?:\/\//i.test(href ?? '')
//     return (
//       <a
//         href={href}
//         {...(isExternal
//           ? { target: '_blank', rel: 'noopener noreferrer' }
//           : {})}
//         className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
//       >
//         {children}
//       </a>
//     )
//   },

//   // ===== 图片：限制宽度、圆角 =====
//   img: ({ src, alt }) => (
//     // eslint-disable-next-line @next/next/no-img-element
//     <img
//       src={src}
//       alt={alt ?? ''}
//       loading="lazy"
//       className="my-4 max-w-full rounded-lg border"
//     />
//   ),

//   // ===== 分割线 =====
//   hr: () => <hr className="my-6 border-t border-border" />,

//   // ===== 代码：行内 code 与块级 code 分开处理 =====
//   // rehype-highlight 会给块级 code 加上 "hljs language-xxx" 类
//   // 行内 code 没有这些类
//   code: ({ className, children, ...props }) => {
//     const isBlock = /language-|hljs/.test(className ?? '')

//     if (isBlock) {
//       // 块级：样式交给 pre + hljs 主题，这里不加行内样式
//       return (
//         <code className={className} {...props}>
//           {children}
//         </code>
//       )
//     }

//     // 行内：加内边距和背景
//     return (
//       <code
//         className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em]"
//         {...props}
//       >
//         {children}
//       </code>
//     )
//   },

//   pre: ({ children }) => (
//     <pre className="my-4 overflow-x-auto rounded-xl border bg-muted p-4 text-sm leading-relaxed [&>code]:bg-transparent [&>code]:p-0">
//       {children}
//     </pre>
//   ),

//   // ===== 表格：支持 Markdown 对齐，外层横向滚动 =====
//   table: ({ children }) => (
//     <div className="my-4 w-full overflow-x-auto">
//       <table className="w-full border-collapse text-sm">{children}</table>
//     </div>
//   ),
//   thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
//   th: ({ children, style }) => (
//     <th
//       style={style}
//       className="border px-3 py-2 text-left font-semibold"
//     >
//       {children}
//     </th>
//   ),
//   td: ({ children, style }) => (
//     <td style={style} className="border px-3 py-2 align-top">
//       {children}
//     </td>
//   ),

//   // ===== 任务列表（remark-gfm 的 [x]）=====
//   input: ({ checked, ...props }) => (
//     <input
//       type="checkbox"
//       checked={checked}
//       readOnly
//       className="mr-2 h-4 w-4 translate-y-0.5 accent-primary"
//       {...props}
//     />
//   ),
// }

// export default function MarkdownRenderer({
//   content,
// }: MarkdownRendererProps) {
//   return (
//     <div>
//       <ReactMarkdown
//         remarkPlugins={[remarkGfm]}
//         components={components}
//       >
//         {content}
//       </ReactMarkdown>
//     </div>
//   )
// }