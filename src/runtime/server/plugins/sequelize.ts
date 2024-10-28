import { readdirSync } from 'node:fs'
import { join, basename, extname } from 'node:path'
import { defineNitroPlugin } from 'nitropack/runtime'
import type { Model, ModelStatic } from 'sequelize'
import { useSequelizeClient } from '../composables/useSequelizeClient'
import { dir } from '#nuxt-sequelize-options'

export default defineNitroPlugin(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sequelize = {} as Record<string, ModelStatic<Model<any, any>>>

  const root = join(process.cwd(), dir)

  const files = await readdirSync(root)

  const client = useSequelizeClient()

  await Promise.all(
    files.map(async (file) => {
      const modelName = basename(file, extname(file))
      const { default: handler } = await import(join(root, `./${file}`))
      if (handler) {
        const model = handler(modelName, client)
        sequelize[modelName] = model
      }
    }),
  )

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.__nuxt_sequelize__ = sequelize
})
