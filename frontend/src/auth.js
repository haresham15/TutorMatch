export function loginUser(username, password) {
  return fetch("/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ username, password }),
  })
    .then(res => {
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    })
    .then(data => {
      localStorage.setItem("token", data.access_token);
    });
}
export function logout() {
  localStorage.removeItem("token");
}
export function getToken() {
  return localStorage.getItem("token");
}
export function authHeaders() {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}
export function getUserRole() {
  const token = getToken();
  if (!token) return null;
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload?.role;
}
export function getUserId() {
  const token = getToken();
  if (!token) return null;
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload?.sub;
}

export function isLoggedIn() {
  return !!getToken();
}
