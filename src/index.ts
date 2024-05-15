import { scrapeBourseNews } from "./bourseNews";
import { scrapeSahamyab } from "./sahamyab";
import { scrapeBourse24 } from "./bourse24";
import { scrapeEghtesadNews } from "./eghtesadNews";
// import { strDateExtractor } from "./utils";

try {
  scrapeEghtesadNews();
  // scrapeBourse24();
  // scrapeSahamyab();
  // scrapeBourseNews();
  // strDateExtractor("شنبه ۱۸ شهريور ۱۴۰۲ - ۱۱:۱۱");
} catch (error) {
  if (error instanceof Error)
    console.log("Error in index: ", error.name, "->", error.message);
}
