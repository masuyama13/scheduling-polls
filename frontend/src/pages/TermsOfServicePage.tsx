import { SERVICE_NAME } from '../config/appConfig.ts'

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-4 text-content-primary sm:py-8">
      <section className="rounded-xl border border-border-subtle bg-surface-panel p-6 sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Terms of Service</h1>
        <div className="mt-6 space-y-6 leading-relaxed text-content-secondary [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-content-primary [&_p+p]:mt-3">
          <p>These terms govern your use of {SERVICE_NAME}. By using the service, you agree to these terms.</p>
          <section>
            <h2>1. Acceptable use</h2>
            <p>
              Use {SERVICE_NAME} only for lawful scheduling. Do not post unlawful, abusive, or harmful content; violate
              others’ rights; send spam; disrupt the service; or access data without permission.
            </p>
            <p>
              Avoid sharing sensitive personal or confidential information, such as contact details, home addresses, or
              financial or health information. We recommend using a nickname or alias instead of your full name when
              responding. Use a unique password for an event; do not reuse a password from another service.
            </p>
            <p>
              You are responsible for your content and for having permission to share it. We may remove content or
              restrict access to address misuse, security concerns, or legal requirements.
            </p>
          </section>
          <section>
            <h2>2. Shared links and permissions</h2>
            <p>
              Anyone with an event link can view its details and responses, and links can be forwarded. We do not verify
              participants’ identities.
            </p>
            <p>
              Anyone with the link can add, edit, or delete responses. An event password protects editing and deleting
              the event, but not viewing it or changing responses. Without a password, anyone with the link can also
              edit or delete the event. We cannot recover or disclose event passwords. If you forget one, you may be
              unable to edit or delete that event.
            </p>
          </section>
          <section>
            <h2>3. Event retention and deletion</h2>
            <p>
              We may remove an event and its responses at any time, at our discretion and without notice, including if
              we discontinue the service. We do not guarantee a minimum retention period. Keep your own copy of anything
              you need; deleted content may not be recoverable.
            </p>
          </section>
          <section>
            <h2>4. Availability and accuracy</h2>
            <p>
              To the extent permitted by law, {SERVICE_NAME} is provided “as is” and “as available.” We do not guarantee
              uninterrupted or error-free service or preservation of content, and may change, suspend, or discontinue
              it. Time zone and daylight-saving rules can change; verify important times with participants before making
              arrangements.
            </p>
          </section>
          <section>
            <h2>5. Responsibility and liability</h2>
            <p>
              To the extent permitted by law, the operator is not liable for indirect or consequential losses arising
              from use of or inability to use {SERVICE_NAME}, including scheduling errors, service interruptions, or
              lost content. These terms do not exclude liability or rights that cannot legally be excluded.
            </p>
          </section>
          <section>
            <h2>6. Privacy</h2>
            <p>
              Our{' '}
              <a className="underline" href="/privacy">
                Privacy Policy
              </a>{' '}
              explains how information is handled when you use {SERVICE_NAME}.
            </p>
          </section>
          <section>
            <h2>7. Changes to these terms</h2>
            <p>
              We may update these terms as the service changes. Updates will be posted here, with further notice where
              required by law.
            </p>
          </section>
          <section>
            <h2>8. Contact</h2>
            <p>For questions about these terms, contact us by email at crosstimely@gmail.com.</p>
          </section>
        </div>
      </section>
    </div>
  )
}
