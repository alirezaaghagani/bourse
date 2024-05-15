import * as Cheerio from "cheerio";
import { axios } from "./axiosCli";
import { fsSaveJson, sleep } from "./utils";
import { connectToDbCollection } from "./db";
import { list } from "./24List";

const URL = "https://www.bourse24.ir";

// private     "https://www.bourse24.ir/articles/26776/مروری-بر-عملکرد-و-وضعیت-سودآوری-«جم-پیلن»"
export async function scrapeBourse24() {
  const errs = [];
  const db = await connectToDbCollection("bourse24");
  for (let i = 0; i < list.length; i++) {
    try {
      const data = await getBourse24SingleContent(list[i]);
      if (data) {
        await db.insertOne(data);
        const progress = Math.floor(i / list.length);
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
  errs && (await fsSaveJson(errs, "Bourse24Errors", list.length));
}

// *** scrape single page contents ***

async function getBourse24SingleContent(url: string) {
  try {
    const res = await axios.get(url);
    const urlTitle = url.split("/").at(-1);
    const id = Number(url.split("/").at(-2));
    console.log(res.status, id, urlTitle);
    const data = res.data;
    const $ = Cheerio.load(data);
    const pageData$ = $(".container");
    const title = pageData$.find(".content-h1").text();
    const article$ = pageData$.find("article.post");
    const isPrivate = pageData$.find("blockquote + section.featured-primary")
      .length
      ? true
      : false;
    if (title && !isPrivate)
      return {
        id,
        title,
        summery: article$.find("blockquote").text()?.trim() || null,
        date:
          article$
            .find("article.post-large span:has(.fa-calendar)")
            .text()
            ?.trim() || null,
        cat:
          article$
            .find("article.post-large span:has(.fa-folder)")
            .text()
            ?.trim() || null,
        content: article$.find(".post-text").text()?.trim() || null,
        tags: article$
          .find(".post-tags")
          .find("a")
          .toArray()
          .map((element) => $(element).text() || null),
        imgs: article$
          .find(".post-text")
          .find("img")
          .toArray()
          .map((element) => $(element).attr("src")),
      };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        "!- Failed to fetch " + url.split("/").at(-2) + " page data!"
      );
    }
  }
}
// *** scrape pages links ***
async function getBourse24PagesList(type: pageType, category: string) {
  let linksList: string[] = [];
  let errorList: number[] = [];
  const REQ = 5227;
  for (let i = 1; i <= REQ; i++) {
    try {
      const links = await getBourse24PagesListContent(type, category, i);
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
  fsSaveJson(linksList, type, category, REQ);
}

async function getBourse24PagesListContent(
  type: pageType,
  category: string,
  page: number
) {
  try {
    const res = await axios.get(
      URL + `/${type}/category/${category}?page=${page}`
    );
    console.log(res.status, page);
    const data = res.data;
    const $ = Cheerio.load(data);
    const newsPageData$ = $(".container");
    const posts$ = newsPageData$.find(".post");
    const links: string[] = posts$
      .find(".post-content h2 a")
      .toArray()
      .map((element) => $(element).attr("href")!);

    return links;
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error: ", error.name, "->", error.message);
      throw new Error(
        "!- Failed to fetch " + category + " page " + page + "data!"
      );
    }
  }
}

type pageType = "articles" | "news";
