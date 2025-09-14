import Joi from 'joi';

const getProgramRegistration = {
  query: Joi.object().keys({
    id: Joi.string().uuid(),
    name: Joi.string(),
    email: Joi.string().email().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    segment: Joi.string().allow(null, ''),
    institution: Joi.string().allow(null, ''),
    registeredAt: Joi.date().allow(null, ''),
    source: Joi.string().allow(null, ''),
    program: Joi.alternatives()
      .try(
        Joi.object({
          name: Joi.string().allow(null, '')
        }),
        Joi.string().allow(null, '') // biar tetap valid kalau querynya cuma ?program=xxx
      )
      .allow(null, ''),

    member: Joi.alternatives()
      .try(
        Joi.object({
          name: Joi.string().allow(null, ''),
          email: Joi.string().email().allow(null, '')
        }),
        Joi.string().allow(null, '')
      )
      .allow(null, ''),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

export default {
  getProgramRegistration
};
