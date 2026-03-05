import Database from "better-sqlite3";

const localdatabase = new Database('./src/infrastructure/database/mydatabase.db', { verbose: console.log });

/*
    application:
        port => É a porta do service dentro do cluster
        node_port => É a porta dentro do container,
        target_port => É a porta externa aberta para acessar os nodes
        container_port => É a porta interna em que a aplicação é executada dentro do container (não obrigatório nesta situação)
*/
localdatabase.exec(`
    drop table if exists application;
    drop table if exists application_files;
    drop table if exists configuration;
    drop table if exists infrastructure_component;
    drop table if exists infrastructure_component_command;
    drop table if exists infrastructure_component_port;
    drop table if exists infrastructure_component_volumes;
    drop table if exists infrastructure_component_network;
    drop table if exists infrastructure_component_labels;
    drop table if exists infrastructure_component_environment;

    create table configuration(
        id integer primary key autoincrement,
        title varchar(200) not null,
        networks_web_external bool not null
    );
    
    create table application(
        id integer primary key autoincrement,
        name varchar(100) not null,

        --service
        port integer not null,
        node_port integer not null,
        target_port integer not null,
        protocol varchar(10) default 'TCP',
        type varchar(10) default 'NodePort',

        --deployment
        container_name varchar not null,
        image varchar not null,
        image_pull_policy varchar(100) not null default 'Always',
        container_port integer not null,
        replicas integer not null default 1,
        configuration_id integer not null,
        constraint configuration_id_c foreign key (configuration_id) references configuration(id)
    );

    create table application_files(
        id integer primary key autoincrement,
        name varchar(100) not null,
        file text not null,
        application_id integer not null,
        constraint application_id_c foreign key (application_id) references application(id)
    );

    create table infrastructure_component(
        id integer primary key autoincrement,
        service_key varchar(200) not null,
        image varchar(200) not null,
        container_name varchar(100) not null,
        entrypoint text null,
        command text null,
        restart varchar(100) not null default 'always',
        configuration_id integer not null,
        constraint configuration_id_c foreign key (configuration_id) references configuration(id)
    );

    create table infrastructure_component_command(
        id integer primary key autoincrement,
        command varchar not null,
        infrastructure_component_id integer not null,
        constraint infrastructure_component_id_c foreign key (infrastructure_component_id) references infrastructure_component(id)
    );
    create table infrastructure_component_port(
        id integer primary key autoincrement,
        port_bind varchar not null,
        infrastructure_component_id integer not null,
        constraint infrastructure_component_id_c foreign key (infrastructure_component_id) references infrastructure_component(id)
    );
    create table infrastructure_component_volumes(
        id integer primary key autoincrement,
        volume varchar not null,
        infrastructure_component_id integer not null,
        constraint infrastructure_component_id_c foreign key (infrastructure_component_id) references infrastructure_component(id)
    );

    create table infrastructure_component_network(
        id integer primary key autoincrement,
        network varchar not null,
        infrastructure_component_id integer not null,
        constraint infrastructure_component_id_c foreign key (infrastructure_component_id) references infrastructure_component(id)
    );

    create table infrastructure_component_labels(
        id integer primary key autoincrement,
        label varchar not null,
        infrastructure_component_id integer not null,
        constraint infrastructure_component_id_c foreign key (infrastructure_component_id) references infrastructure_component(id)
    );

    create table infrastructure_component_environment(
        id integer primary key autoincrement,
        environment_name varchar not null,
        environment_value varchar not null,
        infrastructure_component_id integer not null,
        constraint infrastructure_component_id_c foreign key (infrastructure_component_id) references infrastructure_component(id)
    );


    insert into configuration(title, networks_web_external)
    select 'default-config-01', false
    where not exists (
        select 1 from configuration c where c.id = 1
    );
`);