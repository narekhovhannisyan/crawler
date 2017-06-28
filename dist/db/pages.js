module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Pages', {
    page_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    page_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    page_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    limit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    country: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'pages',
    timestamps: true,
    getterMethods: {},
    instanceMethods: {}
  })
}