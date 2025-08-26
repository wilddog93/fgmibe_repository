import Joi from 'joi';

const webhookSchema = Joi.object({
  transaction_status: Joi.string().valid(
    'settlement',
    'capture',
    'success',
    'pending',
    'deny',
    'cancel',
    'failure',
    'expire',
    'refund'
  ),
  order_id: Joi.string().uuid().required(),
  gross_amount: Joi.string().required(),
  status_code: Joi.string().required(),
  signature_key: Joi.string().required(),
  fraud_status: Joi.string(),
  payment_type: Joi.string(),
  transaction_time: Joi.string()
});

export default {
  webhookSchema
};
