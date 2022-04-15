const joi=require('joi');

const title = joi.string().required()
const cate = joi.string().required()
const content = joi.string().required().allow('')
const state = joi.string().valid('published', 'draft').required()

exports.addArticleSchema = {
    body: {
      title,
      cate,
      content,
      state
    }
  }