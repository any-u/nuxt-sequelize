import type {
  BelongsToManyOptions,
  BelongsToOptions,
  HasManyOptions,
  HasOneOptions,
} from 'sequelize'
import type { SequelizeModels } from './sequelize'
import { capitalize } from '../utils/utils'

export interface AssociationEntity<T> {
  name: string
  options: T
}

export interface BaseAssociation<F, T> {
  from: AssociationEntity<F>
  to: AssociationEntity<T>
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

  const { from, to } = association
  const FModel = models[capitalize(from.name)]
  const TModel = models[capitalize(to.name)]
  FModel.hasOne(TModel, from.options)
  TModel.belongsTo(FModel, to.options)
}

function oneToN(models: SequelizeModels, association: OneToNAssociation) {
  if (association.type !== '1toN') return

  const { from, to } = association
  const FModel = models[capitalize(from.name)]
  const TModel = models[capitalize(to.name)]

  FModel.hasMany(TModel, from.options)
  TModel.belongsTo(FModel, to.options)
}

function nToM(models: SequelizeModels, association: NtoMAssociation) {
  if (association.type !== 'NtoM') return

  const { from, to, through } = association
  const FModel = models[capitalize(from.name)]
  const TModel = models[capitalize(to.name)]

  const throughModel = models[through]

  FModel.belongsToMany(TModel, {
    ...{ through: throughModel },
    ...from.options,
  })
  TModel.belongsToMany(FModel, { ...{ through: throughModel }, ...to.options })
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
