declare module '#sequelize' {
  import type { Options } from 'sequelize'

  type UserOptions = Exclude<
    Options,
    'database' | 'username' | 'password' | 'host' | 'port' | 'dialect'
  >
  const dir: string
  const options: UserOptions
}
