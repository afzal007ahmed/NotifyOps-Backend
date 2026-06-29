const parseRegisterPayload = (payload) => {
  return {
    email: payload.email,
    password: payload.password,
    name: payload.name,
    role: payload.role,
    orgName: payload.orgName,
  };
};

const parseLoginPayload = (payload) => {
  return {
    email: payload.email,
    password: payload.password,
  };
};

const parseTemplatePayload = (payload) => {
  return {
    template_name: payload.template_name.trim(),
    channel: payload.channel,
    title: payload.subject,
    body: payload.body,
  };
};

const findTemplateVariables = (template) => {
  if (!template) return [];
  const matches = [
    ...template.matchAll(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g),
  ].map((match) => match[1].trim());
  return matches;
};

const parseNotificationPayload = (payload, batch) => {
  if (!payload || typeof payload !== "object") return {};
  return {
    data: payload.data,
    template_name: payload.template_name,
    channel: payload.channel,
    ...(!batch && { to: payload.to }),
  };
};

const injectVariablesInTemplateForOneRecipient = (
  variables,
  templateBody,
  templateTitle,
  data,
) => {
  variables.forEach((variable) => {
    templateBody = templateBody?.replaceAll(`{{${variable}}}`, data[variable]);
    templateTitle = templateTitle?.replaceAll(`{{${variable}}}`, data[variable]);
  });
  templateBody = templateBody?.replaceAll("\n", "<br/>");
  return {
    templateBody,
    templateTitle,
  };
};

module.exports = {
  parseRegisterPayload,
  parseLoginPayload,
  parseTemplatePayload,
  findTemplateVariables,
  parseNotificationPayload,
  injectVariablesInTemplateForOneRecipient,
};
