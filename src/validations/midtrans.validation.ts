// src/validations/midtrans.validation.ts
import Joi from 'joi';

const statusSchema = Joi.object({
  order_id: Joi.string().required()
});

export default {
  statusSchema
};
