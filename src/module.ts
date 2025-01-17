import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { basename, extname } from 'node:path'
import {
  addServerImports,
  addServerImportsDir,
  addServerPlugin,
  addTemplate,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import type { Options } from 'sequelize'

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

    const serverDir = fileURLToPath(
      new URL('./runtime/server', import.meta.url),
    )
    const modelsDir = resolveProject('models')

    const generatedDefineModelPath = addTemplate({
      filename: 'sequelize.define.mjs',
      write: true,
      getContents: async () =>
        fs.readFileSync(
          resolver(serverDir, './utils/define-sequelize-model.ts'),
          'utf-8',
        ),
    }).dst
    addServerImports([
      {
        name: 'defineSequelizeModel',
        from: generatedDefineModelPath,
      },
    ])

    // Inject models via virtual template
    const files = fs.readdirSync(modelsDir)

    const generatedModelPathList: { name: string, path: string }[] = []
    files.forEach((file) => {
      const name = basename(file, extname(file))
      const path = addTemplate({
        filename: `sequelize.model.${name}.mjs`,
        write: true,
        getContents: () =>
          [
            `import { defineSequelizeModel } from '${generatedDefineModelPath}'`,
            fs.readFileSync(resolveProject('models', file), 'utf-8'),
          ].join('\n'),
      }).dst

      generatedModelPathList.push({
        name,
        path,
      })
      addServerImports([
        {
          name: 'default',
          as: `${name}DefineModel`,
          from: path,
        },
      ])
    })

    nuxt.options.alias['#models'] = addTemplate({
      filename: 'sequelize.model.mjs',
      write: true,
      getContents: () =>
        [
          generatedModelPathList
            .map(({ name, path }) => `import ${name}DefineModel from '${path}'`)
            .join('\n'),
          '',
          'export const addSequelizeModels = async () => {',
          '  const models = {}',
          '',
          generatedModelPathList
            .map(({ name }) => {
              return `  models.${name} = ${name}DefineModel`
            })
            .join('\n'),
          '  return models',
          '}',
        ].join('\n'),
    }).dst

    // Inject options via virtual template
    nuxt.options.alias['#sequelize'] = addTemplate({
      filename: 'sequelize.mjs',
      write: true,
      getContents: () =>
        Object.entries(options)
          .map(
            ([key, value]) =>
              `export const ${key} = ${JSON.stringify(value, null, 2)}
      `,
          )
          .join('\n'),
    }).dst

    addServerImportsDir(resolver(serverDir, './composables'))

    addServerPlugin(resolver(serverDir, './plugins/define-sequelize-model'))
    addServerPlugin(resolver(serverDir, './plugins/define-association'))
    addServerPlugin(resolver(serverDir, './plugins/sequelize-client'))
    addServerPlugin(resolver(serverDir, './plugins/sequelize'))
  },
})
