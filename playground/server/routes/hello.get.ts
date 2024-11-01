export default defineEventHandler(async () => {
  // const client = useSequelizeClient()
  // client.sync({ force: true })

  const sequelize = useSequelize()
  const result = await sequelize.User.findAll()
  return result
})
