module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Posts', {
    post_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    page_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    post_message: {
      type: DataTypes.STRING,
      allowNull: true
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true
    },
    post_created_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'posts',
    timestamps: true,
    getterMethods: {},
    instanceMethods: {}
  })
}