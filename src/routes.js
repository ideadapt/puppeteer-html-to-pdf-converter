const { check } = require('express-validator');

module.exports.register = function(app) {
    app.post('/api/generate', [
        check('url').isURL({require_valid_protocol: true, allow_protocol_relative_urls: false, require_tld: false}).optional(),
        check('html').optional(),
        check('filename').optional(),
        check('url_html').custom((value, {req}) => {
            if (!req.body.html && !req.body.url) {
                throw new Error("Must provide either url or html");
            }
            return true;
        }),
        check('scale').custom((value, {req}) => {
            if (!value) {
                return true;
            }
            if (Number.isNaN(value) || value < 0.1 || value > 2) {
                throw new Error("scale must be between 0.1 and 2");
            }
            return true;
        }),
        check('displayHeaderFooter').isBoolean().optional(),
        check('headerTemplate').optional(),
        check('footerTemplate').optional(),
        check('printBackground').isBoolean().optional(),
        check('landscape').isBoolean().optional(),
        check('pageRanges').custom((value, {req}) => {
            if (!value) {
                return true; // optional
            }
            const pageRanges = value.split('-');
            if (Number.isNaN(pageRanges[0]) || Number.isNaN(pageRanges[1])) {
                throw new Error("Invalid page range. Must be like 2-5");
            }
            return true;
        }),
        check('format').custom((value, {req}) => {
            if (!value) {
                return true;
            }
            const options = ['Letter', 'Legal', 'Tabloid', 'Ledger', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6'];
            if (options.indexOf(value) === -1) {
                throw new Error(`Format must be one of ${options.join(',')}`);
            }
            return true;
        }),
        check('width').matches(/\d+\w+/).optional(),
        check('height').matches(/\d+\w+/).optional(),
        check('margin.top').matches(/\d+\w+/).optional(),
        check('margin.right').matches(/\d+\w+/).optional(),
        check('margin.bottom').matches(/\d+\w+/).optional(),
        check('margin.left').matches(/\d+\w+/).optional(),
        check('preferCSSPageSize').isBoolean().optional()
    ], require('./generate'));
}