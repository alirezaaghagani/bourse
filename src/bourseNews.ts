import { axios } from "./axiosCli";
import * as Cheerio from "cheerio";
import { sleep, fsSaveJson } from "./utils";

const URL = "https://www.boursenews.ir/fa";
const INIT_ID = 10775;
const LAST_ID = 278645;
export async function scrapeBourseNews() {
  // await scrapePageLists();
  const allData = [];
  for (let i = INIT_ID; i < LAST_ID; i++) {
    try {
      const pageDataObj = await scrapeSinglePage(i);
      allData.push(pageDataObj);
      // const string = JSON.stringify(data);
      // await appendFileSync("./export/BourseNews_sample.json", string);
      console.log("+ " + i + "saved.");
      await sleep(200);
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error: ", error.name, "->", error.message);
        continue;
      }
    }
  }
  await fsSaveJson(allData, "BourseNews_sample", INIT_ID, LAST_ID);
}

async function scrapeSinglePage(newsId: number) {
  try {
    const res = await axios.get(URL + `/news/${newsId}/`);
    console.log(res.status);
    const data = res.data;
    const $ = Cheerio.load(data);
    const newsPageData$ = $(".newsColR");
    const newsContent$ = newsPageData$.find(".newsContent");
    const newsContent = {
      newsId: newsContent$.find(".newsId").text().split(":")[1].trim() || null,
      newsTitle: newsContent$.find(".newsTitle").text().trim() || null,
      newsPreTitle: newsContent$.find(".newsPreTitle").text().trim() || null,
      newsPosterUrl: newsContent$.find(".lead_image").attr("src") || null,
      newsPosterSubTitle: newsContent$.find(".subtitle").text().trim() || null,
      newsUrl: newsContent$.find("input.copy-button").attr("value") || null,
      newsMainCat: newsContent$.find(".newsServiceName").text().trim() || null,
      newsSubCat: newsContent$.find(".newsSubjectName").text().trim() || null,
      newsPublishDateFa: newsContent$.find(".newsDate").text().trim() || null,
      newsModifiedDateFa:
        $("head")
          .find("meta[property='article:modified_time']")
          .attr("content")
          ?.trim() || null,
      newsLikeCount: newsContent$.find(".like_number").text().trim() || null,
      newsContent:
        newsContent$.find(".row").find("div.body > p").text().trim() || null,
      newsTags: newsContent$
        .find(".newsTags")
        .children("a")
        .toArray()
        .map((element) => {
          const tag = $(element);
          return tag.text().trim();
        }),
      newsComments: newsPageData$
        .find(".comments_container")
        .children(".comments_item")
        .toArray()
        .map((element) => {
          const comment$ = $(element);
          return {
            comName: comment$.find(".comm_info_name").text().trim(),
            comDate: comment$.find(".comm_info_date").text().trim(),
            comCountry: comment$
              .find(".comm_info_country")
              .children("img")
              .attr("title")
              ?.trim(),
            comText: comment$.find(".comments").text().trim(),
            comLike: comment$.find(".rating_up").text().trim(),
            comDisLike: comment$.find(".rating_down").text().trim(),
            comReplys: comment$
              .find(".comm_admin_reply")
              .toArray()
              .map((element) => {
                const comReply$ = $(element);
                return {
                  comReplyName:
                    comReply$.find(".cmReplyName span").text().trim() || null,
                  comReplyDate:
                    comReply$.find(".cmReplyDate").text().trim() || null,
                  comReplyText:
                    comReply$.find(".cmReplyTxt").text().trim() || null,
                };
              }),
          };
        }),
    };
    return newsContent;
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error: ", error.name, "->", error.message);
      throw new Error("!- Failed to fetch" + 278645 + "data!");
    }
  }
}

/*
async function scrapePageLists() {
  try {
    const res = await axios.get(
      URL +
        "/archive/section?sec_id=416&rpp=100&from_date=1380/11/12&to_date=1403/02/12&p=2"
    );
    console.log(res.status);
    const data = res.data;
    const $ = Cheerio.load(data);
    const results = $(".paged_section_container")
      .children(".svImgNewsItem")
      .toArray();
    const links = results.map((element) => {
      const resultItem = $(element);
      return resultItem.find("a.imgNewsTitleLinkSv").attr("href");
    });
    console.log(links);
  } catch (error) {
    if (error instanceof Error)
      console.log("Error: ", error.name, "->", error.message);
  }
}
*/
