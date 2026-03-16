import Database from "better-sqlite3";
import { sha256, sha224 } from 'js-sha256';

const localdatabase = new Database('./src/infrastructure/database/mydatabase.db', { verbose: console.log });

localdatabase.exec(`
    drop table if exists log;

    create table log(
        id integer primary key autoincrement,
        resource varchar not null,
        log text not null,
        short_log text not null,
        time integer not null
    );
`);