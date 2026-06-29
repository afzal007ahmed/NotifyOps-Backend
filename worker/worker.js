const { Worker } = require("bullmq");
const { connection } = require("../connections/redis");
const { logs, usage, limits, template } = require("../models");
const { injectVariablesInTemplateForOneRecipient } = require("../utils/helper");
const { sendEmail } = require("../providers/email");
const { sendSms } = require("../providers/sms");
const { default: Redis } = require("ioredis");

const redis = new Redis();

function runWorker(io) {
  new Worker(
    "notifications",
    async (job) => {
      const templateName = job.data.template_name;

      const { variables, body, title } = await template.findOne({
        where: {
          template_name: templateName,
          proj_id: job.data.user.project_id,
        },
      });

      const jobStatus = await logs.findOne({ where: { job_id: job.id } });

      const usageData = { email_count: 0, sms_count: 0, inapp_count: 0 };

      if (
        jobStatus &&
        jobStatus.status.find((i) => i.channel === "email")?.value ===
          "sent_to_smtp"
      )
        return;

      const log = await logs.findOne({ where: { job_id: job.id } });

      let logStatus = log.status;

      const orgId = job.data.user.org_id;

      let emailLimit = await redis.get(`org_id:${orgId}:email`);
      let smsLimit = await redis.get(`org_id:${orgId}:sms`);
      let inappLimit = await redis.get(`org_id:${orgId}:inapp`);

      if (!emailLimit || !smsLimit || !inappLimit) {
        const limit = await limits.findOne({
          where: { org_id: orgId },
        });
        if (!emailLimit) {
          await redis.set(
            `org_id:${orgId}:email`,
            (limit?.email_limit || 0).toString(),
            "EX",
            3600,
          );
        }

        if (!smsLimit) {
          await redis.set(
            `org_id:${orgId}:sms`,
            (limit?.sms_limit || 0).toString(),
            "EX",
            3600,
          );
        }

        if (!inappLimit) {
          await redis.set(
            `org_id:${orgId}:inapp`,
            (limit?.inapp_limit || 0).toString(),
            "EX",
            3600,
          );
        }
      }

      try {
        if (
          job.data.channel === "email" ||
          (Array.isArray(job.data.channel) &&
            job.data.channel.includes("email"))
        ) {
          if (!job.data.to && Array.isArray(job.data.data)) {
            let result = [];

            for (const user of job.data.data) {
              const { templateBody, templateTitle } =
                injectVariablesInTemplateForOneRecipient(
                  variables,
                  body,
                  title,
                  user,
                );
              const remaining = await redis.decr(
                `org_id:${job.data.user.org_id}:email`,
              );

              if (remaining < 0) {
                await redis.incr(`org_id:${job.data.user.org_id}:email`);
                throw new Error("Organisation email limit has been exhausted.");
              }
              usageData.email_count++;
              result.push(sendEmail(templateBody, templateTitle, user.email));
            }

            result = await Promise.allSettled(result);

            const responseIds = [];
            let done = 0;

            result.forEach((r) => {
              if (r.status === "fulfilled") {
                done++;
              }

              responseIds.push(
                r.status === "fulfilled"
                  ? r.value.messageId
                  : r.reason?.messageId || null,
              );
            });

            const statusValue =
              done === result.length
                ? "sent_to_smtp"
                : done > 0
                  ? "partially_sent"
                  : "failed";

            logStatus = logStatus.map((ch) =>
              ch.channel === "email" ? { ...ch, value: statusValue } : ch,
            );

            await logs.update(
              {
                payload: {
                  ...(log.payload || {}),
                  responseIds,
                },
                status: logStatus,
                attempts: job.attemptsMade,
              },
              { where: { job_id: job.id } },
            );
          } else {
            const remaining = await redis.decr(
              `org_id:${job.data.user.org_id}:email`,
            );

            if (remaining < 0) {
              await redis.incr(`org_id:${job.data.user.org_id}:email`);
              throw new Error("Organisation email limit has been exhausted.");
            }
            const { templateBody, templateTitle } =
              injectVariablesInTemplateForOneRecipient(
                variables,
                body,
                title,
                job.data.data,
              );

            const response = await sendEmail(
              templateBody,
              templateTitle,
              job.data.to,
            );
            usageData.email_count++;
            logStatus = logStatus.map((ch) =>
              ch.channel === "email" ? { ...ch, value: "sent_to_smtp" } : ch,
            );

            await logs.update(
              {
                status: logStatus,
                attempts: job.attemptsMade,
                payload: {
                  ...(log.payload || {}),
                  requestIds: [
                    ...(Array.isArray(log.payload?.requestIds)
                      ? log.payload.requestIds
                      : []),
                    response.messageId,
                  ],
                },
              },
              { where: { job_id: job.id } },
            );
          }
          await usage.increment(
            { email_count: usageData.email_count },
            { where: { org_id: job.data.user.org_id } },
          );
        }
      } catch (error) {
        logStatus = logStatus.map((ch) =>
          ch.channel === "email" ? { ...ch, value: "failed" } : ch,
        );

        await logs.update(
          {
            error_message: error.message,
            status: logStatus,
            attempts: job.attemptsMade,
          },
          { where: { job_id: job.id } },
        );
        throw new Error(error.message, { cause: error });
      }

      try {
        if (
          job.data.channel === "sms" ||
          (Array.isArray(job.data.channel) && job.data.channel.includes("sms"))
        ) {
          if (Array.isArray(job.data.data)) {
            let result = [];

            for (let d of job.data.data) {
              const remaining = await redis.decr(
                `org_id:${job.data.user.org_id}:sms`,
              );

              if (remaining < 0) {
                await redis.incr(`org_id:${job.data.user.org_id}:sms`);
                throw new Error("Organisation sms limit has been exhausted.");
              }
              usageData.sms_count++;
              result.push(sendSms());
            }

            result = await Promise.allSettled(result);

            const messageIds = [];
            let done = 0;

            result.forEach((r) => {
              if (r.status === "fulfilled") {
                done++;
              }

              messageIds.push(
                r.status === "fulfilled"
                  ? r.value.messageId
                  : r.reason?.messageId || null,
              );
            });

            const statusValue =
              done === result.length
                ? "sms_delivered"
                : done > 0
                  ? "partially_sent"
                  : "failed";

            logStatus = logStatus.map((ch) =>
              ch.channel === "sms" ? { ...ch, value: statusValue } : ch,
            );

            await logs.update(
              {
                status: logStatus,
                payload: {
                  ...(log.payload || {}),
                  messageIds,
                },
                attempts: job.attemptsMade,
              },
              { where: { job_id: job.id } },
            );
          } else {
            const remaining = await redis.decr(
              `org_id:${job.data.user.org_id}:sms`,
            );

            if (remaining < 0) {
              await redis.incr(`org_id:${job.data.user.org_id}:sms`);
              throw new Error("Organisation sms limit has been exhausted.");
            }
            const response = await sendSms();

            usageData.sms_count++;

            logStatus = logStatus.map((ch) =>
              ch.channel === "sms" ? { ...ch, value: "sms_delivered" } : ch,
            );

            await logs.update(
              {
                status: logStatus,
                payload: {
                  ...(log.payload || {}),
                  messageIds: [response.messageId],
                },
                attempts: job.attemptsMade,
              },
              { where: { job_id: job.id } },
            );
          }

          await usage.increment(
            { sms_count: usageData.sms_count },
            { where: { org_id: job.data.user.org_id } },
          );
        }
      } catch (error) {
        logStatus = logStatus.map((ch) =>
          ch.channel === "sms" ? { ...ch, value: "failed" } : ch,
        );

        await logs.update(
          {
            error_message: error.message,
            status: logStatus,
            attempts: job.attemptsMade,
            payload: {
              ...(log.payload || {}),
              messageIds: [
                ...(Array.isArray(log.payload?.messageIds)
                  ? log.payload.messageIds
                  : []),
                error.messageId || null,
              ],
            },
          },
          { where: { job_id: job.id } },
        );
        throw new Error(error.message, {
          cause: error,
        });
      }

      try {
        if (
          job.data.channel === "inapp" ||
          (Array.isArray(job.data.channel) &&
            job.data.channel.includes("inapp"))
        ) {
          if (Array.isArray(job.data.data)) {
            const results = [];

            for (let d of job.data.data) {
              const { templateBody, templateTitle } =
                injectVariablesInTemplateForOneRecipient(
                  variables,
                  body,
                  title,
                  d,
                );

              const remaining = await redis.decr(
                `org_id:${job.data.user.org_id}:inapp`,
              );

              if (remaining < 0) {
                await redis.incr(`org_id:${job.data.user.org_id}:inapp`);
                throw new Error("Organisation inapp limit has been exhausted.");
              }

              usageData.inapp_count++;
              io.to(`project_${job.data.user.project_id}`).emit(
                "notification-status",
                {
                  user_id: d.user_id,
                  body: templateBody,
                  title: templateTitle,
                  status: "delivered_to_merchant",
                },
              );

              results.push({ user_id: d.user_id, templateBody, templateTitle });
            }

            logStatus = logStatus.map((ch) =>
              ch.channel === "inapp"
                ? { ...ch, value: "delivered_to_merchant" }
                : ch,
            );

            await logs.update(
              {
                status: logStatus,
                attempts: job.attemptsMade,
                payload: {
                  ...(log.payload || {}),
                  inapp_messages: results,
                },
              },
              { where: { job_id: job.id } },
            );
          } else {
            const { templateBody, templateTitle } =
              injectVariablesInTemplateForOneRecipient(
                variables,
                body,
                title,
                job.data.data,
              );

            const remaining = await redis.decr(
              `org_id:${job.data.user.org_id}:inapp`,
            );

            if (remaining < 0) {
              await redis.incr(`org_id:${job.data.user.org_id}:inapp`);
              throw new Error("Organisation inapp limit has been exhausted.");
            }

            usageData.inapp_count++;

            io.to(`project_${job.data.user.project_id}`).emit(
              "notification-status",
              {
                user_id: job.data.data.user_id,
                body: templateBody,
                title: templateTitle,
                status: "delivered_to_merchant",
              },
            );

            logStatus = logStatus.map((ch) =>
              ch.channel === "inapp"
                ? { ...ch, value: "delivered_to_merchant" }
                : ch,
            );

            await logs.update(
              {
                status: logStatus,
                attempts: job.attemptsMade,
                payload: {
                  ...(log.payload || {}),
                  inapp_messages: [
                    ...(Array.isArray(log.payload?.inapp_messages)
                      ? log.payload.inapp_messages
                      : []),
                    {
                      user_id: job.data.data.user_id,
                      templateBody,
                      templateTitle,
                    },
                  ],
                },
              },
              { where: { job_id: job.id } },
            );
          }
          await usage.increment(
            { inapp_count: usageData.inapp_count },
            { where: { org_id: job.data.user.org_id } },
          );
        }
      } catch (error) {
        logStatus = logStatus.map((ch) =>
          ch.channel === "inapp" ? { ...ch, value: "failed" } : ch,
        );

        await logs.update(
          {
            error_message: error.message,
            status: logStatus,
            attempts: job.attemptsMade,
          },
          { where: { job_id: job.id } },
        );

        throw new Error(error.message, { cause: error });
      }
    },
    {
      connection: connection,
      limiter: {
        max: 10,
        duration: 1000,
      },
    },
  );
}

module.exports = { runWorker };
