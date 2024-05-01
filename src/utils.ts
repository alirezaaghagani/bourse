function strDateExtractor(str: string) {
  console.log(str);
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

function sleep(ms: number) {
  return new Promise(async (resolve, reject) => setTimeout(resolve, ms));
}
export { sleep };
