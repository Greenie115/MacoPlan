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
import { Skeleton } from '@/components/ui/skeleton'

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
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false)

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
    setCopiedBackupCodes(true)
    toast.success('Backup codes copied')
    setTimeout(() => setCopiedBackupCodes(false), 2000)
  }

  if (loading) {
    return (
      <div className={`bg-card rounded-2xl border border-border-strong p-6 space-y-4 ${className}`}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
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
        <div className="mb-6 p-4 bg-warning-50 dark:bg-warning-500/10 border border-warning-500/30 rounded-xl">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-warning-700 dark:text-warning-500">Save Your Backup Codes</p>
              <p className="text-sm text-warning-700/80 dark:text-muted-foreground">
                Store these codes in a safe place. You can use them to sign in if you lose access to your authenticator app.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {backupCodes.map((code, index) => (
              <code
                key={index}
                className="text-sm font-mono tabular-nums bg-card px-3 py-2 rounded-lg border border-warning-500/30"
              >
                {code}
              </code>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyBackupCodes}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 text-sm font-medium bg-card text-warning-700 dark:text-warning-500 border border-warning-500/30 rounded-xl hover:bg-warning-500/10 transition-colors duration-150"
            >
              {copiedBackupCodes ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedBackupCodes ? 'Copied' : 'Copy All Codes'}
            </button>
            <button
              onClick={() => setShowBackupCodes(false)}
              className="flex-1 py-2 px-4 text-sm font-semibold bg-coral-600 text-primary-foreground rounded-xl hover:bg-coral-700 hover:shadow-coral transition-all duration-150"
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
              <div className="inline-block p-4 bg-white rounded-xl border border-border-strong shadow-sm">
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
                  className="p-2 hover:bg-accent rounded-lg transition-colors duration-150"
                  aria-label="Copy secret key"
                >
                  {copiedSecret ? (
                    <Check className="w-4 h-4 text-success" />
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
              className="w-full px-4 py-3 text-center text-2xl font-mono tabular-nums tracking-widest border-2 border-border-strong rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-colors duration-150"
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
              className="flex-1 py-3 px-4 text-sm font-medium border border-border-strong rounded-xl hover:bg-accent transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyTOTP}
              disabled={actionLoading || verificationCode.length !== 6}
              className="flex-1 py-3 px-4 text-sm font-semibold text-primary-foreground bg-coral-600 rounded-xl hover:bg-coral-700 hover:shadow-coral disabled:opacity-50 disabled:hover:shadow-none transition-all duration-150"
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
                  className="px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 rounded-xl hover:bg-destructive/10 transition-colors duration-150 disabled:opacity-50"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={handleStartTOTPSetup}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-colors duration-150 disabled:opacity-50"
                >
                  Enable
                </button>
              )}
            </div>
            {status.methods.totp && status.backupCodesRemaining !== undefined && (
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground tabular-nums">
                  {status.backupCodesRemaining} backup codes remaining
                </span>
                <button
                  onClick={handleRegenerateBackupCodes}
                  disabled={actionLoading}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/90 transition-colors duration-150 disabled:opacity-50"
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
                  className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-colors duration-150 disabled:opacity-50"
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
