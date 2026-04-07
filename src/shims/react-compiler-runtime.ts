declare module 'react/compiler-runtime' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- compiler cache stores mixed internal values
  export function c(size: number): any[]
}

export {}
