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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { updateProfileField, updateEmail, recalculateMacros } from '@/app/actions/profile'
import { toast } from 'sonner'
import { ArrowLeft, Check, Loader2, Mail, Calculator } from 'lucide-react'
import { debounce } from '@/lib/utils/debounce'

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
            console.log('No profile found - redirecting to onboarding')
            router.push('/onboarding/1')
            return
          }
          toast.error('Failed to load profile')
          return
        }

        setProfile(data)
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
        <Badge variant="secondary" className="ml-2">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Saving
        </Badge>
      )
    }
    if (savedFields[field]) {
      return (
        <Badge variant="default" className="ml-2 bg-green-500">
          <Check className="mr-1 h-3 w-3" />
          Saved
        </Badge>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="text-muted-foreground max-w-md">
            You need to complete the onboarding process before you can edit your profile.
          </p>
        </div>
        <Button onClick={() => router.push('/onboarding/1')} className="bg-primary">
          Go to Onboarding
        </Button>
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
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">Update your personal information and preferences</p>
          </div>
          <Button onClick={handleRecalculateMacros} disabled={recalculating} variant="outline">
            <Calculator className="mr-2 h-4 w-4" />
            {recalculating ? 'Recalculating...' : 'Recalculate Macros'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
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
              <Label htmlFor="full_name" className="flex items-center">
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
              <Label htmlFor="email" className="flex items-center">
                Email
                <FieldStatus field="email" />
                <Badge variant="outline" className="ml-2">
                  <Mail className="mr-1 h-3 w-3" />
                  Requires Confirmation
                </Badge>
              </Label>
              <div className="flex gap-2">
                <Input id="email" type="email" defaultValue={userEmail} placeholder="your@email.com" />
                <Button onClick={handleEmailUpdate} variant="outline" disabled={savingFields.email}>
                  Update
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                You'll receive a confirmation email to verify the change
              </p>
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
                <Switch checked={useImperial} onCheckedChange={setUseImperial} />
                <span className={useImperial ? 'font-semibold' : 'text-muted-foreground'}>Imperial</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age" className="flex items-center">
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
                <Label htmlFor="sex" className="flex items-center">
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
                <Label htmlFor="weight" className="flex items-center">
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
                  <Label className="flex items-center">
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
                  <Label htmlFor="height" className="flex items-center">
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
            <Label htmlFor="goal" className="flex items-center">
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
            <Label htmlFor="activity_level" className="flex items-center">
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
              <Label htmlFor="dietary_style" className="flex items-center">
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
              <Label htmlFor="foods_to_avoid" className="flex items-center">
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
              <Label htmlFor="fitness_experience" className="flex items-center">
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
              <Label htmlFor="tracking_experience" className="flex items-center">
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
              <Label htmlFor="meal_prep_skills" className="flex items-center">
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="text-2xl font-bold">{profile.target_calories || '-'}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Protein</p>
              <p className="text-2xl font-bold">{profile.protein_grams || '-'}g</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Carbs</p>
              <p className="text-2xl font-bold">{profile.carb_grams || '-'}g</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Fat</p>
              <p className="text-2xl font-bold">{profile.fat_grams || '-'}g</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">BMR</p>
              <p className="text-2xl font-bold">{profile.bmr || '-'}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">TDEE</p>
              <p className="text-2xl font-bold">{profile.tdee || '-'}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Click "Recalculate Macros" above after changing personal stats or goals to update these values.
          </p>
        </ProfileFormSection>
      </div>

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
