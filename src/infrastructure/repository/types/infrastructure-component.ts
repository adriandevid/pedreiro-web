
import { z } from 'zod';

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
//   ports: InfrastructureComponentPort[]
//   volumes: InfrastructureComponentVolume[]
//   networks: InfrastructureComponentNetwork[]
//   labels: InfrastructureComponentLabel[]
//   environments: InfrastructureComponentEnvironment[]
}


export type InfrastructureComponentCommand = {
  id: number
  command: string
  infrastructure_component_id: number
}

export const InfrastructureComponentCommandValidator = z.object({
  id: z.number(),
  command: z.string(),
  infrastructure_component_id: z.number().optional()
})
export type InfrastructureComponentCommandCreate = Omit<
  z.infer<typeof InfrastructureComponentCommandValidator>,
  "id"
>
export type InfrastructureComponentCommandUpdate = z.infer<typeof InfrastructureComponentCommandValidator>;


export type InfrastructureComponentPort = {
  id: number
  port_bind: string
  infrastructure_component_id: number
}

export const InfrastructureComponentPortValidator = z.object({
  id: z.number(),
  port_bind: z.string(),
  infrastructure_component_id: z.number().optional()
})
export type InfrastructureComponentPortCreate = Omit<
  z.infer<typeof InfrastructureComponentPortValidator>,
  "id"
>
export type InfrastructureComponentPortUpdate = z.infer<typeof InfrastructureComponentPortValidator>;

export type InfrastructureComponentVolume = {
  id: number
  volume: string
  infrastructure_component_id: number
}

export const InfrastructureComponentVolumeValidator = z.object({
  id: z.number(),
  portvolume_bind: z.string(),
  infrastructure_component_id: z.number().optional()
})
export type InfrastructureComponentVolumeCreate = Omit<
  z.infer<typeof InfrastructureComponentVolumeValidator>,
  "id"
>
export type InfrastructureComponentVolumeUpdate = z.infer<typeof InfrastructureComponentVolumeValidator>;

export type InfrastructureComponentNetwork = {
  id: number
  network: string
  infrastructure_component_id: number
}

export const InfrastructureComponentNetworkValidator = z.object({
  id: z.number(),
  network: z.string(),
  infrastructure_component_id: z.number().optional()
})

export type InfrastructureComponentNetworkCreate = Omit<
  z.infer<typeof InfrastructureComponentNetworkValidator>,
  "id"
>

export type InfrastructureComponentNetworkUpdate = z.infer<typeof InfrastructureComponentNetworkValidator>;

export type InfrastructureComponentLabel = {
  id: number
  label: string
  infrastructure_component_id: number
}

export const InfrastructureComponentLabelValidator = z.object({
  id: z.number(),
  label: z.string(),
  infrastructure_component_id: z.number().optional()
})

export type InfrastructureComponentLabelCreate = Omit<
  z.infer<typeof InfrastructureComponentLabelValidator>,
  "id"
>

export type InfrastructureComponentLabelUpdate = z.infer<typeof InfrastructureComponentLabelValidator>;


export type InfrastructureComponentEnvironment = {
  id: number
  environment_name: string
  environment_value: string
  infrastructure_component_id: number
}

export const InfrastructureComponentEnvironmentValidator = z.object({
  id: z.number(),
  environment_name: z.string(),
  environment_value: z.string(),
  infrastructure_component_id: z.number().optional()
})

export type InfrastructureComponentEnvironmentCreate = Omit<
  z.infer<typeof InfrastructureComponentEnvironmentValidator>,
  "id"
>

export type InfrastructureComponentEnvironmentUpdate = z.infer<typeof InfrastructureComponentEnvironmentValidator>;

export const InfrastructureComponentValidator = z.object({
  id: z.number(),
  service_key: z.string(),
  image: z.string(),
  container_name: z.string(),
  entrypoint: z.string().optional(),
  command: z.string(),
  restart: z.string().optional(),         // default 'always'
  configuration_id: z.number(),
  commands: z.array(InfrastructureComponentCommandValidator),
  ports: z.array(InfrastructureComponentPortValidator),
  volumes: z.array(InfrastructureComponentVolumeValidator),
  networks: z.array(InfrastructureComponentNetworkValidator),
  labels: z.array(InfrastructureComponentLabelValidator),
  environments: z.array(InfrastructureComponentEnvironmentValidator)
});


export type InfrastructureComponentCreate = Omit<
  z.infer<typeof InfrastructureComponentValidator>,
  "id"
>

export type InfrastructureComponentUpdate = z.infer<typeof InfrastructureComponentValidator>;