import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-black via-purple-950/20 to-black">
      <div className="w-full max-w-sm">
        <Card className="bg-black/40 border-[#fbc9ff]/20 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-[#fbc9ff]" />
            </div>
            <CardTitle className="text-2xl text-[#fbc9ff]">Check your email</CardTitle>
            <CardDescription className="text-white/60">
              We&apos;ve sent you a confirmation link. Please check your email to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/" className="text-[#fbc9ff] hover:underline">
              Return to home
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
