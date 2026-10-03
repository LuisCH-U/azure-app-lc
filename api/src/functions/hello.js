const { app } = require('@azure/functions');

app.http('hello', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        return {
            status: 200,
            jsonBody: {
                mensaje: 'API funcionando correctamente',
                curso: 'Azure Static Web Apps - LCH',
                estado: 'OK'
            }
        };
    }
});