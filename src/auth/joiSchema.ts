import Joi from "joi";

// Initialize the schema for the registration process
export const registerSchema = Joi.object({
    username: Joi.string().required().min(3).max(20),
    email: Joi.string().required().email(),
    password: Joi.string()
        .required()
        .regex(/^[a-zA-Z0-9!@#$%&*]{6,30}$/),
});
