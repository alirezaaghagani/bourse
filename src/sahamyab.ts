import { axios } from "./axiosCli";
import { connectToDbCollection } from "./db";
import { fsSaveJson, sleep, getLastItemIdFromDb } from "./utils";

// * token for auth: required for req for more pagination than page 10
const TOKEN = {
  access_token:
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkMEkzcHg5c2x2VkpCWDg1ODdTcjF5ZU1uMEUwZjRRb21lR08zMngyeVQ4In0.eyJqdGkiOiI4NDNhYmQ2NC02MjVkLTQzM2EtYjRjZC1jOTRhZjExMmRkOGYiLCJleHAiOjE3MTUwMzUwODUsIm5iZiI6MCwiaWF0IjoxNzE1MDMzMjg1LCJpc3MiOiJodHRwOi8va2V5Y2xvYWs6OTA4MC9hdXRoL3JlYWxtcy9zYWhhbXlhYiIsImF1ZCI6InNhaGFteWFiIiwic3ViIjoiYmZmMTBiOWUtY2U5Mi00NWU5LWJiM2QtYTczYzhmODYwMjYyIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2FoYW15YWIiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiJkMzA0Mjk5ZC1jYjQ4LTRjODAtOGQ4Mi1lYTM3YzcyNjU2NTQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vbmVvYnJva2VyLmlyIiwiaHR0cHM6Ly8qLnNhaGFteWFiLmNvbSIsImh0dHBzOi8vZGV2Lm5lb2Jyb2tlci5pciIsImh0dHBzOi8vd3d3Lm5lb2Jyb2tlci5pciJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiUk9MRV9VU0VSIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhbGlyZXphYWIwMDciLCJnaXZlbl9uYW1lIjoi2LnZhNuM2LHYttinIiwicHJvZmlsZV9pbWFnZSI6ImRlZmF1bHQiLCJpbmFjdGl2ZSI6ZmFsc2UsInVzZXJfaWQiOjQ1MDAwMDE2MSwibmFtZSI6Iti52YTbjNix2LbYpyIsIm5pY2tuYW1lIjoi2LnZhNuM2LHYttinIiwicGhvbmVfbnVtYmVyIjoiMDkyMTA3NTg2NTUiLCJjb3Zlcl9pbWFnZSI6ImRlZmF1bHQiLCJvbmxpbmVfdXNlciI6ZmFsc2UsIm9mZmljaWFsX3VzZXIiOmZhbHNlLCJlbWFpbCI6ImFsaXJlemFhZ2hhZ2FuaS5hYUBnbWFpbC5jb20iLCJwcml2YXRlX21zZ19pZCI6ImJlMDBlZTYyLTY5MmQtNGVlYy1iN2MwLTBhY2JkMzk2YjNkNSJ9.QuVyc2YqYoYGYMpIRsvADr611PtICJuzrxGY0uSwgq3bKygRvYtjZ2Axps3B7H_0EnH5GTHgGO_WUZM931P2LNSpUFYRHKF24K-wm5z1urmUgl6bgh31IglNy7-JFSYDYLxnA_174jgXTSS0suLpP2Mr6Nkqn8Znl3K-srniXj1ZnW7NI5ntTTS_5EM5Fx1EN7vVna6lwqZ4w9kXnkde6vX8fKjwXg2GvBJmmq7_7Uts5qHzkjTLRPTeZIFSQnDIiMW-bc28NTNjKzL8BHumDRR4Vvh1EP2_trQs4eywZ9T1FA0UPT9B2Xart7bxglxibzFZm3PMS5jrg9AcAZwkHg",
  refresh_token:
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkMEkzcHg5c2x2VkpCWDg1ODdTcjF5ZU1uMEUwZjRRb21lR08zMngyeVQ4In0.eyJqdGkiOiI1MGEzMzZlNS1hZDgxLTQyMjktYjk1OC1mZTgxYzNkMDgyYmUiLCJleHAiOjE3MTc2MjMxNTgsIm5iZiI6MCwiaWF0IjoxNzE1MDMzMjg1LCJpc3MiOiJodHRwOi8va2V5Y2xvYWs6OTA4MC9hdXRoL3JlYWxtcy9zYWhhbXlhYiIsImF1ZCI6InNhaGFteWFiIiwic3ViIjoiYmZmMTBiOWUtY2U5Mi00NWU5LWJiM2QtYTczYzhmODYwMjYyIiwidHlwIjoiUmVmcmVzaCIsImF6cCI6InNhaGFteWFiIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiZDMwNDI5OWQtY2I0OC00YzgwLThkODItZWEzN2M3MjY1NjU0IiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIlJPTEVfVVNFUiIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUifQ.acflTdACwMArJLGqBworot3TaWs32f-juvayx86yWyg15vvibc6R41MaTxb9ZT6_lUaSugz7HraqwrnDh_yi2AG3slTDLJk5D6LO4SnvxyQdvqapRKf1qExfGJLzWfkbqe69XF_a-fIPDH78qwYD9JiccYd2w3aQ2727QCXWgPRM1bhOrBxZK0qvMTC96vYxkApXCyLbLM3zihm7W4NlfddT0B8VnMuRRSUZZXYoEAats-rfryowkS9FyqexywNltpcpE_tgjrJsTlDlVYOL4fuD9XrHgDRP_fQNbmLLlENqdYWMU7NeHWZo333NeiDu8bwIuhYL56yfe-nJG0qe0g",
};
const REFRESH_TOKEN_INTERVAL = 150;
const URL = "https://www.sahamyab.com/guest/twiter/list?v=0.1";
const REQ_NUM = 400;
export async function scrapeSahamyab() {
  // * connect to db
  const db = await connectToDbCollection("sahamyab");
  // * make scrape continue from last section
  let page = 1;
  let lastId = await getLastItemIdFromDb<string>(db);
  let id = lastId;
  // (Number(lastId) + 1).toString();
  let itemsList: twitItemObj[] = [];
  console.log("+-----Id:", id);

  // * fetch and scrape each page
  for (let i = 0; i < REQ_NUM; i++) {
    try {
      let data = await scrapeSahamyabById(page, id, i);
      id = data?.lastId!;
      if (data?.items.length) {
        // * push each data into itemsList Arr to make a json copy each time code runs
        itemsList = itemsList.concat(data?.items);
        // * insert each page fetched to db collection
        await db.insertMany(data?.items!);
      }

      // * refresh page(because of 40 pagination limit)
      if (page < 40) page++;
      else page = 0;
      // * refresh token every <REFRESH_TOKEN_INTERVAL> time (because of 1800 time limit)
      if (i % REFRESH_TOKEN_INTERVAL === 0 && i !== 0) {
        const newToken = await refreshTokenSahamyab(TOKEN.refresh_token);
        TOKEN.access_token = newToken.access_token;
        TOKEN.refresh_token = newToken.refresh_token;
        console.log("token refreshed to:", newToken);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error: ", error.name, "->", error.message);
        continue;
        // throw new Error("!- Failed to fetch" + page + ":" + id + "data!");
      }
    }
  }
  // await fsSaveJson(itemsList, "sahamyab", id!, REQ_NUM);
  console.log(`${REQ_NUM} reqs finished last id:${id}`);
}
async function scrapeSahamyabById(
  page: number,
  id: string | null,
  index: number
) {
  try {
    const res = await axios.post(
      URL,
      { page, id },
      { headers: { Authorization: "Bearer " + TOKEN.access_token } }
    );
    const data: twitsResObj = res.data;
    if (!data.success) throw new Error(`page:${page} id:${id} not Found!`);
    const lastId = data.items.at(-1)?.id;
    console.log(index, "-", res.status, "page:", page, "id:", id, "-", lastId);
    await sleep(500);

    return { lastId, items: data.items };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.name, "---->", error.message);
      const lastId = (Number(id) + 1).toString();
      return { lastId, items: [] };
      // throw new Error(`!- Failed to fetch page:${page} id:${id} data!`);
    }
  }
}
async function refreshTokenSahamyab(refresh_token: string) {
  const formData: tokenReq = {
    client_id: "sahamyab",
    refresh_token,
    grant_type: "refresh_token",
  };
  const res = await axios.post(
    "  https://www.sahamyab.com/auth/realms/sahamyab/protocol/openid-connect/token",
    formData,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  const data: tokenRes = res.data;
  return { access_token: data.access_token, refresh_token: data.refresh_token };
}
interface twitsResObj {
  errorCode: string;
  errorTitle: string;
  success: boolean;
  hasMore: boolean;
  items: Array<twitItemObj>;
  gap: number;
}
interface twitItemObj {
  id: string;
  sendTime: string;
  sendTimePersian: string;
  parentSendTime?: string;
  parentSendTimePersian?: string;
  parentId?: string;
  parentSenderName?: string;
  parentSenderUsername?: string;
  parentSenderProfileImage?: string;
  parentContent?: string;
  parentImageUid?: string;
  senderName: string;
  senderUsername: string;
  senderProfileImage: string;
  content: string;
  quoteCount?: string;
  type: string;
  mediaContentType: string;
  scoredPostDate?: string;
  finalPullDatePersian: string;
  finalPullDate?: string;
  durationPerHour?: number;
  durationPerDay?: number;
  options?: [];
  pullStatus?: string;
  voteCount?: number;
}

interface loginRes {
  access_token: string;
  expires_in: 1800;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: "bearer";
  "not-before-policy": 1538380001;
  session_state: string;
  scope: "email profile";
  errorCode: string;
  success: boolean;
  username: string;
  roles: ["ROLE_USER", "offline_access", "uma_authorization"];
}
interface tokenRes {
  access_token: string;
  expires_in: 1800;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: "bearer";
  "not-before-policy": 1538380001;
  session_state: string;
  scope: "email profile";
}

// * token request must be a form url-encoded
interface tokenReq {
  grant_type: "refresh_token";
  refresh_token: string;
  client_id: "sahamyab";
}
