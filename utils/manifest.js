const pkg = require("../package.json");

function processVendorKeys(obj, vendor){
  if(Array.isArray(obj)) {
    return obj.map(value => processVendorKeys(value, vendor));
  }

  if(typeof obj === "object" && obj !== null) {
    return Object.entries(obj).reduce((acc, [prefixedKey, value]) => {
      if(prefixedKey.includes(":")) {
        const [vendors, key] = prefixedKey.split(":");
        if(vendors.split("|").includes(vendor)) {
          acc[key] = processVendorKeys(value, vendor);
        }
      } else {
        acc[prefixedKey] = processVendorKeys(value, vendor);
      };

      return acc;
    }, { });
  }

  return obj;
}

function processManifest(buffer, vendor) {
  let unprocessed = JSON.parse(buffer.toString());
  let manifest = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    ...processVendorKeys(unprocessed, vendor)
  };

  return JSON.stringify(manifest, null, 2);
}

module.exports = {
  processManifest,
  processVendorKeys
};