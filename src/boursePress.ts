import * as Cheerio from "cheerio";
import { axios } from "./axiosCli";
import { fsSaveJson, sleep } from "./utils";
import { list } from "./LinkLists/boursePressList";
import { connectToDbCollection } from "./db";

const URL = "https://boursepress.ir";

export default async function scrapeBoursePress() {
  const errs = [];
  const db = await connectToDbCollection("boursePress");
  const metaDb = await connectToDbCollection("boursePressMeta");
  const listIndex = (await metaDb.findOne({ meta: true }))?.index;
  console.log("Starting from last list index: ", listIndex);

  for (let i = listIndex; i < list.length; i++) {
    try {
      const data = await getBoursePressSingleContent(list[i]);
      if (data) {
        await metaDb.findOneAndUpdate(
          { meta: true },
          { $set: { index: i + 1 } }
        );
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
  await fsSaveJson(errs, "BoursePressErrors", list.length);
}

// *** scrape single page contents ***

async function getBoursePressSingleContent(id: Number) {
  try {
    const res = await axios.get(URL + "/news/" + id);
    console.log(res.status, id);
    const data = res.data;
    const $ = Cheerio.load(data);
    const pageData$ = $("#divNewsPage");
    const article$ = pageData$.find("#divNewsContent");
    const title = article$.find("h1").text();

    if (title)
      return {
        id,
        id_fa:
          article$
            .find('.news-map div[style="float:left"]')
            .text()
            .split(":")
            .at(1)
            ?.trim() || null,
        title,
        subTitle: article$.find(".short-title").text() || null,
        summery: article$.find(".news-lead").text() || null,
        posterUrl: article$.find(".news-img img").attr("src") || null,
        date:
          article$
            .find('.news-map div[style=" position: absolute; left: 240px; "]')
            .text() || null,
        content: article$.find(".news-text").text().trim() || null,
        tags: article$
          .find(".tags .tags-content")
          .find("a")
          .toArray()
          .map((element) => $(element).text() || null),
      };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error("!- Failed to fetch " + id + " page data!");
    }
  }
}

// *** scrape pages links ***

async function getBoursePressPagesList() {
  let linksList: Number[] = [];
  let errorList: Number[] = [];
  const REQ = 1466;
  for (let i = 1; i <= REQ; i++) {
    try {
      const links = await getBoursePressPagesListContent(i);
      if (links?.length) linksList = linksList.concat(links);
      // await sleep(300);
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.name} ->${error.message}`);
        errorList.push(i);
      }
    }
  }
  console.log(linksList, linksList.length);
  console.log("Errors:", errorList);
  fsSaveJson(linksList, "boursePressLinks", REQ, linksList.length);
}

async function getBoursePressPagesListContent(page: Number) {
  try {
    const res = await axios.get(URL + `/service/companies?p${page}`);
    console.log(res.status, page);
    const data = res.data;
    const $ = Cheerio.load(data);
    const newsPageData$ = $("#NewsCnt");
    const postsList$ = newsPageData$.find(".news-list-t-i-l");
    const posts$ = postsList$.find("li");
    const links: Number[] = posts$
      .find("a.news-list-title-icon")
      .toArray()
      .map((element) => {
        const idString = $(element).attr("href")?.split("/").at(-2)!;
        return Number(idString);
      });

    return links;
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error: ", error.name, "->", error.message);
      throw new Error("!- Failed to fetch " + page + " page data!");
    }
  }
}
