import { scrapeBourseNews } from "./bourseNews";
// import { strDateExtractor } from "./utils";
try {
  scrapeBourseNews();
  // strDateExtractor("شنبه ۱۸ شهريور ۱۴۰۲ - ۱۱:۱۱");
} catch (error) {
  if (error instanceof Error)
    console.log("Error: ", error.name, "->", error.message);
}