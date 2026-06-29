const limitsModel = (sequelize, DataTypes) => {
  const limits = sequelize.define("limits" ,
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 500,
      },
      sms_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 500,
      },
      inapp_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 500,
      },
      org_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "limits",
      timestamps: true,
    },
  );
  return limits;
};

module.exports = { limitsModel };
