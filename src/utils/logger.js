import pino from 'pino';
import dayjs from 'dayjs';

export const log = pino({
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    ],
  },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});
