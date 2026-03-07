'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '../../../lib/api'
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function VerifyEmailClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const emailFromUrl = searchParams.get('email')
  const [email, setEmail] = useState('')

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl)
      localStorage.setItem('verificationEmail', emailFromUrl)
    } else {
      const savedEmail = localStorage.getItem('verificationEmail')
      if (savedEmail) setEmail(savedEmail)
    }
  }, [emailFromUrl])

  useEffect(() => {
    if (!email && !loading && !success) {
      const timer = setTimeout(() => {
        router.push('/register')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [email, router, loading, success])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const verificationCode = code.join('')

    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    if (!email) {
      setError('Email is missing. Redirecting to register...')
      setTimeout(() => router.push('/register'), 2000)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authApi.verifyEmail(email, verificationCode)

      if (response.success) {
        setSuccess(true)

        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.removeItem('verificationEmail')

        setTimeout(() => {
          router.push('/upscale')
        }, 2000)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Email is missing. Please register again.')
      setTimeout(() => router.push('/register'), 2000)
      return
    }

    setResendLoading(true)
    setResendSuccess(false)
    setError('')

    try {
      await authApi.resendVerification(email)
      setResendSuccess(true)
      setCountdown(60)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to resend code')
    } finally {
      setResendLoading(false)
    }
  }

  if (!email && !loading && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl border border-gray-200 rounded-2xl sm:px-10 text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Missing</h2>
            <p className="text-gray-600 mb-6">
              No email address found. Redirecting to registration...
            </p>
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl border border-gray-200 rounded-2xl sm:px-10 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. Redirecting you...
            </p>
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <EnvelopeIcon className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We&apos;ve sent a 6-digit code to{' '}
          <strong className="text-blue-600">{email}</strong>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-200 rounded-2xl sm:px-10">

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-600 text-sm">
                New code sent! Check your email.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter verification code
              </label>

              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleCodeChange(index, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    placeholder="0"
                    title={`Digit ${index + 1}`}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700">
              Didn&apos;t receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resendLoading || countdown > 0}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <span className="flex items-center gap-1 text-gray-700">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Sending...
                  </span>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  'Resend code'
                )}
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}