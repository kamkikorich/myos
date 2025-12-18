import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()
        const correctPassword = process.env.APP_PASSWORD

        if (!correctPassword) {
            return NextResponse.json(
                { error: 'Password tidak dikonfigurasi' },
                { status: 500 }
            )
        }

        if (password === correctPassword) {
            // Set auth cookie (valid for 7 days)
            const cookieStore = await cookies()
            cookieStore.set('auth-token', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/'
            })

            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json(
                { error: 'Password salah' },
                { status: 401 }
            )
        }
    } catch {
        return NextResponse.json(
            { error: 'Ralat berlaku' },
            { status: 500 }
        )
    }
}
