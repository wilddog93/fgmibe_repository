import Joi from 'joi';

const createMembershipPackage = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
    price: Joi.number().required()
  })
};

const getMembershipPackages = {
  query: Joi.object().keys({
    id: Joi.string().uuid(),
    name: Joi.string(),
    description: Joi.string(),
    price: Joi.number(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getMembershipPackage = {
  params: Joi.object().keys({
    membershipPackageId: Joi.string().uuid()
  })
};

const updateMembershipPackage = {
  params: Joi.object().keys({
    membershipPackageId: Joi.string().uuid()
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      price: Joi.number()
    })
    .min(1)
};

const deleteMembershipPackage = {
  params: Joi.object().keys({
    membershipPackageId: Joi.string().uuid()
  })
};

export default {
  createMembershipPackage,
  getMembershipPackages,
  getMembershipPackage,
  updateMembershipPackage,
  deleteMembershipPackage
};
