import { SERVICE_NAME } from '../config/appConfig.ts'
import SeoMetadata from '../components/SeoMetadata'

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-4 text-content-primary sm:py-8">
      <SeoMetadata title="Privacy Policy" description={`Privacy information for ${SERVICE_NAME}.`} path="/privacy" />
      <section className="rounded-xl border border-border-subtle bg-surface-panel p-6 sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Privacy Policy</h1>
        <div className="mt-6 space-y-6 leading-relaxed text-content-secondary [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-content-primary [&_p+p]:mt-3">
          <p>This policy explains how we collect, use, store, and share information when you use {SERVICE_NAME}.</p>
          <section>
            <h2>1. Information you provide</h2>
            <p>
              We store the information you submit to provide scheduling features: event names and descriptions, proposed
              dates and times, response names, comments, availability answers, and city or time zone selections
              submitted with an event or response. We also store identifiers and creation and update timestamps for
              these records.
            </p>
            <p>
              If you set an event password, we store a one-way password hash rather than the password as readable text.
              If you contact us by email, we receive your email address and the information you include in your message
              so that we can respond.
            </p>
            <p>
              Avoid sharing sensitive personal or confidential information, such as contact details, home addresses, or
              financial or health information. We recommend using a nickname or alias instead of your full name when
              responding. Even with an alias, comments, dates, or other details may identify you, so do not assume that
              your submissions are anonymous.
            </p>
          </section>
          <section>
            <h2>2. Browser storage and technical information</h2>
            <p>
              {SERVICE_NAME} uses your browser’s time zone setting to suggest a local time zone. It uses local storage
              on your device to remember World Clock city preferences and other service preferences. You can remove
              these preferences by clearing the site’s browser data.
            </p>
            <p>
              Requests to the service include technical information such as an IP address, browser information,
              requested URL, and request time. The application and hosting services may process this information in
              operational or security logs to deliver the service, diagnose problems, and prevent abuse.
            </p>
          </section>
          <section>
            <h2>3. How we use information</h2>
            <p>
              We use this information to operate and secure the scheduling service, respond to inquiries, and comply
              with legal obligations.
            </p>
          </section>
          <section>
            <h2>4. Who can access shared content</h2>
            <p>
              Anyone with an event link can view its event details and responses, including names, comments,
              availability, and submitted city or time zone information. Anyone with the link can edit or delete
              responses. If the event has no password, anyone with the link can also edit or delete the event itself.
            </p>
            <p>
              An event password does not restrict viewing. Links can be forwarded, and recipients can copy shared
              content.
            </p>
          </section>
          <section>
            <h2>5. Service providers and processing locations</h2>
            <p>
              We currently use Render to host the service. Event data is stored in Render&apos;s Oregon, United States
              region. Render delivers the static website through a globally distributed CDN and may process technical
              information in other locations. Information may be subject to the laws of the places where it is stored or
              processed.
            </p>
            <p>We may also disclose information when required by law or to address security incidents or misuse.</p>
          </section>
          <section>
            <h2>6. Retention and deletion</h2>
            <p>
              We may remove event pages and associated responses at any time, at our discretion and without notice,
              including if we discontinue the service. We do not guarantee a minimum retention period.
            </p>
            <p>
              Events and responses may also be deleted through the service. We otherwise retain information as needed
              for the purposes above or to meet legal obligations. Logs and backups may persist after content is deleted
              from the active service until they are replaced or removed.
            </p>
            <p>Deleting content from {SERVICE_NAME} does not remove copies that other people have made.</p>
          </section>
          <section>
            <h2>7. Security</h2>
            <p>
              We take reasonable steps to protect information, but no online service can guarantee complete security.
            </p>
          </section>
          <section>
            <h2>8. Your choices and requests</h2>
            <p>
              You may use an alias and clear locally stored preferences. For privacy questions or requests concerning
              your personal information, contact us by email. We may need to verify your request and will respond as
              required by law.
            </p>
          </section>
          <section>
            <h2>9. Policy updates</h2>
            <p>
              We may update this policy as our service or practices change. Updates will be posted here, with further
              notice or consent where required by law.
            </p>
          </section>
          <section>
            <h2>10. Contact</h2>
            <p>Privacy contact: {SERVICE_NAME} Developer (British Columbia, Canada)</p>
            <p>Email: crosstimely@gmail.com</p>
          </section>
        </div>
      </section>
    </div>
  )
}
