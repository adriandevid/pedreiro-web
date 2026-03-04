import Database from "better-sqlite3";

const localdatabase = new Database('./src/infrastructure/database/mydatabase.db', { verbose: console.log });

export { localdatabase }