
// server.js - Minimal custom server setup

type DockerEvent = {
    Type: string;
    Action: string;
    Actor: {
        ID: string;
        Attributes: {
            "com.docker.compose.config-hash": string;
            "com.docker.compose.container-number": string;
            "com.docker.compose.depends_on": string;
            "com.docker.compose.image": string;
            "com.docker.compose.oneoff": string;
            "com.docker.compose.project": string;
            "com.docker.compose.project.config_files": string;
            "com.docker.compose.project.working_dir": string;
            "com.docker.compose.service": string;
            "com.docker.compose.version": string;
            image: string;
            name: string;
            "org.opencontainers.image.ref.name": string;
            "org.opencontainers.image.version": string;
        };
    };
    scope: string;
    time: number;
    timeNano: number;
};

const Database = require("better-sqlite3");
const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");
const Docker = require("dockerode");

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handler = app.getRequestHandler();

const localdatabase = new Database('./src/infrastructure/database/mydatabase.db', { verbose: console.log });

app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer);

    io.on("connection", async (socket: any) => {
        console.log("Client connected");
        const dockerode = new Docker();

        const eventsOfNetwork = await dockerode.getEvents();

        eventsOfNetwork.on("data", function (data: any) {
            try {
                var event: DockerEvent = JSON.parse(data.toString('utf8'));
                const existLogs: { resource: string, log: string, time: number, short_log: string }[] = localdatabase.prepare(`select * from log where resource = '${event.Actor.Attributes.name}' and time = ${event.time}`).all() as any[];

                if (existLogs.length > 0 && existLogs[existLogs.length - 1].log == data.toString('utf8')) {
                    return;
                }


                var shortLog = `${event.Type} - ${event.Actor.Attributes.name} - ${event.Action}`;


                if(existLogs.length > 0 && existLogs[existLogs.length - 1].short_log.includes("kill") && !shortLog.includes("destroy")) {
                    return;
                }

                if(existLogs.length > 0 && existLogs[existLogs.length - 1].short_log.includes("kill") && !shortLog.includes("stop")) {
                    return;
                }

                if(existLogs.length > 0 && existLogs[existLogs.length - 1].short_log.includes("stop") && !shortLog.includes("die")) {
                    return;
                }

                if(existLogs.length > 0 && existLogs[existLogs.length - 1].short_log.includes("die") && shortLog.includes("stop")) {
                    return;
                }

                localdatabase.exec(`
                    insert into log(resource, log, time, short_log)
                    values ('${event.Actor.Attributes.name}', '${data.toString('utf8')}', ${event.time}, '${shortLog}')   
                `);

                const logs: { resource: string, log: string, time: number, short_log: string }[] = localdatabase.prepare(`select * from log where resource = '${event.Actor.Attributes.name}'`).all() as any[];

                io.emit(`logs-container`, JSON.stringify(logs));
            } catch (ex) {
                console.log(ex);
            }
        })
    });

    httpServer.listen(3000);
});
