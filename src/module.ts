import { fileURLToPath } from 'node:url'
import { addServerImportsDir, addServerPlugin, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Options } from 'sequelize'

export type UserOptions = Exclude<Options, 'database' | 'username' | 'password' | 'host' | 'port' | 'dialect'>

export default defineNuxtModule({
  meta: {
    // 通常是你的模块的npm包名称
    name: 'nuxt-sequelize',
    // `nuxt.config`中保存你的模块选项的键
    configKey: 'sequelize',
    // 兼容性约束
    compatibility: {
      // 支持的Nuxt版本的Semver版本
      nuxt: '^3.0.0',
    },
  },
  // 模块的默认配置选项，也可以是返回这些选项的函数
  defaults: {
    dir: 'server/models',
    options: {} as UserOptions,
  },
  // 包含模块逻辑的函数，可以是异步的
  async setup(options, nuxt) {
    const { resolve: resolver } = createResolver(import.meta.url)

    const serverDir = fileURLToPath(new URL('./runtime/server', import.meta.url))

    // Inject options via virtual template
    nuxt.options.alias['#nuxt-sequelize-options'] = addTemplate({
      filename: 'nuxt-sequelize-options.mjs',
      write: true,
      getContents: () => Object.entries(options).map(([key, value]) =>
        `export const ${key} = ${JSON.stringify(value, null, 2)}
      `).join('\n'),
    }).dst

    addServerImportsDir(resolver(serverDir, './composables'))

    addServerPlugin(resolver(serverDir, './plugins/define-sequelize-model'))
    addServerPlugin(resolver(serverDir, './plugins/sequelize-client'))
    addServerPlugin(resolver(serverDir, './plugins/sequelize'))
  },
})
