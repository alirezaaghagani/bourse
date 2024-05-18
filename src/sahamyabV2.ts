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
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkMEkzcHg5c2x2VkpCWDg1ODdTcjF5ZU1uMEUwZjRRb21lR08zMngyeVQ4In0.eyJqdGkiOiI0YzMyMzVlZS0zOGNjLTQzNWMtYWYyYS1kNWRmNzA1MmNlNjEiLCJleHAiOjE3MTYwNjMyMzQsIm5iZiI6MCwiaWF0IjoxNzE2MDYxNDM0LCJpc3MiOiJodHRwOi8va2V5Y2xvYWs6OTA4MC9hdXRoL3JlYWxtcy9zYWhhbXlhYiIsImF1ZCI6InNhaGFteWFiIiwic3ViIjoiYmZmMTBiOWUtY2U5Mi00NWU5LWJiM2QtYTczYzhmODYwMjYyIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2FoYW15YWIiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiJlNzFjNTc5MS1hOTQ0LTQzYzMtOGI2Yy02NTMzMWRkYmU5ZGQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vbmVvYnJva2VyLmlyIiwiaHR0cHM6Ly8qLnNhaGFteWFiLmNvbSIsImh0dHBzOi8vZGV2Lm5lb2Jyb2tlci5pciIsImh0dHBzOi8vd3d3Lm5lb2Jyb2tlci5pciJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiUk9MRV9VU0VSIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhbGlyZXphYWIwMDciLCJnaXZlbl9uYW1lIjoi2LnZhNuM2LHYttinIiwicHJvZmlsZV9pbWFnZSI6ImRlZmF1bHQiLCJpbmFjdGl2ZSI6ZmFsc2UsInVzZXJfaWQiOjQ1MDAwMDE2MSwibmFtZSI6Iti52YTbjNix2LbYpyIsIm5pY2tuYW1lIjoi2LnZhNuM2LHYttinIiwicGhvbmVfbnVtYmVyIjoiMDkyMTA3NTg2NTUiLCJjb3Zlcl9pbWFnZSI6ImRlZmF1bHQiLCJvbmxpbmVfdXNlciI6ZmFsc2UsIm9mZmljaWFsX3VzZXIiOmZhbHNlLCJlbWFpbCI6ImFsaXJlemFhZ2hhZ2FuaS5hYUBnbWFpbC5jb20iLCJwcml2YXRlX21zZ19pZCI6ImJlMDBlZTYyLTY5MmQtNGVlYy1iN2MwLTBhY2JkMzk2YjNkNSJ9.ZaFp4phCYzc3PuVl52cmojR7tTGjBSqgPPqwmpIuQxDXI5HMCk5VBF9N7zfag9YuUhUl2HNfSRLW9RkjU7Ccb0HweXIm8zbgAG5DSbsXrSgpghTULw9jZoEuR6babwjXn6fbxBjWcoOrwFYztHheoYP2U3qdIQNz9Wsd7Jvxl4p8UTM8igFSL67BdIUBGbNxU8iBw4_vR9Wwos-xPT7NUZp2ARPObuWFFurQMsCx66p-yTRhvpnmQEVBAg1jzIXSqHclZDuzazJMZXQK-oauLNgwXBYUMxQYPgw5Wh_43ZG-Ik7jllx58CTUYmBJWoeV6u1J2viN4dvAkW-259CKig",
  expires_in: 1800,
  refresh_expires_in: 2513255,
  refresh_token:
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkMEkzcHg5c2x2VkpCWDg1ODdTcjF5ZU1uMEUwZjRRb21lR08zMngyeVQ4In0.eyJqdGkiOiJiMDI0ZWY2ZC00NjNmLTRjOWEtOWE1Ny02NGQ3NjdmMWJkMDQiLCJleHAiOjE3MTg1NzQ2ODksIm5iZiI6MCwiaWF0IjoxNzE2MDYxNDM0LCJpc3MiOiJodHRwOi8va2V5Y2xvYWs6OTA4MC9hdXRoL3JlYWxtcy9zYWhhbXlhYiIsImF1ZCI6InNhaGFteWFiIiwic3ViIjoiYmZmMTBiOWUtY2U5Mi00NWU5LWJiM2QtYTczYzhmODYwMjYyIiwidHlwIjoiUmVmcmVzaCIsImF6cCI6InNhaGFteWFiIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiZTcxYzU3OTEtYTk0NC00M2MzLThiNmMtNjUzMzFkZGJlOWRkIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIlJPTEVfVVNFUiIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUifQ.dT-qgaRJ9TD4PdlmBIHZv7Tg6Jx6kMxELarDcIyy__Yd4HrNPeVOHMaTSYRympxNrNgiBJVlw4B2iVjgt-YN1or9XhzibM0yMAB0hOc3VBSNzVWTgJKNBJkVwi8ocivDnfnmOQ_YZeNFpgJ2c_AS33pyXZ3UtS-UAb4kFpUb9r5SFfa9jba_6E3J59IKEwhOgDvHBG1UEKy3APXtXPgjHPzTbnksMzuEPs-pCvNciVuxwewhFuWlQUwdTgfVzuvTMbQibRvuAiMh7T3x6X6m_DUqhr3ayPAk_kIJs2b0K_7ujX_otJmryBMY969c_8-EhOeiO2SSaKHY4TW-JVC9Ww",
  token_type: "bearer",
  "not-before-policy": 1538380001,
  session_state: "e71c5791-a944-43c3-8b6c-65331ddbe9dd",
  scope: "email profile",
};

TOKEN.access_token = tokenPasted.access_token;
TOKEN.refresh_token = tokenPasted.refresh_token;
const REFRESH_TOKEN_INTERVAL = 160;
const URL = "https://www.sahamyab.com/app/twiter/list?v=0.1";
const REQ_NUM = 500000;
const FINISH_ID = 539000;
export async function scrapeSahamyabV2() {
  // * connect to db
  const db = await connectToDbCollection("sahamyabV2");
  // * make scrape continue from last section
  let page = 0;
  let lastId = await getLastItemIdFromDb<number>(db);
  let id = lastId || 450462813;

  console.log("+-----Id:", id);
  // let itemsList: twitItemObj[] = [];

  // * fetch and scrape each page
  for (let i = 0; i < REQ_NUM; i++) {
    try {
      let data = await scrapeSahamyabById(page, id, i);
      id = data?.lastId!;
      if (data?.items.length) {
        const filteredItems = data?.items.filter(
          (item) => item.advertise !== true
        );
        // * insert each page fetched to db collection
        await db.insertMany(filteredItems);

        // * finish scrape if there is no more items
        if (!data.hasMore) break;

        // * refresh page(because of 10 pagination limit)
        if (page < 10) page++;
        else page = 0;
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
    const lastId = data.items.at(-1)?.id;
    const countLeft = id - FINISH_ID;
    console.log(
      `${index} - ${res.status} -----page: ${page} id: ${id} - ${lastId} (${countLeft} left!).`
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
