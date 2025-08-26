import Joi from 'joi';

const createMember = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow('', null),
    institution: Joi.string().allow('', null),
    segment: Joi.string().valid('STUDENT', 'FRESH_GRADUATE', 'PROFESSIONAL', 'BASIC'),
    interestAreas: Joi.array().items(Joi.string()),
    joinDate: Joi.date().required(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE'),
    membershipPackageId: Joi.string().uuid().allow(''),
    userId: Joi.number().integer().allow(0, null)
  })
};

const getMembers = {
  query: Joi.object().keys({
    id: Joi.string().uuid(),
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
    institution: Joi.string(),
    segment: Joi.string(),
    interestAreas: Joi.array().items(Joi.string()),
    joinDate: Joi.date(),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getMember = {
  params: Joi.object().keys({
    memberId: Joi.string().uuid()
  })
};

const updateMember = {
  params: Joi.object().keys({
    memberId: Joi.string().uuid()
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      email: Joi.string().email(),
      phone: Joi.string(),
      institution: Joi.string(),
      segment: Joi.string().valid('STUDENT', 'FRESH_GRADUATE', 'PROFESSIONAL', 'BASIC'),
      interestAreas: Joi.array().items(Joi.string()),
      joinDate: Joi.date(),
      status: Joi.string().valid('ACTIVE', 'INACTIVE'),
      membershipPackageId: Joi.string().uuid(),
      userId: Joi.number().integer()
    })
    .min(1)
};

const deleteMember = {
  params: Joi.object().keys({
    memberId: Joi.string().uuid()
  })
};

export default {
  createMember,
  getMembers,
  getMember,
  updateMember,
  deleteMember
};
