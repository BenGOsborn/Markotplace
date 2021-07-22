import Joi from "joi";

// Initialize the schema for the registration process
export const registerSchema = Joi.object({
    username: Joi.string()
        .required()
        .regex(/^[a-zA-Z0-9_-]{3,20}$/),
    email: Joi.string().required().email(),
    password: Joi.string()
        .required()
        .regex(/^[a-zA-Z0-9!@#$%&*_-]{6,30}$/),
});

// Initialize the user update schema
export const updateSchema = Joi.object({
    username: Joi.string().regex(/^[a-zA-Z0-9_-]{3,20}$/),
    email: Joi.string().email(),
    password: Joi.string().regex(/^[a-zA-Z0-9!@#$%&*_-]{6,30}$/),
});

// Initialize the schema for the app creation process
export const createAppSchema = Joi.object({
    name: Joi.string()
        .required()
        .regex(/^[a-zA-Z0-9_-]{3,20}$/),
    title: Joi.string().required().min(1).max(50),
    description: Joi.string().required().min(1).max(500),
    price: Joi.number().required().min(0).max(999),
});

// Initialize the schema for the app edit process
export const editAppSchema = Joi.object({
    name: Joi.string().required(),
    title: Joi.string().min(1).max(50),
    description: Joi.string().min(1).max(500),
    price: Joi.number().min(0).max(999),
});
