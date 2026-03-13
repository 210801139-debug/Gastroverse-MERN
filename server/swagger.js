const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gastroverse Restaurant Management API",
      version: "1.0.0",
      description:
        "REST API for Gastroverse — a restaurant management platform supporting authentication, restaurant CRUD, menu management, ordering, and reservations.",
      contact: {
        name: "Gastroverse Team",
      },
    },
    servers: [
      {
        url: "/api",
        description: "API base path",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            name: { type: "string", example: "John Doe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: {
              type: "string",
              enum: ["customer", "owner"],
              example: "customer",
            },
            phone: { type: "string", example: "+1234567890" },
          },
        },
        Restaurant: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            name: { type: "string", example: "The Great Kitchen" },
            description: {
              type: "string",
              example: "A fine-dining experience",
            },
            cuisine: {
              type: "array",
              items: { type: "string" },
              example: ["Italian", "French"],
            },
            address: {
              type: "object",
              properties: {
                street: { type: "string", example: "123 Main St" },
                city: { type: "string", example: "New York" },
                state: { type: "string", example: "NY" },
                zipCode: { type: "string", example: "10001" },
              },
            },
            phone: { type: "string", example: "+1234567890" },
            owner: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            image: { type: "string", example: "https://example.com/image.jpg" },
            rating: { type: "number", minimum: 0, maximum: 5, example: 4.5 },
            isOpen: { type: "boolean", example: true },
          },
        },
        MenuItem: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            name: { type: "string", example: "Margherita Pizza" },
            description: {
              type: "string",
              example: "Classic pizza with tomato and mozzarella",
            },
            price: { type: "number", minimum: 0, example: 12.99 },
            category: {
              type: "string",
              enum: ["appetizer", "main", "dessert", "beverage", "side"],
              example: "main",
            },
            image: { type: "string", example: "https://example.com/pizza.jpg" },
            restaurant: {
              type: "string",
              example: "665a1b2c3d4e5f6a7b8c9d0e",
            },
            isAvailable: { type: "boolean", example: true },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            customer: {
              type: "string",
              example: "665a1b2c3d4e5f6a7b8c9d0e",
            },
            restaurant: {
              type: "string",
              example: "665a1b2c3d4e5f6a7b8c9d0e",
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  menuItem: {
                    type: "string",
                    example: "665a1b2c3d4e5f6a7b8c9d0e",
                  },
                  quantity: {
                    type: "integer",
                    minimum: 1,
                    maximum: 20,
                    example: 2,
                  },
                  price: { type: "number", example: 12.99 },
                },
              },
            },
            totalAmount: { type: "number", example: 25.98 },
            status: {
              type: "string",
              enum: [
                "pending",
                "confirmed",
                "preparing",
                "ready",
                "delivered",
                "cancelled",
              ],
              example: "pending",
            },
            notes: { type: "string", example: "No onions please" },
          },
        },
        Reservation: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            customer: {
              type: "string",
              example: "665a1b2c3d4e5f6a7b8c9d0e",
            },
            restaurant: {
              type: "string",
              example: "665a1b2c3d4e5f6a7b8c9d0e",
            },
            date: {
              type: "string",
              format: "date-time",
              example: "2026-04-15T00:00:00.000Z",
            },
            time: { type: "string", example: "19:00" },
            partySize: {
              type: "integer",
              minimum: 1,
              maximum: 20,
              example: 4,
            },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "completed"],
              example: "pending",
            },
            notes: {
              type: "string",
              example: "Window seat preferred",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
