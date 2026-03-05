type InfrastructureComponent = {
    service_key: string
    image: string
    container_name: string
    entrypoint: string | null
    command: string | null
    restart: string          // default 'always'
    configuration_id: number,
    commands: any[]
    ports: { description: string }[]
    volumes: { description: string }[]
    networks: { description: string }[]
    labels: { description: string }[]
    environments: { description: string }[]
}
type Mapper = {
    [key: string]: Mapper | string | string[]
}

const mapper: Mapper = {
    "traefik": {
        "image": "",
        "container_name": "traefik",
        // "command": [
        //     "--api=true",
        //     "--api.dashboard=true"
        // ]
    }
}
var result = "";
var count = 0;

function parser(m: Mapper, r: string, tag?: string | undefined) {
    count++;
    if(count > 10) {
        return;
    }
    if(Object.keys(m).length > 0) {
        Object.keys(m).forEach(key => {
            r += `\t${key}: \n`;

            if(Object.keys(m[key]).length > 0 && !Object.keys(m[key]).includes('0')) {
                r += parser(m[key] as Mapper, r, key);
            }
        })
    } else {
        r += `${tag}: ${m[`${tag}`]} \n \t\t`
    }

    return r;
}

console.log(parser(mapper, result))