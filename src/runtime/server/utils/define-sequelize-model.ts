import type { ModelAttributes, ModelOptions, Sequelize } from 'sequelize'
import { pluralize, underscore } from 'inflection'
import type { SequelizeModels } from '../plugins/sequelize'

export interface ModelHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (modelName: string, client: Sequelize, sequelize: SequelizeModels): any
}

export type Attributes = ModelHandler | ModelAttributes

export function defineSequelizeModel(
  attributes: Attributes,
  options?: ModelOptions,
) {
  if (typeof attributes === 'function') return attributes

  return function (name: string, sequelize: Sequelize) {
    options = {
      tableName: pluralize(underscore(name)),
      ...options,
    }
    return sequelize.define(name, attributes, options)
  }
}
