export type Application = {
  id: number
  name: string

  // service
  port: number
  node_port: number
  target_port: number
  protocol?: string        // default 'TCP'
  type?: string            // default 'NodePort'

  // deployment
  container_name: string
  image: string
  image_pull_policy?: string | null
  container_port: number
  replicas: number         // default 1
  configuration_id: number
  files: ApplicationFile[]
}

export type ApplicationFile = {
  id: number
  name: string
  file: string
  application_id: number
}

export type ApplicationCreate = Omit<Application, "id">


export type Configuration = {
  id: number
  title: string
  networks_web_external: boolean
}

export type ConfigurationCreate = Omit<Configuration, "id">

export type InfrastructureComponent = {
  id: number
  service_key: string
  image: string
  container_name: string
  entrypoint: string | null
  command: string | null
  restart: string          // default 'always'
  configuration_id: number,
  commands: InfrastructureComponentCommand[]
  ports: InfrastructureComponentPort[]
  volumes: InfrastructureComponentVolume[]
  networks: InfrastructureComponentNetwork[]
  labels: InfrastructureComponentLabel[]
  environments: InfrastructureComponentEnvironment[]
}

export type InfrastructureComponentCreate = Omit<
  InfrastructureComponent,
  "id"
>

export type InfrastructureComponentCommand = {
  id: number
  command: string
  infrastructure_component_id: number
}

export type InfrastructureComponentCommandCreate = Omit<
  InfrastructureComponentCommand,
  "id"
>

export type InfrastructureComponentPort = {
  id: number
  port_bind: string
  infrastructure_component_id: number
}

export type InfrastructureComponentPortCreate = Omit<
  InfrastructureComponentPort,
  "id"
>

export type InfrastructureComponentVolume = {
  id: number
  volume: string
  infrastructure_component_id: number
}

export type InfrastructureComponentVolumeCreate = Omit<
  InfrastructureComponentVolume,
  "id"
>

export type InfrastructureComponentNetwork = {
  id: number
  network: string
  infrastructure_component_id: number
}

export type InfrastructureComponentNetworkCreate = Omit<
  InfrastructureComponentNetwork,
  "id"
>

export type InfrastructureComponentLabel = {
  id: number
  label: string
  infrastructure_component_id: number
}

export type InfrastructureComponentLabelCreate = Omit<
  InfrastructureComponentLabel,
  "id"
>

export type InfrastructureComponentEnvironment = {
  id: number
  environment_name: string
  environment_value: string
  infrastructure_component_id: number
}

export type InfrastructureComponentEnvironmentCreate = Omit<
  InfrastructureComponentEnvironment,
  "id"
>