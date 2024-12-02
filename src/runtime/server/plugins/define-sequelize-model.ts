import { defineNitroPlugin } from 'nitropack/runtime'
import { defineSequelizeModel as defineModel } from '../utils/define-sequelize-model'

export default defineNitroPlugin(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.defineSequelizeModel = defineModel
})
