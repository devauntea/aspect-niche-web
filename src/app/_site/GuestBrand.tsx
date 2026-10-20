import Image from "next/image";
import Link from "next/link";

// The name above every page a shared link opens (invitations, date plans,
// series and replies). The person opening one has often never heard of
// Aspect Niche; this says whose page it is and where to learn more, without
// competing with the card they came for.
export default function GuestBrand() {
  return (
    <Link className="guest-brand" href="/">
      <Image src="/brand/logo-tile.png" alt="" width={24} height={24} />
      <span>Aspect Niche</span>
    </Link>
  );
}
