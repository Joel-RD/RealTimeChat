interface Config {
  PORT_SERVER: number | string,
  URL_LOCAL: string,
  DB_URL: string,
  console_log: (...args: unknown[]) => void
}

const { PORT_SERVER, URL_LOCAL_HOST, DB_URL_LOCAL, DB_URL_CLOUD, NODE_ENV } =
  process.env;

export const config: Config = {
  PORT_SERVER: PORT_SERVER || 3000,
  URL_LOCAL: URL_LOCAL_HOST,
  DB_URL: NODE_ENV === "production" ? DB_URL_CLOUD : DB_URL_LOCAL,
  console_log: (...args) => {
    if (NODE_ENV !== "production") {
      console.log(...args); // Solo loguea en entornos que no sean producción
    }
  },
};
