const User = require('../models/user.model');

module.exports = { 
    authorizationMiddlewear: (role) => {
        return async (req, res, next) => {
            if (!req.user) {
                return res.status(401).send({ error: 'El usuario debe autenticarse!' });
            }

            try {
                if (req.user.role !== role) {
                    return res.status(403).send({ error: 'El usuario necesita permisos!' });
                }

                next();
            } catch (error) {
                console.error('Error en la autorización:', error);
                res.status(500).send({ error: 'Error interno del servidor' });
            }
        };
    },

    handlePolicies: (policies) => {
        return async (req, res, next) => {
            if (!req.user) {
                return res.status(401).send({ status: 'error', message: 'Unauthorized' });
            }

            try {
                const hasPermission = policies.some(policy => req.user.role === policy);

                if (!hasPermission) {
                    return res.status(403).send({ status: 'error', message: 'Forbidden' });
                }

                next();
            } catch (error) {
                console.error('Error en la autorización:', error);
                res.status(500).send({ error: 'Error interno del servidor' });
            }
        };
    }
}