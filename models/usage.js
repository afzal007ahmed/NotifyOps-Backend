const usageModel = (sequelize, DataTypes) => {
  const usage = sequelize.define(
    "usage",
    {
      email_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      sms_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      inapp_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      org_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "usage",
      timestamps: true,
    },
  );

  return usage;
};

module.exports = { usageModel };
