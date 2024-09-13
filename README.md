# HTML to PDF converter HTTP API

This is a cloud ready HTML to PDF converter application running inside docker accessible via an HTTP API.

## HTT API Usage

### `POST /api/generate`

The number of requests (per client or globally) can be limited, see the configuration section for more details.

**Request Parameters**

Following parameters are supported. Send them as form-data form-urlencoded or as raw json.

| Parameter             | Type      | Description                                                                                                                                                                                                      |
|:----------------------|:----------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                 | `string`  | **Required if no html**. The url of the webpage to convert to PDF                                                                                                                                                |
| `html`                | `string`  | **Required if no url**. The html to convert to PDF. String length is by default limited to 1 mega byte.                                                                                                          |
| `filename`            | `string`  | **Optional**. The name of generated PDF file in the download response, without extension. Defaults to `generated-file`.                                                                                          |
| `scale`               | `string`  | **Optional**. Scale of the webpage rendering. Scale amount must be between 0.1 and 2. Defaults to 1.                                                                                                             |
| `displayHeaderFooter` | `boolean` | **Optional**. Display header and footer. Defaults to `false `                                                                                                                                                    |
| `headerTemplate`      | `string`  | **Optional**. HTML template for the print header. Should be valid HTML markup with following classes used to inject printing values into them: `date`, `title`, `url`, `pageNumber`, `totalPages`                |
| `footerTemplate`      | `string`  | **Optional**. HTML template for the print footer. Should use the same format as the `headerTemplate`                                                                                                             |
| `printBackground`     | `boolean` | **Optional**. Print background graphics. Defaults to `false`                                                                                                                                                     |
| `landscape`           | `boolean` | **Optional**. Paper orientation. Defaults to `false`                                                                                                                                                             |
| `pageRanges`          | `string`  | **Optional**. Paper ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means print all pages                                                                                            |
| `format`              | `string`  | **Optional**. Paper format. If set, takes priority over width or height options. Defaults to 'A4'                                                                                                                |
| `width`               | `integer` | **Optional**. Paper width, accepts values labeled with units                                                                                                                                                     |
| `height`              | `integer` | **Optional**. Paper height, accepts values labeled with units                                                                                                                                                    |
| `margin.top`          | `integer` | **Optional**. Top margin, accepts values labeled with units. Defaults to `0`                                                                                                                                     |
| `margin.right`        | `integer` | **Optional**. Right margin, accepts values labeled with units. Defaults to `0`                                                                                                                                   |
| `margin.bottom`       | `integer` | **Optional**. Bottom margin, accepts values labeled with units. Defaults to `0`                                                                                                                                  |
| `margin.left`         | `integer` | **Optional**. Left margin, accepts values labeled with units. Defaults to `0`                                                                                                                                    |
| `preferCSSPageSize`   | `boolean` | **Optional**. Give any CSS `@page` size declared in the page priority over what is declared in `width` and `height` or `format` options. Defaults to `false`, which will scale the content to fit the paper size |
| `waitUntil`           | `string`  | **Optional**. Parameter to consider waiting succeeds when page is loading. Should be 'load', 'domcontentloaded', 'networkidle0' or 'networkidle2'. Default to 'networkidle0';                                    |
| `scrollPage`          | `boolean` | **Optional**. Make the browser wait until network idle, then scroll to bottom and finally wait again for network idle. Defaults to false.                                                                        |
| `viewportDimensions`  | `string`  | **Optional**. Viewport width and height (eg 800x400) in px                                                                                                                                                       |

Since most of these options are forwarded to puppeteer, a more detailed description might be available
at https://www.jsdocs.io/package/puppeteer-core/v/13.7.0#PDFOptions.

**Response**

If the request was successful the response will be an HTTP attachment, i.e. a binary stream of the PDF data.

If one of the parameters was invalid the response will look something like:

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

Go to https://html2pdf.fly.dev

## Installation

1. Clone the repo

```
git clone https://github.com/ideadapt/puppeteer-html-to-pdf-converter.git
```

2. Navigate in the project directory

```
cd puppeteer-html-to-pdf-converter
```

3. Copy the contents of [config-example.json](config-example.json) and place them in a new config.json

