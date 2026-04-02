const nextConfig = {
    turbopack: {
        root: __dirname,
    },
    assetPrefix: process.env.ASSET_PREFIX || undefined,
    transpilePackages: ['lucide-react'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com', // Google User Images
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'profile.line-scdn.net', // LINE User Images
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
                port: '',
                pathname: '/**',
            }
        ],
    },
}

module.exports = nextConfig
