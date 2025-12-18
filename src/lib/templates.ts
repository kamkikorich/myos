import { FlowNode, NodeType } from '../types/index'

export interface ProjectTemplate {
    id: string
    title: string
    description: string
    icon: string
    color: string
    defaultTitle: string
    defaultSummary: string
    nodes: Array<{
        type: NodeType
        content: string
    }>
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
    {
        id: 'game-app',
        title: 'App Game',
        description: 'Buat aplikasi permainan interaktif',
        icon: '🎮',
        color: '#8b5cf6',
        defaultTitle: 'App Permainan Saya',
        defaultSummary: 'Aplikasi permainan interaktif yang menyeronokkan',
        nodes: [
            { type: 'title', content: 'App Permainan - Nama Game Anda' },
            { type: 'planning', content: 'Fasa 1: Design UI\nFasa 2: Logic permainan\nFasa 3: Sound & animasi' },
            { type: 'feature', content: 'Paparan skor\nLevel permainan\nLeaderboard' },
            { type: 'idea', content: 'Tambah bunyi bila menang\nAnimasi confetti\nShare skor ke social media' },
            { type: 'technical', content: 'React/Next.js\nCanvas untuk grafik\nLocal storage untuk skor' },
        ]
    },
    {
        id: 'mobile-app',
        title: 'App Mobile',
        description: 'Buat aplikasi telefon pintar',
        icon: '📱',
        color: '#3b82f6',
        defaultTitle: 'App Mobile Saya',
        defaultSummary: 'Aplikasi mobile untuk menyelesaikan masalah sehari-hari',
        nodes: [
            { type: 'title', content: 'App Mobile - Nama App Anda' },
            { type: 'planning', content: 'Fasa 1: Wireframe\nFasa 2: UI Design\nFasa 3: Development\nFasa 4: Testing' },
            { type: 'feature', content: 'Login pengguna\nDashboard\nNotifikasi\nProfil pengguna' },
            { type: 'technical', content: 'React Native / Flutter\nFirebase Backend\nPush Notifications' },
            { type: 'api', content: 'Auth API\nUser API\nData API' },
            { type: 'database', content: 'Users collection\nData collection\nSettings collection' },
        ]
    },
    {
        id: 'school-website',
        title: 'Website Sekolah',
        description: 'Buat laman web untuk sekolah',
        icon: '🏫',
        color: '#10b981',
        defaultTitle: 'Website Sekolah Saya',
        defaultSummary: 'Laman web rasmi sekolah dengan maklumat lengkap',
        nodes: [
            { type: 'title', content: 'Website Sekolah - Nama Sekolah' },
            { type: 'planning', content: 'Halaman utama\nTentang kami\nGaleri\nHubungi kami\nBerita' },
            { type: 'feature', content: 'Slider gambar\nKalender aktiviti\nPendaftaran online\nGaleri foto' },
            { type: 'idea', content: 'Portal pelajar\nSistem kehadiran\nPaparan keputusan peperiksaan' },
            { type: 'technical', content: 'Next.js\nTailwind CSS\nFirebase/Supabase' },
        ]
    },
    {
        id: 'online-store',
        title: 'Kedai Online',
        description: 'Buat platform e-commerce',
        icon: '🛒',
        color: '#f59e0b',
        defaultTitle: 'Kedai Online Saya',
        defaultSummary: 'Platform jual beli online yang lengkap',
        nodes: [
            { type: 'title', content: 'Kedai Online - Nama Kedai' },
            { type: 'planning', content: 'Katalog produk\nKeranjang belanja\nCheckout\nPembayaran\nPenghantaran' },
            { type: 'feature', content: 'Carian produk\nFilter kategori\nWishlist\nReview produk' },
            { type: 'idea', content: 'Diskaun otomatik\nProgram kesetiaan\nLive chat support' },
            { type: 'api', content: 'Product API\nOrder API\nPayment Gateway\nShipping API' },
            { type: 'database', content: 'Products\nOrders\nUsers\nReviews\nCategories' },
        ]
    },
    {
        id: 'learning-app',
        title: 'App Pembelajaran',
        description: 'Buat aplikasi untuk belajar',
        icon: '📚',
        color: '#ec4899',
        defaultTitle: 'App Pembelajaran Saya',
        defaultSummary: 'Aplikasi interaktif untuk membantu pembelajaran',
        nodes: [
            { type: 'title', content: 'App Pembelajaran - Subjek' },
            { type: 'planning', content: 'Modul pembelajaran\nKuiz interaktif\nProgress tracking\nLencana pencapaian' },
            { type: 'feature', content: 'Video pembelajaran\nLatihan interaktif\nNota digital\nFlashcards' },
            { type: 'idea', content: 'AI tutor\nGamifikasi\nKompetisi mingguan\nCertificate' },
            { type: 'technical', content: 'React/Next.js\nVideo streaming\nProgress database' },
        ]
    },
    {
        id: 'blank',
        title: 'Projek Kosong',
        description: 'Mula dari awal',
        icon: '✨',
        color: '#64748b',
        defaultTitle: '',
        defaultSummary: '',
        nodes: []
    }
]
