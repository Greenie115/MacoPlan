'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserProfile, UserProfileUpdate } from '@/lib/types/database'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { ProfileFormSection } from '@/components/profile/profile-form-section'
import { MacroWarningModal } from '@/components/profile/macro-warning-modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { updateProfileField, updateEmail, recalculateMacros } from '@/app/actions/profile'
import { toast } from 'sonner'
import { ArrowLeft, Check, Loader2, Mail, Calculator } from 'lucide-react'
import { debounce } from '@/lib/utils/debounce'
import { BottomNav } from '@/components/layout/bottom-nav'

// Spacing between labels and inputs - adjust this value to change all label margins
const LABEL_SPACING = 'mb-3'

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingFields, setSavingFields] = useState<Record<string, boolean>>({})
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({})
  const [showMacroWarning, setShowMacroWarning] = useState(false)
  const [useImperial, setUseImperial] = useState(true)
  const [recalculating, setRecalculating] = useState(false)

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      try {
        // Get user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        setUserEmail(user.email || '')

        // Get profile
        const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single()

        if (error) {
          // PGRST116 = no rows returned (user has no profile)
          if (error.code === 'PGRST116') {
            router.push('/onboarding/1')
            return
          }
          toast.error('Failed to load profile')
          return
        }

        setProfile(data)
        // Initialize measurement system from profile
        if (data.measurement_system) {
          setUseImperial(data.measurement_system === 'imperial')
        }
      } catch (error) {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase, router])

  // Auto-save field handler with debounce
  const handleFieldUpdate = debounce(async (field: keyof UserProfileUpdate, value: any) => {
    if (!profile) return

    setSavingFields((prev) => ({ ...prev, [field]: true }))
    setSavedFields((prev) => ({ ...prev, [field]: false }))

    try {
      const result = await updateProfileField(field, value)

      if (result.error) {
        toast.error(result.error)
      } else {
        // Show saved indicator
        setSavedFields((prev) => ({ ...prev, [field]: true }))

        // Hide saved indicator after 2 seconds
        setTimeout(() => {
          setSavedFields((prev) => ({ ...prev, [field]: false }))
        }, 2000)

        // Check if field affects macros
        const macroAffectingFields = ['weight_kg', 'height_cm', 'age', 'activity_level', 'goal']
        if (macroAffectingFields.includes(field as string)) {
          setShowMacroWarning(true)
        }
      }
    } catch (error) {
      toast.error('Failed to save changes')
    } finally {
      setSavingFields((prev) => ({ ...prev, [field]: false }))
    }
  }, 500)

  // Handle email update
  const handleEmailUpdate = async () => {
    const newEmail = (document.getElementById('email') as HTMLInputElement)?.value
    if (!newEmail || newEmail === userEmail) return

    setSavingFields((prev) => ({ ...prev, email: true }))

    try {
      const result = await updateEmail(newEmail)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.message || 'Email update initiated')
      }
    } catch (error) {
      toast.error('Failed to update email')
    } finally {
      setSavingFields((prev) => ({ ...prev, email: false }))
    }
  }

  // Handle macro recalculation
  const handleRecalculateMacros = async () => {
    setRecalculating(true)

    try {
      const result = await recalculateMacros()

      if (result.error) {
        toast.error(result.error)
      } else if (result.macros) {
        toast.success('Macros recalculated successfully!')
        // Reload profile
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single()
          if (data) setProfile(data)
        }
      }
    } catch (error) {
      toast.error('Failed to recalculate macros')
    } finally {
      setRecalculating(false)
    }
  }

  // Weight conversion helpers
  const kgToLbs = (kg: number) => (kg * 2.20462).toFixed(1)
  const lbsToKg = (lbs: number) => lbs / 2.20462

  // Height conversion helpers
  const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return { feet, inches }
  }
  const feetInchesToCm = (feet: number, inches: number) => {
    return Math.round((feet * 12 + inches) * 2.54)
  }

  // Field status indicator
  const FieldStatus = ({ field }: { field: string }) => {
    if (savingFields[field]) {
      return (
        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving
        </span>
      )
    }
    if (savedFields[field]) {
      return (
        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-xs font-medium text-success">
          <Check className="h-3 w-3" />
          Saved
        </span>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <BottomNav activeTab="profile" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <main className="max-w-3xl mx-auto p-4">
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowLeft className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Complete Your Profile</h2>
              <p className="text-muted-foreground max-w-md">
                You need to complete the onboarding process before you can edit your profile.
              </p>
            </div>
            <button
              onClick={() => router.push('/onboarding/1')}
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Go to Onboarding
            </button>
          </div>
        </main>
        <BottomNav activeTab="profile" />
      </div>
    )
  }

  const userInitials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Profile
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Edit Profile</h1>
          <p className="text-base text-muted-foreground mt-2">Update your personal information and preferences</p>
        </div>

        {/* Recalculate Macros Button */}
        <div className="px-4 pb-2">
          <button
            onClick={handleRecalculateMacros}
            disabled={recalculating}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calculator className="h-5 w-5" />
            {recalculating ? 'Recalculating...' : 'Recalculate Macros'}
          </button>
        </div>

        <div className="px-4 pt-2"><div className="h-px bg-border-strong w-full"></div></div>

      <div className="space-y-6 pb-6">
        {/* Profile Picture */}
        <ProfileFormSection title="Profile Picture" description="Upload a photo to personalize your account">
          <AvatarUpload
            currentAvatarUrl={profile.avatar_url}
            userInitials={userInitials}
            onUploadComplete={(url) => {
              setProfile({ ...profile, avatar_url: url })
            }}
            onDeleteComplete={() => {
              setProfile({ ...profile, avatar_url: null })
            }}
          />
        </ProfileFormSection>

        {/* Basic Information */}
        <ProfileFormSection title="Basic Information" description="Your name and email address">
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name" className={`flex items-center ${LABEL_SPACING}`}>
                Full Name
                <FieldStatus field="full_name" />
              </Label>
              <Input
                id="full_name"
                defaultValue={profile.full_name || ''}
                onBlur={(e) => {
                  const value = e.target.value
                  if (value !== profile.full_name) {
                    handleFieldUpdate('full_name', value)
                  }
                }}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email" className={`flex items-center gap-2 ${LABEL_SPACING}`}>
                Email
                <FieldStatus field="email" />
              </Label>
              <div className="flex gap-2">
                <Input id="email" type="email" defaultValue={userEmail} placeholder="your@email.com" className="flex-1" />
                <button
                  onClick={handleEmailUpdate}
                  disabled={savingFields.email}
                  className="px-4 h-10 rounded-xl border-2 border-primary/20 bg-primary/5 text-primary font-bold hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update
                </button>
              </div>
              <div className="flex items-start gap-2 mt-2 p-2 bg-info-50 border border-info-500/20 rounded-lg">
                <Mail className="h-4 w-4 text-info-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-info-700">
                  You'll receive a confirmation email to verify the change
                </p>
              </div>
            </div>
          </div>
        </ProfileFormSection>

        {/* Personal Stats */}
        <ProfileFormSection
          title="Personal Stats"
          description="Your physical measurements used for macro calculations"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Measurement System</Label>
              <div className="flex items-center gap-2">
                <span className={!useImperial ? 'font-semibold' : 'text-muted-foreground'}>Metric</span>
                <Switch
                  checked={useImperial}
                  onCheckedChange={(checked) => {
                    setUseImperial(checked)
                    handleFieldUpdate('measurement_system', checked ? 'imperial' : 'metric')
                  }}
                />
                <span className={useImperial ? 'font-semibold' : 'text-muted-foreground'}>Imperial</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age" className={`flex items-center ${LABEL_SPACING}`}>
                  Age
                  <FieldStatus field="age" />
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  defaultValue={profile.age || ''}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value)
                    if (!isNaN(value) && value !== profile.age) {
                      handleFieldUpdate('age', value)
                    }
                  }}
                  placeholder="25"
                />
              </div>

              <div>
                <Label htmlFor="sex" className={`flex items-center ${LABEL_SPACING}`}>
                  Sex
                  <FieldStatus field="sex" />
                </Label>
                <Select
                  defaultValue={profile.sex || undefined}
                  onValueChange={(value) => {
                    if (value !== profile.sex) {
                      handleFieldUpdate('sex', value)
                    }
                  }}
                >
                  <SelectTrigger id="sex">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="weight" className={`flex items-center ${LABEL_SPACING}`}>
                  Weight {useImperial ? '(lbs)' : '(kg)'}
                  <FieldStatus field="weight_kg" />
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  defaultValue={
                    profile.weight_kg ? (useImperial ? kgToLbs(profile.weight_kg) : profile.weight_kg) : ''
                  }
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      const kg = useImperial ? lbsToKg(value) : value
                      if (kg !== profile.weight_kg) {
                        handleFieldUpdate('weight_kg', kg)
                      }
                    }
                  }}
                  placeholder={useImperial ? '150' : '68'}
                />
              </div>

              {useImperial ? (
                <div className="space-y-2">
                  <Label className={`flex items-center ${LABEL_SPACING}`}>
                    Height (ft/in)
                    <FieldStatus field="height_cm" />
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="height_feet"
                      type="number"
                      min="3"
                      max="8"
                      placeholder="5"
                      defaultValue={profile.height_cm ? cmToFeetInches(profile.height_cm).feet : ''}
                      onBlur={(e) => {
                        const feet = parseInt(e.target.value) || 0
                        const inches =
                          parseInt((document.getElementById('height_inches') as HTMLInputElement)?.value) || 0
                        const cm = feetInchesToCm(feet, inches)
                        if (cm !== profile.height_cm) {
                          handleFieldUpdate('height_cm', cm)
                        }
                      }}
                      className="w-20"
                    />
                    <span className="flex items-center">ft</span>
                    <Input
                      id="height_inches"
                      type="number"
                      min="0"
                      max="11"
                      placeholder="8"
                      defaultValue={profile.height_cm ? cmToFeetInches(profile.height_cm).inches : ''}
                      onBlur={(e) => {
                        const feet = parseInt((document.getElementById('height_feet') as HTMLInputElement)?.value) || 0
                        const inches = parseInt(e.target.value) || 0
                        const cm = feetInchesToCm(feet, inches)
                        if (cm !== profile.height_cm) {
                          handleFieldUpdate('height_cm', cm)
                        }
                      }}
                      className="w-20"
                    />
                    <span className="flex items-center">in</span>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="height" className={`flex items-center ${LABEL_SPACING}`}>
                    Height (cm)
                    <FieldStatus field="height_cm" />
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    defaultValue={profile.height_cm || ''}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value)
                      if (!isNaN(value) && value !== profile.height_cm) {
                        handleFieldUpdate('height_cm', value)
                      }
                    }}
                    placeholder="175"
                  />
                </div>
              )}
            </div>
          </div>
        </ProfileFormSection>

        {/* Fitness Goals */}
        <ProfileFormSection title="Fitness Goal" description="Your current fitness objective">
          <div>
            <Label htmlFor="goal" className={`flex items-center ${LABEL_SPACING}`}>
              Goal
              <FieldStatus field="goal" />
            </Label>
            <Select
              defaultValue={profile.goal || undefined}
              onValueChange={(value) => {
                if (value !== profile.goal) {
                  handleFieldUpdate('goal', value)
                }
              }}
            >
              <SelectTrigger id="goal">
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cut">Cut (Lose Fat)</SelectItem>
                <SelectItem value="bulk">Bulk (Build Muscle)</SelectItem>
                <SelectItem value="maintain">Maintain Weight</SelectItem>
                <SelectItem value="recomp">Recomposition</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ProfileFormSection>

        {/* Activity Level */}
        <ProfileFormSection title="Activity Level" description="How active you are throughout the week">
          <div>
            <Label htmlFor="activity_level" className={`flex items-center ${LABEL_SPACING}`}>
              Activity Level
              <FieldStatus field="activity_level" />
            </Label>
            <Select
              defaultValue={profile.activity_level || undefined}
              onValueChange={(value) => {
                if (value !== profile.activity_level) {
                  handleFieldUpdate('activity_level', value)
                }
              }}
            >
              <SelectTrigger id="activity_level">
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (Little to no exercise)</SelectItem>
                <SelectItem value="lightly">Lightly Active (1-3 days/week)</SelectItem>
                <SelectItem value="moderately">Moderately Active (3-5 days/week)</SelectItem>
                <SelectItem value="very">Very Active (6-7 days/week)</SelectItem>
                <SelectItem value="extremely">Extremely Active (2x per day + physical job)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ProfileFormSection>

        {/* Dietary Preferences */}
        <ProfileFormSection title="Dietary Preferences" description="Your eating style and restrictions">
          <div className="space-y-4">
            <div>
              <Label htmlFor="dietary_style" className={`flex items-center ${LABEL_SPACING}`}>
                Dietary Style
                <FieldStatus field="dietary_style" />
              </Label>
              <Select
                defaultValue={profile.dietary_style || undefined}
                onValueChange={(value) => {
                  if (value !== profile.dietary_style) {
                    handleFieldUpdate('dietary_style', value)
                  }
                }}
              >
                <SelectTrigger id="dietary_style">
                  <SelectValue placeholder="Select dietary style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Restrictions</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="pescatarian">Pescatarian</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="foods_to_avoid" className={`flex items-center ${LABEL_SPACING}`}>
                Foods to Avoid
                <FieldStatus field="foods_to_avoid" />
              </Label>
              <Textarea
                id="foods_to_avoid"
                defaultValue={profile.foods_to_avoid || ''}
                onBlur={(e) => {
                  const value = e.target.value
                  if (value !== profile.foods_to_avoid) {
                    handleFieldUpdate('foods_to_avoid', value)
                  }
                }}
                placeholder="List any foods you'd like to avoid (optional)"
                rows={3}
              />
            </div>
          </div>
        </ProfileFormSection>

        {/* Experience Levels */}
        <ProfileFormSection title="Experience Levels" description="Your familiarity with fitness and nutrition">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fitness_experience" className={`flex items-center ${LABEL_SPACING}`}>
                Fitness Experience
                <FieldStatus field="fitness_experience" />
              </Label>
              <Select
                defaultValue={profile.fitness_experience || undefined}
                onValueChange={(value) => {
                  if (value !== profile.fitness_experience) {
                    handleFieldUpdate('fitness_experience', value)
                  }
                }}
              >
                <SelectTrigger id="fitness_experience">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tracking_experience" className={`flex items-center ${LABEL_SPACING}`}>
                Macro Tracking Experience
                <FieldStatus field="tracking_experience" />
              </Label>
              <Select
                defaultValue={profile.tracking_experience || undefined}
                onValueChange={(value) => {
                  if (value !== profile.tracking_experience) {
                    handleFieldUpdate('tracking_experience', value)
                  }
                }}
              >
                <SelectTrigger id="tracking_experience">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never Tracked</SelectItem>
                  <SelectItem value="some">Some Experience</SelectItem>
                  <SelectItem value="experienced">Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="meal_prep_skills" className={`flex items-center ${LABEL_SPACING}`}>
                Meal Prep Skills
                <FieldStatus field="meal_prep_skills" />
              </Label>
              <Select
                defaultValue={profile.meal_prep_skills || undefined}
                onValueChange={(value) => {
                  if (value !== profile.meal_prep_skills) {
                    handleFieldUpdate('meal_prep_skills', value)
                  }
                }}
              >
                <SelectTrigger id="meal_prep_skills">
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ProfileFormSection>

        {/* Current Macros Display */}
        <ProfileFormSection title="Current Macros" description="Your calculated daily nutrition targets">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Daily Target</p>
                <p className="text-xl font-bold text-foreground">{profile.target_calories?.toLocaleString() || '-'} cal</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-protein/10 p-3 rounded-xl">
                <p className="font-bold text-protein">{profile.protein_grams || '-'}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="bg-carb/10 p-3 rounded-xl">
                <p className="font-bold text-carb">{profile.carb_grams || '-'}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="bg-fat/10 p-3 rounded-xl">
                <p className="font-bold text-fat">{profile.fat_grams || '-'}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-secondary rounded-xl">
                <p className="text-xs text-muted-foreground">BMR</p>
                <p className="text-lg font-bold text-foreground">{profile.bmr?.toLocaleString() || '-'}</p>
              </div>
              <div className="p-3 bg-secondary rounded-xl">
                <p className="text-xs text-muted-foreground">TDEE</p>
                <p className="text-lg font-bold text-foreground">{profile.tdee?.toLocaleString() || '-'}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Click "Recalculate Macros" after changing personal stats or goals to update these values.
            </p>
          </div>
        </ProfileFormSection>
      </div>
      </main>

      <BottomNav activeTab="profile" />

      {/* Macro Warning Modal */}
      <MacroWarningModal
        open={showMacroWarning}
        onOpenChange={setShowMacroWarning}
        onRecalculate={async () => {
          // Reload profile after recalculation
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            const { data } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single()
            if (data) setProfile(data)
          }
        }}
      />
    </div>
  )
}
