import render from "svalit/prerender.mjs"
import RenderPage from "../src/index.mjs"
import RenderThread from "svalit"
import {readFileSync} from "fs"
import {html} from "lit"

import '../components/app-page.mjs'

const RenderPageThread = RenderPage(RenderThread)

const dev = process.env.VERCEL_ENV === 'development', options = {
    dev,
    shim: true,
    importMapOptions: {
        cache: dev,
        ignore: ['mongodb'],
        inputMap: {
            imports: {
                "#root/": "/",
                "#lib/": "/lib/",
                "#utils": "/lib/utils.mjs",
                "#db": "/lib/db/client.mjs",
            }
        }
    },
    imports: ['/components/app-page.mjs'],
    content: {head: readFileSync(new URL('../includes/head.html', import.meta.url))}
}, template = ({meta: {url, setMeta}}) => html`
    <app-page url="${url}" .setMeta="${setMeta}"></app-page>`

const result = await render({
    renderOptions: {...options, meta: {title: 'LCMS'}},
    publicDir: new URL('../.vercel/output/static/', import.meta.url),
    renderClass: RenderPageThread,
    template
})

console.debug('Complete build', result.length, 'routes')
process.exit()
