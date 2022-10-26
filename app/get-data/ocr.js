const axios = require("axios").default;

const getOrcText = async (url) => {
  try {
    const send = JSON.stringify({
      src: url,
      rm_spaces: true,
      rm_fonts: true,
      formats: ["text"],
    });

    const { data } = await axios({
      url: "https://api.mathpix.com/v3/text",
      method: "POST",
      headers: {
        app_id: "dungvh_galaxy_com_vn_b5b5c4_6979dd",
        app_key:
          "923060b57b29fa8153e42ff8142cede96506565283d15040a08bec3400348df9",
        "Content-Type": "application/json",
      },
      data: send,
    });
    let { text } = data;
    if (!text) return null
    return text
  } catch (e) {
    console.log(e);
    return null;
  }
};


module.exports = { getOrcText };
