import fs from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import { addTemplate, addTypeTemplate } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { UserOptions } from '../module'

export type ComposableSetupOptions = {
  modelsDir: string
  nuxt: Nuxt
  options: {
    dir: string
    options: UserOptions
  }
}

export function setupComposable({ modelsDir, nuxt, options }: ComposableSetupOptions) {
  // 1. add defineSequelizeModel
  const generatedDefineModelPath = addTemplate({
    filename: 'sequelize.define.mjs',
    write: true,
    getContents: async () =>
      [
        'import { pluralize, underscore } from "inflection"',
        '',
        'export function defineSequelizeModel(attributes, options) {',
        '  if (typeof attributes === "function") return attributes',
        '',
        '  return function (name, sequelize) {',
        '    options = {',
        '      tableName: pluralize(underscore(name)),',
        '      ...options,',
        '    }',
        '    return sequelize.define(name, attributes, options)',
        '  }',
        '}',
      ].join('\n'),
  }).dst

  // 2. add defineAssociation
  addTemplate({
    filename: 'sequelize.define-association.mjs',
    write: true,
    getContents: async () =>
      [
        'function camelize(str) {',
        '  return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c ? c.toUpperCase() : "")',
        '}',
        '',
        'function oneToOne(models, association) {',
        '  if (association.type !== "1to1") return',
        '',
        '  const { modelA, modelB } = association',
        '  const FModel = models[camelize(modelA.name)]',
        '  const TModel = models[camelize(modelB.name)]',
        '  FModel.hasOne(TModel, modelA.options)',
        '  TModel.belongsTo(FModel, modelB.options)',
        '}',
        '',
        'function oneToN(models, association) {',
        '  if (association.type !== "1toN") return',
        '',
        '  const { modelA, modelB } = association',
        '  const FModel = models[camelize(modelA.name)]',
        '  const TModel = models[camelize(modelB.name)]',
        '',
        '  FModel.hasMany(TModel, modelA.options)',
        '  TModel.belongsTo(FModel, modelB.options)',
        '}',
        '',
        'function nToM(models, association) {',
        '  if (association.type !== "NtoM") return',
        '',
        '  const { modelA, modelB, through } = association',
        '  const FModel = models[camelize(modelA.name)]',
        '  const TModel = models[camelize(modelB.name)]',
        '',
        '  const throughModel = models[camelize(through)]',
        '',
        '  FModel.belongsToMany(TModel, {',
        '    ...{ through: throughModel },',
        '    ...modelA.options,',
        '  })',
        '  TModel.belongsToMany(FModel, { ...{ through: throughModel }, ...modelB.options })',
        '}',
        '',
        'export function defineAssociation(associations) {',
        '  return function (sequelize) {',
        '    for (const association of associations) {',
        '      switch (association.type) {',
        '        case "1to1":',
        '          oneToOne(sequelize, association)',
        '          break',
        '        case "1toN":',
        '          oneToN(sequelize, association)',
        '          break',
        '        case "NtoM":',
        '          nToM(sequelize, association)',
        '          break',
        '      }',
        '    }',
        '  }',
        '}',
        '',
        'export default defineAssociation',
      ].join('\n'),
  })

  // 3. add defineSequelizeModel type and defineAssociation type
  addTypeTemplate({
    filename: 'types/sequelize.d.ts',
    getContents: () =>
      [
        '// AUTO-GENERATED BY nuxt-sequelize',
        '',
        'import { Model, ModelAttributes, ModelOptions } from "sequelize"',
        '',
        'interface AssociationEntity<T> {',
        '  name: string',
        '  options: T',
        '}',
        '',
        'interface BaseAssociation<F, T> {',
        '  modelA: AssociationEntity<F>',
        '  modelB: AssociationEntity<T>',
        '}',
        '',
        'type OneToOneAssociationType = "1to1"',
        'interface OneToOneAssociation extends BaseAssociation<HasOneOptions, BelongsToOptions> {',
        '  type: OneToOneAssociationType',
        '}',
        '',
        'type OneToNAssociationType = "1toN"',
        'interface OneToNAssociation extends BaseAssociation<HasManyOptions, BelongsToOptions> {',
        '  type: OneToNAssociationType',
        '}',
        '',
        'type NtoMAssociationType = "NtoM"',
        'interface NtoMAssociation extends BaseAssociation<BelongsToManyOptions, BelongsToManyOptions> {',
        '  type: NtoMAssociationType',
        '  through: string',
        '}',
        '',
        'type Association =',
        '  | OneToOneAssociation',
        '  | OneToNAssociation',
        '  | NtoMAssociation',
        '',
        'declare global {',
        '  export function defineSequelizeModel<T extends ModelAttributes>(attributes: T, options?: ModelOptions): (name: string, sequelize: any) => Model<T>',
        '  export function defineAssociation(associations: Association[]): void',
        '}',
        '',
      ].join('\n'),
  })

  // 3. add model files
  const files = fs.readdirSync(modelsDir)
  const generatedModelPathList: Array<string> = []
  files.forEach((file) => {
    const name = basename(file, extname(file))
    addTemplate({
      filename: `models/${name}.mjs`,
      write: true,
      getContents: () =>
        [
          `import { defineSequelizeModel } from '${generatedDefineModelPath}'`,
          fs.readFileSync(resolve(modelsDir, file), 'utf-8'),
        ].join('\n'),
    })

    generatedModelPathList.push(name)
  })

  // 4. add model imports by #models alias
  nuxt.options.alias['#models'] = addTemplate({
    filename: 'models/index.mjs',
    write: true,
    getContents: () =>
      [
        generatedModelPathList
          .map(name => `import ${name}DefineModel from './${name}.mjs'`)
          .join('\n'),
        '',
        'export const loadSequelizeModels = async () => {',
        '  const models = {',
        generatedModelPathList
          .map((name) => {
            return `    ${name}: ${name}DefineModel`
          })
          .join('\n'),
        '  }',
        '',
        '  return models',
        '}',
      ].join('\n'),
  }).dst

  // 5. inject options via virtual template
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
}
