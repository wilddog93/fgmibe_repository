import { ProgramCategory, ProgramStatus } from '@prisma/client';
import Joi from 'joi';

const createProgram = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    priceMember: Joi.number().required(),
    priceNonMember: Joi.number().required(),
    category: Joi.string()
      .required()
      .valid(
        ProgramCategory.WEBINAR,
        ProgramCategory.BOOTCAMP,
        ProgramCategory.TRAINING,
        ProgramCategory.OTHER
      )
  })
};

const getPrograms = {
  query: Joi.object().keys({
    id: Joi.string(),
    name: Joi.string(),
    description: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    priceMember: Joi.number(),
    priceNonMember: Joi.number(),
    category: Joi.string(),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getProgram = {
  params: Joi.object().keys({
    programId: Joi.string()
  })
};

const updateProgram = {
  params: Joi.object().keys({
    programId: Joi.string()
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      priceMember: Joi.number(),
      priceNonMember: Joi.number(),
      category: Joi.string().valid(
        ProgramCategory.WEBINAR,
        ProgramCategory.BOOTCAMP,
        ProgramCategory.TRAINING,
        ProgramCategory.OTHER
      )
    })
    .min(1)
};

const deleteProgram = {
  params: Joi.object().keys({
    programId: Joi.string()
  })
};

export default {
  createProgram,
  getPrograms,
  getProgram,
  updateProgram,
  deleteProgram
};
