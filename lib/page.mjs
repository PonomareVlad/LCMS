import {render} from "@lit-labs/ssr/lib/render-with-global-dom-shim.js"
import {readableFrom} from "@lit-labs/ssr/lib/readable.js"
import EventEmitter from "events"
import {readFileSync} from "fs"
import {html} from "lit"
import {db} from "#db"

import '../components/app-page.mjs'

const readFile = path => readFileSync(new URL(path, import.meta.url))

const head = readFile('../includes/head.html')
const footer = readFile('../includes/footer.html')
const importMap = `<script type="importmap">${readFile('../includes/importmap.json')}</script>`
const titleTemplate = (title = 'LCMS') => `<title>${title}</title>`
const headTemplate = title => `<!doctype html><html lang="ru"><head>${head}${importMap}${titleTemplate(title)}</head><body>`

const template = ({url, setMeta}) => html`
    <app-page url="${url}" .setMeta="${setMeta}"></app-page>`

export async function createRenderThread(req, res) {
    const chunks = [];
    const renderEvents = new EventEmitter();
    const url = `${req.headers['x-forwarded-proto'].split(',').shift()}://${req.headers['x-forwarded-host']}${req.url}`

    renderEvents.once('meta', ({title}) => chunks.unshift(Buffer.from(headTemplate(title))))

    globalThis.renderInfo = {
        customElementHostStack: [],
        customElementInstanceStack: []
    }

    const setMeta = data => renderEvents.emit('meta', data);

    const stream = readableFrom(render(template({url, setMeta}), globalThis.renderInfo), true)

    stream.on('end', () => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Disposition', 'inline');
        renderEvents.emit('meta', {})
        res.write(Buffer.concat(chunks))
        res.end(`<script>window.cache=${db.exportCache()}</script>${footer}</body></html>`)
    })

    for await (let chunk of stream) chunks.push(Buffer.from(chunk))
}