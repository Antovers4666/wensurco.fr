'use strict';
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'director.log');

const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  cyan:    '\x1b[36m',
  gray:    '\x1b[90m',
  white:   '\x1b[97m',
};

const col = (color, text) => `${C[color]}${text}${C.reset}`;

function ts() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function write(level, msg) {
  const line = `[${ts()}] [${level.padEnd(4)}] ${msg}`;
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (_) {}
}

const log = {
  info:  (msg) => { console.log(`${col('gray', ts())} ${col('blue',   '·')} ${msg}`);                          write('INFO', msg); },
  ok:    (msg) => { console.log(`${col('gray', ts())} ${col('green',  '✓')} ${msg}`);                          write('OK',   msg); },
  warn:  (msg) => { console.log(`${col('gray', ts())} ${col('yellow', '⚠')} ${msg}`);                          write('WARN', msg); },
  error: (msg) => { console.error(`${col('gray', ts())} ${col('red',   '✗')} ${col('red', msg)}`);             write('ERR',  msg); },
  step:  (msg) => { console.log(`\n${col('bold', col('cyan', '▶ ' + msg))}`);                                  write('STEP', msg); },
  done:  (msg) => { console.log(`\n${col('bold', col('green', '✓ ' + msg))}`);                                 write('DONE', msg); },
  raw:   (msg) => { console.log(msg); },
};

log.banner = function() {
  const line = '═'.repeat(55);
  log.raw(`\n${col('cyan', col('bold', `╔${line}╗`))}`);
  log.raw(col('cyan', col('bold', `║${'  🤖  DIRECTEUR WENSURCO.FR — AUTOPILOTE'.padEnd(55)}║`)));
  log.raw(col('cyan', col('bold', `║${'  https://wensurco.fr'.padEnd(55)}║`)));
  log.raw(col('cyan', col('bold', `╚${line}╝`)));
  log.raw('');
};

module.exports = log;
