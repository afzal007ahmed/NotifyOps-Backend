function apiKeysModel(sequelize, DataTypes) {
  const ApiKeys = sequelize.define(
    "api_keys",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      hash_key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      is_seen: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      proj_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status : {
        type : DataTypes.ENUM("active" , "revoked" , "deleted" ) ,
        defaultValue : "active"
      }
    },
    {
      timestamps: true,
      tableName: "api_keys",
    }
  );

  return ApiKeys;
}

module.exports = apiKeysModel;