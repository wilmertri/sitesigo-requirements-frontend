import { unref } from 'vue'

const DEFAULT = {
    light: { bg: '#f3f4f6', color: '#6b7280' },
    dark:  { bg: '#1e293b', color: '#94a3b8' },
}

const ESTADO_MAP = {
    nuevo:         { label: 'Nuevo',         light: { bg: '#dbeafe', color: '#1e40af' }, dark: { bg: '#1e3a5f', color: '#93c5fd' } },
    en_analisis:   { label: 'En análisis',   light: { bg: '#fef9c3', color: '#854d0e' }, dark: { bg: '#713f12', color: '#fde047' } },
    en_desarrollo: { label: 'En desarrollo', light: { bg: '#ffedd5', color: '#9a3412' }, dark: { bg: '#7c2d12', color: '#fdba74' } },
    resuelto:      { label: 'Resuelto',      light: { bg: '#dcfce7', color: '#166534' }, dark: { bg: '#14532d', color: '#86efac' } },
    cerrado:       { label: 'Cerrado',       light: { bg: '#f3f4f6', color: '#6b7280' }, dark: { bg: '#1e293b', color: '#94a3b8' } },
    rechazado:     { label: 'Rechazado',     light: { bg: '#fee2e2', color: '#991b1b' }, dark: { bg: '#7f1d1d', color: '#fca5a5' } },
    archivado:     { label: 'Archivado',     light: { bg: '#d1d5db', color: '#374151' }, dark: { bg: '#1e293b', color: '#64748b' } },
}

const PRIORIDAD_MAP = {
    alta:  { label: 'Alta',  light: { bg: '#fee2e2', color: '#991b1b' }, dark: { bg: '#7f1d1d', color: '#fca5a5' } },
    media: { label: 'Media', light: { bg: '#fef9c3', color: '#854d0e' }, dark: { bg: '#713f12', color: '#fde047' } },
    baja:  { label: 'Baja',  light: { bg: '#dcfce7', color: '#166534' }, dark: { bg: '#14532d', color: '#86efac' } },
}

function norm(v) { return (v ?? '').toLowerCase().replace(/\s+/g, '_') }

export function useBadges(isDarkRef = null) {
    const dark = () => unref(isDarkRef) === true

    const estadoLabel    = v => ESTADO_MAP[norm(v)]?.label ?? v
    const estadoStyle    = v => {
        const map = ESTADO_MAP[norm(v)]
        const m   = dark() ? (map?.dark ?? DEFAULT.dark) : (map?.light ?? DEFAULT.light)
        return `background:${m.bg};color:${m.color}`
    }
    const prioridadLabel = v => PRIORIDAD_MAP[norm(v)]?.label ?? v
    const prioridadStyle = v => {
        const map = PRIORIDAD_MAP[norm(v)]
        const m   = dark() ? (map?.dark ?? DEFAULT.dark) : (map?.light ?? DEFAULT.light)
        return `background:${m.bg};color:${m.color}`
    }

    return { estadoLabel, estadoStyle, prioridadLabel, prioridadStyle }
}
