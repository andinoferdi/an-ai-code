import type { Message } from './message.js'

export type ShellProgress = {
  output: string
  fullOutput: string
  elapsedTimeSeconds: number
  totalLines: number
  totalBytes?: number
  timeoutMs?: number
  taskId?: string
  [key: string]: unknown
}

export type PowerShellProgress = ShellProgress

export type AgentToolProgress = {
  message: Extract<Message, { type: 'assistant' | 'user' }>
  toolUseCount?: number
  tokenCount?: number
  tokens?: number | null
  lastActivity?: string
  summary?: string
  agentType?: string
  description?: string
  descriptionColor?: string
  taskDescription?: string
  color?: string
  isResolved?: boolean
  isError?: boolean
  isAsync?: boolean
  lastToolInfo?: string | null
  hideType?: boolean
  name?: string
  [key: string]: unknown
}
