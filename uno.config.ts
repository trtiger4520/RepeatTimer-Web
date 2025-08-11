import { defineConfig, presetWind4 } from 'unocss'
import presetWebFonts from '@unocss/preset-web-fonts'

export default defineConfig({
    theme: {
        colors: {
            primary: 'var(--color-primary)',
            onPrimary: 'var(--color-on-primary)',
            surface: 'var(--color-surface)',
            onSurface: 'var(--color-on-surface)',
            surfaceVariant: 'var(--color-surface-variant)',
            onSurfaceVariant: 'var(--color-on-surface-variant)',
            outline: 'var(--color-outline)',
            error: 'var(--color-error)',
        },
    },
    shortcuts: {
        'card': 'bg-surfaceVariant/60 dark:bg-surfaceVariant/40 backdrop-blur-md border border-outline/30 rounded-xl shadow-lg',
        'btn-base': 'inline-flex items-center justify-center gap-1 font-medium rounded-lg px-4 py-2 text-sm tracking-wide transition-all focus:(outline-none ring-2 ring-primary/60)',
        'btn-primary': 'btn-base bg-primary text-onPrimary hover:bg-primary/90 active:translate-y-0.5 shadow shadow-primary/30',
        'btn-tonal': 'btn-base bg-surfaceVariant/70 hover:bg-surfaceVariant/90 border border-outline/30 text-onSurface active:translate-y-0.5',
        'btn-danger': 'btn-base bg-error text-onPrimary hover:bg-error/90 active:translate-y-0.5 shadow shadow-error/30',
    },
    presets: [
        presetWind4(),
        presetWebFonts({
            provider: 'google',
            fonts: {
                sans: 'Montserrat',
                mono: 'Google Sans Code',
            },
        }),
    ],
})