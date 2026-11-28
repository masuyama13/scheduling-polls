import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import '../i18n/index.ts'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export default function PasswordInput({ className = '', ...props }: PasswordInputProps) {
  const { t } = useTranslation('common')
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative">
      <input {...props} type={isVisible ? 'text' : 'password'} className={`${className} pr-10`} />
      <button
        type="button"
        aria-label={isVisible ? t('home.form.hidePassword') : t('home.form.showPassword')}
        title={isVisible ? t('home.form.hidePassword') : t('home.form.showPassword')}
        onClick={() => setIsVisible((visible) => !visible)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-full text-content-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
      >
        {isVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
      </button>
    </div>
  )
}
