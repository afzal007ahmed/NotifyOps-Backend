const { DataTypes } = require("sequelize");
const { sequelize } = require("../connections/sequelize");

const usersModel = require("./user");
const organisationModel = require("./organisation");
const { subscriptionModel } = require("./subscription");
const { projectModel } = require("./project");
const apiKeysModel = require("./apikey");
const { templateModel } = require("./template");
const { logsModel } = require("./log");
const { usageModel } = require("./usage");
const { limitsModel } = require("./limit");

const subscription = subscriptionModel(sequelize, DataTypes);
const users = usersModel(sequelize, DataTypes);
const organisation = organisationModel(sequelize, DataTypes);
const project = projectModel(sequelize, DataTypes);
const apiKeys = apiKeysModel(sequelize, DataTypes);
const template = templateModel(sequelize, DataTypes);
const logs = logsModel(sequelize, DataTypes);
const usage = usageModel(sequelize, DataTypes);
const limits = limitsModel(sequelize, DataTypes);

users.belongsTo(organisation, {
  foreignKey: "org_id",
  as: "user_organisation",
  onDelete: "CASCADE",
});

organisation.hasMany(users, {
  foreignKey: "org_id",
  as: "organisation_users",
  onDelete: "CASCADE",
});

organisation.belongsTo(subscription, {
  foreignKey: "subscription_id",
  as: "organisation_subscription",
  onDelete: "SET NULL",
});

subscription.hasMany(organisation, {
  foreignKey: "subscription_id",
  as: "subscribed_organisations",
  onDelete: "CASCADE",
});

project.belongsTo(organisation, {
  foreignKey: "org_id",
  as: "organisation_project",
  onDelete: "CASCADE",
});

organisation.hasMany(project, {
  foreignKey: "org_id",
  as: "organisation_projects",
  onDelete: "CASCADE",
});

template.belongsTo(project, {
  foreignKey: "proj_id",
  as: "project_template",
  onDelete: "CASCADE",
});

project.hasMany(template, {
  foreignKey: "proj_id",
  as: "project_templates",
  onDelete: "CASCADE",
});

apiKeys.belongsTo(project, {
  foreignKey: "proj_id",
  as: "project_api_key",
  onDelete: "CASCADE",
});

project.hasMany(apiKeys, {
  foreignKey: "proj_id",
  as: "project_api_keys",
  onDelete: "CASCADE",
});

logs.belongsTo(project, {
  foreignKey: "proj_id",
  as: "project_log",
  onDelete: "CASCADE",
});

project.hasMany(logs, {
  foreignKey: "proj_id",
  as: "project_logs",
  onDelete: "CASCADE",
});

usage.belongsTo(organisation, {
  foreignKey: "org_id",
  as: "usage_organisation",
  onDelete: "CASCADE",
});

organisation.hasOne(usage, {
  foreignKey: "org_id",
  as: "organisation_usage",
  onDelete: "CASCADE",
});

organisation.hasOne(limits, {
  foreignKey: "org_id",
  as: "organisation_limits",
  onDelete: "CASCADE",
});

limits.belongsTo(organisation, {
  foreignKey: "org_id",
  as: "limit_organisation",
  onDelete: "CASCADE",
});

module.exports = {
  users,
  organisation,
  sequelize,
  subscription,
  project,
  apiKeys,
  template,
  logs,
  usage,
  limits
};
