function usersModel(sequelize, DataTypes) {
  const users = sequelize.define(
    "users",
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

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM("OWNER", "ADMIN", "DEVELOPER", "VIEWER"),
        allowNull: false,
        defaultValue: "DEVELOPER",
      },

      org_id: {
        type: DataTypes.UUID,
        allowNull: false,
      }
    },
    {
      timestamps: true,
      tableName: "users",
    },
  );

  return users;
}

module.exports = usersModel;
