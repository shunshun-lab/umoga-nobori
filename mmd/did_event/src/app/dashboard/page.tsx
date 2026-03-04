import DashboardFeed from "@/components/homepage/DashboardFeed";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
    return (
        <>
            <Header />
            <DashboardFeed />
        </>
    );
}
