 type DockerEvent = {
  Type: string;
  Action: string;
  Actor: {
    ID: string;
    Attributes: {
      "com.docker.compose.config-hash": string;
      "com.docker.compose.container-number": string;
      "com.docker.compose.depends_on": string;
      "com.docker.compose.image": string;
      "com.docker.compose.oneoff": string;
      "com.docker.compose.project": string;
      "com.docker.compose.project.config_files": string;
      "com.docker.compose.project.working_dir": string;
      "com.docker.compose.service": string;
      "com.docker.compose.version": string;
      image: string;
      name: string;
      "org.opencontainers.image.ref.name": string;
      "org.opencontainers.image.version": string;
    };
  };
  scope: string;
  time: number;
  timeNano: number;
};

export default DockerEvent;