export default defineEventHandler(async () => {
  const sequelize = useSequelize()
  const result = await sequelize.user.findAll()
  return result
})
