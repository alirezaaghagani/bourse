import { scrapeBourseNews } from "./bourseNews";
import { scrapeSahamyab } from "./sahamyab";
// import { strDateExtractor } from "./utils";

try {
  // scrapeSahamyab();
  scrapeBourseNews();
  // strDateExtractor("شنبه ۱۸ شهريور ۱۴۰۲ - ۱۱:۱۱");
} catch (error) {
  if (error instanceof Error)
    console.log("Error in index: ", error.name, "->", error.message);
}
