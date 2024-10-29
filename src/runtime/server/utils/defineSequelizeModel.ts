import type { ModelAttributes, Sequelize } from 'sequelize'
export interface ModelHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (modelName: string, sequelize: Sequelize): any
}

export type Options = ModelHandler | ModelAttributes

export function defineSequelizeModel(options: Options) {
  if (typeof options === 'function') return options

  return function (name: string, sequelize: Sequelize)  {
    return sequelize.define(name, options)
  }
}
