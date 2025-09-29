/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                has: [
                    {
                        type: 'cookie',
                        key: 'shouldCache',
                        value: 'true',
                    },
                ],
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'max-age=60',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
