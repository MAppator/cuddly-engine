module.exports = function(context, cb) {
  const mutation = context.body.data.Map;
  
  const map = mutation.updatedFields.indexOf('sourceUrls') !== -1 ? mutation.node : undefined;
  // todo:mm: should also get new hash if the 'up-to-date' flag it updated from false to true

  if(!map) {
    cb(null);
    return;
  }
  
  
  getHashForSources(map.sourceUrls)
    .then(hash => updateHashForMap(map, hash)
      .then(() => cb(null))
      .catch(error => cb(error)))
    .catch(error => cb(error));
    
  // -------------------- Functions Below -------------------- //

  function updateHashForMap(map, hash) {
    const request = require('graphql-request').request;
    
    const endpoint = context.meta.graphEndpoint;
    const variables = { id: map.id, hash: hash };
    const query = `
      mutation updateMapOriginHash($id: ID!, $hash: String!) {
        updateMap(id: $id, originHash: $hash) {
          id
        }
      }
    `;
    
    return request(endpoint, query, variables);
  }
  
  function getHashForSources(sourceUrls) {
    const request = require('request-promise');
    const originContentRequests = sourceUrls.map(url => request(url));
    
    return Promise.all(originContentRequests).then(originContents => {
      var md5 = require('md5')
      
      return md5(originContents.join());
    })
  }
  
};