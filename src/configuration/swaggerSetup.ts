import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  servers: [
    {
      url: "http://localhost:5200/",
    },
  ],
  info: {
    title: "Expense Tracking API",
    version: "1.0.0",
    description: "API for tracking and splitting expenses",
  },
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ["./src/routers/*.ts"],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: any): void => {
  // Serve swagger docs the way you like (Recommendation: only in development)
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
