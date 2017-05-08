module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Country', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    iso: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nicename: {
      type: DataTypes.STRING,
      allowNull: true
    },
    iso3: {
      type: DataTypes.STRING,
      allowNull: true
    },
    numcode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    phonecode: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'pages',
    timestamps: false,
    getterMethods: {},
    instanceMethods: {}
  })
}