const paramsToObj = (res, cur) => {
  const p = cur.split('=');
  res[p[0]] = p[1];
  return res;
}

const q = window.location.search.substring(1);
const params = q.split('&');

const config = params.reduce( paramsToObj, {});

export default config;
