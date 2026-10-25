export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'ShopCart E-Commerce & Payment Gateway API',
    version: '1.0.0',
    description:
      'Production-grade RESTful API for ShopCart with PostgreSQL transactions, Redis caching/idempotency, and server-verified Razorpay payments.',
    contact: {
      name: 'ShopCart Engineering',
      email: 'engineering@shopcart.dev'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'API base path'
    },
    {
      url: '/',
      description: 'Root base path'
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description: 'HTTP-only access token cookie'
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Bearer authorization header fallback'
      }
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          meta: {
            type: 'object',
            properties: {
              requestId: { type: 'string', example: 'req_8f1a2b3c4d5e' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'PAYMENT_SIGNATURE_INVALID' },
              message: { type: 'string', example: 'Payment verification failed' }
            }
          },
          meta: {
            type: 'object',
            properties: {
              requestId: { type: 'string' }
            }
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Liveness check',
        responses: {
          200: { description: 'Process alive' }
        }
      }
    },
    '/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness check for PostgreSQL and Redis',
        responses: {
          200: { description: 'All backing services connected' },
          503: { description: 'Backing service degraded' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Aarav Sharma' },
                  email: { type: 'string', example: 'aarav@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                  phone: { type: 'string', example: '+91 98765 43210' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User registered successfully and cookies set' },
          409: { description: 'User already exists' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in with credentials',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'aarav@example.com' },
                  password: { type: 'string', example: 'Password123!' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'User authenticated successfully' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Query products catalogue with Redis caching',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['featured', 'price-low', 'price-high', 'rating', 'discount'] } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
        ],
        responses: {
          200: { description: 'List of products with live inventory quantities' }
        }
      }
    },
    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get authoritative user cart with calculated totals',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: 'User cart details' },
          401: { description: 'Authentication required' }
        }
      }
    },
    '/api/cart/items': {
      post: {
        tags: ['Cart'],
        summary: 'Add item to user cart',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string', example: 'elec-1' },
                  quantity: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Item added' },
          400: { description: 'Insufficient stock or validation failure' }
        }
      }
    },
    '/api/payments/create-order': {
      post: {
        tags: ['Payments'],
        summary: 'Create internal order and Razorpay Order (Protected by Idempotency-Key)',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'Idempotency-Key',
            in: 'header',
            required: false,
            schema: { type: 'string', format: 'uuid' },
            description: 'Unique key preventing duplicate order creations on retry'
          }
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  couponCode: { type: 'string', example: 'WELCOME50' },
                  shippingAddressId: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Order created with Razorpay order ID' },
          400: { description: 'Cart empty or out of stock' },
          409: { description: 'Idempotency key collision/in-progress' }
        }
      }
    },
    '/api/payments/verify': {
      post: {
        tags: ['Payments'],
        summary: 'Server-side timing-safe HMAC SHA256 payment signature verification',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId', 'razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature'],
                properties: {
                  orderId: { type: 'string' },
                  razorpayOrderId: { type: 'string' },
                  razorpayPaymentId: { type: 'string' },
                  razorpaySignature: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Payment verified and inventory atomically deducted' },
          400: { description: 'PAYMENT_SIGNATURE_INVALID or OUT_OF_STOCK' }
        }
      }
    },
    '/api/webhooks/razorpay': {
      post: {
        tags: ['Webhooks'],
        summary: 'Receive signed Razorpay webhook callbacks (Idempotent)',
        parameters: [
          {
            name: 'X-Razorpay-Signature',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'HMAC SHA256 signature generated by Razorpay'
          }
        ],
        responses: {
          200: { description: 'Webhook processed or duplicate skipped safely' },
          400: { description: 'Invalid signature' }
        }
      }
    }
  }
};
