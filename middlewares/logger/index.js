function Logger(server) {
    const logger = $$.getLogger("Logger", "apihub/logger");
    logger.trace(`Registering Logger middleware`);
    
    const getRequestDuration = (start) => {
        const diff = process.hrtime(start);
        return (diff[0] * 1e9 + diff[1]) / 1e6;
    };

  server.use(function (req, res, next) {
    const {
      method,
      url
    } = req;

    const start = process.hrtime();
    let durationInMilliseconds;

    res.on('finish', () => {
      const { statusCode } = res;
      durationInMilliseconds = getRequestDuration(start);
      let log = `${method}:${url} ${statusCode} ${durationInMilliseconds.toLocaleString()}ms`;
      logger.log(log);
      if(req.getLogs){
          const visualIndex = "\t";
          const requestLogs = req.getLogs();
          if(requestLogs.length > 0){
              logger.trace("Request logs:");
              for(let i=0; i<requestLogs.length; i++){
                  if(Array.isArray(requestLogs)){
                      logger.log(visualIndex, ...requestLogs[i]);
                  }else{
                      logger.log(visualIndex, requestLogs[i]);
                  }
              }
              logger.log("\n");
          }
      }
    });

    next();
  });
}

module.exports = Logger;
