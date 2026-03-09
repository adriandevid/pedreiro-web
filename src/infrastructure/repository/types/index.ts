import { z } from 'zod';



//

export type Configuration = {
  id: number
  title: string
  networks_web_external: boolean
}

export type Edge = {
  id: number;
  source_id: string;
  target_id: string;
}

export type ConfigurationCreate = Omit<Configuration, "id">