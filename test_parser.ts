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
enum TypeMapper {

}

type mapper = {
    [key: string]: {
        key: string;
        value: string;
    }
}