import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()
    const requestUrl = new URL(request.url)

    // 1. Generate the Auth Link manually using the Admin API without sending an email via Supabase
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        // Redirection callback pointing to our verify endpoint
        redirectTo: `${requestUrl.origin}/api/auth/verify`,
      }
    })

    if (linkError) {
      return NextResponse.json(
        { error: linkError.message },
        { status: 400 }
      )
    }

    // Capture the generated link
    const magicLink = linkData.properties.action_link

    // 2. Send the email using Resend
    const { error: resendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Magic Login Link',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; color: #333;">
          <h1 style="color: #111;">Welcome!</h1>
          <p>Click the secure link below to log in to your account. This link will expire in 10 minutes.</p>
          <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #6366F1; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;">
            Securely Sign In
          </a>
          <br /><br />
          <p style="font-size: 12px; color: #888;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    })

    if (resendError) {
      return NextResponse.json(
        { error: resendError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Check your email for the magic link' }, 
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

