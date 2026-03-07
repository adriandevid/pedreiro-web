type InfrastructureComponent = {
    service_key: string
    image: string
    container_name: string
    entrypoint: string | null
    command: string | null
    restart: string          // default 'always'
    configuration_id: number,
    commands: any[]
    ports: any[]
    volumes: any[]
    networks: any[]
    labels: any[]
    environments: any[]
}
type Mapper = {
    [key: string]: string
}

const data = {
  string8: {
    id: 9,
    image: 'string',
    container_name: 'string',
    entrypoint: null,
    command: null,
    restart: 'always',
    configuration_id: 1,
    commands: [ 'asdasd' ],
    volumes: [],
    networks: [],
    labels: [],
    environments: [],
    environment: []
  }
}

function parseJsonToYmlStringFormat(json: any, r: string, tabSpaceLevel: number): string {
    var result = r;

    if (Object.keys(json).length > 0 && !Object.keys(json).includes('0')) {
        Object.keys(json).forEach(key => {
            if (json[key] != null) {
                if (Object.keys(json[key]).length > 0 && !Object.keys(json[key]).includes('0')) {
                    result += `${"  ".repeat(tabSpaceLevel)}${key}: \n`;
                    result = parseJsonToYmlStringFormat(json[key] as Mapper, result, tabSpaceLevel + 1);
                } else {
                    if (Array.isArray(json[key])) {
                        result += `${"  ".repeat(tabSpaceLevel)}${key}: \n`;
                        json[key].forEach((x, index) => {
                            var arrayType: string[] = json[key] as string[];
                            result += `${"  ".repeat(tabSpaceLevel + 1)}- ${arrayType[index]} \n`
                        })
                    } else {
                        result += `${"  ".repeat(tabSpaceLevel)}${key}: ${json[key]} \n`;
                    }
                }
            }
        })
    }

    return result;
}

console.log(parseJsonToYmlStringFormat(data, "", 1))