import express from 'express';
import qs from 'qs';
import fs from 'fs';

type Routes = {[key: string]: string};

type Config = {
  port: number;
  routes: Routes;
  defaultRoute?: string;
}

const readJsonFile = (path: string, exitOnError: boolean = false): any => {
  try {
    return JSON.parse(fs.readFileSync(path).toString());
  } catch(err) {
    if(exitOnError) {
      return {};
    }
    fs.writeFileSync(path, "{}");
    return readJsonFile(path, true)
  }
}

const getConfig = (path: string): Config => {
  let config = readJsonFile(path);
  if(!config.port) {
    throw "Config needs to have a `port` field!";
  }
  if(!config.routes) {
    throw "Config needs to have a `routes` field!";
  }

  return config;
}

const CONFIG_PATH = './config.json';
const config = getConfig(CONFIG_PATH);

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
    log[path].from[from] = (log[path].from[from] || 0) + 1;
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

async function run() {
  const app = express();

  app.get('*', (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const path = req.path === '/' || req.path.length === 0 ?
      req.subdomains.join('.') : req.path.substring(1);
    let route = config.routes[path];
    if(!route) {
      if(!config.defaultRoute) {
        return res.send('No route!');  
      }
      route = config.defaultRoute;
    }
    let routeQuery = route.split("?")[1];
    log(path, ip, req.query);
    if(routeQuery) {
      log(path, ip, qs.parse(routeQuery), false);
    } 

    res.location(route);
    res.redirect(301, route);
    res.end();
  });

  app.listen(config.port, () => {
    console.log(`URL shortener app is listening on port ${config.port}`)
  });
}
run();

