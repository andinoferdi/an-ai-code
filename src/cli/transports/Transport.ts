import type { StdoutMessage } from 'src/cli/sdkCompatTypes.js'

export interface Transport {
  connect(): Promise<void>
  write(message: StdoutMessage): Promise<void>
  close(): void

  setOnData(callback: (data: string) => void): void
  setOnClose(callback: (closeCode?: number) => void): void

  setOnConnect?(callback: () => void): void
  setOnEvent?(callback: (event: unknown) => void): void
  getStateLabel?(): string
  isConnectedStatus(): boolean
  isClosedStatus(): boolean
}
