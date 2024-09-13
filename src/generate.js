const {validationResult} = require('express-validator');

module.exports = async function (req, res) {
    if (!req.headers['content-type']) {
        return res.status(406).json({success: false, errors: [{msg: 'Missing content-type header'}]})
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false, errors: errors.errors
        });
    }

    if (!global.browser) {
        return res.status(503)
    }

    const pdfOptions = {
        format: 'A4', margin: {
            top: 0, right: 0, bottom: 0, left: 0
        }
    };
    const availableOptions = ['scale', 'displayHeaderFooter', 'headerTemplate', 'footerTemplate', 'printBackground', 'landscape', 'pageRanges', 'format', 'width', 'height', 'margin.top', 'right', 'margin.bottom', 'margin.left', 'preferCSSPageSize'];
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

    try {
        const page = await global.browser.newPage();

        if (req.body['viewportDimensions']) {
            await page.setViewport({
                width: Number(req.body['viewportDimensions'].split('x')[0]),
                height: Number(req.body['viewportDimensions'].split('x')[1])
            });
        }

        if (req.body.url) {
            let response = await page.goto(req.body.url, {waitUntil: req.body['waitUntil'] ?? 'networkidle0'});
            if (response.status() >= 400) {
                return res.status(400).json({
                    success: false,
                    errors: [{msg: `Cannot access URL ${req.body.url}, the server returned an error ${response.status()}`}]
                })
            }
        } else {
            await page.setContent(req.body.html);
        }

        if (req.body['scrollPage']) {
            await scrollPage(page);
        }

        const bytes = await page.pdf(pdfOptions);
        await page.close();

        res.set("Content-Type", "application/octet-stream")
        res.set("Content-Disposition", `attachment;filename=${req.body['filename'] || 'generated-file'}.pdf`)
        return res.status(200).send(Buffer.from(bytes, 'binary'))
    } catch (error) {
        try {
            await page.close()
        } catch (e) {
            // Nothing to do... try to close in case of error
        }
        return res.status(500).json({success: false, errors: [{msg: `Internal error : ${error.message}`}]})
    }
}

async function scrollPage(page) {
    // scroll to the end of page step by step
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const step = 500;
            const intervalId = setInterval(() => {
                window.scrollBy(0, step);
                totalHeight += step;
                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, 10);
        });
    });
    // and wait for networkIdle (lazy load cases)
    await page.waitForNetworkIdle();
}