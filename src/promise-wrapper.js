// Calls `method` on the `api` provided, with the params provided
// Returns a Promise
export default function promiseWrapper(api, method, params) {
  return new Promise((resolve, reject) => {
    try {
      api[method](params, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    } catch (err) {
      return reject(err)
    }
  });
};
