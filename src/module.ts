import { fileURLToPath } from 'node:url'
import {
  addServerImportsDir,
  addServerPlugin,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import type { Options } from 'sequelize'
import { ensureDependencyInstalled } from 'nypm'
import { setupComposable } from './package-utils/setup-helpers'

export type UserOptions = Exclude<
  Options,
  'database' | 'username' | 'password' | 'host' | 'port' | 'dialect'
>

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
    const { resolve: resolveProject } = createResolver(nuxt.options.rootDir)
    const { resolve: resolver } = createResolver(import.meta.url)

    // 1. ensure dependencies installed
    try {
      await ensureDependencyInstalled('sequelize', {
        cwd: resolveProject(),
      })
      await ensureDependencyInstalled('inflection', {
        cwd: resolveProject(),
      })
    }
    catch {
      console.error('Failed to install dependencies')
    }

    // 2. Locate related directory
    const serverDir = fileURLToPath(
      new URL('./runtime/server', import.meta.url),
    )
    const modelsDir = resolveProject(options.dir)

    // 3. Setup composable
    setupComposable({ modelsDir, nuxt, options })

    // 4. Add imports and plugins
    addServerImportsDir(resolver(serverDir, './composables'))

    addServerPlugin(resolver(serverDir, './plugins/sequelize-client'))
    addServerPlugin(resolver(serverDir, './plugins/sequelize'))
  },
})
