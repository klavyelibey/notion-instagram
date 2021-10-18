const fetch = require("node-fetch");
const notionClient = require("notion-client");
const api = new notionClient.NotionAPI({ authToken: process.env.NT_TOKEN });
const notionUtils = require("notion-utils");

const _imgLink = (src, id) => {
  return `https://www.notion.so/image/${encodeURIComponent(
    src
  )}?table=block&id=${id}&cache=v2`;
};

const _getDbId = (pagelink) => {
  return pagelink.split("/")[3];
};

module.exports = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const blocks = (await api.getPage(_getDbId(process.env.PAGE_LINK))).block;
      const postsIds = Object.keys(blocks).filter((id) => {
        const block = blocks[id];

        if (
          block.value &&
          block.value.type === "page" &&
          block.value.properties &&
          !(
            block.value.properties["@@`t"] &&
            block.value.properties["@@`t"][0][0] === "Yes"
          ) &&
          block.value.properties["_Tle"] &&
          block.value.properties["_Tle"][0][0] === "Yes"
        ) {
          return true;
        }
      });
      let posts = [];
      postsIds.forEach((id) => {
        const properties = blocks[id].value.properties;
        console.log(properties["^w`s"][0][0]);
        posts.push({
          id: id,
          title: properties["title"] ? properties["title"][0][0] : null,
          tags: properties["^w`s"]
            ? properties["^w`s"][0][0].replace(/,/g, " ")
            : null,
          schedule:
            properties["g@eh"] && properties["g@eh"][0][1]
              ? properties["g@eh"][0][1][0][1]
              : null,
          isScheduled: properties["d{}M"] && properties["d{}M"][0][0] === "Yes",
          // Filter multiples images
          images: properties["YXUk"]
            ? properties["YXUk"]
                .map((img) => {
                  if (img && img[0] != ",") return _imgLink(img[1][0][1], id);
                })
                .filter((img) => img != null)
            : [],
        });
      });
      resolve(posts);
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
