const { logs } = require("../models");
const { queue } = require("../queue/queue");
const { parseNotificationPayload } = require("../utils/helper");

const validateRecipients = (channels, data) => {
  for (const recipient of data) {
    if (channels.includes("email") && !recipient.email) {
      throw new Error("Email is missing for a recipient.");
    }

    if (channels.includes("sms") && !recipient.number) {
      throw new Error("Number is missing for a recipient.");
    }
    if (channels.includes("inapp") && !recipient.user_id) {
      throw new Error("user_id is missing for a recipient.");
    }
  }
};

const notificationsController = {
  sendOneNotification: async (req, res) => {
    try {
      const notifications = parseNotificationPayload(req.body);

      if (
        !notifications?.to &&
        (notifications.channel === "sms" || notifications.channel === "email")
      ) {
        return res.status(400).json({
          message: "missing recipient details",
          code: "MISSING_RECIPIENT_DETAILS",
        });
      }

      if (Array.isArray(notifications.channel)) {
        return res.status(400).json({
          message: "single channel allowed",
          code: "SINGLE_CHANNEL",
        });
      }

      if (Array.isArray(notifications.data)) {
        return res.status(400).json({
          message: "Data must be object",
          code: "INVALID_DATA_FORMAT",
        });
      }

      if (notifications.channel === "inapp") {
        if (!notifications.data.user_id) {
          return res.status(400).json({
            message: "recipient should have user_id",
            code: "USER_ID_MISSING",
          });
        }
      }

      const channel = notifications.channel;

      const log = await logs.create({
        status: [{ channel, value: "pending" }],
        error_message: "",
        channel: [channel],
        payload: notifications,
        proj_id: req.user.project_id,
        recipients_type: "single",
      });

      const job = await queue.add("notifications", {
        ...notifications,
        user: req.user,
      });

      await logs.update({ job_id: job.id }, { where: { id: log.id } });

      return res.status(202).json({
        success: true,
        message: "Notification queued successfully",
        jobId: job.id,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        code: "ERR",
      });
    }
  },

  batch: async (req, res) => {
    try {
      const notifications = parseNotificationPayload(req.body, true);

      if (!notifications || !Array.isArray(notifications.data)) {
        return res.status(400).json({
          message: "data should be an array for batch notifications.",
          code: "INVALID_DATA_FORMAT",
        });
      }

      const channel = notifications.channel;

      if (Array.isArray(channel)) {
        return res.status(400).json({
          message: "single channel allowed",
          code: "SINGLE_CHANNEL",
        });
      }

      const channels = [channel];

      validateRecipients(channels, notifications.data);

      const log = await logs.create({
        status: channels.map((c) => ({ channel: c, value: "pending" })),
        error_message: "",
        channel: channels,
        payload: notifications,
        proj_id: req.user.project_id,
        recipients_type: "multi",
      });

      const job = await queue.add("notifications", {
        ...notifications,
        user: req.user,
      });

      await logs.update({ job_id: job.id }, { where: { id: log.id } });

      return res.status(202).json({
        success: true,
        message: "Notification queued successfully",
        jobId: job.id,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        code: "ERR",
      });
    }
  },

  multiChannel: async (req, res) => {
    try {
      const notifications = parseNotificationPayload(req.body, true);

      if (!notifications?.channel) {
        return res.status(400).json({
          message: "channels are missing",
          code: "MISSING_CHANNELS",
        });
      }

      if (!Array.isArray(notifications.channel)) {
        return res.status(400).json({
          message: "channel must be an array",
          code: "INVALID_CHANNEL_FORMAT",
        });
      }

      if (!Array.isArray(notifications.data)) {
        return res.status(400).json({
          message: "data should be an array for multi channel notifications.",
          code: "INVALID_DATA_FORMAT",
        });
      }

      validateRecipients(notifications.channel, notifications.data);

      const log = await logs.create({
        status: notifications.channel.map((c) => ({
          channel: c,
          value: "pending",
        })),
        error_message: "",
        channel: notifications.channel,
        payload: notifications,
        proj_id: req.user.project_id,
        recipients_type: "multi",
      });

      const job = await queue.add("notifications", {
        ...notifications,
        user: req.user,
      });

      await logs.update({ job_id: job.id }, { where: { id: log.id } });

      return res.status(202).json({
        success: true,
        message: "Notification queued successfully",
        jobId: job.id,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "something_went_wrong",
        code: "ERR",
      });
    }
  },
};

module.exports = { notificationsController };
