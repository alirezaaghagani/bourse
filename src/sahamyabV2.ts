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
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkMEkzcHg5c2x2VkpCWDg1ODdTcjF5ZU1uMEUwZjRRb21lR08zMngyeVQ4In0.eyJqdGkiOiIwYjE2NTBkOC0xODM1LTRmNDUtYmRjNS1hODFiNDNjYzY5YTUiLCJleHAiOjE3MTY4NDc2NjQsIm5iZiI6MCwiaWF0IjoxNzE2ODQ1ODY0LCJpc3MiOiJodHRwOi8va2V5Y2xvYWs6OTA4MC9hdXRoL3JlYWxtcy9zYWhhbXlhYiIsImF1ZCI6InNhaGFteWFiIiwic3ViIjoiYmZmMTBiOWUtY2U5Mi00NWU5LWJiM2QtYTczYzhmODYwMjYyIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2FoYW15YWIiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiJlNzFjNTc5MS1hOTQ0LTQzYzMtOGI2Yy02NTMzMWRkYmU5ZGQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vbmVvYnJva2VyLmlyIiwiaHR0cHM6Ly8qLnNhaGFteWFiLmNvbSIsImh0dHBzOi8vZGV2Lm5lb2Jyb2tlci5pciIsImh0dHBzOi8vd3d3Lm5lb2Jyb2tlci5pciJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiUk9MRV9VU0VSIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhbGlyZXphYWIwMDciLCJnaXZlbl9uYW1lIjoi2LnZhNuM2LHYttinIiwicHJvZmlsZV9pbWFnZSI6ImRlZmF1bHQiLCJpbmFjdGl2ZSI6ZmFsc2UsInVzZXJfaWQiOjQ1MDAwMDE2MSwibmFtZSI6Iti52YTbjNix2LbYpyIsIm5pY2tuYW1lIjoi2LnZhNuM2LHYttinIiwicGhvbmVfbnVtYmVyIjoiMDkyMTA3NTg2NTUiLCJjb3Zlcl9pbWFnZSI6ImRlZmF1bHQiLCJvbmxpbmVfdXNlciI6ZmFsc2UsIm9mZmljaWFsX3VzZXIiOmZhbHNlLCJlbWFpbCI6ImFsaXJlemFhZ2hhZ2FuaS5hYUBnbWFpbC5jb20iLCJwcml2YXRlX21zZ19pZCI6ImJlMDBlZTYyLTY5MmQtNGVlYy1iN2MwLTBhY2JkMzk2YjNkNSJ9.knqx3_2Bc8M8ZrOiaQjiCT7lD_uSr4qIOfM3YVmr0jt2dHAmKoKYMFkXlxUHLGKhV8mMJ-U9Aa1pRnVow_bd6OI1rlpiKcgp0VYZLMdevSP0baXB6wKOl8e_q_uV0bdLXPiHqGCHiCkTlvyZ3SxfPEPwdwVwCtNSoKyxPOXPK1zTXUzOc7IdrDVJEzqoi_PukDZj6JqXGUC27y-UZ5RU6VWNGn03dQMVnx2_-7byJ4WmMth7Oaw8Sx4LGuzpFgA-5iEmiB0NwRVG9iWyPvowHYHVKGxZCIXJFdvQzfFbiMpPJt5c-crP2zhsCpWIAXAA514GBsumCVY_O-5Lae1D2A",
  expires_in: 1800,
  refresh_expires_in: 1728825,
  refresh_token:
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkMEkzcHg5c2x2VkpCWDg1ODdTcjF5ZU1uMEUwZjRRb21lR08zMngyeVQ4In0.eyJqdGkiOiIwMThlZjNlNi0xNTM3LTQ3MjgtOGJkYy1kNjEzN2ZkMDZmOTgiLCJleHAiOjE3MTg1NzQ2ODksIm5iZiI6MCwiaWF0IjoxNzE2ODQ1ODY0LCJpc3MiOiJodHRwOi8va2V5Y2xvYWs6OTA4MC9hdXRoL3JlYWxtcy9zYWhhbXlhYiIsImF1ZCI6InNhaGFteWFiIiwic3ViIjoiYmZmMTBiOWUtY2U5Mi00NWU5LWJiM2QtYTczYzhmODYwMjYyIiwidHlwIjoiUmVmcmVzaCIsImF6cCI6InNhaGFteWFiIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiZTcxYzU3OTEtYTk0NC00M2MzLThiNmMtNjUzMzFkZGJlOWRkIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIlJPTEVfVVNFUiIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUifQ.UrvVOCs2CDXj2Art8uR53oQRBkdeqwyoiqJC6FV2rblpkuwnbjaImbU9dxo-y36IBKXB_xguTKHiO-Ab5mGmsZkQIf6NWeutQuzutNAifGJ0Ryh58eIlCGvcfPcmgBhjA0lgLgQrvmabRLF1kWhgWCtdVXprDafvTOaK8Vbw1_QWR-CQeI1XkE2ARIA3iMbKnk6HzHky9VHMXI7bitCcKX83yZvhnOZi1C6u6qX-d4deboJ2DRlfwLjpmU1roauXlFLd7lOeR9T2QOJB2kUMB4em66lUg0jzOxQPg9u0cne7Vp4e6Yx1rfL6WilsnILxdfy2N5zAp-ImaV_TvPvAgA",
  token_type: "bearer",
  "not-before-policy": 1538380001,
  session_state: "e71c5791-a944-43c3-8b6c-65331ddbe9dd",
  scope: "email profile",
};