```
cp config-example.json config.json
```

4. Fill in the config.json with your configuration

### Non Docker

5. Install the npm dependencies

```
npm install
```

6. Run the app

```
npm run start
```

### Docker

5. Build the docker image

```
npm run docker:image
```

6. Run the app inside a docker container

```
docker run -i --init --rm --cap-add=SYS_ADMIN --name html2pdf -p 3000:3000 ideadapt/puppeteer-html-to-pdf-converter:1.0.15 node src/index.js
```

## Configuration

Config is read from a `config.json` file in the root folder of the project.

| Parameter                        | Description                                                                                                                                                                                                                 | Required                                                                                                          | Examples |
|:---------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------|:--------|
| `PORT`                           | The port the server will listen to.                                                                                                                                                                                         | Yes                                                                                                               | 3000    |
| `BODY_MAX_LENGTH`                | Max length of request body.                                                                                                                                                                                                 | No                                                                                                                | "250kb" |
| `RATE_LIMIT_WINDOW_MS`           | Time window for rate limiting.                                                                                                                                                                                              | Required if `RATE_LIMIT_REJECT_AFTER` or `RATE_LIMIT_DELAY_AFTER` or `RATE_LIMIT_GLOBAL_REJECT_AFTER` are defined | 5000    |
| `RATE_LIMIT_REJECT_AFTER`        | Number of requests to process during the time window. Additional requests will be rejected (HTTP 429 Too Many Requests).                                                                                                    | No                                                                                                                | 10      |
| `RATE_LIMIT_DELAY_AFTER`         | Number of requests to process during the time window. Additional requests will be delayed. Ignored if `RATE_LIMIT_REJECT_AFTER` is defined.                                                                                 | No                                                                                                                | 10      |
| `RATE_LIMIT_DELAY_MS`            | Delay to apply to requests above the `RATE_LIMIT_DELAY_AFTER` threshold.                                                                                                                                                    | Required if 'RATE_LIMIT_DELAY_AFTER' is defined                                                                   | 1000    |
| `RATE_LIMIT_GLOBAL_REJECT_AFTER` | Previous rate limit settings are applied per user (based on IP). If defined, this setting will define a global rate limit for all users. Can be combined either with `RATE_LIMIT_REJECT_AFTER` or `RATE_LIMIT_DELAY_AFTER`. | No                                                                                                                | 100     |
| `TRUST_PROXY`                    | Set it to true if the server is behind a proxy.                                                                                                                                                                             | No                                                                                                                | true    |
| `URL_ALLOWLIST`                  | A list of authorized URLs. If this config is defined : 1) "url" values provided in the body should start whith one of the url in the allowlist, 2) "html" content provided in the body is rejected                          | No       | "https://domaineone.com,https://domainetwo.com" |


A list of authorized URLs can be provided in the `URL_ALLOWLIST` parameter. If this parameter is not provided, all URLs are authorized.


Example `config.json`:

```json
{
  "PORT": 3000,
  "BODY_MAX_LENGTH": "2mb",
  "RATE_LIMIT_WINDOW_MS": 5000,
  "RATE_LIMIT_DELAY_AFTER": 10,
  "RATE_LIMIT_DELAY_MS": 1000,
  "RATE_LIMIT_GLOBAL_REJECT_AFTER": 100,
  "TRUST_PROXY": true,
  "URL_ALLOWLIST": "https://domaineone.com,https://domainetwo.com"
}
```

## Implementation Details

This repo is based on https://github.com/fritsvt/puppeteer-html-to-pdf-converter.git.

The following changes were applied:

- Containerize application. This allows running the whole application (including puppeteer) on any platform that has
  docker installed. \
  This is a major benefit, because properly installing puppeteer is cumbersome, depending on the platform.
- Changed response format from a temporary URL to a file download (binary stream). \
  This reduced the complexity and platform requirements on the server side, because the generated PDF files are not
  stored on the disk anymore.
- Make request body size limit configurable.
- Bug fixes: Margin parameter validation fixes. Errors are returned as JSON, not plain text.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This repo is based on https://github.com/fritsvt/puppeteer-html-to-pdf-converter.git .

[MIT](LICENSE)
