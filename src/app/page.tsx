import Image from "next/image";
import { ClaudeLogo, DownloadIcon } from "@/components/icons";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen bg-bg-100 text-text-100">
      {/* Top-left Claude wordmark */}
      <div className="pointer-events-none absolute left-6 top-5 z-10 md:left-8">
        <ClaudeLogo className="pointer-events-auto h-6 w-auto text-text-100" />
      </div>

      <main className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-4 px-4 xl:grid-cols-2">
        {/* LEFT — sign-in column */}
        <div className="flex min-h-[89vh] w-full items-center py-6">
          <div className="flex h-full w-full flex-col items-center justify-between">
            <div aria-hidden className="shrink-0" />

            <div className="w-full max-w-md">
              <h2 className="mt-12 text-center font-serif text-[2.25rem] font-light leading-tight tracking-tight min-[350px]:text-[2.75rem] min-[500px]:text-[3.5rem]">
                Question what&rsquo;s
                <br />
                next
              </h2>
              <h3 className="mt-4 text-center font-serif text-lg font-normal leading-snug text-text-100">
                Your thinking partner for big ambitions
              </h3>

              {/* Auth card */}
              <div className="mx-4 mt-8 rounded-[32px] border border-[hsl(var(--border-300)/0.15)] bg-bg-300 p-7 text-center shadow-[0_4px_24px_0_rgba(0,0,0,0.02),0_2px_64px_0_rgba(0,0,0,0.01),0_16px_32px_0_rgba(0,0,0,0.01)] sm:mx-auto sm:min-w-xs">
                <div className="flex flex-col gap-5">
                  {/* Continue with Google */}
                  <button
                    type="button"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-[hsl(var(--border-300)/0.3)] px-5 text-base font-medium text-text-100 transition-colors duration-100 hover:bg-white/[0.06]"
                  >
                    <Image
                      src="/images/google.svg"
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px]"
                    />
                    Continue with Google
                  </button>

                  {/* OR divider */}
                  <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-text-400">
                    <span className="h-px flex-1 bg-[hsl(var(--border-300)/0.15)]" />
                    OR
                    <span className="h-px flex-1 bg-[hsl(var(--border-300)/0.15)]" />
                  </div>

                  {/* Continue with email (primary) */}
                  <button
                    type="button"
                    className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[10px] bg-[var(--btn-primary-bg)] px-4 text-[15px] font-medium text-[var(--btn-primary-text)] transition-opacity duration-100 hover:opacity-90"
                  >
                    Continue with email
                  </button>

                  {/* Continue with SSO (ghost) */}
                  <button
                    type="button"
                    className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[10px] px-4 text-[15px] font-medium text-white transition-colors duration-100 hover:bg-white/[0.06]"
                  >
                    Continue with SSO
                  </button>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-text-400">
                  By continuing, you acknowledge Anthropic&rsquo;s{" "}
                  <a
                    href="https://www.anthropic.com/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-text-100"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>

              {/* Download desktop app */}
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[hsl(var(--border-300)/0.3)] px-5 text-base font-medium text-text-100 transition-colors duration-100 hover:bg-white/[0.06]"
                >
                  <DownloadIcon className="h-[18px] w-[18px]" />
                  Download desktop app
                </button>
              </div>
            </div>

            <div aria-hidden className="mt-14 shrink-0" />
          </div>
        </div>

        {/* RIGHT — hero video (hidden below lg) */}
        <div className="hidden w-full items-center justify-center lg:flex">
          <div className="mb-8 flex aspect-[1080/1350] w-full max-w-xl items-center justify-center rounded-2xl xl:max-w-[460px]">
            <div className="relative flex h-full w-full animate-login-hero-in items-center justify-center">
              <div className="relative h-full w-full rounded-2xl bg-bg-200 shadow-[0_4px_20px_0_rgba(0,0,0,0.04)]">
                <div className="h-full w-full overflow-hidden rounded-2xl">
                  <video
                    className="h-full w-full object-cover"
                    src="/videos/login-hero.mp4"
                    poster="/videos/login-hero-still.webp"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
