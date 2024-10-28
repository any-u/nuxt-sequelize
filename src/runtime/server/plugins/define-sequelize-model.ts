import { defineSequelizeModel as defineModel } from '../utils/defineSequelizeModel'

export default defineNitroPlugin(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.defineSequelizeModel = defineModel
})
