const templateModel = (sequelize, DataTypes) => {
  const template = sequelize.define(
    "template",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      template_name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      proj_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      variables: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      channel: {
        type: DataTypes.ENUM("email", "sms", "inapp"),
        allowNull: false,
      },
    },
    { timestamps: true, tableName: "templates" },
  );

  return template;
};

module.exports = { templateModel };
