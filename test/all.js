import http from "k6/http";
import { check, sleep } from "k6";

// const baseUrl = "http://localhost:3000/api";
const baseUrl = "http://192.168.1.199:3000/api";

function randomString(iter = 1) {
  let base = "";
  while (iter--) base += Math.random().toString(36) + Math.random().toString(36);
  return base;
}

export default function () {
  const registerData = {
    name: randomString(),
    password: randomString(),
    privilege: 0,
  };

  let registerRes = http.post(baseUrl + "/user/register", JSON.stringify(registerData), {
    headers: { "Content-Type": "application/json" },
  });

  check(registerRes, { "/user/register - status": (r) => 300 > r.status && r.status >= 200 });

  let loginData = { name: registerData.name, password: registerData.password };

  let loginRes = http.post(baseUrl + "/token/new", JSON.stringify(loginData), {
    headers: { "Content-Type": "application/json" },
  });

  check(loginRes, { "/token/new - status": (r) => 300 > r.status && r.status >= 200 });

  const params = {
    headers: {
      authentication: loginRes.json().token,
    },
  };

  let articleCreateData = {
    title: randomString(1),
    description: randomString(5),
    privilege: 0,
    bookId: "1",
  };

  let articleCreateRes = http.post(baseUrl + "/post/create", JSON.stringify(articleCreateData), params);

  check(articleCreateRes, { "/post/create - status": (r) => 300 > r.status && r.status >= 200 });

  sleep(5);

  let articleTitleRes = http.get(baseUrl + "/post/title/" + articleCreateData.title, params);

  check(articleTitleRes, { "/post/title/:title - status": (r) => 300 > r.status && r.status >= 200 });

  sleep(5);

  let articleUpdateData = {
    id: articleTitleRes.json().id,
    content: randomString(100),
  };

  // let articleUpdateRes = http.put(baseUrl + "/post/", articleUpdateData, params);

  // console.log(articleUpdateRes.body);

  // check(articleUpdateRes, { "/post/ - status": (r) => 300 > r.status && r.status >= 200 });

  // sleep(5);

  // let articleReadRes = http.get(baseUrl + "/post/read/" + articleTitleRes.json().id, params);

  // check(articleReadRes, { "/post/read/:id - status": (r) => 300 > r.status && r.status >= 200 });
}

export const options = {
  scenarios: {
    rampingUp: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [{ duration: "200s", target: 3000 }],
    },
  },
};
