import { Zap } from "lucide-react";

export default function SplashScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white">
      <h1 className="flex items-center text-4xl font-bold text-black">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-5">
          <Zap className="w-9 h-9 text-primary-foreground animate-pulse font-bold" />
        </div>
        PrivGPT Pro
      </h1>
    </div>
  );
}
