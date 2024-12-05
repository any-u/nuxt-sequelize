import { Sequelize } from 'sequelize'
import { defineNitroPlugin } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'
import { options } from '#sequelize'

export default defineNitroPlugin(() => {
  const config = (useRuntimeConfig() || {}).sequelize
  const client = new Sequelize(
    {
      database: config.database,
      username: config.username,
      password: config.password,
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      ...options,
    },
  )

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.__nuxt_sequelize_client__ = client
})
