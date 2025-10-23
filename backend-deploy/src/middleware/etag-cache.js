/**
 * ETag middleware for HTTP 304 caching
 * Returns HTTP 304 Not Modified for unchanged data
 * This makes browser cache INSTANT (0ms response time)
 */

const crypto = require('crypto');

function etagMiddleware(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Serialize once to avoid double JSON.stringify
    const jsonString = JSON.stringify(data);
    
    // Generate ETag from serialized data
    const etag = crypto
      .createHash('md5')
      .update(jsonString)
      .digest('hex');
    
    // Set ETag header
    res.setHeader('ETag', `"${etag}"`);
    
    // Set Cache-Control to enable browser validation with If-None-Match
    res.setHeader('Cache-Control', 'no-cache');
    
    // Check if client has same version
    const clientEtag = req.headers['if-none-match'];
    if (clientEtag === `"${etag}"`) {
      // Data hasn't changed - return 304
      console.log(`⚡ HTTP 304 - Not Modified (instant response)`);
      return res.status(304).end();
    }
    
    // Data changed - send the serialized string directly
    res.setHeader('Content-Type', 'application/json');
    return res.send(jsonString);
  };
  
  next();
}

module.exports = etagMiddleware;

