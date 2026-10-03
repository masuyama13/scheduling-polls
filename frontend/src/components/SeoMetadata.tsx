import { useEffect } from 'react'
import { SERVICE_NAME } from '../config/appConfig.ts'

type SeoMetadataProps = {
  title: string | null
  description: string
  path?: string
  noindex?: boolean
}

const SITE_URL = 'https://crosstimely.com'
const SHARE_IMAGE = `${SITE_URL}/og-image.png`

function updateMeta(attribute: 'name' | 'property', key: string, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    document.head.append(meta)
  }

  meta.content = content
}

export default function SeoMetadata({ title, description, path, noindex = false }: SeoMetadataProps) {
  useEffect(() => {
    const previousTitle = document.title
    const pageTitle = title === null ? null : `${title} | ${SERVICE_NAME}`
    const canonicalUrl = path ? `${SITE_URL}${path}` : null

    if (pageTitle !== null) {
      document.title = pageTitle
      updateMeta('property', 'og:title', pageTitle)
      updateMeta('name', 'twitter:title', pageTitle)
    }
    updateMeta('name', 'description', description)
    updateMeta('property', 'og:type', 'website')
    updateMeta('property', 'og:site_name', SERVICE_NAME)
    updateMeta('property', 'og:description', description)
    updateMeta('property', 'og:image', SHARE_IMAGE)
    updateMeta('property', 'og:image:type', 'image/png')
    updateMeta('property', 'og:image:width', '2400')
    updateMeta('property', 'og:image:height', '1260')
    updateMeta('property', 'og:image:alt', `${SERVICE_NAME} — schedule across time zones.`)
    updateMeta('name', 'twitter:card', 'summary_large_image')
    updateMeta('name', 'twitter:description', description)
    updateMeta('name', 'twitter:image', SHARE_IMAGE)

    if (noindex) {
      updateMeta('name', 'robots', 'noindex')
    } else {
      document.head.querySelector('meta[name="robots"]')?.remove()
    }

    if (canonicalUrl) {
      updateMeta('property', 'og:url', canonicalUrl)
      let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.append(canonical)
      }
      canonical.href = canonicalUrl
    } else {
      document.head.querySelector('meta[property="og:url"]')?.remove()
      document.head.querySelector('link[rel="canonical"]')?.remove()
    }

    return () => {
      if (pageTitle !== null) document.title = previousTitle
    }
  }, [description, noindex, path, title])

  return null
}
