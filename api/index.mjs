import {template, options} from "../src/template.mjs"
import {errorHandler} from "#lib/errorHandler.mjs"
import RenderStream from "@svalit/vercel"
import RenderPage from "../src/index.mjs"

const RenderPageStream = RenderPage(RenderStream)

export default (req, res) => {
    try {
        const url = `${req.headers['x-forwarded-proto'].split(',').shift()}://${req.headers['x-forwarded-host']}${req.url}`
        const page = new RenderPageStream({...options, req, res, meta: {title: 'LCMS', url}})
        return page.renderTemplate(template)
    } catch (e) {
        return errorHandler(e, res)
    }
}
