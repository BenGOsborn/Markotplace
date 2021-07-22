import Joi from "joi";

// Initialize the schema for the app creation process
export const registerSchema = Joi.object({
    name: Joi.string()
        .required()
        .regex(/^[a-zA-Z0-9_-]{3,20}$/),
    title: Joi.string().required().min(1).max(50),
    description: Joi.string().required().min(1).max(500),
    price: Joi.number().required().min(0).max(999),
});
