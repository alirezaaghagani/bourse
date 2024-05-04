import axios from "axios";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  Connection: "keep-alive",
};

const axiosCli = axios.create({
  headers,
  withCredentials: true,
  maxRedirects: 2,
});
export { axiosCli as axios };
