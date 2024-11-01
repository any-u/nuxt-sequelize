import { readdirSync } from 'node:fs'
import { join, basename, extname } from 'node:path'
import { defineNitroPlugin } from 'nitropack/runtime'
import type { Model, ModelStatic } from 'sequelize'
import { useSequelizeClient } from '../composables/useSequelizeClient'
import { capitalize } from '../utils/utils'
import { dir } from '#nuxt-sequelize-options'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SequelizeModels = Record<string, ModelStatic<Model<any, any>>>

export default defineNitroPlugin(async () => {
  const sequelize = {} as SequelizeModels

  const root = join(process.cwd(), dir)

  const files = await readdirSync(root)
  /**
   * When we need to create association, we need to get another model.
   * If there is an order in dynamic introduction,
   * We can create associations in the next model.
   */
  files.sort()

  const client = useSequelizeClient()

  for (const file of files) {
    const modelName = capitalize(basename(file, extname(file)))
    const { default: handler } = await import(join(root, `./${file}`))
    if (handler) {
      const model = handler(modelName, client, sequelize)
      sequelize[modelName] = model
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.__nuxt_sequelize__ = sequelize
})
