#!/usr/bin/env node

import { main } from './index-bin';

main(process.cwd(), process.argv.slice(2))
  .then(() => process.exit(0))
  .catch($ => {
    if (process.argv.includes('--debug')) {
      console.error($);
    } else {
      console.error($.toString());
    }
    process.exit(1);
  });

process.on('unhandledRejection', e => {
  throw e;
});
