import type { SettingSource } from '../../../utils/settings/constants.js'
import type { AgentColorName } from '../../../tools/AgentTool/agentColorManager.js'
import type { AgentMemoryScope } from '../../../tools/AgentTool/agentMemory.js'

export type GeneratedAgent = {
  identifier: string
  whenToUse: string
  systemPrompt: string
}

export type FinalAgentDraft = {
  agentType: string
  whenToUse: string
  getSystemPrompt: () => string
  tools?: string[]
  source: SettingSource
  color?: AgentColorName
  model?: string
  memory?: AgentMemoryScope
}

export type AgentWizardData = {
  // Location + strategy
  location?: SettingSource
  method?: 'generate' | 'manual'

  // Generated-agent flow state
  generationPrompt?: string
  isGenerating?: boolean
  generatedAgent?: GeneratedAgent
  wasGenerated?: boolean

  // Manual entry fields
  agentType?: string
  systemPrompt?: string
  whenToUse?: string

  // Configuration choices
  selectedTools?: string[]
  selectedModel?: string
  selectedColor?: string
  selectedMemory?: AgentMemoryScope

  // Aggregated output for confirmation/save
  finalAgent?: FinalAgentDraft
}

