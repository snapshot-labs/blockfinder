import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import graphql from './graphql';
import { initLogger, fallbackLogger } from './helpers/sentry';

const app = express();
const PORT = process.env.PORT || 3004;

initLogger(app);

app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ limit: '4mb', extended: false }));
app.use(cors({ maxAge: 86400 }));
app.set('trust proxy', 1);
app.use('/', graphql);

fallbackLogger(app);

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
