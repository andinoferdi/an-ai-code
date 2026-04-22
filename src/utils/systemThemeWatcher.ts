import { oscColor, type TerminalQuerier } from '../ink/terminal-querier.js'
import {
  setCachedSystemTheme,
  themeFromOscColor,
  type SystemTheme,
} from './systemTheme.js'

export function watchSystemTheme(
  querier: TerminalQuerier,
  onThemeChange: (theme: SystemTheme) => void,
): () => void {
  let cancelled = false

  const poll = async () => {
    const responsePromise = querier.send(oscColor(11))
    const flushPromise = querier.flush()
    const response = await responsePromise
    await flushPromise

    if (cancelled || !response?.data) {
      return
    }

    const theme = themeFromOscColor(response.data)
    if (!theme) {
      return
    }

    setCachedSystemTheme(theme)
    onThemeChange(theme)
  }

  void poll()
  const interval = setInterval(() => {
    void poll()
  }, 5000)

  return () => {
    cancelled = true
    clearInterval(interval)
  }
}
