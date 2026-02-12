import buildApp from "./app";

const startServer = async () => {
  try {
    const app = await buildApp();
    const PORT = parseInt(process.env.PORT || "3000");
    await app.ready();
    await app.listen({
      port: PORT,
      host: new URL(`${process.env.SERVER_URL}`).hostname,
    });

    app.log.info(`Documentation available at ${process.env.BASE_URL}/docs`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
