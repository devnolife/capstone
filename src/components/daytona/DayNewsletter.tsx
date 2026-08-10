'use client';

import { useState, type FormEvent } from 'react';
import { SubmitArrowIcon } from '@/components/daytona/icons';

export function DayNewsletter() {
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribed(true);
  }

  return (
    <section className="day-container grid grid-cols-1 gap-6 py-20 min-[810px]:grid-cols-[416px_1fr] min-[810px]:gap-0">
      {/* Left label */}
      <span className="block pt-2 font-day-mono text-[12px] uppercase leading-3 text-[#a2a2a2]">
        PENGUMUMAN
      </span>

      {/* Right content */}
      <div className="max-w-[700px]">
        <h2 className="font-day-sans text-[20px] leading-6">
          <span className="text-white">Berlangganan Info Capstone.</span>
          <span className="text-[#a2a2a2]">
            {' '}
            Jadwal penting, deadline milestone, pengumuman sidang, dan
            informasi periode capstone langsung ke email kampusmu.
          </span>
        </h2>

        <form className="mt-12 flex flex-col gap-2.5" onSubmit={handleSubmit}>
          <label
            htmlFor="newsletter-email"
            className="font-day-sans text-[16px] leading-[25.6px] tracking-[-0.32px] text-[#a2a2a2]"
          >
            Masukkan email kampus
          </label>
          {subscribed ? (
            <p className="font-day-sans text-[16px] text-[#2ecc71]">
              Berhasil berlangganan.
            </p>
          ) : (
            <div className="flex h-[52px] items-center justify-between gap-2 rounded-[4px] bg-[#161616] pl-4 pr-3">
              <input
                id="newsletter-email"
                type="email"
                placeholder="nama@unismuh.ac.id"
                aria-label="Email"
                className="flex-1 bg-transparent font-day-sans text-[16px] text-white outline-none placeholder:text-[#585858]"
              />
              <button
                type="submit"
                aria-label="Berlangganan"
                className="flex size-12 items-center justify-center rounded-[6px] text-white transition-colors hover:bg-[#252525]"
              >
                <SubmitArrowIcon className="size-6" />
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
