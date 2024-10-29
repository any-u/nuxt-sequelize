export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  sequelize: {
    dir: 'playground/models',
    options: {
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      logging: false,
      dialectOptions: {
        dateStrings: true,
        typeCast: true,
      },
      define: {
        timestamps: true,
        createdAt: 'createTime',
        updatedAt: 'updateTime',
      },
    },
  },
  runtimeConfig: {
    sequelize: {
      dialect: '',
      database: '',
      host: '',
      port: '',
      username: '',
      password: '',
    },
    server: {
      authSecret: '',
      authExpiresIn: '',
    },
  },
})
