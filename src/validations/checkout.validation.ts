// src/validations/checkout.validation.ts
import Joi from 'joi';

const checkoutSchema = Joi.object({
  programId: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  phone: Joi.string().allow('', null),
  institution: Joi.string().allow('', null),
  segment: Joi.string().valid('STUDENT', 'FRESH_GRADUATE', 'PROFESSIONAL').allow(null),
  programPackage: Joi.string().allow('', null),
  method: Joi.string().valid('QRIS', 'BANK_TRANSFER', 'EWALLET').default('QRIS'),
  userId: Joi.number().allow(null),
  memberId: Joi.string().allow(null)
});

export default {
  checkoutSchema
};
