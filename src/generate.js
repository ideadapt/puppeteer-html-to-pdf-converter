const { validationResult } = require('express-validator');

module.exports = async function(req, res) {
    if(!req.headers['content-type']){
        return res.status(406).json({success: false, errors: [{msg: 'Missing content-type header'}]})
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            errors: errors.errors
        });
    }

    if (!global.browser) {
        return res.status(503)

    }

    const pdfOptions = {
        format: 'A4',
        margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    };
    const availableOptions = ['scale', 'displayHeaderFooter', 'headerTemplate', 'footerTemplate', 'printBackground', 'landscape', 
    'pageRanges', 'format', 'width', 'height', 'margin.top', 'right', 'margin.bottom', 'margin.left', 'preferCSSPageSize'];
    const integerOptions = ['scale', 'width', 'height'];
    for (const option of availableOptions) {
        if (req.body[option] && !option.includes('margin')) {
            if (integerOptions.includes(option)) {
                pdfOptions[option] = Number(req.body[option]);
            } else {
                pdfOptions[option] = req.body[option];
            }
        }
        if (req.body[option] && option.includes('margin')) {
            pdfOptions.margin[option.replace('margin.', '')] = req.body[option];
        }
    }

    const page = await global.browser.newPage();
    if (req.body.url) {
        await page.goto(req.body.url);
    } else {
        await page.setContent(req.body.html);
    }
    const bytes = await page.pdf(pdfOptions);
    await page.close();

    res.set("Content-Type", "application/octet-stream")
    res.set("Content-Disposition", `attachment;filename=${req.body['filename'] || 'generated-file'}.pdf`)
    return res.status(200).send(Buffer.from(bytes, 'binary'))
}