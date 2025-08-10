import { ViteSSG } from 'vite-ssg/single-page'

import '@unocss/reset/sanitize/sanitize.css'
import '@unocss/reset/sanitize/assets.css'
import 'virtual:uno.css'
import './style.css'

import App from './App.vue'

export const createApp = ViteSSG(App);