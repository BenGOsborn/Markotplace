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
        .regex(/^(?=.{3,20}$)([a-z0-9]+(?:[-]?[a-z0-9]+)+)$/),
    title: Joi.string().required().min(1).max(50),
    description: Joi.string().required().min(1).max(500),
    price: Joi.number().required().integer().min(0).max(999),
    ghRepoOwner: Joi.string().required(),
    ghRepoName: Joi.string().required(),
    ghRepoBranch: Joi.string().required(),
    env: Joi.string().required(),
});

// Initialize the schema for the app edit process
export const editAppSchema = Joi.object({
    title: Joi.string().min(1).max(50),
    description: Joi.string().min(1).max(500),
    price: Joi.number().integer().min(0).max(999),
    ghRepoOwner: Joi.string(),
    ghRepoName: Joi.string(),
    ghRepoBranch: Joi.string(),
    env: Joi.string(),
});
