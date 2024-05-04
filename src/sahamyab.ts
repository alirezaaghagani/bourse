import { axios } from "./axiosCli";
import { fsSaveJson, sleep } from "./utils";

const URL = "https://www.sahamyab.com/guest/twiter/list?v=0.1";
const REQ_NUM = 50000;
export async function scrapeSahamyab() {
  let page = 1;
  let id = null;
  let itemsList: twitItemObj[] = [];
  for (let i = 0; i < REQ_NUM; i++) {
    try {
      let data = await scrapeSahamyabById(page, id, i);
      id = data?.lastId!;
      itemsList = itemsList.concat(data?.items!);
      if (page < 40) page++;
      else page = 0;
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
    const res = await axios.post(URL, { page, id });
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
