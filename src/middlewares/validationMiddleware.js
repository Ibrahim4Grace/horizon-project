import { ZodError } from 'zod';

function validateData(schema, targets = ['body']) {
  return (req, res, next) => {
    try {
      targets.forEach((target) => {
        if (target in req) {
          const validatedData = schema.parse(req[target]);
          req[target] = validatedData;
        }
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          path: issue.path,
          message: issue.message,
        }));
        res.status(422).json({ errors: errorMessages });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
}

export { validateData };
