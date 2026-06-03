import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { AlertTriangle, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { configApi } from '../api/config.api'
import Toggle from '../components/ui/Toggle'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const GIFTS = [
  { key: 'rose', emoji: '🌹', name: 'Rose' },
  { key: 'diamond', emoji: '💎', name: 'Diamond' },
  { key: 'car', emoji: '🚗', name: 'Car' },
  { key: 'ring', emoji: '💍', name: 'Ring' },
  { key: 'kiss', emoji: '💋', name: 'Kiss' },
]

function Section({ title, children }) {
  return (
    <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-6 mb-6">
      <h3 className="text-white font-semibold text-lg mb-4">{title}</h3>
      {children}
    </div>
  )
}

function FormInput({ label, description, register, name, type = 'text', ...props }) {
  return (
    <div>
      <label className="block text-meetzy-text text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        className="w-full bg-meetzy-hover border border-meetzy-border rounded-xl px-4 py-3 text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
        {...(register ? register(name) : {})}
        {...props}
      />
      {description && <p className="text-meetzy-muted text-xs mt-1">{description}</p>}
    </div>
  )
}

export default function ConfigPage() {
  const queryClient = useQueryClient()

  const { data: config, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: configApi.getConfig,
  })

  const saveMutation = useMutation({
    mutationFn: configApi.saveConfig,
    onSuccess: () => {
      toast.success('✅ Settings saved!')
      queryClient.invalidateQueries({ queryKey: ['config'] })
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const { register, handleSubmit, control, watch, reset } = useForm()

  useEffect(() => {
    if (config) {
      reset({
        minAndroidVersion: config.minAndroidVersion || '',
        minIosVersion: config.minIosVersion || '',
        matchmakingEnabled: config.matchmakingEnabled ?? true,
        vipMatchPriority: config.vipMatchPriority ?? true,
        freeMatchesPerDay: config.freeMatchesPerDay || 10,
        giftPrices: config.giftPrices || {},
        newUserBonus: config.newUserBonus || 50,
        autoFlagAfterReports: config.autoFlagAfterReports || 5,
        maintenanceMode: config.maintenanceMode ?? false,
        maintenanceMessage: config.maintenanceMessage || '',
      })
    }
  }, [config, reset])

  const maintenanceMode = watch('maintenanceMode')

  const onSubmit = (data) => {
    saveMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">App Config</h1>
      <p className="text-meetzy-muted text-sm mt-1 mb-6">Configure app settings and behaviour.</p>

      {maintenanceMode && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 mb-6">
          <AlertTriangle size={20} className="text-meetzy-red flex-shrink-0" />
          <p className="text-meetzy-red text-sm font-medium">
            ⚠️ App is in MAINTENANCE MODE — users cannot login right now
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Section title="📱 App Versions">
          <p className="text-meetzy-muted text-sm mb-4">
            Users below the minimum version will see an update prompt.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Min Android Version"
              name="minAndroidVersion"
              register={register}
              placeholder="1.0.0"
            />
            <FormInput
              label="Min iOS Version"
              name="minIosVersion"
              register={register}
              placeholder="1.0.0"
            />
          </div>
        </Section>

        <Section title="🎯 Matchmaking">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="flex items-center justify-between bg-meetzy-hover rounded-xl px-4 py-3">
              <div>
                <p className="text-white text-sm font-medium">Matchmaking Enabled</p>
                <p className="text-meetzy-muted text-xs">Allow users to find matches</p>
              </div>
              <Controller
                name="matchmakingEnabled"
                control={control}
                render={({ field }) => (
                  <Toggle checked={!!field.value} onChange={field.onChange} />
                )}
              />
            </div>
            <div className="flex items-center justify-between bg-meetzy-hover rounded-xl px-4 py-3">
              <div>
                <p className="text-white text-sm font-medium">VIP Match Priority</p>
                <p className="text-meetzy-muted text-xs">VIP users get faster matches</p>
              </div>
              <Controller
                name="vipMatchPriority"
                control={control}
                render={({ field }) => (
                  <Toggle checked={!!field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </div>
          <div className="max-w-xs">
            <FormInput
              label="Free Matches Per Day"
              name="freeMatchesPerDay"
              type="number"
              register={register}
              description="Number of free video matches per user per day"
            />
          </div>
        </Section>

        <Section title="🎁 Gift Coin Prices">
          <div className="rounded-xl overflow-hidden border border-meetzy-border">
            <table className="w-full">
              <thead>
                <tr className="bg-meetzy-hover">
                  <th className="px-4 py-3 text-left text-xs text-meetzy-muted uppercase tracking-wider">Gift</th>
                  <th className="px-4 py-3 text-left text-xs text-meetzy-muted uppercase tracking-wider">Coin Price</th>
                </tr>
              </thead>
              <tbody>
                {GIFTS.map((gift) => (
                  <tr key={gift.key} className="border-b border-meetzy-border/50">
                    <td className="px-4 py-3 text-meetzy-text text-sm">
                      {gift.emoji} {gift.name}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        placeholder="0"
                        className="w-32 bg-meetzy-hover border border-meetzy-border rounded-lg px-3 py-2 text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
                        {...register(`giftPrices.${gift.key}`)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="🎉 Bonuses">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="New User Welcome Coins"
              name="newUserBonus"
              type="number"
              register={register}
              description="Coins given to new users on registration"
            />
            <FormInput
              label="Auto-flag after X reports"
              name="autoFlagAfterReports"
              type="number"
              register={register}
              description="Automatically flag users with this many reports"
            />
          </div>
        </Section>

        <Section title="🔧 Maintenance Mode">
          <div className="flex items-center justify-between bg-meetzy-hover rounded-xl px-4 py-3 mb-4">
            <div>
              <p className="text-white text-sm font-medium">Maintenance Mode</p>
              <p className="text-meetzy-muted text-xs">
                When ON, users cannot login to the app
              </p>
            </div>
            <Controller
              name="maintenanceMode"
              control={control}
              render={({ field }) => (
                <Toggle checked={!!field.value} onChange={field.onChange} danger />
              )}
            />
          </div>
          {maintenanceMode && (
            <div>
              <label className="block text-meetzy-text text-sm font-medium mb-1">
                Maintenance Message
              </label>
              <textarea
                rows={3}
                placeholder="We're performing scheduled maintenance. We'll be back shortly!"
                className="w-full bg-meetzy-hover border border-meetzy-border rounded-xl px-4 py-3 text-meetzy-text text-sm focus:border-meetzy-purple outline-none resize-none"
                {...register('maintenanceMessage')}
              />
            </div>
          )}
        </Section>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="w-full bg-meetzy-purple hover:bg-purple-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saveMutation.isPending ? (
            <>
              <LoadingSpinner size="sm" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save All Settings
            </>
          )}
        </button>
      </form>
    </div>
  )
}
