const logsModel = (sequelize, DataTypes) => {
  const logs = sequelize.define(
    "logs",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      job_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      channel: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      proj_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      recipients_type: {
        type: DataTypes.ENUM("multi", "single"),
        allowNull: false,
      },
    },
    {
      tableName: "logs",
      timestamps: true,
    },
  );
  return logs;
};

module.exports = { logsModel };
