import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerDefinition from '../../../docs/swaggerDef';

const router = express.Router();

// Move Swagger docs before error handler
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Express TypeScript API Documentation'
};

const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: ['src/docs/*.yml', 'src/routes/v1/*.ts']
});

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(specs, swaggerOptions));

export default router;
