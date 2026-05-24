import { HeroBanner, CardFeature, StepGuide, BenefitsSection, SubscriptionSection, FaqSection } from "./_components";
import { LandingLayout } from "./layout";

export function Landing() {
    return (
        <LandingLayout>
            <main className="min-h-screen bg-black">
                <HeroBanner />
                <CardFeature />
                <StepGuide />
                <BenefitsSection />
                <SubscriptionSection />
                <FaqSection />
            </main>
        </LandingLayout>
    );
}
