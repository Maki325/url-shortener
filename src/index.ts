import express from 'express';
import qs from 'qs';
import fs from 'fs';

const app = express();
const port = 3000;

const readJsonFile = (path: string, exitOnError: boolean = false): any => {
  try {
    return JSON.parse(fs.readFileSync(ROUTES_PATH).toString());
  } catch(err) {
    if(exitOnError) {
      return {};
    }
    fs.writeFileSync(path, "{}");
    return readJsonFile(path, true)
  }
}

const ROUTES_PATH = './routes.json';
let ROUTES = readJsonFile(ROUTES_PATH);

const LOG_PATH = './log.json';

type Query = {
  from?: string;
}

const log = (path: string, ip: string | string[], query: Query, addRequest: boolean = true) => {
  let log = JSON.parse(fs.readFileSync(LOG_PATH).toString());
  if(!log[path]) {
    log[path] = {
      from: {},
      requests: [],
    };
  }
  let from = null;
  if(query.from && typeof query.from === 'string') { 
    from = query.from;
    console.log({log, path, from});
    log[path].from[from] = (log[path].from[from] || 0) + 1;
    console.log({newLog: log}); 
  }

  if(addRequest) {
    log[path].requests.push({
      ips: typeof ip === 'object' ? ip : [ip],
      time: new Date(),
      from,
    });
  }

  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

app.get('*', (req, res) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
  console.log(req.subdomains);
  console.log('req.path: ', req.path);
  const path = req.path === '/' || req.path.length === 0 ?
    req.subdomains.join('.') : req.path.substring(1);
  const route = ROUTES[path];
  console.log({path, route});
  if(!route) {
    return res.send('No route!');
  }
  let routeQuery = route.split("?")[1];
  console.log({routeQuery});
  log(path, ip, req.query);
  if(routeQuery) {
    log(path, ip, qs.parse(routeQuery), false);
  } 

  res.location(route);
  res.redirect(301, route);
  res.end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

