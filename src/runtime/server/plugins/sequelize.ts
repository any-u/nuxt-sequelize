import { defineNitroPlugin } from 'nitropack/runtime'
import type { Model, ModelStatic } from 'sequelize'
import { camelize } from 'inflection'
import { useSequelizeClient } from '../composables/use-sequelize-client'
import { addSequelizeModels, type SequelizeAssociationFn, type SequelizeModelFn } from '#models'
// import { user } from '#imports'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SequelizeModels = Record<string, ModelStatic<Model<any, any>>>

export default defineNitroPlugin(async () => {
  const sequelize = {} as SequelizeModels

  // console.log(user)
  // load sequelize client
  const client = useSequelizeClient()

  // load sequelize models
  const models = await addSequelizeModels()

  let associationFn = null
  for (const key in models) {
    if (key === 'associations') {
      associationFn = models[key] as SequelizeAssociationFn
    }
    else {
      const handler = models[key] as SequelizeModelFn
      if (handler) {
        const modelName = camelize(key)
        const model = handler(key, client)
        sequelize[modelName] = model
      }
    }
  }

  if (associationFn) {
    associationFn(sequelize)
  }

  // client.sync({ force: true })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.__nuxt_sequelize__ = sequelize
})
