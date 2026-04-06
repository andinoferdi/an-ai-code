import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages.mjs'

export type MessageContentBlock =
  | ContentBlockParam
  | {
      type: 'tool_use'
      id: string
      name: string
      input?: unknown
      [key: string]: unknown
    }
  | {
      type: 'tool_result'
      tool_use_id?: string
      content?: unknown
      [key: string]: unknown
    }
  | {
      type: 'text'
      text: string
      [key: string]: unknown
    }
  | Record<string, unknown>

export type MessageContent = string | MessageContentBlock[]

export type APIMessage = {
  id?: string
  role: 'user' | 'assistant' | string
  content: MessageContent
  [key: string]: unknown
}

type BaseMessage = {
  type: string
  uuid: string
  parentUuid?: string | null
  timestamp?: string
  requestId?: string
  sourceToolUseID?: string
  isMeta?: boolean
  isVisibleInTranscriptOnly?: boolean
  slug?: string
  [key: string]: unknown
}

export type UserMessage = BaseMessage & {
  type: 'user'
  message: APIMessage & { role: 'user' }
}

export type NormalizedUserMessage = UserMessage

export type AssistantMessage = BaseMessage & {
  type: 'assistant'
  message: APIMessage & { role: 'assistant' }
  error?: unknown
  errorDetails?: string
  isApiErrorMessage?: boolean
}

export type SystemMessage = BaseMessage & {
  type: 'system'
  subtype?: string
  content: string
  level?: 'info' | 'warning' | 'error' | string
}

export type AttachmentMessage = BaseMessage & {
  type: 'attachment'
  message: APIMessage
  attachments?: unknown[]
}

export type ProgressMessage = BaseMessage & {
  type: 'progress'
  content: string
}

export type HookResultMessage = BaseMessage & {
  type: 'hook_result'
  content: string
  hookEvent?: string
}

export type SystemAPIErrorMessage = SystemMessage & {
  isApiErrorMessage: true
  errorDetails?: string
}

export type SystemFileSnapshotMessage = SystemMessage & {
  subtype: 'file_snapshot'
  kind?: string
  path?: string
}

export type CompactMetadata = {
  trigger?: string
  preTokens?: number
  preservedSegment?: {
    headUuid?: string
    anchorUuid?: string
    tailUuid?: string
  }
}

export type Message =
  | UserMessage
  | AssistantMessage
  | SystemMessage
  | AttachmentMessage
  | ProgressMessage
  | HookResultMessage
