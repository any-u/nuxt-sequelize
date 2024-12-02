import type { Sequelize } from 'sequelize'

export function useSequelizeClient() {
  // @ts-expect-error - untyped global
  const client = globalThis.__nuxt_sequelize_client__ as Sequelize

  return client
}
