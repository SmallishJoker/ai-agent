import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"

import {
    Bot,
    SquarePen
} from 'lucide-react'

import type { Conversation } from '@/types/chat'

interface AppSidebarProps {
    conversations: Conversation[]
    activeConversationId: string | null
    loading: boolean
    onSelectConversation: (id: string) => void
    onNewConversation: () => void
}

export function AppSidebar({
    conversations,
    activeConversationId,
    loading,
    onSelectConversation,
    onNewConversation
}: AppSidebarProps) {
    const { state } = useSidebar()
    const isCollapsed = state === 'collapsed'

    return (
        <Sidebar collapsible='icon'>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-1 py-1">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Bot className="size-4" />
                    </div>
                    <span className="truncate font-semibold group-data-[collapsible=icon]:hidden">
                        AI Agent
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="新对话"
                                    onClick={onNewConversation}
                                    className="cursor-pointer"
                                >
                                    <SquarePen className="cursor-pointer" />
                                    <span>新对话</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    {
                        !isCollapsed && (
                            <SidebarGroupLabel>
                                历史会话
                            </SidebarGroupLabel>
                        )
                    }
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {loading ? (
                                Array.from({ length: 5 }).map(
                                    (_, index) => (
                                        <SidebarMenuItem key={index}>
                                            <SidebarMenuSkeleton showIcon />
                                        </SidebarMenuItem>
                                    )
                                )
                            ) : conversations.length === 0 ? (
                                <SidebarMenuItem className="px-2 py-1.5 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                                    暂无历史会话
                                </SidebarMenuItem>
                            ) : (
                                conversations.map(conversation => (
                                    <SidebarMenuItem key={conversation.id}>
                                        <SidebarMenuButton
                                            isActive={
                                                conversation.id ===
                                                activeConversationId
                                            }
                                            tooltip={conversation.title}
                                            onClick={() =>
                                                onSelectConversation(
                                                    conversation.id
                                                )
                                            }
                                        >
                                            {isCollapsed ? (
                                                <span
                                                    aria-hidden="true"
                                                    className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-sidebar-accent text-[10px] font-medium"
                                                >
                                                    {Array.from(
                                                        conversation.title.trim()
                                                    )[0] ?? '会'}
                                                </span>
                                            ) : (
                                                <>
                                                    {/* <MessageSquare /> */}
                                                    <span>
                                                        {conversation.title}
                                                    </span>
                                                </>
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter />

            <SidebarRail />
        </Sidebar>
    )
}
