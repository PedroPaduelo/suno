'use client';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Stylized "A" with sound wave */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500 rounded-xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

        {/* Icon container */}
        <div
          className="relative rounded-xl bg-gradient-to-br from-primary via-primary to-pink-500 p-2 flex items-center justify-center"
          style={{ width: icon + 16, height: icon + 16 }}
        >
          <svg
            width={icon}
            height={icon}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            {/* Stylized "A" formed by sound waves */}
            {/* Central peak */}
            <path
              d="M24 8L24 40"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Sound wave - left side */}
            <path
              d="M12 32C12 32 14 24 18 24C22 24 24 16 24 16"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-lg"
            />

            {/* Sound wave - right side */}
            <path
              d="M36 32C36 32 34 24 30 24C26 24 24 16 24 16"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-lg"
            />

            {/* Crossbar of "A" */}
            <path
              d="M16 28H32"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Outer waves - left */}
            <path
              d="M8 36C8 36 10 28 14 28"
              stroke="url(#gradient1)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* Outer waves - right */}
            <path
              d="M40 36C40 36 38 28 34 28"
              stroke="url(#gradient2)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* Accent dot at peak */}
            <circle
              cx="24"
              cy="12"
              r="3"
              fill="url(#accentGradient)"
              className="animate-pulse"
            />

            <defs>
              <linearGradient id="gradient1" x1="8" y1="36" x2="14" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE" />
                <stop offset="1" stopColor="white" />
              </linearGradient>
              <linearGradient id="gradient2" x1="40" y1="36" x2="34" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE" />
                <stop offset="1" stopColor="white" />
              </linearGradient>
              <linearGradient id="accentGradient" x1="21" y1="9" x2="27" y2="15" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE" />
                <stop offset="1" stopColor="white" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${text} font-bold tracking-tight text-gradient-primary`}>
            AETHER
          </span>
          <span className="text-[10px] text-slate-500 tracking-[0.2em] uppercase -mt-1">
            Music AI
          </span>
        </div>
      )}
    </div>
  );
}
