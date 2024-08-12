import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import k8sRoutes from './routes/k8s';
import routesservice from './routes/routesservice';

import NotFoundController from './api/controllers/NotFound.controller';
import InternalErrorController from './api/controllers/InternalError.controller';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(k8sRoutes);
app.use(routesservice);

app.use(NotFoundController);

app.use(InternalErrorController);

app.listen(process.env.PORT, () => {
    console.log(`Api on port ${process.env.PORT}`);
});

export default app;
