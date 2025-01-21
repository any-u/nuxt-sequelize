import { col } from 'sequelize'

export default defineEventHandler(async () => {
  const sequelize = useSequelize()
  // const result = await sequelize.User.findAll()
  // return result

  const result = await sequelize.User.findAll({
    attributes: {
      exclude: ['id', 'created_at', 'updated_at'],
      include: [
        'account',
        [col('Profile.username'), 'username'],
        [col('Profile.avatar'), 'avatar'],
        [col('Profile.mobile'), 'mobile'],
        [col('Profile.company'), 'company'],
        [col('Profile.job'), 'job'],
        [col('Profile.bio'), 'bio'],
      ],
    },
    include: {
      model: sequelize.Profile,
      attributes: [],
      as: 'profile',
    },
    raw: true,
  })

  return result
})
