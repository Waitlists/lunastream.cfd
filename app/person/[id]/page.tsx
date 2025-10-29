import { Navbar } from "@/components/navbar"
import { MediaCard } from "@/components/media-card"
import { tmdb } from "@/lib/tmdb"
import Image from "next/image"
import { Calendar, MapPin, Briefcase, AlertCircle } from "lucide-react"

export default async function PersonPage({ params }: { params: { id: string } }) {
  const personId = Number.parseInt(params.id)

  let person
  try {
    person = await tmdb.getPersonDetails(personId)
  } catch (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
              <h1 className="text-4xl font-bold text-white mb-4">Person Not Found</h1>
              <p className="text-white/60 text-lg max-w-md">
                The person you're looking for doesn't exist or there was an error loading their information.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!person || !person.id) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
              <h1 className="text-4xl font-bold text-white mb-4">Person Not Found</h1>
              <p className="text-white/60 text-lg max-w-md">
                The person you're looking for doesn't exist or there was an error loading their information.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const knownFor = person.combined_credits?.cast
    ?.filter((item: any) => item.vote_average > 0)
    .sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0))
    .slice(0, 6) || []

  const filmography = person.combined_credits?.cast
    ?.sort((a: any, b: any) => {
      const dateA = a.release_date || a.first_air_date || "0"
      const dateB = b.release_date || b.first_air_date || "0"
      return dateB.localeCompare(dateA)
    })
    .slice(0, 20) || []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="flex-none w-full md:w-[300px]">
              <div className="relative">
                <Image
                  src={tmdb.getImageUrl(person.profile_path, "w500") || "/placeholder-user.jpg"}
                  alt={person.name}
                  width={300}
                  height={450}
                  className="rounded-lg shadow-2xl w-full object-cover"
                  priority
                />
                {person.known_for_department && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {person.known_for_department}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{person.name}</h1>

              <div className="space-y-3 mb-6">
                {person.known_for_department && (
                  <div className="flex items-center gap-2 text-white/80">
                    <Briefcase className="w-5 h-5 text-[#fbc9ff]" />
                    <span>Known for {person.known_for_department}</span>
                  </div>
                )}
                {person.birthday && (
                  <div className="flex items-center gap-2 text-white/80">
                    <Calendar className="w-5 h-5 text-[#fbc9ff]" />
                    <span>
                      Born {new Date(person.birthday).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {person.deathday && (
                        <span className="ml-2">
                          - Died {new Date(person.deathday).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="w-5 h-5 text-[#fbc9ff]" />
                    <span>{person.place_of_birth}</span>
                  </div>
                )}
              </div>

              {person.biography && person.biography.trim() && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">Biography</h2>
                  <p className="text-white/80 leading-relaxed whitespace-pre-line">{person.biography}</p>
                </div>
              )}
            </div>
          </div>

          {knownFor.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Known For</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {knownFor.map((item: any) => {
                  const mediaType = item.media_type || "movie"
                  const title = item.title || item.name || "Untitled"
                  const year = item.release_date
                    ? new Date(item.release_date).getFullYear().toString()
                    : item.first_air_date
                      ? new Date(item.first_air_date).getFullYear().toString()
                      : undefined

                  return (
                    <MediaCard
                      key={item.id}
                      id={item.id}
                      title={title}
                      posterPath={item.poster_path}
                      mediaType={mediaType}
                      voteAverage={item.vote_average}
                      year={year}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {filmography.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Filmography</h2>
              <div className="space-y-2">
                {filmography.map((item: any) => {
                  const mediaType = item.media_type || "movie"
                  const title = item.title || item.name || "Untitled"
                  const year = item.release_date
                    ? new Date(item.release_date).getFullYear()
                    : item.first_air_date
                      ? new Date(item.first_air_date).getFullYear()
                      : "TBA"

                  return (
                    <a
                      key={`${item.id}-${mediaType}`}
                      href={`/${mediaType}/${item.id}`}
                      className="block p-4 bg-card rounded-lg hover:ring-2 hover:ring-[#fbc9ff] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{title}</h3>
                          {item.character && <p className="text-white/60 text-sm">as {item.character}</p>}
                        </div>
                        <div className="flex items-center gap-4 text-white/60">
                          <span className="text-sm">{year}</span>
                          {item.vote_average > 0 && (
                            <span className="text-sm text-[#fbc9ff]">★ {item.vote_average.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
