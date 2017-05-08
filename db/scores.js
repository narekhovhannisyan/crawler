module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Scores', {
    score_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    post_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    score_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reactions: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    comments: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    shares: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  }, {
    tableName: 'scores',
    timestamps: true,
    updatedAt: false, 
    getterMethods: {},
    instanceMethods: {}
  })
}