module.exports = async function (context, req) {
    context.res = {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            mensaje: "API funcionando correctamente",
            curso: "Azure Static Web Apps",
            estado: "OK"
        }
    };
};