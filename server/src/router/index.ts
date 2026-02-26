import { Router } from 'express';
import { body } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import userController from '../controllers/user';
import authMiddleware from '../middlewares/authMiddleware';
import { 
  authenticateGoogle, 
  authenticateGoogleCallback 
} from '../middlewares/googleAuth';
import type { UserType } from '../types/auth';

type AuthRequestBody = Pick<UserType, 'email' | 'password'>;
type AuthRequest = Request<{}, {}, AuthRequestBody>;

const handleRequest = <P = {}, ResBody = {}, ReqBody = {}, ReqQuery = {}>(
  handler: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => Promise<Response | void>
) => {
  return (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => {
    return handler(req, res, next);
  };
};

const router = Router();

router.post('/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 3, max: 32 }),
  handleRequest<{}, {}, AuthRequestBody>((req, res, next) => 
    userController.registration(req, res, next)
  )
);

router.post('/login',
  handleRequest<{}, {}, AuthRequestBody>((req, res, next) => 
    userController.login(req, res, next)
  )
);

router.post('/logout',
  handleRequest((req, res, next) => 
    userController.logout(req, res, next)
  )
);

router.get('/activate/:link',
  handleRequest<{ link: string }>((req, res, next) => 
    userController.activate(req, res, next)
  )
);

router.get('/refresh',
  handleRequest((req, res, next) => 
    userController.refresh(req, res, next)
  )
);

router.get('/users',
  authMiddleware,
  handleRequest((req, res, next) => 
    userController.getUsers(req, res, next)
  )
);

router.get('/auth/google', authenticateGoogle);
router.get('/auth/google/callback', authenticateGoogleCallback);

export default router;