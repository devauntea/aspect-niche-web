"use client";

import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

export function IconFitness({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      <rect x="8" y="24" width="8" height="8" rx="3" fill="#D4537E"/>
      <rect x="40" y="24" width="8" height="8" rx="3" fill="#D4537E"/>
      <rect x="14" y="20" width="5" height="16" rx="2.5" fill="#D4537E"/>
      <rect x="37" y="20" width="5" height="16" rx="2.5" fill="#D4537E"/>
      <rect x="19" y="26" width="18" height="4" rx="2" fill="#EF9F27"/>
      <line x1="4" y1="22" x2="7" y2="22" stroke="#D4537E" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <line x1="4" y1="28" x2="7" y2="28" stroke="#D4537E" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <line x1="4" y1="34" x2="7" y2="34" stroke="#D4537E" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

export function IconCreative({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      <circle cx="28" cy="30" r="16" fill="#7F77DD" opacity="0.15"/>
      <circle cx="28" cy="30" r="16" fill="none" stroke="#7F77DD" strokeWidth="2.5"/>
      <circle cx="22" cy="26" r="3.5" fill="#D4537E"/>
      <circle cx="32" cy="24" r="3" fill="#EF9F27"/>
      <circle cx="36" cy="32" r="3" fill="#1D9E75"/>
      <circle cx="20" cy="34" r="3" fill="#378ADD"/>
      <ellipse cx="30" cy="36" rx="5" ry="3.5" fill="#FAF8F2"/>
      <line x1="34" y1="18" x2="42" y2="10" stroke="#7F77DD" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="40" y="8" width="6" height="3" rx="1.5" fill="#7F77DD" transform="rotate(-45 40 8)"/>
    </svg>
  );
}

export function IconOutdoor({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      <polygon points="28,10 44,42 12,42" fill="#1D9E75" opacity="0.2"/>
      <polygon points="28,10 44,42 12,42" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points="20,42 28,26 36,42" fill="#1D9E75" opacity="0.5"/>
      <circle cx="42" cy="14" r="5" fill="#EF9F27"/>
      <line x1="42" y1="6" x2="42" y2="4" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round"/>
      <line x1="48" y1="9" x2="50" y2="8" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round"/>
      <line x1="50" y1="14" x2="52" y2="14" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round"/>
      <line x1="36" y1="9" x2="34" y2="8" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="44" x2="48" y2="44" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}

export function IconTech({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      <line x1="28" y1="10" x2="28" y2="6" stroke="#378ADD" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="28" cy="5" r="2.5" fill="#378ADD"/>
      <rect x="18" y="10" width="20" height="16" rx="4" fill="#378ADD" opacity="0.2"/>
      <rect x="18" y="10" width="20" height="16" rx="4" fill="none" stroke="#378ADD" strokeWidth="2"/>
      <circle cx="24" cy="18" r="3" fill="white" stroke="#378ADD" strokeWidth="1.5"/>
      <circle cx="32" cy="18" r="3" fill="white" stroke="#378ADD" strokeWidth="1.5"/>
      <circle cx="24" cy="18" r="1.5" fill="#378ADD"/>
      <circle cx="32" cy="18" r="1.5" fill="#378ADD"/>
      <rect x="23" y="23" width="10" height="2" rx="1" fill="#378ADD" opacity="0.6"/>
      <rect x="25" y="26" width="6" height="3" rx="1" fill="#378ADD" opacity="0.5"/>
      <rect x="14" y="29" width="28" height="18" rx="4" fill="#378ADD" opacity="0.15"/>
      <rect x="14" y="29" width="28" height="18" rx="4" fill="none" stroke="#378ADD" strokeWidth="2"/>
      <rect x="20" y="33" width="16" height="8" rx="2" fill="#7F77DD" opacity="0.3"/>
      <rect x="20" y="33" width="16" height="8" rx="2" fill="none" stroke="#7F77DD" strokeWidth="1.5"/>
      <circle cx="24" cy="37" r="2" fill="#EF9F27"/>
      <circle cx="28" cy="37" r="1.5" fill="#D4537E"/>
      <circle cx="32" cy="37" r="2" fill="#1D9E75"/>
      <rect x="6" y="30" width="8" height="14" rx="3" fill="#378ADD" opacity="0.2"/>
      <rect x="6" y="30" width="8" height="14" rx="3" fill="none" stroke="#378ADD" strokeWidth="2"/>
      <rect x="42" y="30" width="8" height="14" rx="3" fill="#378ADD" opacity="0.2"/>
      <rect x="42" y="30" width="8" height="14" rx="3" fill="none" stroke="#378ADD" strokeWidth="2"/>
    </svg>
  );
}

export function IconSocial({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      <circle cx="16" cy="16" r="7" fill="#EF9F27"/>
      <path d="M6 38 Q6 28 16 28 Q22 28 24 32" stroke="#EF9F27" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="40" cy="16" r="7" fill="#D4537E"/>
      <path d="M50 38 Q50 28 40 28 Q34 28 32 32" stroke="#D4537E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <rect x="20" y="8" width="14" height="10" rx="3" fill="#EF9F27" opacity="0.2"/>
      <rect x="20" y="8" width="14" height="10" rx="3" fill="none" stroke="#EF9F27" strokeWidth="1.5"/>
      <path d="M22 18 L20 22 L26 18" fill="#EF9F27" opacity="0.2"/>
      <path d="M22 18 L20 22 L26 18" fill="none" stroke="#EF9F27" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="22" y="24" width="14" height="10" rx="3" fill="#D4537E" opacity="0.2"/>
      <rect x="22" y="24" width="14" height="10" rx="3" fill="none" stroke="#D4537E" strokeWidth="1.5"/>
      <path d="M34 34 L36 38 L30 34" fill="#D4537E" opacity="0.2"/>
      <path d="M34 34 L36 38 L30 34" fill="none" stroke="#D4537E" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="26" cy="13" r="1.2" fill="#EF9F27"/>
      <circle cx="29" cy="13" r="1.2" fill="#EF9F27"/>
      <circle cx="32" cy="13" r="1.2" fill="#EF9F27"/>
      <circle cx="28" cy="29" r="1.2" fill="#D4537E"/>
      <circle cx="31" cy="29" r="1.2" fill="#D4537E"/>
      <circle cx="34" cy="29" r="1.2" fill="#D4537E"/>
    </svg>
  );
}

export function IconCulinary({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      <rect x="14" y="36" width="28" height="8" rx="3" fill="#D85A30"/>
      <rect x="14" y="36" width="28" height="8" rx="3" fill="none" stroke="#D85A30" strokeWidth="2"/>
      <path d="M20 36 C20 36 16 32 16 24 C16 16 22 10 28 10 C34 10 40 16 40 24 C40 32 36 36 36 36 Z" fill="#FAF8F2"/>
      <path d="M20 36 C20 36 16 32 16 24 C16 16 22 10 28 10 C34 10 40 16 40 24 C40 32 36 36 36 36 Z" fill="none" stroke="#D85A30" strokeWidth="2.5"/>
      <path d="M18 22 Q20 18 24 20" stroke="#D85A30" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M38 22 Q36 18 32 20" stroke="#D85A30" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
      <line x1="20" y1="40" x2="36" y2="40" stroke="white" strokeWidth="1" opacity="0.5"/>
      <line x1="20" y1="46" x2="20" y2="52" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round"/>
      <line x1="36" y1="46" x2="36" y2="52" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="53" r="2" fill="#EF9F27"/>
      <circle cx="36" cy="53" r="2" fill="#EF9F27"/>
    </svg>
  );
}

export function IconAdventure({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      <path d="M12 12 L28 8 L28 36 Q28 46 20 50 Q12 46 12 36 Z" fill="#D4537E" opacity="0.2"/>
      <path d="M12 12 L28 8 L28 36 Q28 46 20 50 Q12 46 12 36 Z" fill="none" stroke="#D4537E" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M17 26 L20 22 L23 26 L20 30 Z" fill="#D4537E" opacity="0.7"/>
      <line x1="32" y1="10" x2="50" y2="46" stroke="#EF9F27" strokeWidth="3" strokeLinecap="round"/>
      <line x1="38" y1="22" x2="46" y2="14" stroke="#EF9F27" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="47" y="43" width="5" height="8" rx="2" fill="#D85A30" transform="rotate(-30 47 43)"/>
      <line x1="33" y1="12" x2="49" y2="44" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

export function IconNature({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      <path d="M28 46 Q12 36 12 20 Q20 8 40 10 Q42 30 28 46 Z" fill="#1D9E75" opacity="0.2"/>
      <path d="M28 46 Q12 36 12 20 Q20 8 40 10 Q42 30 28 46 Z" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M28 46 Q30 30 38 16" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M25 36 Q30 30 35 26" stroke="#1D9E75" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      <path d="M20 28 Q25 24 30 22" stroke="#1D9E75" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      <circle cx="42" cy="42" r="5" fill="#639922" opacity="0.7"/>
      <circle cx="46" cy="38" r="3" fill="#1D9E75" opacity="0.5"/>
    </svg>
  );
}

export function IconCraft({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      <rect x="10" y="40" width="36" height="6" rx="2" fill="#5A5855"/>
      <rect x="14" y="32" width="28" height="10" rx="2" fill="#5A5855" opacity="0.8"/>
      <path d="M42 36 Q50 36 50 38 Q50 40 42 40 Z" fill="#5A5855" opacity="0.8"/>
      <rect x="14" y="30" width="28" height="5" rx="1.5" fill="#888780"/>
      <line x1="36" y1="16" x2="22" y2="30" stroke="#D85A30" strokeWidth="3" strokeLinecap="round"/>
      <rect x="32" y="8" width="16" height="10" rx="3" fill="#D85A30" transform="rotate(-45 32 8)"/>
      <circle cx="28" cy="24" r="2" fill="#EF9F27" opacity="0.9"/>
      <circle cx="24" cy="20" r="1.5" fill="#EF9F27" opacity="0.7"/>
      <circle cx="32" cy="20" r="1.2" fill="#EF9F27" opacity="0.6"/>
      <circle cx="20" cy="26" r="1" fill="#EF9F27" opacity="0.5"/>
      <circle cx="34" cy="26" r="1" fill="#EF9F27" opacity="0.5"/>
      <ellipse cx="28" cy="30" rx="6" ry="2" fill="#EF9F27" opacity="0.3"/>
    </svg>
  );
}

export function IconMind({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      <ellipse cx="28" cy="18" rx="12" ry="10" fill="#D4537E" opacity="0.15"/>
      <ellipse cx="28" cy="18" rx="12" ry="10" fill="none" stroke="#D4537E" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6"/>
      <path d="M20 16 Q22 12 24 15 Q26 12 28 15 Q30 12 32 15 Q34 12 36 16" stroke="#D4537E" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <circle cx="28" cy="26" r="5" fill="#378ADD"/>
      <path d="M28 31 L28 40" stroke="#378ADD" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 40 Q20 42 16 40" stroke="#378ADD" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M28 40 Q36 42 40 40" stroke="#378ADD" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M28 34 Q22 36 18 34" stroke="#378ADD" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M28 34 Q34 36 38 34" stroke="#378ADD" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="18" cy="34" r="2" fill="#D4537E"/>
      <circle cx="38" cy="34" r="2" fill="#D4537E"/>
      <circle cx="10" cy="20" r="1.5" fill="#EF9F27" opacity="0.7"/>
      <circle cx="46" cy="20" r="1.5" fill="#EF9F27" opacity="0.7"/>
    </svg>
  );
}

export function IconCommunity({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      <path d="M8 36 Q8 28 14 26 L20 24 Q22 22 24 24 L24 34" stroke="#EF9F27" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 26 L14 20 Q14 18 16 18 Q18 18 18 20 L18 24" stroke="#EF9F27" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M18 22 L18 16 Q18 14 20 14 Q22 14 22 16 L22 22" stroke="#EF9F27" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M22 22 L22 17 Q22 15 24 15 Q26 15 26 17 L26 22" stroke="#EF9F27" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M8 36 Q8 42 14 44 L24 44 L24 34" fill="#EF9F27" opacity="0.2"/>
      <path d="M8 36 Q8 42 14 44 L24 44 L24 34" fill="none" stroke="#EF9F27" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M48 36 Q48 28 42 26 L36 24 Q34 22 32 24 L32 34" stroke="#7F77DD" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M42 26 L42 20 Q42 18 40 18 Q38 18 38 20 L38 24" stroke="#7F77DD" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M38 22 L38 16 Q38 14 36 14 Q34 14 34 16 L34 22" stroke="#7F77DD" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M34 22 L34 17 Q34 15 32 15 Q30 15 30 17 L30 22" stroke="#7F77DD" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M48 36 Q48 42 42 44 L32 44 L32 34" fill="#7F77DD" opacity="0.2"/>
      <path d="M48 36 Q48 42 42 44 L32 44 L32 34" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinejoin="round"/>
      <ellipse cx="28" cy="34" rx="5" ry="6" fill="#1D9E75" opacity="0.3"/>
    </svg>
  );
}

export function IconAppMark({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 110" fill="none" className={className}>
      <line x1="38" y1="30" x2="58" y2="18" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <line x1="58" y1="18" x2="80" y2="26" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <line x1="80" y1="26" x2="88" y2="50" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <line x1="88" y1="50" x2="72" y2="70" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <line x1="72" y1="70" x2="48" y2="76" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <line x1="48" y1="76" x2="30" y2="60" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <line x1="30" y1="60" x2="38" y2="30" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <circle cx="38" cy="30" r="11" fill="#D4537E"/>
      <circle cx="58" cy="18" r="8" fill="#EF9F27"/>
      <circle cx="80" cy="26" r="10" fill="#7F77DD"/>
      <circle cx="88" cy="50" r="7" fill="#378ADD"/>
      <circle cx="72" cy="70" r="9" fill="#D85A30"/>
      <circle cx="48" cy="76" r="7" fill="#639922"/>
      <circle cx="30" cy="60" r="8" fill="#D4537E" opacity="0.7"/>
    </svg>
  );
}
