import { axios } from "./axiosCli";
import { connectToDbCollection } from "./db";
import { fsSaveJson, sleep, getLastItemIdFromDb } from "./utils";

// * token for auth: required for req for more pagination than page 10
const TOKEN = { access_token: "", refresh_token: "" };
const URL = "https://www.sahamyab.com/guest/twiter/list?v=0.1";
const REQ_NUM = 30;
export async function scrapeSahamyab() {
  // * connect to db
  const db = await connectToDbCollection("sahamyab");
  // * make scrape continue from last section
  let page = 1;
  let id = await getLastItemIdFromDb(db);
  let itemsList: twitItemObj[] = [];

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

      if (page < 40) page++;
      else {
        // * refresh page(because of 40 pagination limit) and tokens (because of 1800 limit)
        page = 0;
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
  await fsSaveJson(itemsList, "sahamyab", id!, REQ_NUM);
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
      { headers: { Authorization: TOKEN.access_token } }
    );
    console.log(index, "-", res.status, "page:", page, "id", id);
    const data: twitsResObj = res.data;
    if (!data.success) throw new Error(`page:${page} id:${id} not Found!`);
    await sleep(500);

    return { lastId: data.items.at(-1)?.id, items: data.items };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.name, "---->", error.message);
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
