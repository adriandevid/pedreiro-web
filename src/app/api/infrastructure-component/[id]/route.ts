import { localdatabase } from "@pedreiro-web/infrastructure/database/config";
import { createFile, readFile } from "@pedreiro-web/util/file";
import { NextRequest, NextResponse } from "next/server";

async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
    const { id } = await params;

    const row = localdatabase.prepare(`select * from infrastructure_component where id = ${id}`).all();
    if (row.length == 0) {
        return NextResponse.json({ message: "Código não existe!" }, { status: 400 })
    }

    const infrastructureComponentResult: InfrastructureComponent = row[0] as InfrastructureComponent;
    localdatabase.exec(`
        DELETE FROM infrastructure_component
        WHERE id = ${id};
    `)

    readFile("./configuration/docker-compose.yml", (content: string) => {
        var result = content;
        result = result.replace(
            new RegExp(`#start ${infrastructureComponentResult.service_key}[\\s\\S]*?#end ${infrastructureComponentResult.service_key}`, 'g'),
            ''
        )
        createFile("./configuration/docker-compose.yml", result);
    });

    return NextResponse.json({ status: 200 })
}

export { DELETE }