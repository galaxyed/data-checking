const fetch = require("node-fetch").default;
const puppeteer = require("puppeteer");
const fs = require("fs");
const axios = require("axios").default;
const Sentry = require("@sentry/node");
const { log } = require("console");

const getSignedUrl = async (type) => {
  return fetch(
    `${process.env.S3_UPLOAD_SERVER}/uploads/presign?type=${type}`
  ).then((response) => response.json());
};

const putImage = async (url, file) => {
  return fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": "image/png",
    },
  });
};

const uploadImageToS3 = async ({ file, type }) => {
  try {
    const data = await getSignedUrl(type);
    if (data) {
      const { uploadUrl, fileUrl } = data;
      await putImage(uploadUrl, file);
      return { fileUrl, file };
    }
  } catch (e) {
    return { fileUrl: null, file: null };
  }
};

const convert2ImageQ = async (html, type) => {
  let browser
  let page
  try {
     browser = await puppeteer.launch({
      args: [
        "--disable-gpu",
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--no-zygote",
      ],
      // executablePath: "/usr/bin/chromium-browser",
    });
    html = html.replace("/\\/g", "/\/");
    const htmlDiv = `
                <head>
                  <style>
                    .content-render {
                      width: 840px;
                      display: block;
                      word-break: break-word;
                      white-space: ${
                        type === "question" ? "pre-line" : "normal"
                      } ;
                      padding:0px 20px 20px 20px;
                      font-size: 26px;
                      font-weight: 400;
                      line-height: 35px;
                    }
                    ${
                      type === "question"
                        ? `p{
                      margin:0
                    }`
                        : null
                    }
                    .MJXc-display {
                      text-align: left !important;
                    }
                  </style>
                <script type="text/x-mathjax-config;">
                    MathJax.Hub.Config({
                              messageStyle: "none",
                              SVG: {
                                    scale: 120,
                                    linebreaks: {
                                        automatic: true
                                    }
                              },
                              "HTML-CSS": { linebreaks: { automatic: true } },
                              CommonHTML: { linebreaks: { automatic: true } },
                              tex2jax: {
                                    inlineMath: [ ['$','$'], ['\\\\(','\\\\)'] ]
                              }
                            })
                  </script>
                </head>
                <body>
                  <script
                    type="text/javascript"
                    async=""
                    src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-MML-AM_CHTML"
                    defer=""
                  ></script>
                  <div class="content-render">
                    ${html}
                  </div>
                </body>
  `;
    page = await browser.newPage();
    // Navigate to a particular div on the website

    await page.setContent(htmlDiv, { waitUntil: "networkidle0", timeout: 0 });
    const content = await page.$(".content-render");
   // get image buffer
    let imageBuffer = await content.screenshot({
      path: `image.jpeg`,
      type: `jpeg`,
    });
    await page.close();
    await browser.close();
    // upload image
    const url = await uploadImageToS3({ file: imageBuffer, type });
   
    // delete image;
    if (fs.existsSync("image.jpeg")) {
      fs.unlink("image.jpeg", (err) => {
        if (err) {
          console.error(err);
          Sentry.captureException(err);
        }
      });
    }
    return url;
  } catch (error) {
    await page.close();
    await browser.close();
    console.log(error);
    Sentry.captureException(error);
  }
};
module.exports = {
  convert2ImageQ,
};
