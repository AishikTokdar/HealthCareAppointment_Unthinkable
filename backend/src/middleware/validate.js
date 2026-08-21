function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages
      });
    }

    req.body = value;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages
      });
    }

    req.query = value;
    next();
  };
}

module.exports = { validate, validateQuery };
