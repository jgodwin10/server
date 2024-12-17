import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "AppMosphere Backend",
			description: "API documentation for AppMosphere Backend",
			contact: {
				name: "Danny",
				email: "nabothdaniel35@gmail.com",
			},
			version: "1.0.0",
		},
		servers: [
			{
				url: "http://localhost:5000/api",
				description: "Local server",
			},
			{
				url: "https://appmosphere-backend.onrender.com/api",
				description: "Live server",
			},
		],
	},
	// looks for configuration in specified directories
	apis: ["./Routes/*.ts"],
};
// Initialize swagger-jsdoc
const swaggerDocs = swaggerJsdoc(options);

export { swaggerDocs, swaggerUi };
