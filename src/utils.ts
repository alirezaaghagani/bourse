import { appendFileSync, writeFileSync } from "fs";
import { type Collection } from "mongodb";

/*
function strDateExtractor(str: string) {
  console.log(str);
}
declare global {
  interface StringConstructor {
    toEnNum(str: string): string;
  }
}

String.toEnNum = (str: string) => {
  var find = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  var replace = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  var regex;
  for (var i = 0; i < find.length; i++) {
    regex = new RegExp(find[i], "g");
    str = str.replace(regex, replace[i]);
  }
  return str;
};
*/

function sleep(ms: number) {
  return new Promise(async (resolve, reject) => setTimeout(resolve, ms));
}
async function getLastItemIdFromDb(db: Collection) {
  const result = await db.findOne({}, { sort: { _id: -1 } });
  return result?.id;
}
async function fsSaveJson(
  data: object | [],
  title: string,
  initId: number | string,
  lastId: number | string
) {
  const string = JSON.stringify(data);
  writeFileSync(`./export/${title}(${initId}-${lastId}).json`, string);
  console.log("Finished!");
}

export { sleep, fsSaveJson, getLastItemIdFromDb };