TOKEN.access_token = tokenPasted.access_token;
TOKEN.refresh_token = tokenPasted.refresh_token;
const REFRESH_TOKEN_INTERVAL = 160;
const URL = "https://www.sahamyab.com/app/twiter/list?v=0.1";
const REQ_NUM = 18000000;
const FINISH_ID = 539000;
export async function scrapeSahamyabV2() {
  // * connect to db
  const db = await connectToDbCollection("sahamyabV2");
  // * make scrape continue from last section
  let page = 0;
  let lastId = await getLastItemIdFromDb<number>(db);
  let id = lastId || 450480535;

  console.log("+-----Id:", id);
  // let itemsList: twitItemObj[] = [];

  // * fetch and scrape each page
  for (let i = 0; i < REQ_NUM; i++) {
    try {
      let data = await scrapeSahamyabById(page, id, i);
      const lastId = data?.lastId!;
      if (id < FINISH_ID) {
        console.log("finished!");
        return;
      }
      if (id - lastId < 10000) id = lastId;
      else {
        console.log("long seperetion in data detected:", id - lastId);
        id = id - 200;
        continue;
      }
      if (data?.items.length) {
        const filteredItems = data?.items.filter(
          (item) => item.advertise !== true
        );
        // * insert each page fetched to db collection
        await db.insertMany(filteredItems);

        // * finish scrape if there is no more items
        if (!data.hasMore) break;

        // * refresh page(because of 10 pagination limit)
        // if (page < 20) page = 0;
        // else page = 0;
      }
      // * refresh token every <REFRESH_TOKEN_INTERVAL> time (because of 1800 time limit)
      if (i % REFRESH_TOKEN_INTERVAL === 0 && i !== 0) {
        const newToken = await refreshTokenSahamyab(TOKEN.refresh_token);
        TOKEN.access_token = newToken.access_token;
        TOKEN.refresh_token = newToken.refresh_token;
        console.log("token refreshed to:", newToken);
      }
      await sleep(250);
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
async function scrapeSahamyabById(page: Number, id: number, index: Number) {
  try {
    const res = await axios.post(
      URL,
      { page, id },
      { headers: { Authorization: "Bearer " + TOKEN.access_token } }
    );
    const data: twitsResObj = res.data;
    if (!data.success) throw new Error(`page:${page} id:${id} not Found!`);
    const lastId = data.items.at(-1)?.id || id - 1;
    const date = data.items.at(-1)?.sendTime || "unknown";
    const countLeft = id - FINISH_ID;
    console.log(
      `${index} - ${res.status} -----page: ${page} id: ${id} - ${lastId}  (${countLeft} left!) >> ${date}.`
    );

    return { lastId: Number(lastId), items: data.items, hasMore: data.hasMore };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.name, "---->", error.message);
      // const lastId = (Number(id) + 1).toString();
      return { lastId: Number(id), items: [], hasMore: true };
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
  advertise?: boolean;
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
