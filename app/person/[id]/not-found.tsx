import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <User className="w-20 h-20 text-[#fbc9ff] mx-auto" />
        <h1 className="text-4xl font-bold text-white">Person Not Found</h1>
        <p className="text-white/60 text-lg">The person you're looking for doesn't exist or has been removed.</p>
        <Link href="/">
          <Button className="bg-[#fbc9ff] hover:bg-[#db97e2] text-black font-semibold">Go Back Home</Button>
        </Link>
      </div>
    </div>
  )
}