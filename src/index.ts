import { scrapeBourseNews } from "./bourseNews";
import { scrapeSahamyab } from "./sahamyab";
import { scrapeBourse24 } from "./bourse24";
import { scrapeEghtesadNews } from "./eghtesadNews";
import scrapeBoursePress from "./boursePress";

// ** uncomment the a single function to run that code
try {
  scrapeBoursePress();
  // scrapeEghtesadNews();
  // scrapeBourse24();
  // scrapeSahamyab();
  // scrapeBourseNews();
} catch (error) {
  if (error instanceof Error)
    console.log("Error in index: ", error.name, "->", error.message);
}
