import { axios } from "./axiosCli";
import { connectToDbCollection } from "./db";
import { fsSaveJson, sleep, getLastItemIdFromDb } from "./utils";

// * token for auth: required for req for more pagination than page 10
const TOKEN = {
  access_token: "",
  refresh_token: "",
};
const tokenPasted = {
  access_token:
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkMEkzcHg5c2x2VkpCWDg1ODdTcjF5ZU1uMEUwZjRRb21lR08zMngyeVQ4In0.eyJqdGkiOiJjMTMzNWU4Ni01MzU3LTQzZWUtYTc3Ny05MWJhM2FhMTk0NzAiLCJleHAiOjE3MTUxOTMxODcsIm5iZiI6MCwiaWF0IjoxNzE1MTkxMzg3LCJpc3MiOiJodHRwOi8va2V5Y2xvYWs6OTA4MC9hdXRoL3JlYWxtcy9zYWhhbXlhYiIsImF1ZCI6InNhaGFteWFiIiwic3ViIjoiYmZmMTBiOWUtY2U5Mi00NWU5LWJiM2QtYTczYzhmODYwMjYyIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2FoYW15YWIiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiJkNWZiZDIzNi01OGY5LTQ1YmQtYmJlMS05MTFmMjdiZTBmNWIiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vbmVvYnJva2VyLmlyIiwiaHR0cHM6Ly8qLnNhaGFteWFiLmNvbSIsImh0dHBzOi8vZGV2Lm5lb2Jyb2tlci5pciIsImh0dHBzOi8vd3d3Lm5lb2Jyb2tlci5pciJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiUk9MRV9VU0VSIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhbGlyZXphYWIwMDciLCJnaXZlbl9uYW1lIjoi2LnZhNuM2LHYttinIiwicHJvZmlsZV9pbWFnZSI6ImRlZmF1bHQiLCJpbmFjdGl2ZSI6ZmFsc2UsInVzZXJfaWQiOjQ1MDAwMDE2MSwibmFtZSI6Iti52YTbjNix2LbYpyIsIm5pY2tuYW1lIjoi2LnZhNuM2LHYttinIiwicGhvbmVfbnVtYmVyIjoiMDkyMTA3NTg2NTUiLCJjb3Zlcl9pbWFnZSI6ImRlZmF1bHQiLCJvbmxpbmVfdXNlciI6ZmFsc2UsIm9mZmljaWFsX3VzZXIiOmZhbHNlLCJlbWFpbCI6ImFsaXJlemFhZ2hhZ2FuaS5hYUBnbWFpbC5jb20iLCJwcml2YXRlX21zZ19pZCI6ImJlMDBlZTYyLTY5MmQtNGVlYy1iN2MwLTBhY2JkMzk2YjNkNSJ9.odQbLAXCOTz-6jXtOUmP92W4wtBH9Z2FJ6ninCb88VwUoF2M9vJKx1QweLBJvcjH_uE5WCTZArmtm667-4Ug8tWdqQ57PeFiHoU9wrwRhe2basQrEUaTSyn5jLtmJmEjVsFPgp9g-j-JlWFcM9l0BC0diLhclQhiiUk2IMdcYQRn0bSs1REXQZpXtVsVXSd6cdiJeYAZmSF25eXJ9wRDmQaqrOxdc-meZIyKm5VwTpZUzcaKyo8xdpp6o7GMRnPygbLr12b8tiX153HoJUmoptbVWvLQsiuTRnCZyWhRsG40onHJjWtbB-FEdHIgOYC0U3Q-YSKJmwfP5Uc6UbZ3dg",
  expires_in: 1800,
  refresh_expires_in: 2589684,
  refresh_token:
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkMEkzcHg5c2x2VkpCWDg1ODdTcjF5ZU1uMEUwZjRRb21lR08zMngyeVQ4In0.eyJqdGkiOiI0MWFhMTUwZS0yM2M0LTRkNWQtYTBmNy0yMWVjYzhjYTljOWQiLCJleHAiOjE3MTc3ODEwNzEsIm5iZiI6MCwiaWF0IjoxNzE1MTkxMzg3LCJpc3MiOiJodHRwOi8va2V5Y2xvYWs6OTA4MC9hdXRoL3JlYWxtcy9zYWhhbXlhYiIsImF1ZCI6InNhaGFteWFiIiwic3ViIjoiYmZmMTBiOWUtY2U5Mi00NWU5LWJiM2QtYTczYzhmODYwMjYyIiwidHlwIjoiUmVmcmVzaCIsImF6cCI6InNhaGFteWFiIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiZDVmYmQyMzYtNThmOS00NWJkLWJiZTEtOTExZjI3YmUwZjViIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIlJPTEVfVVNFUiIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUifQ.aBr1FQWbptNr3j0oPXsHgQS1Sr5xvsbB_cJ1NpPnaG1wbK_6Ghx5AnwSjXyJdJtM5njaPrfgGwChnc1zuHU6N68fMlIJa7tYl7-qTugfbpUOZPCCdo1C2T7ni6ieErR3ObJlcY9g5xD9c2yMN5-l9jCyyGqVWlbIK0oWBQopp_WDPhKfJrsM89JKNfJHrUkYivhWwNQEq5GEHSzxEViGV-ALA1rVAeo4R2uDaJHWrjKyZZIH-OlPA66ly5PKAripfQA1Z6AC4g0DMoJ_ARYLmGTZSuT9MIkh6NRniscF_Or8rL6mumNU9TPnBCM7qIq5CwQcShUkk4dR0RwYJRhlDQ",
  token_type: "bearer",
  "not-before-policy": 1538380001,
  session_state: "d5fbd236-58f9-45bd-bbe1-911f27be0f5b",
  scope: "email profile",
};
TOKEN.access_token = tokenPasted.access_token;
TOKEN.refresh_token = tokenPasted.refresh_token;
const REFRESH_TOKEN_INTERVAL = 150;
const URL = "https://www.sahamyab.com/guest/twiter/list?v=0.1";
const REQ_NUM = 8000;
export async function scrapeSahamyab() {
  // * connect to db
  const db = await connectToDbCollection("sahamyab");
  // * make scrape continue from last section
  let page = 1;
  let lastId = await getLastItemIdFromDb<string>(db);
  let id = lastId || "115138242";
  // (Number(lastId) + 1).toString();
  // let itemsList: twitItemObj[] = [];
  console.log("+-----Id:", id);

  // * fetch and scrape each page
  for (let i = 0; i < REQ_NUM; i++) {
    try {
      let data = await scrapeSahamyabById(page, id, i);
      id = data?.lastId!;
      if (data?.items.length) {
        // * push each data into itemsList Arr to make a json copy each time code runs
        // itemsList = itemsList.concat(data?.items);
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
    await sleep(1200);

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
