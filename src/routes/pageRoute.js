import { Router } from 'express';

import * as pageCtlr from '../controllers/index.js';

const pageRoute = Router();

pageRoute.get('/', pageCtlr.indexPage);
pageRoute.get('/contact', pageCtlr.contact);
// pageRoute.Post('/contact', pageCtlr.contactPage);

export default pageRoute;
