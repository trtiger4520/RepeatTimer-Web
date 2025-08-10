import { defineConfig, presetMini } from 'unocss'
import presetWebFonts from '@unocss/preset-web-fonts'

export default defineConfig({
    presets: [
        presetMini(),
        presetWebFonts({
            provider: 'google',
            fonts: {
                sans: 'Montserrat',
                mono: 'Google Sans Code',
            },
        }),
    ],
})