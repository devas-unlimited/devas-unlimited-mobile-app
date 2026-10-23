import { Link } from 'react-router-dom'

const CONTACT_EMAIL = 'contentbank.du@gmail.com'

interface LegalPageProps {
  kind: 'privacy' | 'terms'
}

export function LegalPage({ kind }: LegalPageProps) {
  const updated = 'October 2025'
  return (
    <div className="min-h-screen bg-[#FCF7F0]">
      <header className="border-b border-[#7C2447]/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <img src="/brand/devas-logo.png" alt="Devas Unlimited" className="h-10 w-auto" />
          <Link to="/" className="text-sm font-medium text-[#7C2447] hover:underline">
            Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 text-[#3d2b33]">
        {kind === 'privacy' ? <Privacy updated={updated} /> : <Terms updated={updated} />}
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-lg font-semibold text-[#7C2447]">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

function Privacy({ updated }: { updated: string }) {
  return (
    <>
      <h1 className="mb-1 text-3xl font-bold text-[#7C2447]">Privacy Policy</h1>
      <p className="mb-8 text-sm text-[#3d2b33]/60">Last updated: {updated}</p>

      <Section title="Who we are">
        <p>
          Devas Unlimited ("we", "our") operates the Devas Unlimited mobile web application,
          which provides guided meditations, events, retreats, and spiritual learning content.
          This policy explains what information we collect and how we use it.
        </p>
      </Section>

      <Section title="Information we collect">
        <p>
          <strong>Account information.</strong> When you sign up, we store your name, email
          address, and (if you sign in with Google) your Google profile photo. This is used to
          create and maintain your account.
        </p>
        <p>
          <strong>Usage information.</strong> We store your meditation session history, journey
          progress, and preferences inside the app so features like streaks and insights work
          across your devices.
        </p>
        <p>
          <strong>Sign-in data.</strong> If you sign in with Google, Google shares your basic
          profile (name, email, avatar) with us. We never see your Google password.
        </p>
      </Section>

      <Section title="How we use your information">
        <p>We use your information only to:</p>
        <ul className="list-disc pl-5">
          <li>Provide and personalise the app (sessions, journey progress, streaks)</li>
          <li>Let you sign in and keep you signed in</li>
          <li>Send essential service messages (e.g., password reset)</li>
          <li>Improve app content and features</li>
        </ul>
        <p>We do not sell your personal data or use it for advertising.</p>
      </Section>

      <Section title="Where your data is stored">
        <p>
          Your data is stored securely in Supabase (hosted on AWS infrastructure). Media such
          as videos and audio playlists are hosted by YouTube, SoundCloud, and Vimeo, which
          have their own privacy policies.
        </p>
      </Section>

      <Section title="Sharing">
        <p>
          We do not share your personal information with third parties except the service
          providers needed to run the app (Supabase for data and authentication, Netlify for
          hosting, Google for optional sign-in).
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You may request a copy or deletion of your account data at any time by emailing{' '}
          <a className="text-[#7C2447] underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          . Deleting your account removes your profile and meditation history.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy? Email us at{' '}
          <a className="text-[#7C2447] underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </>
  )
}

function Terms({ updated }: { updated: string }) {
  return (
    <>
      <h1 className="mb-1 text-3xl font-bold text-[#7C2447]">Terms of Service</h1>
      <p className="mb-8 text-sm text-[#3d2b33]/60">Last updated: {updated}</p>

      <Section title="Using the app">
        <p>
          Devas Unlimited provides meditation, events, and spiritual learning content for
          personal, non-commercial use. By creating an account you agree to use the app
          lawfully and respectfully.
        </p>
      </Section>

      <Section title="Accounts">
        <p>
          You are responsible for keeping your sign-in credentials private. You may sign in
          with an email address or a Google account. We may suspend accounts that misuse the
          service.
        </p>
      </Section>

      <Section title="Content">
        <p>
          Videos and audio in the app are hosted by third parties (YouTube, SoundCloud,
          Vimeo). Availability of that content is subject to those platforms. Our own content
          may not be copied or redistributed without permission.
        </p>
      </Section>

      <Section title="Wellbeing disclaimer">
        <p>
          The app offers meditation and spiritual practice support. It is not medical or
          psychological advice and is not a substitute for professional care. If you have a
          health condition, consult a qualified professional.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update these terms occasionally; continued use of the app means you accept
          the updated terms. We will update the date above when we do.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? Email us at{' '}
          <a className="text-[#7C2447] underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </>
  )
}
