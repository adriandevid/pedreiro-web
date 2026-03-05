import { localdatabase } from "@pedreiro-web/infrastructure/database/config";
import { Application, ApplicationCreate, ApplicationFile, InfrastructureComponent, InfrastructureComponentCommand, InfrastructureComponentCreate, InfrastructureComponentEnvironment, InfrastructureComponentLabel, InfrastructureComponentNetwork, InfrastructureComponentPort, InfrastructureComponentVolume } from "@pedreiro-web/infrastructure/repository/types";
import { NextRequest, NextResponse } from "next/server"
import fs from 'fs';
import { createFile, createFolder, readFile } from "@pedreiro-web/util/file";

async function GET() {
    const applications = localdatabase.prepare(`select * from infrastructure_component`).all()
    const applicationsResult: ApplicationFile[] = applications as ApplicationFile[];

    return NextResponse.json(applicationsResult, { status: 200 })
}

async function POST(request: NextRequest) {
    const body: InfrastructureComponentCreate = await request.json();

    const infrastructureComponentsWithName = localdatabase.prepare(`select * from infrastructure_component where service_key = '${body.service_key}'`).all()
    const infrastructureComponentsResult: InfrastructureComponent[] = infrastructureComponentsWithName as InfrastructureComponent[];

    if (infrastructureComponentsResult.length > 0) {
        return NextResponse.json({ message: "Já existe este componente!" }, { status: 400 })
    }

    localdatabase.exec(`
        insert into infrastructure_component(service_key, image, container_name, entrypoint, command, configuration_id)
        values ('${body.service_key}', '${body.image}', '${body.container_name}', '${body.entrypoint}', '${body.command}', 1)
    `)

    const lastInfrastructureComponentQuery = localdatabase.prepare("select * from infrastructure_component order by id desc limit 1").all();
    const lastInfrastructureComponentQueryResult: InfrastructureComponent = lastInfrastructureComponentQuery[0] as InfrastructureComponent

    if (body.commands && body.commands.length > 0) {
        body.commands.forEach(item => {
            localdatabase.exec(`
                insert into infrastructure_component_command(command, infrastructure_component_id)
                values ('${item.command}', ${lastInfrastructureComponentQueryResult.id})
            `)
        })

        lastInfrastructureComponentQueryResult.commands = localdatabase.prepare(`select * from infrastructure_component_command where infrastructure_component_id = ${lastInfrastructureComponentQueryResult.id}`).all() as InfrastructureComponentCommand[];
    }

    if (body.ports && body.ports.length > 0) {
        body.ports.forEach(item => {
            localdatabase.exec(`
                insert into infrastructure_component_port(port_bind, infrastructure_component_id)
                values ('${item.port_bind}', ${lastInfrastructureComponentQueryResult.id})
            `)
        })

        lastInfrastructureComponentQueryResult.ports = localdatabase.prepare(`select * from infrastructure_component_port where infrastructure_component_id = ${lastInfrastructureComponentQueryResult.id}`).all() as InfrastructureComponentPort[];
    }

    if (body.volumes && body.volumes.length > 0) {
        body.volumes.forEach(item => {
            localdatabase.exec(`
                insert into infrastructure_component_volumes(volume, infrastructure_component_id)
                values ('${item.volume}', ${lastInfrastructureComponentQueryResult.id})
            `)
        })
        lastInfrastructureComponentQueryResult.volumes = localdatabase.prepare(`select * from infrastructure_component_volumes where infrastructure_component_id = ${lastInfrastructureComponentQueryResult.id}`).all() as InfrastructureComponentVolume[];
    }

    if (body.networks && body.networks.length > 0) {
        body.networks.forEach(item => {
            localdatabase.exec(`
                insert into infrastructure_component_network(network, infrastructure_component_id)
                values ('${item.network}', ${lastInfrastructureComponentQueryResult.id})
            `)
        })
        lastInfrastructureComponentQueryResult.networks = localdatabase.prepare(`select * from infrastructure_component_network where infrastructure_component_id = ${lastInfrastructureComponentQueryResult.id}`).all() as InfrastructureComponentNetwork[];
    }

    if (body.labels && body.labels.length > 0) {
        body.labels.forEach(item => {
            localdatabase.exec(`
                insert into infrastructure_component_labels(label, infrastructure_component_id)
                values ('${item.label}', ${lastInfrastructureComponentQueryResult.id})
            `)
        })

        lastInfrastructureComponentQueryResult.labels = localdatabase.prepare(`select * from infrastructure_component_labels where infrastructure_component_id = ${lastInfrastructureComponentQueryResult.id}`).all() as InfrastructureComponentLabel[];
    }

    if (body.environments && body.environments.length > 0) {
        body.environments.forEach(item => {
            localdatabase.exec(`
                insert into infrastructure_component_environment(environment_name, environment_value, infrastructure_component_id)
                values ('${item.environment_name}', '${item.environment_value}', ${lastInfrastructureComponentQueryResult.id})
            `)
        })

        lastInfrastructureComponentQueryResult.environments = localdatabase.prepare(`select * from infrastructure_component_environment where infrastructure_component_id = ${lastInfrastructureComponentQueryResult.id}`).all() as InfrastructureComponentEnvironment[];
    }

    readFile("./configuration/docker-compose.yml", (content: string) => {
        var result = content;
        var commands = `#[command]`;
        var ports = `#[port]`;
        var volumes = `#[volume]`;
        var labels=`#[label]`;
        var environments=`#[environment]`;

        if (lastInfrastructureComponentQueryResult.commands && lastInfrastructureComponentQueryResult.commands.length > 0) {
            lastInfrastructureComponentQueryResult.commands.forEach(x => {
                commands = commands.replace("#[command]", `     - "${x.command}" \n #[command]`);
            })
        } else {
            lastInfrastructureComponentQueryResult.commands = []
        }

        if (lastInfrastructureComponentQueryResult.ports && lastInfrastructureComponentQueryResult.ports.length > 0) {
            lastInfrastructureComponentQueryResult.ports.forEach(x => {
                ports = ports.replace("#[port]", `     - "${x.port_bind}" \n #[port]`);
            })
        } else {
            lastInfrastructureComponentQueryResult.ports = []
        }

        if (lastInfrastructureComponentQueryResult.volumes && lastInfrastructureComponentQueryResult.volumes.length > 0) {
            lastInfrastructureComponentQueryResult.volumes.forEach(x => {
                volumes =  volumes.replace("#[volume]", `     - "${x.volume}" \n #[volume]`);
            })
        }else {
            lastInfrastructureComponentQueryResult.volumes = []
        }

        if (lastInfrastructureComponentQueryResult.labels && lastInfrastructureComponentQueryResult.labels.length > 0) {
            lastInfrastructureComponentQueryResult.labels.forEach(x => {
                labels =  labels.replace("#[label]", `     - "${x.label}" \n #[label]`);
            })
        }else {
            lastInfrastructureComponentQueryResult.labels = []
        }

        if (lastInfrastructureComponentQueryResult.environments && lastInfrastructureComponentQueryResult.environments.length > 0) {
            lastInfrastructureComponentQueryResult.environments.forEach(x => {
                environments = environments.replace("#[environment]", `     ${x.environment_name}:${x.environment_value} \n #[environment]`);
            })
        }else {
            lastInfrastructureComponentQueryResult.environments = []
        }

        var contentLists = `
        ${
            `
${
    lastInfrastructureComponentQueryResult.commands.length > 0 ?
    commands : ""
}
${
    lastInfrastructureComponentQueryResult.ports.length > 0 ?
    ports : ""
}
${
    lastInfrastructureComponentQueryResult.volumes.length > 0 ?
    volumes : ""
}

${
    lastInfrastructureComponentQueryResult.labels.length > 0 ?
    labels : ""
}
${
    lastInfrastructureComponentQueryResult.environments.length > 0 ?
    environments : ""
}
            `
        }
        `

        result = result.replace("#[content]", `
 ${lastInfrastructureComponentQueryResult.service_key}:
    image: ${lastInfrastructureComponentQueryResult.image}
    container_name: ${lastInfrastructureComponentQueryResult.container_name}
    restart: ${lastInfrastructureComponentQueryResult.restart}
    ${lastInfrastructureComponentQueryResult.command != null ?
        `command: ${lastInfrastructureComponentQueryResult.command}` : ""
    }
    ${
        contentLists.trim().length > 0 ?
        contentLists : ""
    }
    networks:
        - web
 #[content]
        `)

        createFile("./configuration/docker-compose.yml", result);
    });

    return NextResponse.json(lastInfrastructureComponentQueryResult, { status: 200 })
}


export { GET, POST }