# HTML to PDF converter HTTP API

This is a cloud ready HTML to PDF converter application running inside docker accessible via an HTTP API.

## HTT API Usage
### `POST /generate`

The number of requests per minute per client is limited.

**Parameters**

Following parameters are supported. Send them as form-data form-urlencoded or as raw json.

| Parameter             | Type | Description                                                                                                                                                                                                      |
|:----------------------| :--- |:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                 | `string` | **Required if no html**. The url of the webpage to convert to pdf                                                                                                                                                |
| `html`                | `string` | **Required if no url**. The html to convert to pdf                                                                                                                                                               |
| `filename`            | `string` | **Optional**. The name of generated PDF file in the download response, without extension. Defaults to `generated-file`.                                                                                          |
| `scale`               | `string` | **Optional**. Scale of the webpage rendering. Scale amount must be between 0.1 and 2. Defaults to 1.                                                                                                             |
| `displayHeaderFooter` | `boolean` | **Optional**. Display header and footer. Defaults to `false `                                                                                                                                                    |
| `headerTemplate`      | `string` | **Optional**. HTML template for the print header. Should be valid HTML markup with following classes used to inject printing values into them: `date`, `title`, `url`, `pageNumber`, `totalPages`                |
| `footerTemplate`      | `string` | **Optional**. HTML template for the print footer. Should use the same format as the `headerTemplate`                                                                                                             |
| `printBackground`     | `boolean` | **Optional**. Print background graphics. Defaults to `false`                                                                                                                                                     |
| `landscape`           | `boolean` | **Optional**. Paper orientation. Defaults to `false`                                                                                                                                                             |
| `pageRanges`          | `string` | **Optional**. Paper ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means print all pages                                                                                            |
| `format`              | `string` | **Optional**. Paper format. If set, takes priority over width or height options. Defaults to 'A4'                                                                                                                |
| `width`               | `integer` | **Optional**. Paper width, accepts values labeled with units                                                                                                                                                     |
| `height`              | `integer` | **Optional**. Paper height, accepts values labeled with units                                                                                                                                                    |
| `margin.top`          | `integer` | **Optional**. Top margin, accepts values labeled with units. Defaults to `0`                                                                                                                                     |
| `margin.right`        | `integer` | **Optional**. Right margin, accepts values labeled with units. Defaults to `0`                                                                                                                                   |
| `margin.bottom`       | `integer` | **Optional**. Bottom margin, accepts values labeled with units. Defaults to `0`                                                                                                                                  |
| `margin.left`         | `integer` | **Optional**. Left margin, accepts values labeled with units. Defaults to `0`                                                                                                                                                   |
| `preferCSSPageSize`   | `boolean` | **Optional**. Give any CSS `@page` size declared in the page priority over what is declared in `width` and `height` or `format` options. Defaults to `false`, which will scale the content to fit the paper size |

Since most of these options are forwarded to puppeteer, a more detailed description might be available at https://pptr.dev/api/puppeteer.pdfoptions.

**Response**

If the request was successful the response will be an HTTP attachment, i.e. a binary stream of the PDF data.

If one of the parameters was invalid the request will look something like:
```
{
    "success": false,
    "errors": [
        {
            "msg": "Must provide either url or html",
            "param": "url_html",
            "location": "body"
        }
    ]
}
```

## Demo Client Application

Go to https://html2pdf.fly.dev/html-js-client 

## Installation

Aside from the option to deploy this project via docker (to e.g. fly.io), the instruction below is meant for a none docker setup.

1. Clone the repo
```
git clone https://github.com/ideadapt/puppeteer-html-to-pdf-converter.git
```
2. Navigate in the project directory
```
cd puppeteer-html-to-pdf-converter
```
3. Install the npm dependencies
```
npm install
```
4. Copy the contents of [config-example.json](config-example.json) and place them in a new config.json
```
cp config-example.json config.json
```
5. Fill in the config.json with your configuration
6. Run the app
```
npm run start
```

## Implementation Details
This repo is based on https://github.com/fritsvt/puppeteer-html-to-pdf-converter.git. 

The following changes were applied:

- Containerize application. This allows running the whole application (including puppeteer) on any platform that has docker installed. \
  This is a major benefit, because properly installing puppeteer is cumbersome, depending on the platform.
- Changed response format from a temporary URL to a file download (binary stream). \
  This reduced the complexity and platform requirements on the server side, because the generated PDF files are not stored on the disk anymore.
- Bug fixes: Margin parameter validation fixes.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
This repo is based on https://github.com/fritsvt/puppeteer-html-to-pdf-converter.git .

[MIT](LICENSE)
