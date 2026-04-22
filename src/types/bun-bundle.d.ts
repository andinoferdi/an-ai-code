declare module 'bun:bundle' {
  export function feature(flag: string): boolean
}

declare const MACRO: {
  VERSION: string
  BUILD_TIME?: string
  PACKAGE_URL?: string
  NATIVE_PACKAGE_URL?: string
}

declare const Bun:
  | {
      gc?: () => void
      [key: string]: unknown
    }
  | undefined
