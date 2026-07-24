export function CaretFooter() {
  return (
    <footer className="md:px-8 -my-px md:border-y md:border-zinc-800">
      <div
        data-reveal
        className="px-6 md:px-16 lg:px-24 xl:px-40 -my-px border border-zinc-800 max-md:border-x-0 flex py-10 max-md:flex-col max-md:gap-y-4"
      >
        <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
          <p className="text-app-secondary-invert grow text-sm">At Your Side Inc.</p>
          <address className="text-app-secondary-invert grow text-sm not-italic">
            45 Lansing St, San Francisco
            <br />
            CA 94105
          </address>
          <ul className="shrink-0 md:text-right [&_li+li]:mt-2.5"></ul>
        </div>
      </div>
      <div className="px-6 md:px-16 lg:px-24 xl:px-40 -my-px border border-zinc-800 max-md:border-x-0 text-app-secondary-invert flex py-6 text-sm max-md:flex-col max-md:gap-y-3">
        <div className="bg-background mx-auto w-full max-w-(--breakpoint-lg)">
          <p className="mb-1 grow">© 2025 At Your Side Inc. All rights reserved.</p>
          <ul className="flex shrink-0 items-center gap-2 text-right">
            <li>
              <a
                className="text-app-primary-invert decoration-border hover:decoration-app-secondary-invert font-semibold underline underline-offset-2 transition-colors"
                href="https://caret.so/en/policy/terms"
              >
                Terms of Service
              </a>
            </li>
            <li>
              <a
                className="decoration-border hover:decoration-app-secondary-invert font-medium underline underline-offset-2 transition-colors"
                href="https://caret.so/en/policy/privacy"
              >
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
