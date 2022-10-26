const port = process.env.PORT || 3000;
const cron = require("node-cron");
const { getImageRender } = require("./get-data");
const express = require('express');
const init = async (app) => {

    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));
  cron.schedule("*/10 * * * *", () => {
    try {
      fetch(process.env.URL_HEALTHCHECK);
    } catch (error) {}
  });
  app.get("/healthcheck", async (req, res) => {
    try {
      return res.status(200).send(`Crawling is running`);
    } catch (error) {
      return res.status(400).send(`error`);
    }
  });
  app.post("/data-checking", getImageRender);

  process.on("uncaughtException", function (err) {
    Sentry.captureException(err);
  });
  app.listen(port, () => {
    console.info(`API server started on port ${port}`);
  });
  return app;
};

module.exports = init;
