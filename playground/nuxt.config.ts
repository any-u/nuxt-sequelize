export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  sequelize: {
    dir: 'models',
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
        createdAt: 'created_at',
        updatedAt: 'updated_at',
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
