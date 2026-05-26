self.onmessage = function(e) {
  const { url } = e.data;
  fetch(url)
    .then(r => r.json())
    .then(data => self.postMessage({ data }))
    .catch(err => self.postMessage({ error: err.message }));
};
