import { Router } from 'express';

import * as pageCtlr from '../controllers/index.js';
import { validateData } from '../middlewares/index.js';
import { contactSchema } from '../schemas/index.js';

const pageRoute = Router();

pageRoute.get('/', pageCtlr.indexPage);
pageRoute.get('/contact', pageCtlr.contact);
pageRoute.post('/contact', validateData(contactSchema), pageCtlr.contactPage);

export default pageRoute;
