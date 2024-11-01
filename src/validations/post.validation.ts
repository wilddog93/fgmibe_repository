import { Post } from '@prisma/client';
import Joi from 'joi';

const createPost = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    content: Joi.string().required(),
    published: Joi.boolean()
  })
};

export default {
  createPost
};
