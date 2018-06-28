import {
  app,
  p2pServer,
} from './app';
import {
  PEERS,
  PORT,
  WS_PORT,
} from './config';
import { logger } from './utils/Logger';

app.listen(PORT, () => {
  logger.info(`Blockchain application is listening on: http://localhost:${PORT}`);
});
p2pServer.listen(WS_PORT, PEERS);
