export const retro = {
    appSurface: 'bg-[#07140c] text-[#d7eddc]',
    page: 'mx-auto w-full max-w-[1360px] px-4 pb-12 pt-24 text-[#d7eddc] md:px-8',
    pageHeaderWrap: 'mb-5 border border-[#0e2a1b] bg-[#183827] p-[3px] shadow-[3px_3px_0_#020a06]',
    pageHeaderInner: 'border border-[#6bc38f] bg-[linear-gradient(180deg,#3d8b5f_0%,#2f6f4d_60%,#254f39_100%)] px-4 py-3',
    pageTitle: 'font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#05190f] md:text-base',
    pageSubtitle: 'mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#dce5c4]',

    section: 'border border-[#0f2d1d] bg-[#173824] p-[3px] shadow-[2px_2px_0_#020a06]',
    sectionInner: 'border border-[#76d69b] bg-[#1f4a32] p-4',
    panelTitle: 'mb-3 border-b border-dotted border-[#87cda4] pb-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#e5dcc0] md:text-sm',

    toolbar: 'mb-4 flex flex-col gap-2 md:flex-row',
    gridCards: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',

    badge: 'border border-[#0d2418] bg-[#0d281a] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#9effbf]',
    card: 'border border-[#0f2d1d] bg-[#0f2d1d] p-[2px] transition hover:translate-y-[-1px] hover:shadow-[2px_2px_0_#04140c]',
    cardInner: 'border border-[#4ea575] bg-[#143623] p-2',

    modalOverlay: 'rgba(4, 12, 8, 0.86)',
};

export const retroModalStyle = {
    content: {
        inset: '5% 7%',
        background: '#143623',
        border: '2px solid #0f2d1d',
        color: '#d7eddc',
        boxShadow: '0 0 0 2px #77d39a inset, 8px 8px 0 #020a06',
        padding: '1rem',
    },
    overlay: {
        backgroundColor: retro.modalOverlay,
        backdropFilter: 'blur(1px)',
    },
};
