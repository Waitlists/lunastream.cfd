import Link from "next/link"
import Image from "next/image"
import { tmdb, type CastMember } from "@/lib/tmdb"

interface CastListProps {
  cast: CastMember[]
}

export function CastList({ cast }: CastListProps) {
  const displayCast = cast.slice(0, 10)

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Cast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayCast.map((member) => (
          <Link
            key={member.id}
            href={`/person/${member.id}`}
            className="group block rounded-lg overflow-hidden bg-card hover:ring-2 hover:ring-[#fbc9ff] transition-all"
          >
            <div className="aspect-[2/3] relative">
              <Image
                src={tmdb.getImageUrl(member.profile_path) || "/placeholder.svg?height=300&width=200"}
                alt={member.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm text-white line-clamp-1">{member.name}</h3>
              {member.character && <p className="text-xs text-white/60 line-clamp-1">{member.character}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
