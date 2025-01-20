declare module '#sequelize' {
  import type { Options } from 'sequelize'

  type UserOptions = Exclude<
    Options,
    'database' | 'username' | 'password' | 'host' | 'port' | 'dialect'
  >
  const dir: string
  const options: UserOptions
}

declare module '#models' {
  import type { Sequelize, Model, ModelStatic } from 'sequelize'

  type SequelizeModelFn = (name: string, sequelize: Sequelize) => ModelStatic<Model>

  type SequelizeAssociationFn = (models: Record<string, ModelStatic<Model>>) => void

  const loadSequelizeModels: () => Promise<Record<string, SequelizeModelFn | SequelizeAssociationFn>>
}
