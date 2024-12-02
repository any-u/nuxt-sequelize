import type { ModelStatic } from 'sequelize'

export function useSequelize() {
  // @ts-expect-error - untyped global
  const client = globalThis.__nuxt_sequelize__ as Record<string, ModelStatic<Model>>

  return client
}
