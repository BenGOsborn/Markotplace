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
