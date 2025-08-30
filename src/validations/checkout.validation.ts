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

const checkoutMemberSchema = Joi.object({
  membershipPackageId: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  phone: Joi.string().allow('', null),
  institution: Joi.string().allow('', null),
  segment: Joi.string().valid('STUDENT', 'FRESH_GRADUATE', 'PROFESSIONAL').allow(null),
  studentId: Joi.string().allow('', null),
  degree: Joi.string().allow('', null),
  interestAreas: Joi.array().items(Joi.string()),
  joinDate: Joi.date().allow(null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
  userId: Joi.number().allow(null),
  method: Joi.string().valid('QRIS', 'BANK_TRANSFER', 'EWALLET').default('QRIS')
});

export default {
  checkoutSchema,
  checkoutMemberSchema
};
