const { PORT_SERVER, URL_LOCAL_HOST, NODE_ENV } = process.env;
export const config = {
    PORT_SERVER: PORT_SERVER || 3000,
    URL_LOCAL: URL_LOCAL_HOST,
    console_log: (...args) => {
        if (NODE_ENV !== "production") {
            console.log(...args); // Solo loguea en entornos que no sean producción
        }
    },
};
