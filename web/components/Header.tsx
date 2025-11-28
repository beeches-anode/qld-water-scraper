"use client";

import { useTheme } from "@/lib/ThemeContext";
import clsx from "clsx";

export default function Header() {
  const { theme } = useTheme();

  return (
    <header
      className={clsx(
        "sticky top-0 z-10 md:static border-b-4 shadow-2xl overflow-hidden",
        `bg-gradient-to-br ${theme.headerGradient}`,
        theme.headerBorder
      )}
    >
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* AI Disclaimer - Subtle info style instead of warning */}
        <div className="mb-4 md:mb-6 flex items-start gap-2 bg-white/10 backdrop-blur-sm border-l-4 border-white/30 rounded-r-xl px-3 py-2">
          <svg
            className="w-4 h-4 text-white/70 shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs text-white/80 leading-relaxed">
            <span className="font-semibold">Note:</span> Content is AI-generated
            and should not be relied upon. Simple formatting changes in the
            source data websites can cause errors. Content is for demonstration
            purposes only and should in no circumstances be relied upon.
          </p>
        </div>

        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-5">
            {/* Water droplet icon */}
            <div className="relative group">
              <div
                className={clsx(
                  "absolute inset-0 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300",
                  theme.headerIconBg.replace("from-", "bg-").split(" ")[0] +
                    "/40"
                )}
              ></div>
              <div
                className={clsx(
                  "relative p-3 md:p-4 rounded-3xl shadow-2xl border-2 border-white/30 group-hover:scale-105 transition-transform duration-300",
                  `bg-gradient-to-br ${theme.headerIconBg}`
                )}
              >
                <svg
                  className={clsx(
                    "w-8 h-8 md:w-10 md:h-10 drop-shadow-lg",
                    theme.headerIcon
                  )}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  <circle cx="12" cy="14" r="4" opacity="0.7" />
                </svg>
              </div>
            </div>

            <div>
              <h1
                className={clsx(
                  "text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight",
                  theme.headerTitle
                )}
              >
                Queensland Water Industry
              </h1>
              <p
                className={clsx(
                  "text-base md:text-xl font-semibold mt-1 tracking-wide",
                  theme.headerSubtitle
                )}
              >
                Information Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Subtitle/Description */}
        <div className="mt-4 md:mt-6 flex items-start gap-3">
          <div
            className={clsx(
              "hidden sm:block w-1 h-12 rounded-full",
              `bg-gradient-to-b ${
                theme.headerIconBg.split(" ")[0]
              } to-transparent`
            )}
          ></div>
          <p
            className={clsx(
              "text-sm md:text-base max-w-3xl leading-relaxed",
              theme.headerText
            )}
          >
            Tracking water allocations, trading activity, regulatory plans, and
            industry developments across Queensland's bulk water supply network.
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className={clsx(
          "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
          theme.headerAccentLine
        )}
      ></div>
    </header>
  );
}
