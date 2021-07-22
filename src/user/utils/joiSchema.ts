import Joi from "joi";

// Initialize the schema for the registration process
export const registerSchema = Joi.object({
    username: Joi.string().required().min(3).max(20),
    email: Joi.string().required().email(),
    password: Joi.string()
        .required()
        .regex(/^[a-zA-Z0-9!@#$%&*]{6,30}$/),
});

// Initialize the user update schema
export const updateSchema = Joi.object({
    username: Joi.string().min(3).max(20),
    email: Joi.string().email(),
    password: Joi.string().regex(/^[a-zA-Z0-9!@#$%&*]{6,30}$/),
});
