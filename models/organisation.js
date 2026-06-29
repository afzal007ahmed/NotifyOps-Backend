function organisationModel(sequelize, DataTypes) {
  const Organisation = sequelize.define(
    "organisations",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subscription_id: {
        type: DataTypes.UUID,
      }
    },
    {
      timestamps: true,
      tableName: "organisations",
    },
  );

  return Organisation;
}

module.exports = organisationModel;
