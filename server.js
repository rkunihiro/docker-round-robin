const express = require("express");
const morgan = require("morgan");
const Redis = require("ioredis");
const serverName = process.env.SERVER_NAME || "unknown";

const defaultOptions = {
    port: 6379,
    lazyConnect: true,
    connectTimeout: 3000,
};
const reader01 = new Redis({
    ...defaultOptions,
    host: "redis-reader01",
});
const reader02 = new Redis({
    ...defaultOptions,
    host: "redis-reader02",
});
const reader = new Redis({
    ...defaultOptions,
    host: "redis-reader",
    lazyConnect: false,
    maxRetriesPerRequest: 0,
    // retryStrategy: (times) => {
    //     console.log(`retry ${times}`);
    //     return 1000;
    // },
    reconnectOnError: (err) => {
        return true;
    },
});
reader.on("error", (err) => {
    console.error(err.message);
});

(async () => {
    // save to redis-reader01
    await reader01.connect();
    await reader01.set("name", "reader-01");
    await reader01.disconnect();

    // save to redis-reader02
    await reader02.connect();
    await reader02.set("name", "reader-02");
    await reader02.disconnect();

    // start web server
    const app = express();
    app.use(morgan("dev"));
    app.get("*", async (req, res) => {
        try {
            // await reader.connect();
            const name = await reader.get("name");
            // await reader.disconnect();
            res.json({
                serverName,
                name,
            });
        } catch (err) {
            res.status(500);
            res.json({
                serverName,
                err,
            });
        }
    });
    app.listen(3000, () => {
        console.log(`server start ${serverName}`);
    });

})();
