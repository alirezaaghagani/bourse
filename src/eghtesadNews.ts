import * as Cheerio from "cheerio";
import { axios } from "./axiosCli";
import { fsSaveJson, sleep } from "./utils";
import { connectToDbCollection } from "./db";
import { list } from "./LinkLists/eghtesadNewsList";

const URL = "https://www.eghtesadnews.com";

export async function scrapeEghtesadNews() {
  const errs = [];
  const db = await connectToDbCollection("eghtesadNews");
  for (let i = 0; i < list.length; i++) {
    try {
      const data = await getEghtesadNewsSingleContent(list[i]);
      if (data) {
        await db.insertOne(data);
        const progress = Math.floor((i / list.length) * 100);
        console.log(data.id, " saved!", `${progress}% (${i}/${list.length})`);
      }
      await sleep(250);
    } catch (error) {
      if (error instanceof Error) {
        errs.push(list[i]);
        console.log("Error: ", error.name, "->", error.message);
      }
    }
  }
  errs.length && (await fsSaveJson(errs, "eghtesadNewsErrors", list.length));
}

// *** scrape single page contents ***

async function getEghtesadNewsSingleContent(url: string) {
  try {
    const res = await axios.get(URL + url);
    console.log(res.status);
    const data = res.data;
    const $ = Cheerio.load(data);
    const id = $("main").attr("data-entity-id") || null;
    const pageData$ = $("#news-page-content");
    const articleHeader$ = $("header.news_page_header");
    const title = articleHeader$.find(".title").text().trim();
    const article$ = pageData$.find(".body");
    const id_fa = articleHeader$
      .find(".news-info .code")
      .text()
      .split(":")
      .at(1)
      ?.trim();

    if (title)
      return {
        id: Number(id),
        id_fa,
        title,
        posterUrl: pageData$.find(".image img").attr("src") || null,
        summery: articleHeader$.find(".lead").text()?.trim() || null,
        date:
          articleHeader$.find(".news-info .news_time").text()?.trim() || null,
        likes: pageData$.find(".rate-news #t-plusme").text()?.trim() || null,
        content:
          article$
            .find("#main_ck_editor")
            .find("p ,h2")
            .toArray()
            .map((element) => $(element).text())
            .join("/n") || null,
        tags: pageData$
          .find(".tags")
          .find("li a")
          .toArray()
          .map((element) => $(element).text().trim() || null),
        imgs: article$
          .find("img")
          .toArray()
          .map((element) => $(element).attr("src")),
      };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        "!- Failed to fetch " +
          url.split("/").at(-2) +
          " page data: " +
          error.message
      );
    }
  }
}

// *** scrape pages links ***
async function getEghtesadNewsLinksList() {
  let linksList: string[] = [];
  let errorList: number[] = [];
  const REQ = 71;
  for (let i = 1; i <= REQ; i++) {
    try {
      const links = await getEghtesadNewsLinksListContent(i);
      if (links?.length) linksList = linksList.concat(links);
      await sleep(300);
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.name} ->${error.message}`);
        errorList.push(i);
      }
    }
  }
  console.log(linksList, linksList.length);
  console.log("Errors:", errorList);
  fsSaveJson(linksList, "egtesadNewsLinks", linksList.length);
}

async function getEghtesadNewsLinksListContent(page: number) {
  try {
    const res = await axios.get(URL + `/بخش-اخبار-بورس-38?page=${page}`);
    console.log(res.status, page);
    const data = res.data;
    const $ = Cheerio.load(data);
    const newsPageData$ = $(".view-content");
    const posts$ = newsPageData$.find(".cont");
    const links: string[] = posts$
      .find(".views-row .title a")
      .toArray()
      .map((element) => $(element).attr("href")!);

    return links;
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error: ", error.name, "->", error.message);
      throw new Error("!- Failed to fetch " + page + " page data!");
    }
  }
}
