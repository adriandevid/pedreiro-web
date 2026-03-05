import { localdatabase } from "@pedreiro-web/infrastructure/database/config";
import { Application } from "@pedreiro-web/infrastructure/repository/types";
import { deleteFolder } from "@pedreiro-web/util/file";
import { NextRequest, NextResponse } from "next/server";

async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
    const { id } = await params;

    const row = localdatabase.prepare(`select * from application where id = ${id}`).all()
    const applicationCreatedResult: Application = row[0] as Application;
    localdatabase.exec(`
        DELETE FROM application
        WHERE id = ${id};
    `)
    await deleteFolder(`./configuration/applications/${applicationCreatedResult.name}`);

    return NextResponse.json({ status: 200 })
}

export { DELETE }