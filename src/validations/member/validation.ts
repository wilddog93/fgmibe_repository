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
    membershipPackageId: Joi.string().allow(''),
    userId: Joi.number().integer().allow(0, null)
  })
};

const getMembers = {
  query: Joi.object().keys({
    id: Joi.string(),
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
    institution: Joi.string(),
    segment: Joi.string(),
    // ✅ interestAreas bisa "AI,Biotech" (string) atau array
    interestAreas: Joi.alternatives()
      .try(Joi.array().items(Joi.string()), Joi.string())
      .custom((value) => {
        if (typeof value === 'string') {
          // split by comma & trim spaces
          return value.split(',').map((v) => v.trim());
        }
        return value;
      }),
    joinDate: Joi.date(),
    status: Joi.string(),
    sortBy: Joi.string(),
    sortType: Joi.string().valid('asc', 'desc').default('desc'),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1)
  })
};

const getMember = {
  params: Joi.object().keys({
    memberId: Joi.string()
  })
};

const updateMember = {
  params: Joi.object().keys({
    memberId: Joi.string()
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
      membershipPackageId: Joi.string(),
      userId: Joi.number().integer()
    })
    .min(1)
};

const deleteMember = {
  params: Joi.object().keys({
    memberId: Joi.string()
  })
};

export default {
  createMember,
  getMembers,
  getMember,
  updateMember,
  deleteMember
};
