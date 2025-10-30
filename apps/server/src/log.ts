import pino from 'pino';

export const log = pino({
  // Removes pid and hostname fields
  base: null,
  // Removes time field
  timestamp: false,
  // Some hack to work with Railway? Idk
  // https://station.railway.com/questions/railway-is-overriding-pino-s-log-level-e7c3e6be#tr0v
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

export const logArgs = (args: unknown[]) => {
  if (!args) return;
  if (!Array.isArray(args)) return;

  const filter = args.filter(
    (arg) => Boolean(arg) && typeof arg !== 'function',
  );
  if (filter.length === 0) return;

  return filter;
};
