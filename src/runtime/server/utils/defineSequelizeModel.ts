import type { Sequelize } from 'sequelize'

export interface ModelHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (modelName: string, sequelize: Sequelize): any
}

export function defineSequelizeModel(handler: ModelHandler) {
  return handler
}
