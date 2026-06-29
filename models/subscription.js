const subscriptionModel = (sequelize, DataTypes) => {
  const Subscription = sequelize.define(
    "subscription",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      plan_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email_rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      sms_rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      in_app_rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName : "subscriptions"
    }
  );

  return Subscription;
};

module.exports = { subscriptionModel } ;