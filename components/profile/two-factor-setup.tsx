'use client'

import { useState, useEffect } from 'react'
import { Shield, Smartphone, Mail, Copy, Check, AlertTriangle, RefreshCw } from 'lucide-react'
import QRCode from 'qrcode'
import {
  setupTOTP,
  verifyAndEnableTOTP,
  enableEmail2FA,
  disable2FA,
  get2FAStatus,
  regenerateBackupCodes,
} from '@/app/actions/two-factor'
import { toast } from 'sonner'

interface TwoFactorSetupProps {
  className?: string
}

export function TwoFactorSetup({ className }: TwoFactorSetupProps) {
  const [status, setStatus] = useState<{
    enabled: boolean
    methods: { totp: boolean; email: boolean }
    preferred: 'totp' | 'email' | null
    backupCodesRemaining?: number
  }>({
    enabled: false,
    methods: { totp: false, email: false },
    preferred: null,
  })
  const [loading, setLoading] = useState(true)
  const [setupMode, setSetupMode] = useState<'none' | 'totp' | 'email'>('none')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)

  // Fetch current 2FA status
  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    setLoading(true)
    const result = await get2FAStatus()
    setStatus(result)
    setLoading(false)
  }

  const handleStartTOTPSetup = async () => {
    setActionLoading(true)
    setError(null)

    const result = await setupTOTP()

    if (result.error) {
      setError(result.error)
      toast.error(result.error)
      setActionLoading(false)
      return
    }

    if (result.uri) {
      // Generate QR code
      const qr = await QRCode.toDataURL(result.uri)
      setQrCode(qr)
    }

    setSecret(result.secret || null)
    setSetupMode('totp')
    setActionLoading(false)
  }

  const handleVerifyTOTP = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setActionLoading(true)
    setError(null)

    const result = await verifyAndEnableTOTP(verificationCode)

    if (result.error) {
      setError(result.error)
      toast.error(result.error)
      setActionLoading(false)
      return
    }

    if (result.backupCodes) {
      setBackupCodes(result.backupCodes)
      setShowBackupCodes(true)
    }

    setSetupMode('none')
    setQrCode(null)
    setSecret(null)
    setVerificationCode('')
    await loadStatus()
    setActionLoading(false)
    toast.success('Authenticator app enabled successfully')
  }

  const handleEnableEmail2FA = async () => {
    setActionLoading(true)
    setError(null)

    const result = await enableEmail2FA()

    if (result.error) {
      setError(result.error)
      toast.error(result.error)
    } else {
      await loadStatus()
      toast.success('Email verification enabled successfully')
    }

    setActionLoading(false)
  }

  const handleDisable2FA = async (method: 'totp' | 'email') => {
    setActionLoading(true)
    setError(null)

    const result = await disable2FA(method)

    if (result.error) {
      setError(result.error)
      toast.error(result.error)
    } else {
      await loadStatus()
      toast.success(method === 'totp' ? 'Authenticator app disabled' : 'Email verification disabled')
    }

    setActionLoading(false)
  }

  const handleRegenerateBackupCodes = async () => {
    setActionLoading(true)
    setError(null)

    const result = await regenerateBackupCodes()

    if (result.error) {
      setError(result.error)
      toast.error(result.error)
    } else if (result.backupCodes) {
      setBackupCodes(result.backupCodes)
      setShowBackupCodes(true)
      toast.success('Backup codes regenerated')
    }

    setActionLoading(false)
  }

  const copySecret = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret)
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  const copyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'))
  }

  if (loading) {
    return (
      <div className={`bg-card rounded-2xl border border-border-strong p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-card rounded-2xl border border-border-strong p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security to your account
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Backup Codes Modal */}
      {showBackupCodes && backupCodes.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Save Your Backup Codes</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Store these codes in a safe place. You can use them to sign in if you lose access to your authenticator app.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {backupCodes.map((code, index) => (
              <code
                key={index}
                className="text-sm font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded border border-amber-200 dark:border-amber-800"
              >
                {code}
              </code>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyBackupCodes}
              className="flex-1 py-2 px-4 text-sm font-medium bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-100 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
            >
              Copy All Codes
            </button>
            <button
              onClick={() => setShowBackupCodes(false)}
              className="flex-1 py-2 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              I&apos;ve Saved Them
            </button>
          </div>
        </div>
      )}

      {/* TOTP Setup Mode */}
      {setupMode === 'totp' && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Scan this QR code with your authenticator app
            </p>
            {qrCode && (
              <div className="inline-block p-4 bg-white rounded-xl">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            )}
          </div>

          {secret && (
            <div className="p-3 bg-muted rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">
                Can&apos;t scan? Enter this code manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono break-all">{secret}</code>
                <button
                  onClick={copySecret}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  {copiedSecret ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Enter the 6-digit code from your app
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-border-strong rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setSetupMode('none')
                setQrCode(null)
                setSecret(null)
                setVerificationCode('')
              }}
              className="flex-1 py-3 px-4 text-sm font-medium border border-border-strong rounded-xl hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyTOTP}
              disabled={actionLoading || verificationCode.length !== 6}
              className="flex-1 py-3 px-4 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>
        </div>
      )}

      {/* Normal View - 2FA Options */}
      {setupMode === 'none' && (
        <div className="space-y-4">
          {/* Authenticator App Option */}
          <div className="p-4 border border-border rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Authenticator App</p>
                  <p className="text-sm text-muted-foreground">
                    Use an app like Google Authenticator
                  </p>
                </div>
              </div>
              {status.methods.totp ? (
                <button
                  onClick={() => handleDisable2FA('totp')}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 rounded-xl hover:bg-destructive/10 transition-colors"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={handleStartTOTPSetup}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-colors"
                >
                  Enable
                </button>
              )}
            </div>
            {status.methods.totp && status.backupCodesRemaining !== undefined && (
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {status.backupCodesRemaining} backup codes remaining
                </span>
                <button
                  onClick={handleRegenerateBackupCodes}
                  disabled={actionLoading}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/90"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              </div>
            )}
          </div>

          {/* Email Option */}
          <div className="p-4 border border-border rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Email Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Receive a code via email when signing in
                  </p>
                </div>
              </div>
              {status.methods.email ? (
                <button
                  onClick={() => handleDisable2FA('email')}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 rounded-xl hover:bg-destructive/10 transition-colors"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={handleEnableEmail2FA}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-colors"
                >
                  Enable
                </button>
              )}
            </div>
          </div>

                  </div>
      )}
    </div>
  )
}
