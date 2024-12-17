import type {
  BelongsToManyOptions,
  BelongsToOptions,
  HasManyOptions,
  HasOneOptions,
} from 'sequelize'
import { defineNitroPlugin } from 'nitropack/runtime'
import { camelize } from 'inflection'
import type { SequelizeModels } from './sequelize'

export interface AssociationEntity<T> {
  name: string
  options: T
}

export interface BaseAssociation<F, T> {
  modelA: AssociationEntity<F>
  modelB: AssociationEntity<T>
}

export type OneToOneAssociationType = '1to1'
export interface OneToOneAssociation extends BaseAssociation<HasOneOptions, BelongsToOptions> {
  type: OneToOneAssociationType
}

export type OneToNAssociationType = '1toN'
export interface OneToNAssociation extends BaseAssociation<HasManyOptions, BelongsToOptions> {
  type: OneToNAssociationType
}

export type NtoMAssociationType = 'NtoM'
export interface NtoMAssociation extends BaseAssociation<BelongsToManyOptions, BelongsToManyOptions> {
  type: NtoMAssociationType
  through: string
}

export type Association =
  | OneToOneAssociation
  | OneToNAssociation
  | NtoMAssociation

function oneToOne(models: SequelizeModels, association: OneToOneAssociation) {
  if (association.type !== '1to1') return

  const { modelA, modelB } = association
  const FModel = models[camelize(modelA.name)]
  const TModel = models[camelize(modelB.name)]
  FModel.hasOne(TModel, modelA.options)
  TModel.belongsTo(FModel, modelB.options)
}

function oneToN(models: SequelizeModels, association: OneToNAssociation) {
  if (association.type !== '1toN') return

  const { modelA, modelB } = association
  const FModel = models[camelize(modelA.name)]
  const TModel = models[camelize(modelB.name)]

  FModel.hasMany(TModel, modelA.options)
  TModel.belongsTo(FModel, modelB.options)
}

function nToM(models: SequelizeModels, association: NtoMAssociation) {
  if (association.type !== 'NtoM') return

  const { modelA, modelB, through } = association
  const FModel = models[camelize(modelA.name)]
  const TModel = models[camelize(modelB.name)]

  const throughModel = models[camelize(through)]

  FModel.belongsToMany(TModel, {
    ...{ through: throughModel },
    ...modelA.options,
  })
  TModel.belongsToMany(FModel, { ...{ through: throughModel }, ...modelB.options })
}

export function defineAssociation(associations: Association[]) {
  return function (sequelize: SequelizeModels) {
    for (const association of associations) {
      switch (association.type) {
        case '1to1':
          oneToOne(sequelize, association)
          break
        case '1toN':
          oneToN(sequelize, association)
          break
        case 'NtoM':
          nToM(sequelize, association)
          break
      }
    }
  }
}

export default defineNitroPlugin(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.defineAssociation = defineAssociation
})
