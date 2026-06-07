const DEFAULT = { bg: '#f3f4f6', color: '#6b7280' }

const ESTADO_MAP = {
    nuevo:         { label: 'Nuevo',         bg: '#dbeafe', color: '#1e40af' },
    en_analisis:   { label: 'En análisis',   bg: '#fef9c3', color: '#854d0e' },
    en_desarrollo: { label: 'En desarrollo', bg: '#ffedd5', color: '#9a3412' },
    resuelto:      { label: 'Resuelto',      bg: '#dcfce7', color: '#166534' },
    cerrado:       { label: 'Cerrado',       bg: '#f3f4f6', color: '#6b7280' },
    rechazado:     { label: 'Rechazado',     bg: '#fee2e2', color: '#991b1b' },
    archivado:     { label: 'Archivado',     bg: '#d1d5db', color: '#374151' },
}

const PRIORIDAD_MAP = {
    alta:  { label: 'Alta',  bg: '#fee2e2', color: '#991b1b' },
    media: { label: 'Media', bg: '#fef9c3', color: '#854d0e' },
    baja:  { label: 'Baja',  bg: '#dcfce7', color: '#166534' },
}

function norm(v) { return (v ?? '').toLowerCase().replace(/\s+/g, '_') }

export function useBadges() {
    const estadoLabel  = v => ESTADO_MAP[norm(v)]?.label ?? v
    const estadoStyle  = v => { const e = ESTADO_MAP[norm(v)] ?? DEFAULT; return `background:${e.bg};color:${e.color}` }
    const prioridadLabel = v => PRIORIDAD_MAP[norm(v)]?.label ?? v
    const prioridadStyle = v => { const p = PRIORIDAD_MAP[norm(v)] ?? DEFAULT; return `background:${p.bg};color:${p.color}` }
    return { estadoLabel, estadoStyle, prioridadLabel, prioridadStyle }
}
