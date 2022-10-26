const { getOrcText } = require("./ocr")
const {
    convert2ImageQ
} = require("../../helper/upload");
const getImageRender = async (req, res) => {
    try {
        const imageUrl = req.body.image
        const orc_text = await getOrcText(imageUrl)
        if (!orc_text) return res.status(500).json(
            "Can not read image, please try again!"
        )
        let { fileUrl } = await convert2ImageQ(orc_text, "question");
        return res.status(200).json({
            orc_text:orc_text.replace(/\n|\r/g, " "),
            image_render: fileUrl ? fileUrl:"Render fail, please render again!"
        })
    } catch (error) {
        console.log(error);
        isConvertRunning = false;
    }
};

module.exports = {
    getImageRender,
};